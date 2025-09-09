

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
selector: 'app-side-nav',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './side-nav.html',
  styleUrls: ['./side-nav.scss']
})
export class SideNavComponent {
    @Input() collapsed = false;
  isSupportMasterOpen = false;

  toggleSupportMaster() {
    this.isSupportMasterOpen = !this.isSupportMasterOpen;
  }
}