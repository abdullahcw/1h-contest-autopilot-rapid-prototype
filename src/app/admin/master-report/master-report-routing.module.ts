import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { MasterReportComponent } from './master-report.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  { path: '', component: null, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: []
})
export class MasterReportRoutingModule { }
