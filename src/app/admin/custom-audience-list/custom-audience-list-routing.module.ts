import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomAudienceListComponent } from './custom-audience-list.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddAudienceComponent } from '../add-audience/add-audience.component';
import { PlayersInAudienceComponent } from '../add-audience/players-in-audience/players-in-audience.component';
import { AddPlayersInAudienceComponent } from '../add-audience/add-players-in-audience/add-players-in-audience.component';


const routes: Routes = [
  { path: '', component: CustomAudienceListComponent, canActivate: [SessionValidatorService], pathMatch: 'full' },
  { path: 'edit', component: PlayersInAudienceComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [CustomAudienceListComponent, AddAudienceComponent, PlayersInAudienceComponent, AddPlayersInAudienceComponent]
})
export class CustomAudienceListRoutingModule { }
