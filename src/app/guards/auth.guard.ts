import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }

    canActivate(): Observable<boolean> {
        return this.authService.validateToken().pipe(
            map(() => true), 
            catchError(() => {
                localStorage.removeItem('token'); 
                this.router.navigate(['/login']); 
                return of(false);
            })
        );
    }
}
