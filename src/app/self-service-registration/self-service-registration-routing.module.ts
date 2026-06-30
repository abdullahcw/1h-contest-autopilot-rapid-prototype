import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material.module';
import { RecaptchaModule } from 'ng-recaptcha';
import { SelfServiceRegistrationComponent } from './self-service-registration.component';

const routes: Routes = [
  { path: '', component: SelfServiceRegistrationComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule,
    RecaptchaModule],
  exports: [RouterModule],
  declarations: [SelfServiceRegistrationComponent]
})
export class SelfServiceRegistrationRoutingModule {
  constructor() {
    console.log('ssr loaded.');
  }
}
