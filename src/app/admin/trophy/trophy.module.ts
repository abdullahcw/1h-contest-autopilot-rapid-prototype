import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrophyRoutingModule } from './trophy-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TrophyRoutingModule
  ],
  exports: [TrophyRoutingModule]
})
export class TrophyModule { }
