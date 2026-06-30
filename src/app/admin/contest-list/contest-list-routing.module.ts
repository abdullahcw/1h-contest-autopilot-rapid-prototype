import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContestListComponent } from './contest-list.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  { path: '', component: ContestListComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [ContestListComponent],
})
export class ContestListRoutingModule {
  constructor() {
    console.log('contestRouting loaded.');
  }
 }
