import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketManagementComponent } from './ticket-management/ticket-management';
import { UploadFilesComponent } from './file-upload/file-upload';
import { ExportData } from './export-data/export-data';

const routes: Routes = [
   
    { path: '', redirectTo: 'ticket-management', pathMatch: 'full' },

    { path: 'ticket-management', component: TicketManagementComponent },

    { path: 'tickets', component: TicketManagementComponent },

    { path: 'file-upload', component: UploadFilesComponent },

    { path: 'export-data', component: ExportData },

    { path: '**', redirectTo: 'ticket-management' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SupportRoutingModule { }
