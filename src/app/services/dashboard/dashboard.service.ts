import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public updatedReport = new Subject<any>();

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  gamesPlayedByTeam(payload) {
    return this.requestManager.post(EndPoint.GAMES_PLAYED_BY_TEAM, payload);
  }

  trophiesAchievedByTeam(payload) {
    return this.requestManager.post(EndPoint.TROPHY_ACHIEVED_BY_TEAM, payload);
  }

  participationByTeam(payload) {
    return this.requestManager.post(EndPoint.PARTICIPATION_BY_TEAM, payload);
  }

  leaderboardByTeam(payload) {
    return this.requestManager.post(EndPoint.LEADERBOARD_BY_TEAM, payload);
  }

  leaderboardByContest(payload) {
    return this.requestManager.post(EndPoint.LEADERBOARD_BY_CONTEST, payload);
  }

  totalGamesPlayedByGame(payload) {
    return this.requestManager.post(EndPoint.TOTAL_PLAYED_BY_GAME, payload);
  }

  trophiesAchievedByGame(payload) {
    return this.requestManager.post(EndPoint.TROPHY_ACHIEVED_BY_GAME, payload);
  }

  totalTimeSpentOnContest(payload) {
    return this.requestManager.post(EndPoint.TIME_SPENT_BY_CONTEST, payload);
  }

  participationByGame(payload) {
    return this.requestManager.post(EndPoint.PARTICIPATION_BY_GAME, payload);
  }
  winrateByGame(payload) {
    return this.requestManager.post(EndPoint.WINRATE_BY_GAME, payload);
  }
  leaderboardByGame(payload) {
    return this.requestManager.post(EndPoint.LEADERBOARD_BY_GAME, payload);
  }

  totalGamesPlayedByPlayer(payload) {
    return this.requestManager.post(EndPoint.GAMES_PLAYED_BY_PLAYER, payload);
  }

  trophiesAchievedByPlayer(payload) {
    return this.requestManager.post(EndPoint.TROPHY_ACHIEVED_BY_PLAYER, payload);
  }

  participationByPlayer(payload) {
    return this.requestManager.post(EndPoint.PARTICIPATION_BY_PLAYER, payload);
  }

  getMlgTrophy(payload) {
    return this.requestManager.post(EndPoint.GET_MLG_TROPHY, payload);
  }

  getDetailedReport(payload) {
    return this.requestManager.post(EndPoint.GET_DETAIL_REPORT, payload);
  }

  getHierarchyReport(payload) {
    return this.requestManager.post(EndPoint.GET_HIERARCHY_REPORT, payload);
  }

  // Report related methods
  getPlayerGameplay(payload) {
    return this.requestManager.post(EndPoint.GET_PLAYER_GAMEPLAY, payload);
  }

  getLevels(playerId) {
    return this.requestManager.get(EndPoint.GET_LEVELS_ACHIEVED + '/' + playerId);
  }

  getLatestTrophies(payload) {
    return this.requestManager.post(EndPoint.PLAYER_DASHBOARD_LATEST_TROPHIES,payload);
  }

  getTrophies(playerId) {
    return this.requestManager.get(`${EndPoint.GET_TROPHIES_ACHIEVED}?player_id=${playerId}&type=achieved`);
  }

  getPlayerAchivements(payload) {
    return this.requestManager.post(`${EndPoint.GET_PLAYER_ACHIVMENTS}`, payload);
  }

  
  

  getSinglePlayerGameHistory(payload) {
    return this.requestManager.post(EndPoint.GET_SP_GAME_HISTORY, payload);
  }

  getMultiplayerGameHistory(payload) {
    return this.requestManager.post(EndPoint.GET_MP_GAME_HISTORY, payload);
  }

  getMLGGamesHistory(payload) {
    return this.requestManager.post(EndPoint.GET_MLG_GAMES_HISTORY, payload);
  }

  getShopGameHistory(payload) {
    return this.requestManager.post(EndPoint.GET_SHOP_GAME_HISTORY, payload);
  }

  
  getSinglePlayerGameSessionDetails(companyId, reportId, playerId, timezone, gameId = null) {
    let endPoint = `${EndPoint.GET_SP_GAME_SESSION_DETAILS}?company_id=${companyId}
    &report_id=${reportId}&player_id=${playerId}&timezone=${timezone}`;
    if (gameId) {
      endPoint += `&game_id=${gameId}`;
    }
    return this.requestManager.get(endPoint);
  }

  getMultiplayerGameSessionDetails(companyId, reportId, playerId, timezone, gameId = null) {
    let endPoint = `${EndPoint.GET_MP_GAME_SESSION_DETAILS}?company_id=${companyId}
    &report_id=${reportId}&player_id=${playerId}&timezone=${timezone}`;
    if (gameId) {
      endPoint += `&game_id=${gameId}`;
    }
    return this.requestManager.get(endPoint);
  }

  detailedReportByCustomRange(payload) {
    return this.requestManager.post(EndPoint.DETAILED_REPORT, payload);
  }

  getQuestionReport(payload) {
    return this.requestManager.post(EndPoint.GET_QUESTION_REPORT, payload);
  }

  getShopReport(companyId, startDate, endDate, sortBy, order, offset, limit) {
    let queryParams = `${EndPoint.GET_SHOP_REPORT}?company_id=${companyId}&start_date=${startDate}&end_date=${endDate}&sort_by=${sortBy}&order=${order}&offset=${offset}&limit=${limit}`;
    return this.requestManager.get(queryParams);
  }

  downloadPlayerGameplayStats(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_PLAYER_GAMEPLAY_STATS, payload);
  }

  downloadSPGameHistory(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_SP_GAME_HISTORY, payload);
  }

  downloadMPGameHistory(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_MP_GAME_HISTORY, payload);
  }

  downloadShopGameHistory(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_SHOP_GAME_HISTORY, payload);
  }
  
  getMlgDetailReport(payload) {
    return this.requestManager.post(EndPoint.GET_MLG_DETAIL_REPORT, payload);
  }
  getMlgPlayerReport(payload) {
    return this.requestManager.post(EndPoint.GET_MLG_PLAYER_REPORT, payload);
  }

  downloadSPGameSessionDetails(companyId, reportId, playerId, timezone, gameId = null) {
    let endPoint = `${EndPoint.DOWNLOAD_SP_GAME_SESSION_DETAILS}?company_id=${companyId}
      &report_id=${reportId}&player_id=${playerId}&timezone=${timezone}`;
    if (gameId) {
      endPoint += `&game_id=${gameId}`;
    }
    return this.requestManager.get(endPoint);
  }

  downloadMPGameSessionDetails(companyId, reportId, playerId, timezone, gameId = null) {
    let endPoint = `${EndPoint.DOWNLOAD_MP_GAME_SESSION_DETAILS}?company_id=${companyId}
      &report_id=${reportId}&player_id=${playerId}&timezone=${timezone}`;
    if (gameId) {
      endPoint += `&game_id=${gameId}`;
    }
    return this.requestManager.get(endPoint);
  }

  downloadQuestionReport(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_QUESTION_REPORT, payload);
  }

  leaderboardByMLG(payload) {
    return this.requestManager.post(EndPoint.LEADERBOARD_BY_MLG, payload);
  }

  dashboardMLGDetails(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_MLG_DETAILS, payload);
  }

  dashboardMLGChartDetails(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_MLG_CHART_DETAILS, payload);
  }

  dashboardSLGChartDetails(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_SLG_CHART_DETAILS, payload);
  }

  dashboardMLGParticipation(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_MLG_PARTICIPATION, payload);
  }

  performanceLevelByMLG(payload) {
    return this.requestManager.post(EndPoint.PERFORMANCE_LEVEL_BY_MLG, payload);
  }

  dashboardContestDetails(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_CONTEST_DETAILS, payload);
  }

  performanceGamesByContest(payload) {
    return this.requestManager.post(EndPoint.PERFORMANCE_GAMES_BY_CONTEST, payload);
  }

  getContestPlayerDashboard(payload) {
    return this.requestManager.post(EndPoint.CONTEST_PLAYER_DASHBOARD, payload);
  }
  dashboardPlayerDetails(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_PLAYER_DETAILS, payload);
  }

  getCalendarStatistics(payload) {
    return this.requestManager.post(EndPoint.CALENDAR_STATISTICS, payload);
  }

  getGamePlayOnDate(payload) {
    return this.requestManager.post(EndPoint.GAMEPLAY_ON_DATE, payload);
  }

  getPlayerPerformance(payload) {
    return this.requestManager.post(EndPoint.PERFORMANCE_BY_PLAYER, payload);
  }

  getPlayerContestHistory(payload) {
    return this.requestManager.post(EndPoint.GET_PLAYER_CONTEST_HISTORY, payload);
  }

  getPlayerContestReport(payload) {
    return this.requestManager.post(EndPoint.GET_PLAYER_CONTEST_REPORT, payload);
  }

  downloadMLGHistory(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_MLG_HISTORY, payload);
  }

  downloadContestHistory(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_CONTEST_HISTORY, payload);
  }

  dashboardSLGDetails(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_SLG_DETAILS, payload);
  }

  dashboardSLGPlayerDetails(payload) {
    return this.requestManager.post(EndPoint.DASHBOARD_SLG_PLAYER_DETAILS, payload);
  }

  reportUpdated(players) {
    this.updatedReport.next(players);
  }

  getGlobalPinnedGames(payload) {
    return this.requestManager.post(EndPoint.GET_GLOBAL_PINNED_GAMES, payload);
  }

  getOverallDetailsByTeam(payload) {
    return this.requestManager.post(EndPoint.GET_OVERALL_DETAILS_BY_TEAM, payload);
  }

  saveGlobalPinnedGames(payload) {
    return this.requestManager.post(EndPoint.SAVE_COMPANY_PINNED_GAME, payload);
  }

  getGamesByWinRate(payload) {
    return this.requestManager.post(`${EndPoint.GET_GAMES_BY_WIN_RATE}`, payload);
  }

  getOnlyGames(companyId,field) {    
    const url = `${EndPoint.GET_ONLY_GAMES}?company_id=${companyId}&&include_field=${field}`
    return this.requestManager.get(url);
  }

  getpathwayinsight(payload) {
    return this.requestManager.post(EndPoint.GET_PATHWAY_INSIGHTS, payload);
  }
  getEngagementInsights(payload) {
    return this.requestManager.post(EndPoint.GET_ENGAGEMENT_INSIGHTS, payload);
  }
  downoladEngagement(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_ENGAGEMENT, payload);
  }
  downoladPathway(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_PATHWAY, payload);
  }

}

