import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocationListRoutingModule } from './location-list-routing.module';

@NgModule({
  imports: [
    CommonModule,
    LocationListRoutingModule
  ],
  declarations: []
})
export class LocationListModule {
  constructor() {
    console.log('LocationListModule loaded.');
  }
}
