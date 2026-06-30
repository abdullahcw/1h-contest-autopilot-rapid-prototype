import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrophyReportComponent } from './trophy-report.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DatePipe } from '@angular/common';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
const routes: Routes = [
  { path: '', component: TrophyReportComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];
@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [TrophyReportComponent],
  providers: [DatePipe]
})
export class TrophyReportRoutingModule { }
