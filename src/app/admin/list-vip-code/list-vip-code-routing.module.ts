import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListVipCodeComponent } from './list-vip-code.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

import { ReactivateVIPcodeComponent } from './reactivate-vipcode/reactivate-vipcode.component';
import { AddVipCodeComponent } from './add-vip-code/add-vip-code.component';
const routes: Routes = [
  { path: '', component: ListVipCodeComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [ListVipCodeComponent, AddVipCodeComponent, ReactivateVIPcodeComponent]
})
export class ListVipCodeRoutingModule { }
