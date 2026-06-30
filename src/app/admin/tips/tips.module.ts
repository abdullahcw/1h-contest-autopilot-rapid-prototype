import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TipsRoutingModule } from './tips-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TipsRoutingModule
  ],
  exports: [TipsRoutingModule]
})
export class TipsModule { }
