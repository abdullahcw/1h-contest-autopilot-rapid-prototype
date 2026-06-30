import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { TranslateModule } from '@ngx-translate/core';
import { DeferLoadModule } from '@trademe/ng-defer-load';
import { PreloadAllModules } from '@angular/router';
import { UploadingProgressComponent } from './admin/uploading-progress/uploading-progress.component';
import { ProgressBarModule } from 'angular-progress-bar';
const routes: Routes = [
  { path: '', redirectTo: 'admin/games', pathMatch: 'full' },
  {
    path: 'login', loadChildren: () => import('./authentication/login.module').then(m => m.LoginModule),
  },
  // tslint:disable-next-line:max-line-length
  { path: 'company-signup', loadChildren: () => import('./self-service-registration/self-service-registration.module').then(m => m.SelfServiceRegistrationModule) },
  { path: 'SSOLogin', loadChildren: () => import('./authentication/sso/sso.module').then(m => m.SsoModule) },
  { path: 'SSOLogin/:url', loadChildren: () => import('./authentication/sso/sso.module').then(m => m.SsoModule) },
  // tslint:disable-next-line:max-line-length
  { path: 'change-password', loadChildren: () => import('./authentication/change-password/change-password.module').then(m => m.ChangePasswordModule) },
  // tslint:disable-next-line:max-line-length
  { path: 'change-password/:url', loadChildren: () => import('./authentication/change-password/change-password.module').then(m => m.ChangePasswordModule) },
  { path: 'admin', loadChildren: () => import('./admin/main-controller/main-controller.module').then(m => m.MainControllerModule) },
  {
    path: 'app', children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./admin/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'company',
        loadChildren: () => import('./admin/company/company.module').then(m => m.CompanyModule),
      },
      {
        path: 'masterReport',
        loadChildren: () => import('./admin/master-report/master-report.module').then(m => m.MasterReportModule),
      },
      {
        path: 'company/company-details',
        loadChildren: () => import('./admin/company-details/company-details.module').then(m => m.CompanyDetailsModule),
      },
      {
        path: 'company/company-details/:companyId',
        loadChildren: () => import('./admin/company-details/company-details.module').then(m => m.CompanyDetailsModule),
      },
      {
        path: 'company-details',
        loadChildren: () => import('./admin/company-details/company-details.module').then(m => m.CompanyDetailsModule),
      },
      {
        path: 'player-attempts',
        loadChildren: () => import('./admin/player-attempts/player-attempts.module').then(m => m.PlayerAttemptsModule),
      },
      {
        path: 'locations',
        loadChildren: () => import('./admin/location-list/location-list.module').then(m => m.LocationListModule),
      },
      {
        path: 'departments',
        loadChildren: () => import('./admin/department-list/department-list.module').then(m => m.DepartmentListModule),
      },
      {
        path: 'branding',
        loadChildren: () => import('./admin/branding/branding.module').then(m => m.BrandingModule),
      },
      {
        path: 'groups',
        loadChildren: () => import('./admin/group-list/group-list.module').then(m => m.GroupListModule),
      },
      {
        path: 'ip-configuration',
        loadChildren: () => import('./admin/ip-configuration/ip-configuration.module').then(m => m.IpConfigurationModule),
      },
      {
        path: 'games',
        loadChildren: () => import('./admin/game-list/game-list.module').then(m => m.GameListModule)
      },
      {
        path: 'questions',
        loadChildren: () => import('./admin/question-list/question-list.module').then(m => m.QuestionListModule)
      },
      {
        path: 'reports/questions-report',
        loadChildren: () => import('./admin/question-list/question-report/question-report.module').then(m => m.QuestionReportModule),
      },
      {
        path: 'faq',
        loadChildren: () => import('./admin/faq/faq.module').then(m => m.FaqModule),
      },
      {
        path: 'players',
        loadChildren: () => import('./admin/players/players.module').then(m => m.PlayersModule),
      },
      {
        path: 'managers',
        loadChildren: () => import('./admin/managers/managers.module').then(m => m.ManagersModule),
      },
      {
        path: 'player-attempts',
        loadChildren: () => import('./admin/player-attempts/player-attempts.module').then(m => m.PlayerAttemptsModule)
      },
      {
        path: 'live-sessions',
        loadChildren: () => import('./admin/live-sessions/live-sessions.module').then(m => m.LiveSessionsModule)
      },
      {
        path: 'question1',
        loadChildren: () => import('./admin/question/question.module').then(m => m.QuestionModule)
      },
      {
        path: 'trophy',
        loadChildren: () => import('./admin/trophy/trophy.module').then(m => m.TrophyModule)
      },
      {
        path: 'trophy-list',
        loadChildren: () => import('./admin/trophy-list/trophy-list.module').then(m => m.TrophyListModule)
      },
      {
        path: 'tips',
        loadChildren: () => import('./admin/tips/tips.module').then(m => m.TipsModule)
      },
      {
        path: 'popup-alerts',
        loadChildren: () => import('./admin/popup-alerts/popup-alerts.module').then(m => m.PopupAlertsModule)
      },
      
      {
        path: 'player-feedback',
        loadChildren: () => import('./admin/player-feedback/player-feedback.module').then(m => m.PlayerFeedbackModule)
      },
      {
        path: 'schedule-game',
        loadChildren: () => import('./admin/schedule-game/schedule-game.module').then(m => m.ScheduleGameModule)
      },
      {
        path: 'more-reports',
        loadChildren: () => import('./admin/more-report/more-report.module').then(m => m.MoreReportModule)
      },
      {
        path: 'contests',
        loadChildren: () => import('./admin/contest-list/contest-list.module').then(m => m.ContestListModule)
      },
      {
        path: 'create-contest',
        loadChildren: () => import('./admin/add-contest/add-contest.module').then(m => m.AddContestModule),
      },
      {
        path: 'multilevel',
        loadChildren: () => import('./admin/multilevel-games-list/multilevel-games-list.module').then(m => m.MultilevelGamesListModule),
      },
      {
        path: 'game-categories',
        loadChildren: () => import('./admin/game-category-list/game-category-list.module').then(m => m.GameCategoryListModule),
      },
      {
        path: 'game-pathways',
        loadChildren: () => import('./admin/game-pathways/game-pathways.module').then(m => m.GamePathwaysModule),
      },
      { path: '', redirectTo: 'company', pathMatch: 'full' },
      { path: '**', redirectTo: 'company' },
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: false,
            enableTracing: false,
            preloadingStrategy: PreloadAllModules,
            relativeLinkResolution: 'legacy'
        }),
        MaterialModule,
        TranslateModule,
        DeferLoadModule,
        ProgressBarModule
    ],
    exports: [RouterModule, ProgressBarModule],
    providers: [],
    declarations: [UploadingProgressComponent]
})
export class AppRoutingModule {
  constructor() {
  }
}
