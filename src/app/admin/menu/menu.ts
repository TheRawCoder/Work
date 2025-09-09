import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss']
})
export class MenuComponent {
 @Output() sidebarToggle = new EventEmitter<void>();

  toggle() {
    this.sidebarToggle.emit();
  }

  user: any = null;

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.user = this.decodeToken(token);
    }
  }

  decodeToken(token: string) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}