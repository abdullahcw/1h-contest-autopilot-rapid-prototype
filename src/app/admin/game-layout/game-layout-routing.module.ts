import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameLayoutComponent } from './game-layout.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateSeriesComponent } from './create-series/create-series.component';
import { GamesInSeriesComponent } from './games-in-series/games-in-series.component';

const routes: Routes = [
  { path: '', component: GameLayoutComponent, canActivate: [SessionValidatorService], pathMatch: 'full'}
];
@NgModule({
  imports: [RouterModule.forChild(routes),SharedModule],
  exports: [RouterModule],
  declarations: [GameLayoutComponent,CreateSeriesComponent,GamesInSeriesComponent]
})
export class GameLayoutRoutingModule { }
