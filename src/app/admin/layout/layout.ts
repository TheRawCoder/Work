import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MenuComponent } from '../menu/menu';
import { SideNavComponent } from '../side-nav/side-nav';
import { filter } from 'rxjs';



@Component({
 selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, MenuComponent, SideNavComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class LayoutComponent {
   isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    console.log('sidebar state', this.isSidebarCollapsed);
  }


   isDashboardPage = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isDashboardPage = event.urlAfterRedirects === '/dashboard';
    });
  }
}