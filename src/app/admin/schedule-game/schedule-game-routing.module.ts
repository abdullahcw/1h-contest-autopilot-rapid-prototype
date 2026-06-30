import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScheduleGameComponent } from '../schedule-game/schedule-game.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  { path: '', component: ScheduleGameComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [ScheduleGameComponent]
})
export class ScheduleGameRoutingModule { }
