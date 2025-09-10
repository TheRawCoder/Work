import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';


interface FileData {
    _id: string;
    name: string;
    size: number;
    mimetype?: string;
    uploadedAt?: Date;
}

@Component({
    selector: 'app-upload-files',
    standalone: true,
    imports: [CommonModule, NzModalModule],
    providers: [DecimalPipe, DatePipe],
    templateUrl: './file-upload.html',
    styleUrls: ['./file-upload.scss']
})
export class UploadFilesComponent implements OnInit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    selectedFile: File | null = null;
    uploadedFiles: FileData[] = [];
    isUploading: boolean = false;

    constructor(private http: HttpClient, private message: NzMessageService, private cdr: ChangeDetectorRef, private modal: NzModalService) { }


    ngOnInit() {
        this.fetchHistory();
    }

    fetchHistory(showMessage: boolean = false) {
        this.http.post<any>('http://localhost:3000/upload-data/fetch-files', {}).subscribe({
            next: (res) => {
                this.uploadedFiles = res.data || [];
                if (showMessage) {
                    if (this.uploadedFiles.length) {
                        this.message.success('History loaded.');
                    } else {
                        this.message.warning('No history found.');
                    }
                }
            },
            error: (err) => {
                console.error(err);
                if (showMessage) {
                    this.message.error('Failed to load upload history.');
                }
            }
        });
    }


    refreshTable() {
        this.fetchHistory();
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0] || null;
    }

    uploadFile() {
        if (!this.selectedFile) {
            this.message.warning('⚠️ Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.isUploading = true;

        this.http.post<any>('http://localhost:3000/upload-data/upload', formData).subscribe({
            next: (res) => {
                this.message.success(res.message || 'File uploaded!');
                this.uploadedFiles = [
                    {
                        _id: res.fileId || '',
                        name: this.selectedFile!.name,
                        size: this.selectedFile!.size,
                        mimetype: this.selectedFile!.type,
                        uploadedAt: new Date()
                    },
                    ...this.uploadedFiles
                ];

                this.selectedFile = null;
                this.fileInput.nativeElement.value = '';
                this.isUploading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                const backendMsg = Array.isArray(err.error?.message)
                    ? err.error.message.join(', ')
                    : err.error?.message || 'Upload failed!';
                this.message.error(`❌ ${backendMsg}`);
                this.isUploading = false;
                this.cdr.detectChanges();
            }
        });
    }

    deleteFile(fileId: string) {
        if (!fileId) {
            this.message.warning('File ID not found');
            return;
        }
        this.modal.confirm({
            nzTitle: 'Are you sure you want to delete this file?',
            nzContent: 'This will delete the file and all its associated data permanently.',
            nzOkText: 'Yes',
            nzCancelText: 'No',
            nzOkType: 'primary',
            nzOkDanger: true,
            nzOnOk: () => {
                this.http.post<any>('http://localhost:3000/upload-data/deleteById', { id: fileId }).subscribe({
                    next: (res) => {
                        this.message.success(res.message || 'File deleted!');
                        this.uploadedFiles = this.uploadedFiles.filter(f => f._id !== fileId);
                    },
                    error: (err) => {
                        this.message.error(err.error?.message || 'Failed to delete file');
                    }
                });
            }
        });
    }



}
