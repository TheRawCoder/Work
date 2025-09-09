// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:3000/auth';
    // <-- use the same key you actually store in localStorage (your screenshot showed 'token')
    private accessTokenKey = 'token';
    private refreshTokenKey = 'refresh_token'; // if you also store refresh token (non-HttpOnly fallback)
    private logoutBroadcastKey = 'app_logout';

    // currentUser or auth state (optional)
    private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
    public isLoggedIn$ = this._isLoggedIn$.asObservable();

    // Keep any refresh timer reference here (if you implement automatic refresh)
    private refreshTimer: any = null;

    constructor(private http: HttpClient, private router: Router) { }

    // ---------------------
    // Authentication calls
    // ---------------------
    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(response => {
                if (response?.accessToken) {
                    this.setToken(response.accessToken);
                    // optional: if backend returns refresh token in response (not in HttpOnly cookie)
                    if (response?.refreshToken) {
                        this.setRefreshToken(response.refreshToken);
                    }
                    this._isLoggedIn$.next(true);
                    // Optionally schedule refresh: this.scheduleRefresh(response.accessToken);
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

    // ---------------------
    // Token helpers
    // ---------------------
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

    // ---------------------
    // Logout (client + server)
    // ---------------------
    /**
     * Best-effort logout:
     * 1. Call backend /auth/logout to clear HttpOnly cookie (if any)
     * 2. Clear localStorage/sessionStorage & in-memory state
     * 3. Broadcast logout so other tabs clear too
     * 4. Navigate to /login (or reload)
     *
     * callServer: whether to call server logout (default true)
     * navigate: whether to navigate to /login (default true). If false, a full reload will be issued.
     */
    logout(callServer = true, navigate = true) {
        // If server call requested, call with credentials so cookies are sent/cleared.
        if (callServer) {
            // If you store refresh token client-side, send it; otherwise backend will clear cookie.
            const payload: any = {};
            const refresh = this.getRefreshToken();
            if (refresh) payload.refreshToken = refresh;

            this.http.post(`${this.apiUrl}/logout`, payload, { withCredentials: true })
                .pipe(
                    catchError(err => {
                        // ignore server errors during logout; still proceed to clear client
                        console.warn('Server logout failed (ignored):', err);
                        return of(null);
                    })
                )
                .subscribe(() => {
                    // finish client-side logout once server call is done (or errored)
                    this.finishClientLogout(navigate);
                });

            // In case server is hanging or slow, also ensure client clears after a short timeout
            setTimeout(() => {
                // only run finish if still logged in (defensive)
                if (this.hasToken()) {
                    this.finishClientLogout(navigate);
                }
            }, 2000);
        } else {
            // No server call requested — clear immediately
            this.finishClientLogout(navigate);
        }
    }

    // central place to ensure client-only cleanup
    private finishClientLogout(navigate = true) {
        try {
            // 1) Clear client storage + app state
            this.clearToken();
            this.clearRefreshToken();
            sessionStorage.clear();
            this._isLoggedIn$.next(false);

            // 2) stop refresh timers if any
            if (this.refreshTimer) {
                clearTimeout(this.refreshTimer);
                this.refreshTimer = null;
            }

            // 3) Broadcast logout to other tabs
            try {
                localStorage.setItem(this.logoutBroadcastKey, Date.now().toString());
                localStorage.removeItem(this.logoutBroadcastKey);
            } catch (e) {
                // ignore storage exceptions
            }

            // 4) Redirect / reload
            if (navigate) {
                // navigate to login route
                this.router.navigate(['/login']).catch(() => {
                    // fallback to full reload if router fails
                    window.location.href = '/login';
                });

                // also do a small delayed reload to ensure in-memory caches in other modules are cleared
                setTimeout(() => {
                    try {
                        // reload will reinitialize services (clears in-memory tokens)
                        window.location.reload();
                    } catch (e) {
                        // ignore
                    }
                }, 250);
            } else {
                // optional full reload to clear all in-memory caches
                try {
                    window.location.reload();
                } catch (e) {
                    // ignore
                }
            }
        } catch (err) {
            console.warn('Error during finishClientLogout', err);
            // as a last resort, force a navigation
            try {
                this.router.navigate(['/login']).catch(() => (window.location.href = '/login'));
            } catch (e) { }
        }
    }

    // Optional: Use to handle refresh scheduling if you implement it
    scheduleRefresh(token: string) {
        // decode token to compute expiry, then setTimeout to refresh a bit earlier than expiry
        // (Left intentionally minimal — implement with jwt-decode or on server)
    }
}
