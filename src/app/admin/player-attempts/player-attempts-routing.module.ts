import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayerAttemptsComponent } from './player-attempts.component';
import { SharedModule } from '../../shared/shared.module';
import { AddAttemptsComponent } from './add-attempts/add-attempts.component';
import { DatePipe } from '@angular/common';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  { path: '', component: PlayerAttemptsComponent, canActivate: [SessionValidatorService], pathMatch: 'full'}
];
@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    declarations: [PlayerAttemptsComponent, AddAttemptsComponent],
    exports: [RouterModule],
    providers: [DatePipe]
})
export class PlayerAttemptsRoutingModule { }
