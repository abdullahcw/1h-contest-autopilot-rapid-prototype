import { Component, OnInit, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Dashboard, DashboardService } from '../../../services/dashboard/dashboard.service';
import { StorageService } from '../../../services/storage/storage.service';
import { Route } from 'src/app/services/login/login.service';
import { BreadcrumbsService } from '../../../services/breadcrumbs/breadcrumbs.service';
import { DatePipe } from '@angular/common';
import { GlobalService, Paginations } from '../../../services/global/global.service';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Constants, ApiService } from '../../../services/network/api.service';
import { CustomDatepickerComponent } from '../../custom-datepicker/custom-datepicker.component';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { HeaderService } from '../../../services/header/header.service';
import { TranslateService } from '@ngx-translate/core';
import { MlgGamePlayReportDialogComponent } from '../mlg-game-play-report-dialog/mlg-game-play-report-dialog.component';
import { PlayerContestReportComponent } from './player-contest-report/player-contest-report.component';

const DATE_FORMAT: any = 'yyyy-MM-dd';
@Component({
  selector: 'app-player-report',
  templateUrl: './player-report.component.html',
  styleUrls: ['./player-report.component.scss']
})
export class PlayerReportComponent implements OnInit {
  playerId: number;
  startDate;
  endDate;
  companyId: number;
  contestId: number;
  gameId: number;
  timezone: number;
  levels: any;
  // trophies: any;
  player_achivement;
  gameplayData: any;
  dashboardFilters: any;
  singlePlayerGameHistory;
  multiplayerGameHistory;
  mlgplayerGameHistory;
  playerContestHistory;
  shopGameHistory;
  selectedTab = 0;
  noOfItemsPerPage;
  is_loading = false;
  startLimit = 0;
  dataSourceSPGames: any;
  dataSourceMPGames: any;
  dataSourceMLGGames: any;
  dataSourceContestPlayer: any;
  dataSourceShopGames: any;
  totalSPGames;
  totalMPGames;
  totalMLGGames;
  totalShopGames
  totalContestGames;
  breakpoint = 4;
  trophy_info: any = {
    title: '',
    description: '',
    trophy_type: 1
  };
  pageSizeOptions: number[];
  displayedColumns: string[] = ['game', 'points', 'accuracy', 'time_spent', 'played_on'];
  displayedColumnsMpGame: string[] = ['game', 'result', 'points', 'time_spent', 'played_on'];
  displayedColumnsMLGGame: string[] = ['mlg_name', 'current_level', 'total_points', 'games_played', 'time_played'];
  displayedColumnsPlayerContestGame: string[] = ['contest_name', 'start_date', 'final_ranking', 'total_points', 'games_played', 'time_played', 'completion'];
  displayedColumnsShopGame: string[] = ['game', 'points', 'accuracy', 'time_played', 'played_on'];
  sort = {
    'sortBy': Constants.GAME_NAME,
    'order': 'asc'
  };
  playerName: any;
  contestTrophies = [];
  contestRewards = [];
  contestState;
  dashboard;
  gameMode: any;
  @ViewChildren('paginator') paginator: any;

  constructor(public breadcrumbService: BreadcrumbsService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    public storageService: StorageService,
    public apiService: ApiService,
    public headerService: HeaderService,
    public translate: TranslateService,
    public dashboardService: DashboardService,
    public globalService: GlobalService) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.dashboard = Dashboard;

