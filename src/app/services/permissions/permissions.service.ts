import { Injectable } from '@angular/core';
import { ApiService, EndPoint } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
export enum Role {
  ADMIN = 'A',
  MANAGER = 'M',
  MID_MANAGER = 'MM',
  TEAM_LEAD = 'T',
  PLAYER = 'P'
}

export enum PermissionsKey {
  COMPANY = 'company',
  GROUP = 'group',
  DEPARTMENT = 'department',
  LOCATION = 'location',
  GAME = 'game',
  QUESTION = 'question',
  TROPHY = 'trophy',
  HELP = 'help',
  PLAYER = 'player',
  MANAGER = 'manager',
  REPORT = 'report',
  INCOMPLETE_SESSIONS = 'incomplete_sessions',
  GAME_ATTEMPTS = 'game_attempts',
  REORDER_GAMES = 'reorder_games',
  LEADERBOARD = 'leaderboard',
  NOTIFICATION = 'notification',
  FAQ = 'faq',
  PLAYERFEEDBACK = 'player_feedback',
  VIP_CODE = 'vip_code',
  CONTEST = 'contest',
  SHOP = 'shop',
  GAME_CATEGORY = 'game_category',
  GAME_PATHWAY = 'game_pathway',
  CUSTOM_AUDIENCE = 'custom_audience',
  LIVE_GAME_POSITION = 'live_game_position',
  GAMES = 'games',
  MULTILEVEL_GAMES = 'multi_level_game',
  SHOP_REPORT = 'shop_settings',
  SHOP_GAMES = 'shop_games',
  ACCOUNTS = 'account_setting',
}

@Injectable({
  providedIn: 'root'
})

export class PermissionsService {

  permissions: any = {};
  userPersonal: any = {};
  awsTokens: any = null;

  constructor(public requestManager: RequestManagerService,
    public apiService: ApiService,
    public dialog: MatDialog,
    public translate: TranslateService,
    public snackBar: MatSnackBar) {
    this.permissions = {
      company: { list: true, create: true, update: true, delete: true, list_all: true, show_company: true, show_brandings: true },
      game: { list: true, create: true, update: true, delete: true, add: true, show_games: true, show_schedules: true },
      contest: { list: true, create: true, update: true, delete: true, add: true, show_contest: true },
      player: { list: true, create: true, update: true, delete: true, show_players: true },
      manager: { list: true, create: true, update: true, delete: true, show_managers: true },
      report: { list: true, create: true, update: true, delete: true, show_reports: true },
      incomplete_sessions: { list: true, show_incomplete_sessions: true },
      game_attempts: { list: true, show_attempts: true },
      group: { list: true, create: true, update: true, delete: true, show_groups: true },
      department: { list: true, create: true, update: true, delete: true, show_departments: true },
      location: { list: true, create: true, update: true, delete: true, show_locations: true },
      question: { list: true, create: true, update: true, delete: true, show_questions: true },
      trophy: { list: true, create: true, update: true, delete: true, show_trophies: true },
      shop: { list: true, create: true, update: true, delete: true, view: true },
      shop_games: { list: true }, shop_settings: { list: true },
      game_category: { list: true, show_category: true },
      game_pathway: { list: true },
      multi_level_game: { list: true }, account_setting: { list: true },
      notification: { list: true, show_notifications: true },
      leaderboard: { list: true, show_leaderboard: true },
      custom_audience: { list: true, show_audience: true },
      live_game_position: { list: true, show_position: true },
      reorder_games: { list: true },
      faq: { list: true },
      player_feedback: { list: true },
      vip_code: { list: true, show_vip_codes: true },
    };
    this.awsTokens = {
      access_key: 'FAKE', secret_key: 'FAKE', region: 'us-east-1',
      bucket_name: 'fake-bucket', bucket_name_static: 'fake-static',
      base_url: 'https://fake.s3.amazonaws.com/',
      base_url_static: 'https://fake-static.s3.amazonaws.com/',
      admin_access_key: 'FAKE', admin_secret_key: 'FAKE',
      presign_timeout: '604800', expired_on: ''
    };
  }

  userPersonalData(): Observable<any> {
    return of({ success: true, data: { first_name: 'John', last_name: 'Doe', name: 'John Doe', email: 'john.doe@1huddle.co', profile_image_url: '' } });
  }
  fetchPermissions(): Observable<any> { return of({ success: true, data: {} }); }
  getUploadTokens(): Observable<any> { return of({ success: true, data: {} }); }
  getPermissions(key: string): any { return this.permissions[key]; }
  setAWSResponse(_res: any): void {}
  setResponse(_res: any): void {}
  setUserResponse(_res: any): void {}

  isAdmin() {
    const companyPermission = this.getPermissions(PermissionsKey.COMPANY);
    if (companyPermission && companyPermission.list_all) {
      return true;
    }
    return false;
  }

  resetPermissions() {
    this.permissions = {};
  }
}
