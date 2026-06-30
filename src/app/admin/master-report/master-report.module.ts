import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterReportRoutingModule } from './master-report-routing.module';

@NgModule({
  imports: [
    CommonModule,
    MasterReportRoutingModule
  ],
  exports: [MasterReportRoutingModule],
  declarations: []
})
export class MasterReportModule { }
