import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { EndPoint } from '../network/api.service';


export enum REPORTS {
  GAME_ACCURACY_REPORT = 1,
  MASTER_REPORT_ACROSS_COMPANIES = 2,
  COMPANY_GAME_REPORT = 3,
  WINRATE_GAME_REPORT = 4,
  PLAYER_WINRATE = 6,
  TOTAL_GAMES_REPORT = 5
}

export enum GAME_MODES {
  ALL = 'ALL',
  CONTEST = 'CONTEST',
  PRACTICE = 'PRACTICE'
}

export enum PLAYER_STATUS {
  ACTIVE = 'ACTIVE',
  ALL = 'ALL'
}

export enum WINRATE_GAMES_TOGGEL {
  ALLPINNED = 'ALLPINNED',
  ALLGAMES = 'ALLGAMES'
}


export class Game {
  gameId: number;
  gameName: String;
}


@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(public requestManager: RequestManagerService) { }

  emailGameAccuracyReport(payload) {
    return this.requestManager.post(`${EndPoint.GAME_ACCURACY_REPORT}`, payload);
  }
  emailCompanyGameReport(payload) {
    return this.requestManager.post(`${EndPoint.COMPANY_GAME_REPORT}`, payload);
  }

  emailMasterReportAcrossCompany(payload) {
    return this.requestManager.post(`${EndPoint.MASTER_REPORT}`, payload);
  }

  emailwinrateReport(payload) {
    return this.requestManager.post(`${EndPoint.WIN_RATE_REPORT}`, payload);
  }
  emailhistoricalwinrateReport(payload) {
    return this.requestManager.post(`${EndPoint.WIN_HISTORICAL_RATE_REPORT}`, payload);
  }

  emailtotalGameplayReport(payload) {
    return this.requestManager.post(`${EndPoint.TOTAL_GAME_PLAY_REPORT}`, payload);
  }
}
