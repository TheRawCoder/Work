// ticket-management.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import en from '@angular/common/locales/en';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';

import { TicketService } from '../../../services/ticket.service'; // adjust path if needed

type TicketStatus = 'Processing' | 'Raised' | 'Resolved' | 'Rejected';
registerLocaleData(en);

@Component({
  selector: 'app-ticket-management',
  standalone: true,
  templateUrl: './ticket-management.html',
  styleUrls: ['./ticket-management.scss'],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzCardModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzDrawerModule,
    NzSelectModule,
    NzInputModule,
    NzFormModule,
    NzDatePickerModule,
    NzPaginationModule
  ]
})
export class TicketManagementComponent implements OnInit {
  tickets: any[] = [];
  ticketForm!: FormGroup;
  selectedTicket: any = null;
  ticketHistory: any[] = [];
  counts$!: Observable<Record<TicketStatus, number>>;

  filters: any = { status: '', ticketRefId: '', dateRange: [] };
  filterBy: string = 'all';
  isDrawerVisible = false;

  pageIndex = 1;
  pageSize = 10;
  totalTickets = 0;

  drawerWidth: string | number = 800;

  constructor(
    private ticketService: TicketService,
    private fb: FormBuilder,
    private message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.ticketForm = this.fb.group({
      ticketRefId: [''],
      title: [''],
      description: [''],
      category: [''],
      subCategory: [''],
      status: ['Raised'],
      remark: ['']
    });

    this.updateDrawerWidth();

    const today = new Date();
    this.filters = { status: '', ticketRefId: '', dateRange: [today, today] };

    // initial load
    this.loadTickets();

    this.counts$ = this.ticketService.getStats().pipe(
      map((s: any) => ({
        Processing: s?.Processing ?? 0,
        Raised: s?.Raised ?? 0,
        Resolved: s?.Resolved ?? 0,
        Rejected: s?.Rejected ?? 0
      }))
    );
  }

  @HostListener('window:resize')
  onResize() {
    this.updateDrawerWidth();
  }

  updateDrawerWidth() {
    this.drawerWidth = window.innerWidth < 768 ? '100%' : 800;
  }

  getPopupContainer = (trigger: HTMLElement): HTMLElement => {
    return trigger.parentElement as HTMLElement;
  };

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private loadTickets(): void {
    const opts: any = {
      page: this.pageIndex,
      limit: this.pageSize
    };

    if (this.filterBy === 'status' && this.filters.status) {
      const backendStatus = this.mapUiToBackendStatus(this.filters.status);
      if (backendStatus) opts.status = backendStatus;
    }

    if (this.filterBy === 'refId' && this.filters.ticketRefId) {
      opts.refId = this.filters.ticketRefId;
    }

    if (this.filters.dateRange && Array.isArray(this.filters.dateRange) && this.filters.dateRange.length === 2) {
      const start = new Date(this.filters.dateRange[0]);
      start.setHours(0, 0, 0, 0);
      const end = new Date(this.filters.dateRange[1]);
      end.setHours(23, 59, 59, 999);
      opts.startDate = start.toISOString();
      opts.endDate = end.toISOString();
    }

    this.ticketService.getTickets(opts).subscribe({
      next: (res: any) => {
        let data: any[] = [];
        if (Array.isArray(res)) data = res;
        else if (res && Array.isArray(res.data)) {
          data = res.data;
          if (typeof res.total === 'number') this.totalTickets = res.total;
        } else if (res && Array.isArray(res.items)) {
          data = res.items;
          if (typeof res.total === 'number') this.totalTickets = res.total;
        } else if (res && Array.isArray(res.tickets)) {
          data = res.tickets;
          if (typeof res.total === 'number') this.totalTickets = res.total;
        }

        if (!data || data.length === 0) {
          this.message.info('No tickets found.');
        }

        const normalized = (data || []).map(d => this.normalizeTicket(d));

        this.tickets = normalized.sort((a, b) => {
          const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bt - at;
        });
      },
      error: (err) => {
        console.error('Error fetching tickets', err);
        this.message.error('Something went wrong while fetching tickets!');
      }
    });
  }

  private normalizeTicket(raw: any) {
    const created = raw.createdDate ?? raw.createdAt ?? raw.created ?? null;
    const updated = raw.updatedDate ?? raw.updatedAt ?? raw.updated ?? null;

    let statusLabel = 'Raised';
    const s = (raw.status ?? '').toString().toLowerCase();
    if (['in_progress', 'inprogress', 'processing'].includes(s)) statusLabel = 'Processing';
    else if (['open', 'raised', 'new', 'opened'].includes(s)) statusLabel = 'Raised';
    else if (['resolved', 'closed', 'done'].includes(s)) statusLabel = s === 'closed' ? 'Rejected' : 'Resolved';

    let remark = '';
    if (Array.isArray(raw.remarks) && raw.remarks.length) {
      const last = raw.remarks[raw.remarks.length - 1];
      remark = last?.text ?? last?.action ?? '';
    } else if (raw.remark) {
      remark = raw.remark;
    } else if (raw.remarks && typeof raw.remarks === 'string') {
      remark = raw.remarks;
    }

    return {
      _id: raw._id ?? raw.id,
      ticketRefId: raw.ticketRefId ?? raw.ticketRef ?? raw.refId,
      serialNumber: raw.serialNumber ?? raw.serialNo,
      category: raw.category ?? raw.department,
      subCategory: raw.subCategory ?? raw.sub_category ?? raw.subCat,
      description: raw.description ?? raw.desc,
      createdAt: created ? new Date(created) : null,
      updatedAt: updated ? new Date(updated) : null,
      status: statusLabel,
      remark,
      __raw: raw
    };
  }

