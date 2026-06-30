import { Component, OnInit, ViewChild, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { Constants, ApiService } from 'src/app/services/network/api.service';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { DashboardService, Dashboard, Range } from 'src/app/services/dashboard/dashboard.service';
import { Router } from '@angular/router';
import { Route } from 'src/app/services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MlgGamePlayReportDialogComponent } from '../dashboard/mlg-game-play-report-dialog/mlg-game-play-report-dialog.component';

@Component({
  selector: 'app-master-report',
  templateUrl: './master-report.component.html',
  styleUrls: ['./master-report.component.scss']
})

export class MasterReportComponent implements OnInit, OnChanges {
  filter_options = [
    { 'filter': Constants.STATUS, value: this.translate.instant('status'), 'is_text_search': true, 'is_list_search': true }];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Input() masterReportPayload;
  pageSizeOptions: number[];
  noOfItemsPerPage: number;
  startLimit = 0;
  messageToDisplay = this.translate.instant('pls_add_filter');
  copyOfMasterReportPayload;
  displayedColumns: string[];
  sort = {
    'sortBy': Constants.FIRST_NAME,
    'order': 'asc'
  };
  playerDataSource = new MatTableDataSource();
  is_loading = false;
  dashboardFilter;
  totalPlayers;
  dashboard;
  @Output() isReportLoaded: EventEmitter<any> = new EventEmitter();
  openCustomMenu: any;
  selectedId: any;
  selectedType: any;
  
  constructor(
    public dashboardService: DashboardService,
    public storageService: StorageService,
    public globalService: GlobalService,
    private datePipe: DatePipe,
    private apiService: ApiService,
    public translate: TranslateService,
    public dialog: MatDialog,
    public router: Router) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.dashboard = Dashboard;
  }

  ngOnInit() {
  }

  ngOnChanges() {
    // console.log('masterReportPayload ONCHANGES', this.masterReportPayload);
    if (!!this.masterReportPayload && 'manager_id' in this.masterReportPayload) {
      this.masterReportPayload['by_fossil_manager_hierarchy'] = true;
      this.checkAppliedManager();
    }
    this.playerDataSource = null;
    this.getDashboardFilter();
    this.prepareDisplayedColumns();
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    setTimeout(() => {
      // console.log('getDetailedReport api call first');
      this.getDetailedReport();
    }, 500);
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  checkAppliedManager() {
    const appliedFilters = this.storageService.getObject('allFilters');
    appliedFilters.forEach(filter => {
      if (filter.key === 'dashboard') {
        const reporteeList = filter.value.filter((item) => item.isHierarchy);
        this.masterReportPayload['manager_id'] = reporteeList && reporteeList.length ? reporteeList[reporteeList.length - 1].id
          : this.storageService.getLoginUserID();

      }
    });
  }

  getDetailedReport() {
    this.copyOfMasterReportPayload = this.masterReportPayload && JSON.parse(JSON.stringify((this.masterReportPayload)));
    // console.log('masterReportPayload getDetailedReport()', this.copyOfMasterReportPayload);
    if (this.copyOfMasterReportPayload) {
      this.is_loading = true;
      this.isReportLoaded.emit(true);
      const company = this.storageService.getCompany();
      // this.copyOfMasterReportPayload['contest_id'] = company && company['contest_id'];
      this.copyOfMasterReportPayload['company_id'] = company && company['company_id'];
      this.copyOfMasterReportPayload['timezone'] = company && company['location_details'] && company['location_details']['tz_name'];
      this.copyOfMasterReportPayload['sort_by'] = this.sort.sortBy;
      this.copyOfMasterReportPayload['order'] = this.sort.order;
      this.copyOfMasterReportPayload['limit_offset'] = this.startLimit; // start limit
      this.copyOfMasterReportPayload['limit_perpage'] = this.noOfItemsPerPage;
      if (!!this.masterReportPayload) {
        if ('manager_id' in this.masterReportPayload) {
          this.masterReportPayload['by_fossil_manager_hierarchy'] = true;
          this.copyOfMasterReportPayload['by_fossil_manager_hierarchy'] = true;
        } else if ('contest_id' in this.masterReportPayload || 
          (('player_id' in this.masterReportPayload || 'game_id' in this.masterReportPayload) && this.dashboardFilter['range'] === Range.ALL_TIME)) {
          delete this.copyOfMasterReportPayload['start_date'];
          delete this.copyOfMasterReportPayload['end_date'];
        }
        if (this.dashboardFilter['dashboard_by'] == Dashboard.BY_TEAM || this.dashboardFilter['dashboard_by'] == Dashboard.BY_PLAYER) {
          this.copyOfMasterReportPayload['game_mode'] = this.masterReportPayload['game_mode'];
        }
      }
      this.dashboardService.getDetailedReport(this.copyOfMasterReportPayload).subscribe(res => {
        const response = res;
        this.is_loading = false;
        this.isReportLoaded.emit(false);
        if (!response.success) {
          this.is_loading = false;
          this.isReportLoaded.emit(false);
          this.dashboardService.reportUpdated(null);
          return;
        }
        if (!response) {
          this.is_loading = false;
          this.isReportLoaded.emit(false);
          this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
          return;
        }
        this.totalPlayers = response.data.total_count;
        this.dashboardService.reportUpdated(response.data.players);
        if (this.totalPlayers === 0) { this.messageToDisplay = this.translate.instant('no_records_found'); }
        const playersData = response.data.players;
        this.playerDataSource = new MatTableDataSource(response.data.players);
        if (playersData) {
          this.processValues(playersData);
        }
      });
    }
  }

  resetMasterReport() {
    this.playerDataSource = null;
    this.paginator.pageIndex = 0;
  }

  formatNumber(number) {
    return number.toLocaleString('en-US');
  }

  secondsToHms(seconds) {
    return this.globalService.secondsToHms(seconds);
  }
  processValues(lastPlayedDate) {
    lastPlayedDate.forEach(lastDate => {
      lastDate.spPlayedOnFormatted = (lastDate.sp_last_played_on && lastDate.sp_last_played_on !== '0000-00-00 00:00:00') ?
    this.datePipe.transform(this.globalService.formatDate(lastDate.sp_last_played_on), 'MM/dd/yyyy hh:mm a') :
    lastDate.sp_last_played_on == '0000-00-00 00:00:00' ? null : lastDate.sp_last_played_on;

      lastDate.spTzAbbrevation = this.globalService.getTimeZoneAbbrevation(lastDate.sp_last_played_on_tz_abbreviation);

      lastDate.mpPlayedOnFormatted = lastDate.mp_last_played_on ?
        this.datePipe.transform(this.globalService.formatDate(lastDate.mp_last_played_on),
          'MM/dd/yyyy hh:mm a') : lastDate.mp_last_played_on;
      lastDate.mpTzAbbrevation = this.globalService.getTimeZoneAbbrevation(lastDate.mp_last_played_on_tz_abbreviation);
      lastDate.timeFormatted = this.globalService.secondsToHms(lastDate.time);
    });
  }
  sortData(sort: Sort) {
    // console.log('Sort type: ' + sort.active);
    switch (sort.active) {
      case 'first_name':
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
      case 'sp_games':
        this.sort.sortBy = Constants.SP_GAMES;
        break;
      case 'sp_points':
        this.sort.sortBy = Constants.SP_POINTS;
        break;
      case 'sp_time':
        this.sort.sortBy = Constants.SP_TIME;
        break;
      case 'sp_last_played_on':
        this.sort.sortBy = Constants.SP_LAST_PLAYED_ON;
        break;
      case 'mp_games':
        this.sort.sortBy = Constants.MP_GAMES;
        break;
      case 'mp_points':
        this.sort.sortBy = Constants.MP_POINTS;
        break;
      case 'mp_time':
        this.sort.sortBy = Constants.MP_TIME;
        break;
      case 'mp_wins':
        this.sort.sortBy = Constants.MP_WINS;
        break;
      case 'mp_last_played_on':
        this.sort.sortBy = Constants.MP_LAST_PLAYED_ON;
        break;
      case 'player_rating':
        this.sort.sortBy = Constants.PLAYER_RATING;
        break;
      case 'department_name':
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
      case 'location_name':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      case 'group_name':
        this.sort.sortBy = Constants.GROUP_NAME;
        break;
      case 'sp_last_score':
        this.sort.sortBy = Constants.LAST_SCORE;
        break;
      case 'win_rate':
        this.sort.sortBy = Constants.WIN_RATE;
        break;
      default:
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
    }

    this.sort.order = sort.direction;
    // console.log('getDetailedReport api call third');
    setTimeout(() => {
      this.getDetailedReport();
    }, 500);
  }

  getDashboardFilter() {
    this.dashboardFilter = this.storageService.getObject('dashboard-filter');
  }

  prepareDisplayedColumns() {
    this.displayedColumns = [
      'profile_image_url',
      'first_name',
      'sp_games',
      'sp_time',
      'sp_points',
      'sp_last_played_on',
      'sp_last_score',
      'win_rate',
      'mp_games',
      'mp_time',
      'mp_points',
      'mp_wins',
      'mp_last_played_on',
      'player_rating',
      'current_level',
      'completion',
      'department_name',
      'location_name',
      'group_name',
    ];

    if (this.masterReportPayload && (this.masterReportPayload.contest_id || this.masterReportPayload.mlg_id)) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('mp_games'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('mp_time'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('mp_points'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('mp_wins'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('mp_last_played_on'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('player_rating'), 1);
      if (this.masterReportPayload.mlg_id) {
        this.displayedColumns.splice(this.displayedColumns.indexOf('completion'), 1);
      }
    }
    if (this.dashboardFilter && this.dashboardFilter.dashboard_by === Dashboard.BY_PLAYER) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('profile_image_url'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('first_name'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('current_level'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('completion'), 1);
    }
    if (this.masterReportPayload && this.masterReportPayload.is_custom) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('department_name'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('location_name'), 1);
    }
    if (this.dashboardFilter && this.dashboardFilter.dashboard_by === Dashboard.BY_GAME) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('player_rating'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('current_level'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('completion'), 1);
    }
    if (this.dashboardFilter && this.dashboardFilter.dashboard_by !== Dashboard.BY_GAME) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('sp_last_score'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('win_rate'), 1);
    }
    if (this.dashboardFilter && this.dashboardFilter.dashboard_by === Dashboard.BY_CONTEST) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('current_level'), 1);
    }
    if (this.dashboardFilter && this.dashboardFilter.dashboard_by === Dashboard.BY_TEAM) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('current_level'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('completion'), 1);
    }
  }

  navigateToPlayerReport(player) {
    const appliedFilters = this.storageService.getObject('allFilters');
    console.log("new data ", player, appliedFilters);
    let mlgFilter;

    appliedFilters.forEach(filter => {
      if (filter.key === 'dashboard') {
        mlgFilter = filter.value.filter((item) => item.filter === Constants.MLG_NAME);
      }
    });

    if(player.mlg_id){
      const dialogRef = this.dialog.open(MlgGamePlayReportDialogComponent, {
        data: {
          company_id: this.masterReportPayload.company_id,
          player_id : player.player_id,
        }
      });
      dialogRef.componentInstance.mlg_id = mlgFilter[0].id;
      dialogRef.componentInstance.mlg_name = mlgFilter[0].value;
      dialogRef.componentInstance.appliedFilters = this.storageService.getFilterArray('dashboard');
      dialogRef.afterClosed().subscribe(redirect => {
        if (redirect) {
          console.log('redirect', redirect);
          // this.switchTab(1);
        }
      });
    }else{
      const playerId = player.player_id;
      const startDate = this.masterReportPayload.start_date;
      const endDate = this.masterReportPayload.end_date;
      const companyId = this.masterReportPayload.company_id;
      const timezone = this.masterReportPayload.timezone;
      const name = player.first_name + ' ' + player.last_name;
      const queryParams: any = {
        playerId: playerId,
        startDate: startDate,
        endDate: endDate,
        companyId: companyId,
        timezone: timezone,
        name: name
      };
      if (this.masterReportPayload['contest_id']) {
        queryParams.contestId = this.masterReportPayload['contest_id'];
      }
      if (this.masterReportPayload['game_id']) {
        queryParams.gameId = this.masterReportPayload['game_id'];
      }
      if (this.dashboardFilter.dashboard_by === Dashboard.BY_TEAM || this.dashboardFilter.dashboard_by === Dashboard.BY_PLAYER) {
        queryParams.gameMode = this.masterReportPayload['game_mode'];
      }
      delete queryParams.selectedTab;
      this.router.navigate([Route.PLAYER_REPORT], {
        queryParams: queryParams
      });
    }
    
    this.globalService.addAdminGoogleEvent('Report_Player_Selected');
  }

  getPlayersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    // console.log('getDetailedReport api call second');
    setTimeout(() => {
      this.getDetailedReport();
    }, 500);
  }

  getPayload() {
    return this.copyOfMasterReportPayload;
  }

  toggleMenu(event, id, type) {
    this.openCustomMenu = event;
    this.selectedId = id;
    this.selectedType = type;
  }
}
