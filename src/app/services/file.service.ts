import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private baseUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    uploadFile(file: File): Observable<HttpEvent<any>> {
        const formData = new FormData();
        formData.append('file', file);

        const req = new HttpRequest('POST', `${this.baseUrl}/upload-data/upload`, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }


}
