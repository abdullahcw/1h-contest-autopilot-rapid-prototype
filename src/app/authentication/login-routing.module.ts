import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from 'src/app/authentication/forgot-password/forgot-password.component';
// import { SsoComponent } from './sso/sso.component';

const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        TranslateModule
    ],
    declarations: [LoginComponent, ForgotPasswordComponent],
    exports: [RouterModule]
})
export class LoginRoutingModule {
  constructor() {
    console.log('LoginRoutingModule loaded.');
  }
}
