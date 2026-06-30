import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrandingRoutingModule } from './branding-routing.module';

@NgModule({
  imports: [
    CommonModule,
    BrandingRoutingModule
  ],
  declarations: []
})
export class BrandingModule {
  constructor() {
    console.log('BrandingModule loaded.');
  }
}
