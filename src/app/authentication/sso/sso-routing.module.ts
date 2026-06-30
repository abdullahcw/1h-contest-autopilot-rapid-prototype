import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SsoComponent } from './sso.component';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SsoMessageComponent } from './sso-message/sso-message.component';

const routes: Routes = [
  { path: '', component: SsoComponent, pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
    exports: [RouterModule],
    declarations: [SsoComponent, SsoMessageComponent]
})
export class SsoRoutingModule { }
