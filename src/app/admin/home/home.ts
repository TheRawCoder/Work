import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartType, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [CommonModule, NgChartsModule],
})
export class HomeComponent implements OnInit {
  cards = [
    { title: 'BOOKINGS', value: '154', footer: 'Target', badge: '198', color: 'blue', icon: 'bi bi-check2-circle' },
    { title: 'COMPLAINTS', value: '68', footer: 'Total Pending', badge: '154', color: 'green', icon: 'bi bi-check2-circle' },
    { title: 'PROFIT', value: '9475', footer: 'Pending', badge: '236', color: 'red', icon: 'bi bi-check2-circle' },
    { title: 'TOTAL PROFIT', value: '124,356', footer: 'Pending', badge: '782', color: '#d49137', icon: 'bi bi-check2-circle' }
  ];

  ticketStats: { [status: string]: number } = {};
  barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Tickets' }] };
  pieChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } }
  };
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchTicketStats();
  }

  fetchTicketStats() {
    this.http.post<any>('http://localhost:3000/upload-data/fetch', {}).subscribe({
      next: (res) => {
        const files = res.data || [];
        // Count tickets by status
        const stats: { [status: string]: number } = {};
        files.forEach((file: any) => {
          const status = file.status || 'Unknown';
          stats[status] = (stats[status] || 0) + 1;
        });
        this.ticketStats = stats;

        // Prepare chart data
        this.barChartData = {
          labels: Object.keys(stats),
          datasets: [{ data: Object.values(stats), label: 'Tickets' }]
        };
        this.pieChartData = {
          labels: Object.keys(stats),
          datasets: [{ data: Object.values(stats) }]
        };
      },
      error: () => {
        this.ticketStats = {};
        this.barChartData = { labels: [], datasets: [{ data: [], label: 'Tickets' }] };
        this.pieChartData = { labels: [], datasets: [{ data: [] }] };
      }
    });
  }
}