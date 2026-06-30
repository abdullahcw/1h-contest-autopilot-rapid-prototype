import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { IpConfigurationComponent } from './ip-configuration.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddIpComponent } from './add-ip/add-ip.component';
import { AddLocDeptCustomFieldsComponent } from './add-loc-dept-custom-fields/add-loc-dept-custom-fields.component';

const routes: Routes = [
  { path: '', component: IpConfigurationComponent, canActivate: [SessionValidatorService], pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes),SharedModule],
  exports: [RouterModule],
  declarations: [IpConfigurationComponent,AddIpComponent,AddLocDeptCustomFieldsComponent]
})
export class IpConfigurationRoutingModule { 
  constructor() {
    console.log('ip loaded.');
  }
}
