import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportRoutingModule } from './support-routing.module';

// standalone component import (standalone components go into imports)
import { TicketManagementComponent } from './ticket-management/ticket-management';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// ng-zorro modules used
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { RouterModule, Routes } from '@angular/router';



const routes: Routes = [
  {
    path: 'ticket-management',
    component: TicketManagementComponent
  }
];


@NgModule({
    // standalone components must be imported (not declared)
    imports: [
        CommonModule,
        FormsModule,
        SupportRoutingModule,
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
        TicketManagementComponent,
        RouterModule.forChild(routes)
    ]
    // no declarations
})
export class SupportModule { }
