import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ManagersComponent } from './managers.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ViewListComponent } from '../view-list/view-list.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  { path: '', component: ManagersComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [ManagersComponent,ViewListComponent]
})
export class ManagersRoutingModule {
  constructor() {
    console.log('ManagersRoutingModule loaded.');
  }
}
