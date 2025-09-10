import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { AuthService } from '../app/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'] 
})
export class App implements OnInit {
  isCollapsed = false;

  constructor(private auth: AuthService, private router: Router) {

    window.addEventListener('storage', (event) => {
      if (event.key === 'app_logout') {
        this.handleLogoutFromOtherTab();
      }
    });


    window.addEventListener('focus', () => {
      if (!this.auth.hasToken()) {
        this.router.navigate(['/login']).catch(() => (window.location.href = '/login'));
      }
    });
  }

  ngOnInit() {

    if (!this.auth.hasToken()) {
      this.router.navigate(['/login']).catch(() => (window.location.href = '/login'));
    }
  }

  private handleLogoutFromOtherTab() {
    this.auth.clearToken();
    this.auth.clearRefreshToken();

    this.router.navigate(['/login']).catch(() => {
      window.location.href = '/login';
    });
  }
}
