import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddDepartmentComponent } from '../add-department/add-department.component';
import { DepartmentListComponent } from './department-list.component';
import { SharedModule } from '../../shared/shared.module';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  { path: '', component: DepartmentListComponent, canActivate: [SessionValidatorService], pathMatch: 'full'}
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule
    ],
    exports: [RouterModule],
    declarations: [AddDepartmentComponent, DepartmentListComponent]
})
export class DepartmentListRoutingModule { }
