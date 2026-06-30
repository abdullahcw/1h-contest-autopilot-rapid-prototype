import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MultilevelGamesListComponent } from './multilevel-games-list.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateMultilevelGameComponent } from '../create-multilevel-game/create-multilevel-game.component';
// tslint:disable-next-line:max-line-length
import { CreateMultilevelGameHeaderComponent } from '../create-multilevel-game/create-multilevel-game-header/create-multilevel-game-header.component';
import { ScheduleMultilevelGamesComponent } from '../schedule-multilevel-games/schedule-multilevel-games.component';
import { MlgSavePopUpComponent } from 'src/app/admin/create-multilevel-game/mlg-save-pop-up/mlg-save-pop-up.component';

const routes: Routes = [
  { path: '', component: MultilevelGamesListComponent, canActivate: [SessionValidatorService], pathMatch: 'full' },
  { path: 'create-multilevel', component: CreateMultilevelGameComponent, canActivate: [SessionValidatorService], pathMatch: 'full' },
  {
    path: 'create-multilevel/schedule-multilevel', component: ScheduleMultilevelGamesComponent,
    canActivate: [SessionValidatorService], pathMatch: 'full'
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  // tslint:disable-next-line:max-line-length
  declarations: [MultilevelGamesListComponent, CreateMultilevelGameComponent,
    CreateMultilevelGameHeaderComponent, ScheduleMultilevelGamesComponent, MlgSavePopUpComponent],
})
export class MultilevelGamesListRoutingModule {
  constructor() {
    console.log('multileve Game loaded.');
  }
}
