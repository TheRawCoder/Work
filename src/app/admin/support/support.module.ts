import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportRoutingModule } from './support-routing.module';
import { TicketManagementComponent } from './ticket-management/ticket-management';
import { UploadFilesComponent } from './file-upload/file-upload';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NzCardModule,
    NzTableModule,
    NzSelectModule,
    NzDatePickerModule,
    NzButtonModule,
    NzInputModule,
    NzDropDownModule,
    NzEmptyModule,
    SupportRoutingModule,         
    TicketManagementComponent,    
    UploadFilesComponent
  ]
})
export class SupportModule { }
