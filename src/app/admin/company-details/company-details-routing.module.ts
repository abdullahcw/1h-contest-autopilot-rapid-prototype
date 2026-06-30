import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyDetailsComponent } from './company-details.component';
import { CropImageComponent } from '../../shared/crop-image/crop-image.component';
import { AddCompanyComponent } from '../add-company/add-company.component';
import { DeleteCompanyComponent } from '../delete-company/delete-company.component';
import { RecaptchaModule } from 'ng-recaptcha';
import { SharedModule } from '../../shared/shared.module';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  {
    path: '', component: CompanyDetailsComponent, canActivate: [SessionValidatorService], pathMatch: 'full', data: {
      breadcrumb: 'Company Details'
    }
  }
];

@NgModule({
    declarations: [CompanyDetailsComponent,
        AddCompanyComponent, DeleteCompanyComponent],
    imports: [RouterModule.forChild(routes),
        SharedModule,
        RecaptchaModule
    ],
    exports: [RouterModule]
})
export class CompanyDetailsRoutingModule {
  constructor() {
    console.log('CompanyDetailsRoutingModule loaded.');
  }
}
