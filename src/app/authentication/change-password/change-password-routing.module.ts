import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password.component';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  { path: '', component: ChangePasswordComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule],
  exports: [RouterModule],
  declarations: [ChangePasswordComponent]
})
export class ChangePasswordRoutingModule {
  constructor() {
    console.log('ChangePasswordRoutingModule loaded.');
  }
}
