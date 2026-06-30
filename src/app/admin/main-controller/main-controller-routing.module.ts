import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { SharedModule } from '../../shared/shared.module';
import { CompanyService } from '../../services/company/company.service';
import { MaterialModule } from '../../material.module';
import { SessionValidatorService } from '../../services/session-validator/session-validator.service';
import { WipComponent } from '../wip/wip.component';
import { NotificationComponent } from '../notifications/notification.component';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { MarketplaceComponent } from '../marketplace/marketplace.component';
import { MarketplaceViewAllComponent } from '../marketplace-view-all/marketplace-view-all.component';


const routes: Routes = [
  {
    path: '', component: AdminComponent, children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'dashboard/player-report',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'dashboard/player-game-report',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'dashboard/pathway-insight',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'dashboard/engagement-insight',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'company',
        loadChildren: () => import('../company/company.module').then(m => m.CompanyModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'company/:pageIndex/:pageLimit',
        loadChildren: () => import('../company/company.module').then(m => m.CompanyModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'masterReport',
        loadChildren: () => import('../master-report/master-report.module').then(m => m.MasterReportModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'company/company-details',
        loadChildren: () => import('../company-details/company-details.module').then(m => m.CompanyDetailsModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'company/company-details/:companyId',
        loadChildren: () => import('../company-details/company-details.module').then(m => m.CompanyDetailsModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'company-details',
        loadChildren: () => import('../company-details/company-details.module').then(m => m.CompanyDetailsModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'player-attempts',
        loadChildren: () => import('../player-attempts/player-attempts.module').then(m => m.PlayerAttemptsModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'live-sessions',
        loadChildren: () => import('../live-sessions/live-sessions.module').then(m => m.LiveSessionsModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'locations',
        loadChildren: () => import('../location-list/location-list.module').then(m => m.LocationListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'departments',
        loadChildren: () => import('../department-list/department-list.module').then(m => m.DepartmentListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'branding',
        loadChildren: () => import('../branding/branding.module').then(m => m.BrandingModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'groups',
        loadChildren: () => import('../group-list/group-list.module').then(m => m.GroupListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'ip-configuration',
        loadChildren: () => import('../ip-configuration/ip-configuration.module').then(m => m.IpConfigurationModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'vipcodes',
        loadChildren: () => import('../list-vip-code/list-vip-code.module').then(m => m.ListVipCodeModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'games',
        loadChildren: () => import('../game-list/game-list.module').then(m => m.GameListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'questions',
        loadChildren: () => import('../question-list/question-list.module').then(m => m.QuestionListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'player-feedback',
        loadChildren: () => import('../player-feedback/player-feedback.module').then(m => m.PlayerFeedbackModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'faq',
        loadChildren: () => import('../faq/faq.module').then(m => m.FaqModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'tutorial-video',
        loadChildren: () => import('../tutorial-video/tutorial-video.module').then(m => m.TutorialVideoModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'players',
        loadChildren: () => import('../players/players.module').then(m => m.PlayersModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'managers',
        loadChildren: () => import('../managers/managers.module').then(m => m.ManagersModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'question1',
        loadChildren: () => import('../question/question.module').then(m => m.QuestionModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'wip',
        component: WipComponent,
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'trophy',
        loadChildren: () => import('../trophy/trophy.module').then(m => m.TrophyModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'trophyReport',
        loadChildren: () => import('../trophy-report/trophy-report.module').then(m => m.TrophyReportModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'reports/questions-report',
        loadChildren: () => import('../question-list/question-report/question-report.module').then(m => m.QuestionReportModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'game-attempt',
        component: WipComponent,
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'notifications',
        component: NotificationComponent,
        canActivate: [SessionValidatorService]
      },
      {
        path: 'leaderboard',
        component: LeaderboardComponent,
        canActivate: [SessionValidatorService]
      },
      {
        path: 'game-layout',
        loadChildren: () => import('../game-layout/game-layout.module').then(m => m.GameLayoutModule),
        canActivate: [SessionValidatorService]
      },
      // {
      //   path: 'reorder-games',
      //   loadChildren: () => import('../reorder-games/reorder-games.module').then(m => m.ReorderGamesModule),
      //   canActivate: [SessionValidatorService]
      // },
      // {
      //   path: 'qrcode',
      //   loadChildren: () => import('../company-qrcode/company-qrcode-routing.module').then(m => m.CompanyQRcodeRoutingModule),
      //   canActivate: [SessionValidatorService]
      // },
      {
        path: 'reports/trophy-list',
        loadChildren: () => import('../trophy-list/trophy-list.module').then(m => m.TrophyListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'tips',
        loadChildren: () => import('../tips/tips.module').then(m => m.TipsModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'popup-alerts',
        loadChildren: () => import('../popup-alerts/popup-alerts.module').then(m => m.PopupAlertsModule)
      },
      {
        path: 'schedule-game',
        loadChildren: () => import('../schedule-game/schedule-game.module').then(m => m.ScheduleGameModule),
        canActivate: [SessionValidatorService]
      },
      {
        path: 'more-reports',
        loadChildren: () => import('../more-report/more-report.module').then(m => m.MoreReportModule),
        canActivate: [SessionValidatorService]
      },
      {
        path: 'contests',
        loadChildren: () => import('../contest-list/contest-list.module').then(m => m.ContestListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'create-contest',
        loadChildren: () => import('../add-contest/add-contest.module').then(m => m.AddContestModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'multilevel',
        loadChildren: () => import('../multilevel-games-list/multilevel-games-list.module').then(m => m.MultilevelGamesListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'shop',
        component: MarketplaceComponent,
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'shop/category/shop-game',
        loadChildren: () => import('../add-marketplace-game/add-marketplace-game.module').then(m => m.AddMarketplaceGameModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'shop/category',
        component: MarketplaceViewAllComponent,
      },
      {
        path: 'game-categories',
        loadChildren: () => import('../game-category-list/game-category-list.module').then(m => m.GameCategoryListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'game-pathways',
        loadChildren: () => import('../game-pathways/game-pathways.module').then(m => m.GamePathwaysModule),
      },
      {
        path: 'custom-audience',
        loadChildren: () => import('../custom-audience-list/custom-audience-list.module').then(m => m.CustomAudienceListModule),
        // canActivate: [SessionValidatorService]
      },
      {
        path: 'reports/shop-report',
        loadChildren: () => import('../shop-report/shop-report.module').then(m => m.ShopReportModule),
      },
      {
        // canActivate: [SessionValidatorService]
        path: 'accounts',
        loadChildren: () => import('../accounts/accounts.module').then(m => m.AccountsModule),
        canActivate: [SessionValidatorService]
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    MaterialModule
  ],
  declarations: [AdminComponent],
  exports: [RouterModule],
  providers: [CompanyService, SessionValidatorService]
})
export class MainControllerRoutingModule { }
