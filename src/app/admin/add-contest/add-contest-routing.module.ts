import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddContestComponent } from './add-contest.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { AddContestHeaderComponent } from './add-contest-header/add-contest-header.component';
import { AddGamesInContestComponent } from './add-games-in-contest/add-games-in-contest.component';
import { SharedModule } from '../../shared/shared.module';
import { ScheduleContestComponent } from '../schedule-contest/schedule-contest.component';
import { MasterOverlayComponent } from '../master-overlay/master-overlay.component';
import { ContestRewardComponent } from '../contest-reward/contest-reward.component';
import { ContestRulesComponent } from '../contest-rules/contest-rules.component';
import { ContestNotificationComponent } from '../contest-notification/contest-notification.component';
import { ContestTrophyComponent } from '../contest-trophy/contest-trophy.component';
const routes: Routes = [
  { path: '', component: AddContestComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes),
        SharedModule],
    exports: [RouterModule, AddGamesInContestComponent],
    declarations: [AddContestComponent, AddContestHeaderComponent, MasterOverlayComponent,
        ScheduleContestComponent, ContestRewardComponent, ContestRulesComponent, ContestNotificationComponent,
        ContestTrophyComponent, AddGamesInContestComponent]
})
export class AddContestRoutingModule { }
