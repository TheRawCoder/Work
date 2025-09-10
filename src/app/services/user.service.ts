import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../app/authentication/register-user/register-user';

@Injectable({
    providedIn: 'root'
})
export class UserApiService {
    private baseUrl = 'http://localhost:3000/users'; 

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('jwtToken'); 
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.baseUrl, { headers: this.getAuthHeaders() });
    }

    updateUser(id: number | string, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.baseUrl}/${id}`, user, { headers: this.getAuthHeaders() });
    }

    deleteUser(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
    }
}
