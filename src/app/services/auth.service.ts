import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:3000/auth';

    private accessTokenKey = 'token';
    private refreshTokenKey = 'refresh_token'; 
    private logoutBroadcastKey = 'app_logout';

    private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
    public isLoggedIn$ = this._isLoggedIn$.asObservable();

    private refreshTimer: any = null;

    constructor(private http: HttpClient, private router: Router) { }

    
    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(response => {
                if (response?.accessToken) {
                    this.setToken(response.accessToken);
                   
                    if (response?.refreshToken) {
                        this.setRefreshToken(response.refreshToken);
                    }
                    this._isLoggedIn$.next(true);
                   
                }
            })
        );
    }

    sendOtp(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
    }

    verifyOtp(email: string, otp: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/verify-otp`, { email, otp });
    }

    resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/reset-password`, {
            email,
            otp,
            newPassword,
            confirmPassword,
        });
    }

    validateToken(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/validate`);
    }


    setToken(token: string) {
        try {
            localStorage.setItem(this.accessTokenKey, token);
        } catch (e) {
            console.warn('Could not set token to localStorage', e);
        }
    }

    getToken(): string | null {
        return localStorage.getItem(this.accessTokenKey);
    }

    clearToken() {
        try {
            localStorage.removeItem(this.accessTokenKey);
        } catch (e) {
            console.warn('Could not remove token from localStorage', e);
        }
    }

    setRefreshToken(token: string) {
        try {
            localStorage.setItem(this.refreshTokenKey, token);
        } catch (e) {
            console.warn('Could not set refresh token', e);
        }
    }

    getRefreshToken(): string | null {
        return localStorage.getItem(this.refreshTokenKey);
    }

    clearRefreshToken() {
        try {
            localStorage.removeItem(this.refreshTokenKey);
        } catch (e) {
            console.warn('Could not remove refresh token', e);
        }
    }

    hasToken(): boolean {
        const t = this.getToken();
        return !!t;
    }

   
    logout(callServer = true, navigate = true) {
       
        if (callServer) {
           
            const payload: any = {};
            const refresh = this.getRefreshToken();
            if (refresh) payload.refreshToken = refresh;

            this.http.post(`${this.apiUrl}/logout`, payload, { withCredentials: true })
                .pipe(
                    catchError(err => {
                       
                        console.warn('Server logout failed (ignored):', err);
                        return of(null);
                    })
                )
                .subscribe(() => {
                   
                    this.finishClientLogout(navigate);
                });

            
            setTimeout(() => {
                
                if (this.hasToken()) {
                    this.finishClientLogout(navigate);
                }
            }, 2000);
        } else {
            
            this.finishClientLogout(navigate);
        }
    }

   
    private finishClientLogout(navigate = true) {
        try {
           
            this.clearToken();
            this.clearRefreshToken();
            sessionStorage.clear();
            this._isLoggedIn$.next(false);

          
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
            }

           
            try {
                localStorage.setItem(this.logoutBroadcastKey, Date.now().toString());
                localStorage.removeItem(this.logoutBroadcastKey);
            } catch (e) {
               
            }

            
            if (navigate) {
              
                this.router.navigate(['/login']).catch(() => {
                 
                    window.location.href = '/login';
                });

               
                setTimeout(() => {
                    try {
                       
                        window.location.reload();
                    } catch (e) {
                        
                    }
                }, 250);
            } else {
            
                try {
                    window.location.reload();
                } catch (e) {
                
                }
            }
        } catch (err) {
            console.warn('Error during finishClientLogout', err);
            
            try {
                this.router.navigate(['/login']).catch(() => (window.location.href = '/login'));
            } catch (e) { }
        }
    }

    scheduleRefresh(token: string) {
        
    }
}
