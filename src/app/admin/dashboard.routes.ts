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

         // <-- ADD THIS BLOCK -->
         {
            path: '',
            // lazy-load the support module we created earlier
            loadChildren: () =>
               import('./support/support.module').then(m => m.SupportModule)
         },
         // <-- END ADD -->

      ]

   }
];
