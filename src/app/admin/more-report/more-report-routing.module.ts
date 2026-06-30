import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MoreReportComponent } from './more-report.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {path: '', component: MoreReportComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [MoreReportComponent]

})
export class MoreReportRoutingModule { }
