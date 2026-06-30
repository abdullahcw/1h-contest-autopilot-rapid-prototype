import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainControllerRoutingModule } from './main-controller-routing.module';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MainControllerRoutingModule
   
  ],
  declarations: []
})
export class MainControllerModule { }
