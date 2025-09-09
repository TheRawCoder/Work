



import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
   selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
    imports: [CommonModule],
})
export class HomeComponent {
 cards = [
    { title: 'BOOKINGS', value: '154', footer: 'Target', badge: '198', color: 'blue', icon: 'bi bi-check2-circle' },
    { title: 'COMPLAINTS', value: '68', footer: 'Total Pending', badge: '154', color: 'green', icon: 'bi bi-check2-circle' },
    { title: 'PROFIT', value: '9475', footer: 'Pending', badge: '236', color: 'red', icon: 'bi bi-check2-circle' },
    { title: 'TOTAL PROFIT', value: '124,356', footer: 'Pending', badge: '782', color: '#d49137', icon: 'bi bi-check2-circle' }
  ];
}