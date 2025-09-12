import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TicketService {
    private base = '/api/ticket-master';

    constructor(private http: HttpClient) { }

    // ✅ Get ticket counts (Processing, Raised, Resolved, Rejected)
    getStats(): Observable<any> {
        return this.http.get(`${this.base}/counts`);
    }

    // ✅ Fetch tickets (paginated + filters)
    getTickets(opts: any = {}): Observable<any> {
        const page = Number(opts.page ?? 1);
        const limit = Number(opts.limit ?? 10);
        const skip = (page - 1) * limit;

        const body: any = { limit, skip };

        if (opts.status) body.status = opts.status;
        if (opts.refId) body.ticketRefId = opts.refId; // match backend schema
        if (opts.startDate) body.startDate = opts.startDate;
        if (opts.endDate) body.endDate = opts.endDate;

        return this.http.post(`${this.base}/get`, body);
    }

    // ✅ Fetch a ticket by refId
    getTicketByRefId(refId: string) {
        return this.http.post(`${this.base}/getByRefId`, { ticketRefId: refId });
    }

    // ✅ Create a new ticket
    createTicket(payload: any) {
        return this.http.post(`${this.base}/create`, payload);
    }

    // ✅ Update ticket by Id
    updateTicket(id: string, payload: any) {
        return this.http.post(`${this.base}/updateById`, { id, ...payload });
    }

    // ✅ Update ticket status
    updateTicketStatus(id: string, payload: any) {
        return this.http.post(`${this.base}/updateById`, { id, ...payload });
    }

    // ✅ Add remark (handled as part of update payload, if needed)
    addRemark(id: string, payload: any) {
        return this.http.post(`${this.base}/updateById`, { id, remarks: [payload] });
    }
}
