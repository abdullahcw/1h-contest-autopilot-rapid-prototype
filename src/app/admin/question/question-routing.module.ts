import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuestionComponent } from './question.component';
import { SharedModule } from '../../shared/shared.module';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { MobileQuestionComponent } from '../mobile-question/mobile-question.component';


const routes: Routes = [
  { path: '', component: QuestionComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule, MatTooltipModule],
  declarations: [],
  exports: [RouterModule],
  // entryComponents: [MobileQuestionComponent]
})
export class QuestionRoutingModule {
  constructor() {
    console.log('QuestionRoutingModule loaded.');
  }
}
