import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { GamePathwaysComponent } from './game-pathways.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddPathwayComponent } from './add-pathway/add-pathway.component';

const routes: Routes = [
  { path: '', component: GamePathwaysComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes),SharedModule],
  exports: [RouterModule],
  declarations:[GamePathwaysComponent,AddPathwayComponent]
})
export class GamePathwaysRoutingModule { }
