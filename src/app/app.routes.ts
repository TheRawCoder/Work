import { Routes } from '@angular/router';
import { AuthenticationRoutes } from './authentication/authentication.routes';
import { DashboardRoutes } from './admin/dashboard.routes';
import { AuthGuard } from '../app/guards/auth.guard'; // ✅ import guard
import { LoginComponent } from './authentication/login/login';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password';
import { RegisterUserComponent } from './authentication/register-user/register-user';

export const routes: Routes = [
 
  { path: 'login', component: LoginComponent },
  { path: '',  component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'register-user', component: RegisterUserComponent },
  {
    path: 'dashboard',
    // canActivate: [AuthGuard], // ✅ protect dashboard
    children: DashboardRoutes,
  },
];
