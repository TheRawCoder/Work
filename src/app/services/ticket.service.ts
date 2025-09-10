import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketService {
    private base = '/api/tickets';

    constructor(private http: HttpClient) { }


    getStats(): Observable<any> {
        return this.http.get(`${this.base}/stats`);
    }


    getTickets(opts: any = {}): Observable<any> {
        const page = Number(opts.page ?? 1);
        const limit = Number(opts.limit ?? 10);
        const skip = (page - 1) * limit;

        let params = new HttpParams()
            .set('limit', String(limit))
            .set('skip', String(skip));

        if (opts.status) params = params.set('status', opts.status);
        if (opts.refId) params = params.set('refId', opts.refId);
        if (opts.startDate) params = params.set('startDate', opts.startDate);
        if (opts.endDate) params = params.set('endDate', opts.endDate);

        return this.http.get(`${this.base}`, { params });
    }

    getTicketById(id: string) {
        return this.http.get(`${this.base}/${id}`);
    }

    updateTicket(id: string, payload: any) {
        return this.http.patch(`${this.base}/${id}/action`, payload);
    }


    updateTicketStatus(id: string, payload: any) {
        return this.http.patch(`${this.base}/${id}/status`, payload);
    }

    createTicket(payload: any) {
        return this.http.post(`${this.base}`, payload);
    }

    addRemark(id: string, payload: any) {
        return this.http.post(`${this.base}/${id}/remarks`, payload);
    }
}
