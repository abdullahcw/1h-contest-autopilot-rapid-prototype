import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupListComponent } from './group-list.component';
import { SharedModule } from '../../shared/shared.module';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  { path: '', component: GroupListComponent, canActivate: [SessionValidatorService], pathMatch: 'full'}
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [GroupListComponent]
})
export class GroupListRoutingModule {
  constructor() {
    console.log('GroupListRouting loaded.');
  }
}
