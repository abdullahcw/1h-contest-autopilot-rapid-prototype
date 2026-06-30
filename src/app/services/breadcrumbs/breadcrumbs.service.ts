import { Injectable } from '@angular/core';
import { Route } from '../login/login.service';
import { PermissionsService } from '../permissions/permissions.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

export let breadcrumbs = {
  '/admin/dashboard': [{ 'key': 'Dashboard', 'url': Route.DASHBOARD }],
  '/admin/dashboard/player-report': [{ 'key': 'Detailed Report', 'url': Route.DASHBOARD },
  { 'key': 'Player Report', 'url': Route.PLAYER_REPORT }],
  '/admin/dashboard/pathway-insight': [{ 'key': 'Pathway Insight', 'url': Route.PATHWAY_INSIGHT }],
  '/admin/dashboard/engagement-insight': [{ 'key': 'Engagement Insight', 'url': Route.ENGAGEMENT_INSIGHTS }],
  '/admin/dashboard/player-game-report': [{ 'key': 'Detailed Report', 'url': Route.DASHBOARD },
  { 'key': 'Player Report', 'url': Route.PLAYER_REPORT },
  { 'key': 'Game Report', 'url': Route.PLAYER_GAME_REPORT }],
  '/admin/masterReport': [{ 'key': 'Dashboard', 'url': Route.DASHBOARD }, { 'key': 'Master Report', 'url': Route.MASTER_REPORT }],
  '/admin/company-details': [{ 'key': 'Company', 'url': Route.MANAGER_COMPANY_DETAILS_PAGE }],
  '/admin/company': [{ 'key': 'Companies', 'url': Route.COMPANY_PAGE }],
  '/admin/company/company-details': [{ 'key': 'Companies', 'url': Route.COMPANY_PAGE },
  { 'key': 'Company Details', 'url': Route.COMPANY_DETAILS_PAGE }],
  '/admin/player-attempts': [{ 'key': 'Add Attempts', 'url': Route.ADD_ATTEMPTS }],
  '/admin/live-sessions': [{ 'key': 'Incomplete Sessions', 'url': Route.LIVE_ATTEMPTS }],
  '/admin/locations': [{ 'key': 'Locations', 'url': Route.LOCATIONS }],
  '/admin/departments': [{ 'key': 'Departments', 'url': Route.DEPARTEMENT }],
  '/admin/branding': [{ 'key': 'Branding', 'url': Route.BRANDING }],
  '/admin/games': [{ 'key': 'Games', 'url': Route.GAMES }],
  '/admin/games/game': [{ 'key': 'Games', 'url': Route.GAMES }, { 'key': 'New Game', 'url': Route.GAME }],
  '/admin/games/game/profile': [{ 'key': 'Games', 'url': Route.GAMES }, { 'key': 'New Game', 'url': Route.GAME },
  { 'key': 'Add Profile', 'url': Route.GAME_PROFILE }],
  '/admin/schedule-game': [{ 'key': 'Schedule Game', 'url': Route.SCHEDULE_GAME }],
  '/admin/questions': [{ 'key': 'Questions', 'url': Route.QUESTIONS }],
  '/admin/questions-list': [{ 'key': 'Questions', 'url': Route.QUESTIONS_1 }],
  '/admin/reports/questions-report': [{ 'key': 'Accuracy', 'url': Route.QUESTION_REPORT }],
  '/admin/player-feedback': [{ 'key': 'Player Feedback', 'url': Route.PLAYER_FEEDBACK }],
  '/admin/players': [{ 'key': 'Players', 'url': Route.PLAYERS }],
  '/admin/managers': [{ 'key': 'Managers', 'url': Route.MANAGERS }],
  '/admin/groups': [{ 'key': 'Groups', 'url': Route.GROUPS }],
  '/admin/ip-configuration': [{ 'key': 'IP Configuration', 'url': Route.IP_CONFIGURATION }],
  '/admin/game-categories': [{ 'key': 'Game Categories', 'url': Route.GAME_CATEGORIES }],
  '/admin/game-pathways': [{ 'key': 'Pathways', 'url': Route.GAME_PATHWAYS }],
  '/admin/custom-audience': [{ 'key': 'Custom Audiences', 'url': Route.CUSTOM_AUDIENCE }],
  '/admin/custom-audience/edit': [{ 'key': 'Custom Audiences', 'url': Route.CUSTOM_AUDIENCE }, { 'key': 'Edit', 'url': Route.EDIT_AUDIENCE }],
  '/admin/faq': [{ 'key': 'FAQ', 'url': Route.FAQ }],
  '/admin/tutorial-video': [{ 'key': 'Videos', 'url': Route.TUTORIAL_VIDEO }],
  '/admin/wip': [{ 'key': 'WIP', 'url': Route.WIP }],
  '/admin/trophy': [{ 'key': 'Trophies', 'url': Route.TROPHY }],
  '/admin/trophyReport': [{ 'key': 'Trophies', 'url': Route.TROPHIES }, { 'key': 'Trophy Report', 'url': Route.TROPHYREPORT }],
  '/admin/notifications': [{ 'key': 'Notifications', 'url': Route.NOTIFICATIONS }],
  '/admin/game-attempt': [{ 'key': 'WIP', 'url': Route.GAME_ATTEMPT }],
  '/admin/leaderboard': [{ 'key': 'Leaderboard', 'url': Route.LEADERBOARD }],
  '/admin/reports/trophy-list': [{ 'key': 'Trophies', 'url': Route.TROPHIES }],
  '/admin/tips': [{ 'key': 'Monthly Email', 'url': Route.TIPS }],
  '/admin/popup-alerts': [{ 'key': 'Pop-up Alert', 'url': Route.POPUPALERTS }],
  '/admin/more-reports': [{ 'key': 'More Reports', 'url': Route.MORE_REPORTS }],
  '/admin/contests': [{ 'key': 'Contests', 'url': Route.CONTESTS }],
  '/admin/vipcodes': [{ 'key': 'VIP Codes', 'url': Route.VIP_CODE }],
  '/admin/create-contest': [{ 'key': 'Contests', 'url': Route.CONTESTS }, { 'key': 'New Contest', 'url': Route.CREATE_CONTEST }],
  '/admin/multilevel': [{ 'key': 'Multilevel Games', 'url': Route.MULTILEVEL_GAMES }],
  '/admin/multilevel/create-multilevel': [{ 'key': 'Multilevel Games', 'url': Route.MULTILEVEL_GAMES },
  { 'key': 'Multilevel Game', 'url': Route.MULTILEVEL_GAME }],
  '/admin/multilevel/create-multilevel/schedule-multilevel': [{ 'key': 'Multilevel Games', 'url': Route.MULTILEVEL_GAMES },
  { 'key': 'Multilevel Game', 'url': Route.MULTILEVEL_GAME }, { 'key': 'Add Players', 'url': Route.MULTILEVEL_SCHEDULE_GAME }],
  '/admin/shop': [{ 'key': 'The Shop', 'url': Route.MARKETPLACE }],
  '/admin/shop/category/shop-game': [{ 'key': 'The Shop', 'url': Route.MARKETPLACE },
  { 'key': 'Category', 'url': Route.MARKETPLACE_CATEGORY }, { 'key': 'New Game', 'url': Route.MARKETPLACE_GAME }],
  '/admin/marketplace-game': [{ 'key': 'The Shop', 'url': Route.MARKETPLACE },
  { 'key': 'New Game', 'url': Route.MARKETPLACE_GAME }],
  '/admin/shop/category': [{ 'key': 'The Shop', 'url': Route.MARKETPLACE }, { 'key': 'Category', 'url': Route.MARKETPLACE_CATEGORY }],
  '/admin/reorder-games': [{ 'key': 'Layout', 'url': Route.REORDER_GAMES }],
  '/admin/game-layout': [{ 'key': 'Layout', 'url': Route.GAME_LAYOUT}],
  '/admin/qrcode': [{ 'key': 'QR Ccde', 'url': Route.QRCODE }],
  '/admin/reports/shop-report': [{ 'key': 'Shop Report', 'url': Route.SHOP_REPORT }],
  '/admin/accounts': [{ 'key': 'Accounts', 'url': Route.ACCOUNTS }],
};


@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {

  companyBreadCrumRoute = '';
  breadcrumbClicked = new Subject<any>();

  constructor(public permissionService: PermissionsService,
    private router: Router) {

    if (this.permissionService.isAdmin()) {
      this.companyBreadCrumRoute = `$[{'key': 'Companies', 'url': Route.COMPANY_PAGE},
      {'key': 'Company Details', 'url': Route.COMPANY_DETAILS_PAGE}]`;
    } else {
      this.companyBreadCrumRoute = `$[{'key': 'Company', 'url': ''},
      {'key': 'Company Details', 'url': Route.COMPANY_DETAILS_PAGE}]`;
    }
  }

  updateBreadcrumbLabel(label) {
    const myBreadcrumbs = breadcrumbs[this.router.url.split('?')[0]];
    if (myBreadcrumbs) {
      const breadcrumb = myBreadcrumbs[myBreadcrumbs.length - 1];
      breadcrumb.key = label;
    }
  }

  getBreadcrumbs() {
    return breadcrumbs[this.router.url.split('?')[0]];
  }

}