export enum Dashboard {
  BY_TEAM = 1,
  BY_CONTEST = 2,
  BY_GAME = 3,
  BY_MULTILEVEL = 4,
  BY_PLAYER = 5,
  BY_HIERARCHY = 6
}

export enum Range {
  TODAY = 'today',
  THIS_WK = 'thisWeek',
  LAST_WK = 'lastWeek',
  THIS_MONTH = 'thisMonth',
  LAST_MONTH = 'lastMonth',
  NEXT_90_DAYS = 'next90Days',
  THIS_YEAR = 'thisYear',
  NEXT_YEAR = 'nextYear',
  THIS_QT = 'thisQuarter',
  LAST_QT = 'lastQuarter',
  ALL_TIME = 'allTime', 
  CUSTOM = 'custom',
  CLEAR = 'clear'
}
export enum DashboardTabType {
  SKILL_INSIGHTS = 'SKILL INSIGHTS',
  PATHWAY_INSIGHTS = 'PATHWAY INSIGHTS',
  ENGAGEMENT_INSIGHTS = 'ENGAGEMENT INSIGHTS',
}
export class MatTile {
  title: string = null;
  value: any = 0;
  showPercentageSign: Boolean = false;
  isLoading: Boolean = false;
}

export class DashboardByGame {
  normalGames = 0;
  practiceGames = 0;
  totalGames = 0;
  isLoading: Boolean = false;
}

export class Trophy {
  defaultTrophies = 0;
  customTrophies = 0;
  totalTrophies = 0;
  isLoading: Boolean = false;
}

export class Player {
  id: any = 0;
  rank: any = 0;
  points: any = 0;
  firstName: any = null;
  lastName: any = null;
  profilePic: any = null;
  isLoading: Boolean = false;
  sp_games: number;
  sp_time: number;
  sp_points: number;
  mp_games: number;
  mp_time: number;
  mp_points: number;
  last_played_on: number;
  mp_wins: number;
  player_rating: number;
  department: string;
  location: string;
  group_name: string;
}



export class Particiapation {
  participation = 0;
  isLoading: Boolean = false;
}
export class WinRate {
  winrate = 0;
  isLoading: Boolean = false;
}
