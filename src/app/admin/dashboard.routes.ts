import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';

export const DashboardRoutes: Routes = [
   {
      path: '',
      component: LayoutComponent,
      children: [
         {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full'
         },
         {
            path: 'home',
            loadComponent: () => import('./home/home').then(m => m.HomeComponent)
         },

    
         {
            path: '',
          
            loadChildren: () =>
               import('./support/support.module').then(m => m.SupportModule)
         },
      
      ]

   }
];
