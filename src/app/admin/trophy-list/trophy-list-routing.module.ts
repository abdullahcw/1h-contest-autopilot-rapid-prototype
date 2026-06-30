import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrophyListComponent } from './trophy-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  { path: '', component: TrophyListComponent, canActivate: [SessionValidatorService], pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [TrophyListComponent]
})
export class TrophyListRoutingModule { }
