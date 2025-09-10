import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ExportDataService } from '../../../services/export-data.service';
import { saveAs } from 'file-saver';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import * as ExcelJS from 'exceljs';

@Component({
    selector: 'app-export-data',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NzTableModule,
        NzSelectModule,
        NzDatePickerModule,
        NzGridModule,
        NzButtonModule,
        NzTagModule
    ],
    templateUrl: './export-data.html',
    styleUrls: ['./export-data.scss']
})
export class ExportData implements OnInit {
    uploadedData: any[] = [];
    filters: any = { status: '', ticketRefId: '', dateRange: [] };
    filterBy: string = 'all';

    pageIndex = 1;
    pageSize = 10;

    isExporting: boolean = false;

    constructor(
        private exportService: ExportDataService,
        private message: NzMessageService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        const today = new Date();
        this.filters.dateRange = [today, today];
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    applyFilter() {
        const payload: any = {};

        if (this.filters.dateRange && this.filters.dateRange.length === 2) {
            payload.startDate = this.formatDate(this.filters.dateRange[0]);
            payload.endDate = this.formatDate(this.filters.dateRange[1]);
        }

        if (this.filterBy === 'status' && this.filters.status) {
            payload.status = this.filters.status;
        }

        if (this.filters.ticketRefId) {
            payload.ticketRefId = this.filters.ticketRefId.trim();
        }

        this.exportService.fetchData(payload).subscribe({
            next: (res: any) => {
                this.uploadedData = res.data || [];
                if (!res.data?.length) {
                    this.message.warning('No records found!');
                }
            },
            error: () => this.message.error('Error fetching data!')
        });
    }

    resetFilters() {
        const today = new Date();
        this.filters = { status: '', ticketRefId: '', dateRange: [today, today] };
        this.filterBy = 'all';
        this.uploadedData = []; 
    }

    onPageIndexChange(index: number) {
        this.pageIndex = index;
    }

    onPageSizeChange(size: number) {
        this.pageSize = size;
        this.pageIndex = 1;
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'Processing': return '#FAAD14';
            case 'Raised': return '#2F54EB';
            case 'Resolved': return '#52C41A';
            case 'Rejected': return '#FF4D4F';
            default: return '#D9D9D9';
        }
    }

    
    private normalizeToArrayBufferCopy(bufferResult: unknown): ArrayBuffer {
        if (bufferResult instanceof ArrayBuffer) {
            const src = new Uint8Array(bufferResult);
            const dest = new Uint8Array(src.length);
            dest.set(src);
            return dest.buffer;
        }

        if (ArrayBuffer.isView(bufferResult as any)) {
            const view = bufferResult as ArrayBufferView;
            const src = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
            const dest = new Uint8Array(src.length);
            dest.set(src);
            return dest.buffer;
        }

        if (bufferResult && typeof bufferResult === 'object' && (bufferResult as any).buffer) {
            const maybeBuf = (bufferResult as any).buffer;
            const byteOffset = typeof (bufferResult as any).byteOffset === 'number' ? (bufferResult as any).byteOffset : 0;
            const byteLength = typeof (bufferResult as any).byteLength === 'number' ? (bufferResult as any).byteLength : (maybeBuf && maybeBuf.byteLength) || 0;
            if (maybeBuf instanceof ArrayBuffer) {
                const src = new Uint8Array(maybeBuf, byteOffset, byteLength);
                const dest = new Uint8Array(src.length);
                dest.set(src);
                return dest.buffer;
            }
        }

        throw new Error('Unsupported buffer format returned by ExcelJS.writeBuffer()');
    }

    exportToExcelFrontend() {
        if (!this.uploadedData.length) {
            this.message.warning('No data available to export.');
            return;
        }

        this.isExporting = true;

        setTimeout(() => {
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('UploadedData');

                const firstRow = this.uploadedData[0] || {};
                worksheet.columns = Object.keys(firstRow).map(key => ({
                    header: key,
                    key: key,
                    width: 20
                }));

                this.uploadedData.forEach(record => worksheet.addRow(record));

                workbook.xlsx.writeBuffer()
                    .then((bufferResult: unknown) => {
                        try {
                            
                            const arrayBufferCopy = this.normalizeToArrayBufferCopy(bufferResult);

                            const blob = new Blob([arrayBufferCopy], {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            });

                            saveAs(blob, 'UploadedData.xlsx');
                            this.message.success('✅ Excel exported successfully!');
                        } catch (normalizeErr) {
                            console.error('Failed to normalize buffer result:', normalizeErr);
                            this.message.error('❌ Failed to process exported data.');
                        }
                    })
                    .catch((err: any) => {
                        console.error('Excel export error:', err);
                        this.message.error('❌ Failed to export Excel!');
                    })
                    .finally(() => {
                        this.isExporting = false;
                        this.cdr.detectChanges();
                    });
            } catch (err) {
                console.error('Unexpected export error:', err);
                this.message.error('❌ Unexpected error while exporting!');
                this.isExporting = false;
                this.cdr.detectChanges();
            }
        }, 0);
    }
}
