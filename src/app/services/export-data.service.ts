import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ExportDataService {
    private baseUrl = 'http://localhost:3000/upload-data';

    constructor(private http: HttpClient) { }

    fetchData(filters: any = {}): Observable<any> {
        return this.http.post(`${this.baseUrl}/fetch`, filters);
    }

    exportExcel(filters: any = {}): Observable<Blob> {
        return this.http.post(`${this.baseUrl}/export`, { ...filters, format: 'excel' }, { responseType: 'blob' });
    }
}
