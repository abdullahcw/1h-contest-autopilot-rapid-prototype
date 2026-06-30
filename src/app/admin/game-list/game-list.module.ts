import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameListRoutingModule } from './game-list-routing.module';

@NgModule({
  imports: [
    CommonModule,
    GameListRoutingModule
  ],
  declarations: []
})
export class GameListModule {
  static isLoaded = false;
  constructor() {
    console.log('GameListModule loaded.');
    GameListModule.isLoaded = true;
  }
}