    this.route.queryParams.subscribe(queryParams => {
      if (this.parseQueryParams(queryParams)) {
        this.loadData();
      } else {
        this.router.navigate([Route.DASHBOARD]);
      }
    });
  }

  ngOnInit() {
    // Hide Company Selection filter
    this.headerService.showCompanyFilter(false);
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator._results.forEach((elem) => {
        this.globalService.getFormattedPaginationLabel(elem);
      });
    }
  }

  loadData() {
    switch (this.selectedTab) {
      case 0:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          // this.getGameplayDetails();          
          // this.getLevels();
        }
        break;
      case 1:
        // this.sort.sortBy = Constants.GAME_NAME;
        this.getSinglePlayerGameHistory();
        break;
      case 2:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || 
          this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
            this.sort.sortBy = Constants.MLG_NAME;
          this.getMLGGames();
        }         
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_GAME) {
          this.getMultiplayerGameHistory();
        }
        break;
      case 3:
        // if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
        //   this.getShopGameHistory();
        // }
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || 
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.sort.sortBy = Constants.GAME_NAME;
          this.getMultiplayerGameHistory();
        }
        break;
      case 4:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || 
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.sort.sortBy = Constants.CONTEST_NAME;
          this.getPlayerContestHistory();
        }
        break;
      case 5:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || 
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.sort.sortBy = Constants.GAME_NAME;
          this.getShopGameHistory();
        }
        break;
      default:
        break;
    }
  }

  changeTab() {
    // Update route
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        selectedTab: this.selectedTab
      },
      // preserve the existing query params in the route
      queryParamsHandling: 'merge',
      skipLocationChange: true
    });
    this.setActiveSort();
    this.startLimit = 0;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    if (this.paginator) {
      this.paginator._results.forEach((elem) => {
        elem.pageIndex = 0;
      });
    }
  }

  parseQueryParams(queryParams) {
    this.playerId = +queryParams.playerId;
    this.startDate = queryParams.startDate;
    this.endDate = queryParams.endDate;
    this.companyId = +queryParams.companyId;
    this.contestId = +queryParams.contestId;
    this.timezone = queryParams.timezone;
    this.gameId = +queryParams.gameId;
    this.playerName = queryParams.name;
    this.contestState = this.storageService.getObject('contest-state');
    this.breadcrumbService.updateBreadcrumbLabel(this.playerName);
    this.gameMode = queryParams.gameMode;
    if (queryParams.selectedTab) {
      this.selectedTab = +queryParams.selectedTab;
    }
    if (!this.startDate && !this.endDate && (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER 
      || this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_GAME)) {
      this.startDate = null;
      this.endDate = null;
    }
    this.updatePreviousBreadcrumb();
    return this.playerId && this.companyId && this.timezone;
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  updatePreviousBreadcrumb() {
    const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
    const previousIndex = breadcrumbs.length - 2;
    if (breadcrumbs.length >= previousIndex) {
      const previousBreadcrumb = breadcrumbs[previousIndex];
      previousBreadcrumb.queryParams = { selectedTab: 1 };
    }
  }

  getSinglePlayerGameHistory() {
    const payload = this.getDefaultPayload();
    this.is_loading = true;
    this.dashboardService.getSinglePlayerGameHistory(payload).subscribe(res => {
      if (res.success) {
        this.singlePlayerGameHistory = res.data.game_sessions;
        this.dataSourceSPGames = new MatTableDataSource(this.singlePlayerGameHistory);
        this.totalSPGames = res.data.total_count;
        this.processValues(this.singlePlayerGameHistory);
      }
      this.is_loading = false;
    });
    if(this.getDashboardFilter()['dashboard_by'] === this.dashboard.BY_PLAYER){
      this.globalService.addAdminGoogleEvent('Single_Player_Games_Player_Report_Viewed');
    }else{
      this.globalService.addAdminGoogleEvent('By_Team_Single_Games_Report');
    }
  }

  getDefaultPayload() {
    console.log('this.sort.order',this.sort.order)
    const payload = {
      'start_date': this.selectedTab === 2 && this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER ? null : this.startDate,
      'player_id': this.playerId,
      'limit_offset': this.startLimit,
      'limit_perpage': this.noOfItemsPerPage,
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      'end_date': this.selectedTab === 2 && this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER ? null : this.endDate,
      'company_id': +this.companyId,
      'timezone': this.timezone
    };
    if (this.gameId) {
      payload['game_id'] = +this.gameId;
    }
    if (this.contestId) {
      payload['contest_id'] = +this.contestId;
    }
    return payload;
  }

  processValues(games) {
    games.forEach(game => {
      game.playedOnFormatted = game.played_on ?
        this.datePipe.transform(game.played_on.replace(/ /g, 'T'), 'MM/dd/yyyy hh:mm a') : game.played_on;
      game.tzAbbrevation = this.globalService.getTimeZoneAbbrevation(game.played_on_tz_abbreviation);
      game.pointsFormatted = this.globalService.formatNumber(game.points);
      game.timeFormatted = this.globalService.secondsToHms(game.time);
    });
  }

  processValuesForMLGReport(games) {
    games.forEach(game => {
      game.timeFormatted = this.globalService.secondsToHms(game.time_played);
    });
  }

  getSPGamesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getSinglePlayerGameHistory();
  }

  getMLGGamesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getMLGGames();
  }

  getShopGamesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getShopGameHistory();
  }

  getMLGGames() {
    const payload = {
      'player_id': this.playerId,      
      'company_id': +this.companyId,
      "start_date": this.startDate,
      "end_date": this.endDate,
      "limit_offset": this.startLimit,
      "limit_perpage": this.noOfItemsPerPage,
      "sort_by": this.sort.sortBy,
      "order": this.sort.order
    };
    this.is_loading = true;
    this.dashboardService.getMLGGamesHistory(payload).subscribe(res => {
      if (res.success) {
        this.mlgplayerGameHistory = res.data.games;
        this.dataSourceMLGGames = new MatTableDataSource(this.mlgplayerGameHistory);
        this.totalMLGGames = res.data.total_count;
        this.processValuesForMLGReport(this.mlgplayerGameHistory);
      }
      this.is_loading = false;
      console.log(this.mlgplayerGameHistory)
    });
    if(this.getDashboardFilter()['dashboard_by'] === this.dashboard.BY_PLAYER){      
      this.globalService.addAdminGoogleEvent('Detailed_Report_Multi_level_games_tapped');
    }else{
      this.globalService.addAdminGoogleEvent('By_Team_Multilevel_Game_Report');
    }
  }

  navigateToPlayerMLGPopup(row){
    console.log(row)

    const dialogRef = this.dialog.open(MlgGamePlayReportDialogComponent, {
      data: {
        company_id : this.storageService.getCompanyId(),
        player_id : this.playerId,
        showPlayerMLG: true
      }
    });
    dialogRef.componentInstance.mlg_id = row.mlg_id;
    dialogRef.componentInstance.mlg_name = row.mlg_name;
    dialogRef.componentInstance.appliedFilters = this.storageService.getFilterArray('dashboard');
    dialogRef.afterClosed().subscribe(redirect => {
      if (redirect) {
        console.log('redirect', redirect);
      }
    });
  }


  getMultiplayerGameHistory() {
    const payload = this.getDefaultPayload();
    this.is_loading = true;
    this.dashboardService.getMultiplayerGameHistory(payload).subscribe(res => {
      if (res.success) {
        this.multiplayerGameHistory = res.data.game_sessions;
        this.dataSourceMPGames = new MatTableDataSource(this.multiplayerGameHistory);
        this.totalMPGames = res.data.total_count;
        this.processValues(this.multiplayerGameHistory);
      }
      this.is_loading = false;
    });
    if(this.getDashboardFilter()['dashboard_by'] === this.dashboard.BY_PLAYER){      
      this.globalService.addAdminGoogleEvent('Multiplayer_Games_Player_Report_Viewed');
    }else{
      this.globalService.addAdminGoogleEvent('By_Team_Multiplayer_Games_Report');
    }
  }

  getGameplayDetails() {
    const payload = {
      'start_date': this.startDate, 'player_id': this.playerId,
      'end_date': this.endDate, 'company_id': this.companyId, 'timezone': this.timezone,
      'game_mode': this.gameMode
    };
    if (this.gameId) {
      payload['game_id'] = +this.gameId;
    }
    if (this.contestId) {
      payload['contest_id'] = +this.contestId;
    }
    this.is_loading = true;
    this.dashboardService.getPlayerGameplay(payload).subscribe(res => {
      if (res.success) {
        this.gameplayData = res.data;
      }
      this.is_loading = false;
    });
    if(this.getDashboardFilter()['dashboard_by'] === this.dashboard.BY_PLAYER){      
      this.globalService.addAdminGoogleEvent('Total_Game_Play_Player_Report_Viewed');
    }else{
      this.globalService.addAdminGoogleEvent('By_Team_Total_Game_Report');
    }
  }

  getLevels() {
    this.is_loading = true;
    this.dashboardService.getLevels(this.playerId).subscribe(res => {
      if (res.success) {
        this.levels = res.data.levels;
      }
      this.is_loading = false;
    });
  }

  getRemainingGamesText(level) {
    let message = level.games_to_go;
    if (+level.games_to_go === 1) {
      message += this.translate.instant('game_to_go');
    } else {
      message += this.translate.instant('game_to_go');
    }
    return message;
  }

  getAchievedDate(level) {
    const newDate = this.globalService.formatDate(level.level_achived_date_utc);
    const dateStr = this.datePipe.transform(newDate, 'MM/dd/yyyy');
    return dateStr;
  }

  getTime(time) {
    return this.globalService.secondsToHms(time);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'game':
        this.sort.sortBy = Constants.GAME_NAME;
        break;
      case 'points':
        this.sort.sortBy = Constants.QUESTION_POINTS;
        break;
      case 'accuracy':
        this.sort.sortBy = Constants.ACCURACY;
        break;
      case 'time_spent':
      case 'time_played':
        this.sort.sortBy = Constants.QUESTION_TIME;
        break;
      case 'played_on':
        this.sort.sortBy = Constants.PLAYED_ON;
        break;
      case 'result':
        this.sort.sortBy = Constants.RESULT;
        break;
      case 'mlg_name':
        this.sort.sortBy = Constants.MLG_NAME;
        break;
      case 'current_level':
        this.sort.sortBy = Constants.CURRENT_LEVEL;
        break;
      case 'total_points':
        this.sort.sortBy = Constants.TOTAL_POINTS;
        break;
      case 'games_played':
        this.sort.sortBy = Constants.GAMES_PLAYED;
        break;
      case 'final_ranking':
        this.sort.sortBy = Constants.FINAL_RANKING;
        break;
      case 'contest_name':
        this.sort.sortBy = Constants.CONTEST_NAME;
        break;
      case 'start_date':
        this.sort.sortBy = Constants.START_DATE;
        break;
    }
    this.sort.order = sort.direction;
    this.loadData()
  }

  navigateToPlayerGameReport(row) {
    const queryParams: any = {
      companyId: this.companyId,
      reportId: row.report_id,
      gameType: this.selectedTab,
      startDate: this.startDate,
      endDate: this.endDate,
      timezone: this.timezone,
      playerId: this.playerId,
      selectedTab: this.selectedTab,
      name: this.playerName
    };
    if (this.gameId) {
      queryParams.gameId = this.gameId;
    }
    if (this.contestId) {
      queryParams.contestId = this.contestId;
      this.globalService.addAdminGoogleEvent('Game_name_tapped');
    }
    this.router.navigate([Route.PLAYER_GAME_REPORT], {
      queryParams: queryParams
    });
  }

  openEmailRecipientsPicker() {
    let byContest = false;
    if (this.contestId) {
      byContest = true;
    }
    const userEmail = this.storageService.userPersonalData && this.storageService.userPersonalData.email;
    const dialogRef = this.dialog.open(CustomDatepickerComponent, {
      data: {
        startDate: this.startDate,
        endDate: this.endDate,
        emails: [userEmail],
        context: byContest
      }
    });
    dialogRef.componentInstance.dateRangePicked.subscribe((data) => {
      const payload: any = this.getDefaultPayload();
      payload.email_ids = data.emails;
      payload.start_date = this.getFormattedDate(data.startDate);
      payload.end_date = this.getFormattedDate(data.endDate);
      this.emailReport(payload);
      this.globalService.addAdminGoogleEvent('Player_Report_Send_By_Email');
    });
  }

  shouldDisableMenuOptions() {
    if (this.selectedTab === 0) { return false; }
    if (this.selectedTab === 1 && this.singlePlayerGameHistory && !this.singlePlayerGameHistory.length) { return true; }
    if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER) {
      if (this.selectedTab === 2 && (this.mlgplayerGameHistory && !this.mlgplayerGameHistory.length)) { return true; } 
    } else {
      if (this.selectedTab === 2 && (this.multiplayerGameHistory && !this.multiplayerGameHistory.length)) { return true; }
    }
    if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {       
      // if (this.selectedTab === 3 && this.shopGameHistory && !this.shopGameHistory.length) { return true; }
      if (this.selectedTab === 3 && this.multiplayerGameHistory && !this.multiplayerGameHistory.length) { return true; }    
      else if (this.selectedTab === 4 && this.playerContestHistory && !this.playerContestHistory.length) { return true; }
    } else {
      if (this.selectedTab === 3 && this.multiplayerGameHistory && !this.multiplayerGameHistory.length) { return true; }
    }
    if (this.selectedTab === 4 && this.playerContestHistory && !this.playerContestHistory.length) { return true; }
  }

  getFormattedDate(date) {
    return this.datePipe.transform(date, DATE_FORMAT);
  }

  emailReport(payload) {
    switch (this.selectedTab) {
      case 0:
        this.dashboardService.downloadPlayerGameplayStats(payload).subscribe((res) => {
          this.processEmailResponse(res);
        });
        break;
      case 1:
        this.dashboardService.downloadSPGameHistory(payload).subscribe((res) => {
          this.processEmailResponse(res);
        });
        break;
      case 2:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadMLGHistory(payload).subscribe((res) => {
            this.processEmailResponse(res);
          });
        } 
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_GAME) {
          this.dashboardService.downloadMPGameHistory(payload).subscribe((res) => {
            this.processEmailResponse(res);
          });
        } 
        break;
      case 3:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER ||
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadMPGameHistory(payload).subscribe((res) => {
            this.processEmailResponse(res);
          });
        } 
        // if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
        //   this.dashboardService.downloadShopGameHistory(payload).subscribe((res) => {
        //     this.processEmailResponse(res);
        //   });
        // } 
        break;
      case 4:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER ||
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadContestHistory(payload).subscribe((res) => {
            this.processEmailResponse(res);
          });
        }
        break;
      case 5:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER ||
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadShopGameHistory(payload).subscribe((res) => {
            this.processEmailResponse(res);
          });
        }
        break;
      default:
        this.dashboardService.downloadMPGameHistory(payload).subscribe((res) => {
          this.processEmailResponse(res);
        });
        break;
    }
  }

  processEmailResponse(res) {
    this.is_loading = false;
    const response: any = res;
    if (!response.success) {
      this.showAlert(this.apiService.getErrorMessage(response.message_code));
      return;
    }
    this.showAlert(this.translate.instant('report_sent_via_email'));
  }

  downloadReport() {
    const payload = this.getDefaultPayload();
    if (!payload) { return; }
    if (payload.hasOwnProperty('email_ids')) { delete payload['email_ids']; }
    switch (this.selectedTab) {
      case 0:
        this.dashboardService.downloadPlayerGameplayStats(payload).subscribe((res) => {
          this.processDownloadResponse(res);
        });
        break;
      case 1:
        this.dashboardService.downloadSPGameHistory(payload).subscribe((res) => {
          this.processDownloadResponse(res);
        });
        break;
      case 2:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || 
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadMLGHistory(payload).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        }
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_GAME) {
          this.dashboardService.downloadMPGameHistory(payload).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        } 
        break;
      case 3:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || 
        this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadMPGameHistory(payload).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        }
        // if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
        //   this.dashboardService.downloadShopGameHistory(payload).subscribe((res) => {
        //     this.processDownloadResponse(res);
        //   });
        // } 
        break;
      case 4:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadContestHistory(payload).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        }
        break;
      case 5:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadShopGameHistory(payload).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        }
        break; 
      default:
        this.dashboardService.downloadMPGameHistory(payload).subscribe((res) => {
          this.processDownloadResponse(res);
        });
        break;
    }
    this.globalService.addAdminGoogleEvent('Player_Report_CSV_Downloaded');
  }

  processDownloadResponse(res) {
    const response: any = res;
    if (!response.success) { return; }
    // Download file
    if (response.data && response.data.url) {
      window.location.assign(response.data.url);
      this.globalService.showMessage(this.translate.instant('downloading_reports'));
    }
  }

  showAlert(message) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.isMultiOption = false;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  getPlayerContestHistory() {
    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'player_id': this.playerId,
      "start_date": null,
      "end_date": null,
      "limit_offset": this.startLimit,
      "limit_perpage": this.noOfItemsPerPage,
      "sort_by": this.sort.sortBy,
      "order": this.sort.order
    };
    this.is_loading = true;
    this.dashboardService.getPlayerContestHistory(payload).subscribe(res => {
      if (res.success) {
        this.playerContestHistory = res.data.games;
        this.dataSourceContestPlayer = new MatTableDataSource(this.playerContestHistory);
        this.totalContestGames = res.data.total_count;
      }
      this.is_loading = false;
    });
    if(this.getDashboardFilter()['dashboard_by'] === this.dashboard.BY_PLAYER){      
      this.globalService.addAdminGoogleEvent('Detailed_Report_Contest_tab_clicked');
    }else{
      this.globalService.addAdminGoogleEvent('By_Team_Contest_Game_Report');
    }
  }

  showPlayerContestReport(contest) {
    const dialogRef = this.dialog.open(PlayerContestReportComponent, {
      data: {
        company_id: this.storageService.getCompanyId(),
        player_id: this.playerId,
        contest_id: contest.contest_id
      }
    });
    dialogRef.afterClosed().subscribe(redirect => {
      if (redirect) {
        console.log('redirect', redirect);
      }
    });
  }

  getContestGamesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getPlayerContestHistory();
  }

  getOrdinalNumber(i) {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  }

  setActiveSort() {
    if (this.selectedTab === 1) {
      if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER) {
        this.sort.sortBy = Constants.GAME_NAME;
      }
    }
    if (this.selectedTab === 2) {
      if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER) {
        this.sort.sortBy = Constants.MLG_NAME;
      }
    }
    if (this.selectedTab === 3) {
      if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER) {
        this.sort.sortBy = Constants.GAME_NAME;
      }
    }
    if (this.selectedTab === 4) {
      if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER) {
        this.sort.sortBy = Constants.CONTEST_NAME;
      }
    }
  }

  convertToHHMMAA(start_time) {
    return this.datePipe.transform(this.globalService.formatDate(start_time),'hh:mm a') 
  }

  getShopGameHistory() {
    const payload = this.getDefaultPayload();
    this.is_loading = true;
    this.dashboardService.getShopGameHistory(payload).subscribe(res => {
      if (res.success) {
        this.shopGameHistory = res.data.games;
        this.dataSourceShopGames = new MatTableDataSource(this.shopGameHistory);
        this.totalShopGames = res.data.total_count;
        this.processValues(this.shopGameHistory);
      }
      this.is_loading = false;
    });
    if(this.getDashboardFilter()['dashboard_by'] === this.dashboard.BY_PLAYER){      
      this.globalService.addAdminGoogleEvent('Detailed_Report_Shop_Game_Tab_Clicked');      
    }else{
      this.globalService.addAdminGoogleEvent('By_Team_Shop_Games_Report');
    }
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Show Company Selection filter
    this.headerService.showCompanyFilter(true);
  }

}