  applyFilter(): void {
    this.pageIndex = 1;
    this.loadTickets();
  }

  resetFilters(): void {
    const today = new Date();
    this.filters = { status: '', ticketRefId: '', dateRange: [today, today] };
    this.filterBy = 'all';
    this.applyFilter();
  }

  // ✅ Added: status card click
  onStatusCardClick(status: 'Processing' | 'Raised' | 'Resolved' | 'Rejected'): void {
    this.filterBy = 'status';
    this.filters.status = status;
    this.pageIndex = 1;
    this.loadTickets();
  }

  // ✅ Added: clear status filter
  clearStatusFilter(): void {
    this.filterBy = 'all';
    this.filters.status = '';
    this.pageIndex = 1;
    this.loadTickets();
  }

  openDrawer(ticket: any): void {
    const raw = ticket.__raw ?? ticket;
    this.selectedTicket = {
      ...raw,
      _id: raw._id ?? raw.id ?? ticket._id ?? ticket.id
    };

    if (Array.isArray(this.selectedTicket.remarks) && this.selectedTicket.remarks.length) {
      this.ticketHistory = this.selectedTicket.remarks.map((r: any) => ({
        updatedBy: r.by ?? 'System',
        status: '',
        updatedAt: r.createdAt ?? null,
        remark: r.text ?? ''
      }));
    } else if (Array.isArray(this.selectedTicket.history)) {
      this.ticketHistory = this.selectedTicket.history;
    } else {
      this.ticketHistory = [];
    }

    this.ticketForm.patchValue({
      ticketRefId: ticket.ticketRefId,
      category: ticket.category,
      subCategory: ticket.subCategory,
      status: ticket.status,
      description: ticket.description,
      remark: ''
    });

    this.isDrawerVisible = true;
  }

  closeDrawer(): void {
    this.isDrawerVisible = false;
    this.selectedTicket = null;
    this.ticketForm.reset();
    this.ticketHistory = [];
  }

  saveTicket(): void {
    if (!this.selectedTicket || this.ticketForm.invalid) return;

    const id = this.selectedTicket._id ?? this.selectedTicket.id ?? this.selectedTicket.ticketRefId;
    if (!id || typeof id !== 'string' || id.trim() === '' || id === 'ID') {
      this.message.error('Invalid ticket identifier. Cannot save.');
      return;
    }

    const uiStatus: string = this.ticketForm.value.status;
    const remark: string = (this.ticketForm.value.remark ?? '').trim();
    const backendStatus = this.mapUiToBackendStatus(uiStatus);

    this.ticketService.updateTicketStatus(id, { status: backendStatus, by: 'Support Team' }).subscribe({
      next: () => {
        if (remark) {
          this.ticketService.addRemark(id, { text: remark, by: 'Support Team' }).subscribe({
            next: () => this.afterSuccessfulUpdate(),
            error: (err) => {
              console.error('Error adding remark:', err);
              this.afterSuccessfulUpdate();
              this.message.warning('Status updated but remark failed to save.');
            }
          });
        } else {
          this.afterSuccessfulUpdate();
        }
      },
      error: (err) => {
        console.error('Error updating ticket status:', err);
        const backendMsg = err?.error?.message ?? (err?.message || 'Error updating ticket');
        this.message.error(Array.isArray(backendMsg) ? backendMsg.join(', ') : backendMsg);
      }
    });
  }

  private afterSuccessfulUpdate() {
    this.loadTickets();
    this.refreshCounts();
    this.closeDrawer();
    this.message.success('Ticket updated successfully');
  }

  private mapUiToBackendStatus(uiLabel: string): 'open' | 'in_progress' | 'resolved' | 'closed' {
    const s = (uiLabel ?? '').toString().toLowerCase();
    if (s === 'processing') return 'in_progress';
    if (s === 'resolved') return 'resolved';
    if (s === 'rejected') return 'closed';
    return 'open';
  }

  private refreshCounts() {
    this.counts$ = this.ticketService.getStats().pipe(
      map((s: any) => ({
        Processing: s?.Processing ?? 0,
        Raised: s?.Raised ?? 0,
        Resolved: s?.Resolved ?? 0,
        Rejected: s?.Rejected ?? 0
      }))
    );
  }

  onPageIndexChange(index: number): void {
    this.pageIndex = index;
    this.loadTickets();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 1;
    this.loadTickets();
  }
}
