import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';
import { CompanyComponent } from './company.component';
import { SharedModule } from '../../shared/shared.module';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
const routes: Routes = [
  {
    path: '', component: CompanyComponent, canActivate: [SessionValidatorService], pathMatch: 'full'
  }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    declarations: [CompanyComponent],
    exports: [RouterModule]
})
export class CompanyRoutingModule { }
