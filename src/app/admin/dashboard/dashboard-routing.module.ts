import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MasterReportComponent } from '../master-report/master-report.component';
import { PlayerReportComponent } from './player-report/player-report.component';
import { PlayerGameReportComponent } from './player-game-report/player-game-report.component';
import { ReportByHirarchyComponent } from '../report-by-hirarchy/report-by-hirarchy.component';
import { GameplayLeaderboardComponent } from './gameplay-leaderboard/gameplay-leaderboard.component';
import { GameplayCardComponent } from './gameplay-card/gameplay-card.component';
import { DashboardByTypeComponent } from './dashboard-by-type/dashboard-by-type.component';
import { DashboardByMlgComponent } from './dashboard-by-mlg/dashboard-by-mlg.component';
import { MlgBarChartComponent } from './mlg-bar-chart/mlg-bar-chart.component';
import { GamePlayReportPopupComponent } from './game-play-report-popup/game-play-report-popup.component';
import { MlgDashbaordLeaderboardComponent } from './mlg-dashbaord-leaderboard/mlg-dashbaord-leaderboard.component';
import { MlgDashbaordPerformanceLevelComponent } from './mlg-dashbaord-performance-level/mlg-dashbaord-performance-level.component';
import { MlgCircleChartComponent } from './mlg-circle-chart/mlg-circle-chart.component';
import { MlgGamePlayReportDialogComponent } from './mlg-game-play-report-dialog/mlg-game-play-report-dialog.component';
import { DashboardByContestComponent } from './dashboard-by-contest/dashboard-by-contest.component';
import { ContestDashboardLeaderboardComponent } from './contest-dashboard-leaderboard/contest-dashboard-leaderboard.component';
import { ContestDashboardPerformanceGameComponent } from './contest-dashboard-performance-game/contest-dashboard-performance-game.component';
import { TotalGameplayByContestComponent } from './player-report/total-gameplay-by-contest/total-gameplay-by-contest.component';
import { ContestCircleChartComponent } from './player-report/total-gameplay-by-contest/contest-circle-chart/contest-circle-chart.component';
import { DashboardByPlayerComponent } from './dashboard-by-player/dashboard-by-player.component';
import { MilestoneAchivedComponent } from './dashboard-by-player/milestone-achived/milestone-achived.component';
import { LatestTrophiesComponent } from './dashboard-by-player/latest-trophies/latest-trophies.component';
import { GameplayByDateComponent } from './dashboard-by-player/gameplay-by-date/gameplay-by-date.component';
import { StreakCalendarComponent } from './dashboard-by-player/streak-calendar/streak-calendar.component';
import { PlayerDashboardPerformanceComponent } from './dashboard-by-player/player-dashboard-performance/player-dashboard-performance.component';
import { TotalGameplayByPlayerComponent } from './player-report/total-gameplay-by-player/total-gameplay-by-player.component';
import { PlayerContestReportComponent } from './player-report/player-contest-report/player-contest-report.component';
import { PlayerAchivementsComponent } from './player-report/player-achivements/player-achivements.component';
import { DashboardBySlgComponent } from './dashboard-by-slg/dashboard-by-slg.component';
import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { GlobalPinnedGamesComponent } from './global-pinned-games/global-pinned-games.component';
import { PinnedGameOnDashboardComponent } from './pinned-game-on-dashboard/pinned-game-on-dashboard.component';
import { WinRateCalculationInfoComponent } from './dashboard-by-type/win-rate-calculation-info/win-rate-calculation-info.component';
import { PathwayInsightsComponent } from './pathway-insights/pathway-insights.component';
import { SkillInsightsComponent } from './skill-insights/skill-insights/skill-insights.component';
import { EngagmentInsightsComponent } from './engagement-insights/engagment-insights.component';
  
export function playerFactory() {
  return player;
}

const routes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [SessionValidatorService],pathMatch: 'full', data: {
      breadcrumb: 'Dashboard'
    }
  },
  {
    path: 'player-report', component: PlayerReportComponent, canActivate: [SessionValidatorService], pathMatch: 'full', data: {
      breadcrumb: 'Player Report'
    }
  },
  {
    path: 'player-game-report', component: PlayerGameReportComponent, canActivate: [SessionValidatorService] , pathMatch: 'full', data: {
      breadcrumb: 'Player Game Report'
    }
  },
  {
    path: 'pathway-insight', component: PathwayInsightsComponent, canActivate: [SessionValidatorService] , pathMatch: 'full', data: {
      breadcrumb: 'Player Game Report'
    }
  },
  {
    path: 'engagement-insight', component: EngagmentInsightsComponent, canActivate: [SessionValidatorService] , pathMatch: 'full', data: {
      breadcrumb: 'Player Game Report'
    }
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule,
    LottieModule.forRoot({ player: playerFactory })
  ],
  declarations: [DashboardComponent, MasterReportComponent, PlayerReportComponent, GameplayCardComponent, DashboardByTypeComponent, WinRateCalculationInfoComponent, DashboardByMlgComponent, DashboardByPlayerComponent,
    PlayerGameReportComponent, ReportByHirarchyComponent, GameplayLeaderboardComponent, GlobalPinnedGamesComponent,PinnedGameOnDashboardComponent,MlgDashbaordLeaderboardComponent, MlgDashbaordPerformanceLevelComponent, PlayerDashboardPerformanceComponent,
    MlgBarChartComponent,MlgCircleChartComponent,GamePlayReportPopupComponent,MlgGamePlayReportDialogComponent, GameplayByDateComponent, StreakCalendarComponent,
    MilestoneAchivedComponent,LatestTrophiesComponent, TotalGameplayByPlayerComponent, PlayerContestReportComponent,PlayerAchivementsComponent,
    ContestDashboardLeaderboardComponent,DashboardByContestComponent,DashboardBySlgComponent,
    MlgBarChartComponent,MlgCircleChartComponent,GamePlayReportPopupComponent,MlgGamePlayReportDialogComponent, ContestDashboardPerformanceGameComponent, TotalGameplayByContestComponent,ContestCircleChartComponent,
    EngagmentInsightsComponent,PathwayInsightsComponent,SkillInsightsComponent],
  exports: [RouterModule],
  providers: [DatePipe],
  

})
export class DashboardRoutingModule {
  constructor() {
    console.log('DashboardRoutingModule loaded.');
  }
}
