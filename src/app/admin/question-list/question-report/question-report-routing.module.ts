import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuestionReportComponent } from './question-report.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {path: '', component: QuestionReportComponent, pathMatch: 'full'}
];
@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [QuestionReportComponent]
})
export class QuestionReportRoutingModule { }
