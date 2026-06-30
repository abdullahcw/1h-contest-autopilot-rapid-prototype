import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint, Constants } from '../network/api.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  public loginUser$ = new Subject<any>();

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) {
  }

  verifyEmail(email) {
    console.log('email', email);
    return this.requestManager.post(EndPoint.VALIDATE_EMAIL, { 'email': email });
  }
  verifyCompany(slug) {
    console.log('slug', slug);
    return this.requestManager.post(EndPoint.VALIDATE_COMPANY, { 'company_name': slug });
  }

  login(user) {
    return this.requestManager.post(EndPoint.LOGIN,
      { 'email': user.email, 'password': user.password });
  }

  loginSSOUser(samlToken) {
    return this.requestManager.post(EndPoint.LOGIN,
      { 'saml_token': samlToken });
  }

  forgotPassword(email) {
    return this.requestManager.put(EndPoint.FORGOT_PWD,
      { 'email': email, 'user_type': Constants.MANAGER });
  }

  updatePassword(payload) {
    return this.requestManager.put(EndPoint.UPDATE_PASSWORD, payload);
  }

  logout() {
    return this.requestManager.delete(EndPoint.LOGOUT);
  }

  getSettings(companyId) {
    return this.requestManager.get(`${EndPoint.SETTINGS}?company_id=${companyId}`);
  }

  userLoggedIn(loggedInUser) {
    this.loginUser$.next(loggedInUser);
  }

}

export class User {
  manager_id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export enum Route {
  LOGIN = 'login',
  COMPANY_PAGE = 'admin/company',
  GAMES = 'admin/games',
  GAME = 'admin/games/game',
  SCHEDULE_GAME = 'admin/schedule-game',
  GAME_PROFILE = 'admin/games/game/profile',
  QUESTIONS = 'admin/questions',
  QUESTIONS_1 = 'admin/questions-list',
  QUESTION_REPORT = 'admin/reports/questions-report',
  BRANDING = 'admin/branding',
  ADD_ATTEMPTS = 'admin/player-attempts',
  LIVE_ATTEMPTS = 'admin/live-sessions',
  COMPANY_DETAILS_PAGE = 'admin/company/company-details',
  MANAGER_COMPANY_DETAILS_PAGE = 'admin/company-details',
  DASHBOARD = 'admin/dashboard',
  PLAYER_REPORT = 'admin/dashboard/player-report',
  PLAYER_GAME_REPORT = 'admin/dashboard/player-game-report',
  MASTER_REPORT = 'admin/masterReport',
  LOCATIONS = 'admin/locations',
  DEPARTEMENT = 'admin/departments',
  PLAYERS = 'admin/players',
  MANAGERS = 'admin/managers',
  GROUPS = 'admin/groups',
  FAQ = 'admin/faq',
  TUTORIAL_VIDEO = 'admin/tutorial-video',
  HELP = 'admin/help',
  TROPHY = 'admin/trophy',
  TROPHYREPORT = 'admin/trophyReport',
  WIP = '/admin/wip',
  NOTIFICATIONS = 'admin/notifications',
  GAME_ATTEMPT = '/admin/game-attempt',
  LEADERBOARD = 'admin/leaderboard',
  PLAYER_FEEDBACK = '/admin/player-feedback',
  TROPHIES = '/admin/reports/trophy-list',
  TIPS = 'admin/tips',
  POPUPALERTS = 'admin/popup-alerts',
  MORE_REPORTS = 'admin/more-reports',
  CONTESTS = 'admin/contests',
  VIP_CODE = 'admin/vipcodes',
  CREATE_CONTEST = 'admin/create-contest',
  MULTILEVEL_GAMES = 'admin/multilevel',
  MULTILEVEL_GAME = 'admin/multilevel/create-multilevel',
  MULTILEVEL_SCHEDULE_GAME = 'admin/multilevel/create-multilevel/schedule-multilevel',
  MARKETPLACE = 'admin/shop',
  MARKETPLACE_GAME = 'admin/shop/category/shop-game',
  MARKETPLACE_CATEGORY = 'admin/shop/category',
  GAME_CATEGORIES = 'admin/game-categories',
  GAME_PATHWAYS = 'admin/game-pathways',
  CUSTOM_AUDIENCE = 'admin/custom-audience',
  REORDER_GAMES = 'admin/reorder-games',
  GAME_LAYOUT = 'admin/game-layout',
  QRCODE = 'admin/qrcode',
  EDIT_AUDIENCE = 'admin/custom-audience/edit',
  SHOP_REPORT = '/admin/reports/shop-report',
  ACCOUNTS = 'admin/accounts',
  IP_CONFIGURATION = 'admin/ip-configuration',
  PATHWAY_INSIGHT = 'admin/dashboard/pathway-insight',
  ENGAGEMENT_INSIGHTS = 'admin/dashboard/engagement-insight',
}

