import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ContestService } from 'src/app/services/contest/contest.service';
import {
  Dashboard, DashboardByGame, DashboardService, MatTile, Particiapation, Range, Trophy, WinRate
} from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Route } from 'src/app/services/login/login.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { WinRateCalculationInfoComponent } from './win-rate-calculation-info/win-rate-calculation-info.component';

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-dashboard-by-type',
  templateUrl: './dashboard-by-type.component.html',
  styleUrls: ['./dashboard-by-type.component.scss']
})
export class DashboardByTypeComponent implements OnInit, OnChanges {
  @Input() selectedDashboardType: number;
  @Input() resetView: any;
  @Input() appliedFilters = [];
  @Input() selectedRange;
  @Input() fetchingAllLocations = false;
  @Input() timeZone: string = null;
  @Input() tabIndex;
  @Output() changeTab: EventEmitter<any> = new EventEmitter<any>();
  gamePlay: any = [];
  pinnedGames: any = [];
  payload;
  companyId: number;
  startDate;
  endDate;
  isTopPlayerLoading = false;
  isOverallLoading = false;
  isPinnedGamedLoading = false;
  totalCount = 0;
  totalCountPineedGames = 0;
  dashboard: any;
  notScrolly = true;
  notEmpty = true;
  max = 100;
  stroleColor = '#FF0000';
  current = 35;
  winRate = 0;
  overall_details;
  isGameModeShop = false;

  pinnedGamesData = [];

  constructor(private dashboardService: DashboardService, public translate: TranslateService,
    private cdRef: ChangeDetectorRef, private globalService: GlobalService,
    public router: Router,
    public dialog: MatDialog,
    private storageService: StorageService, private contestService: ContestService) {
    this.dashboard = Dashboard;
  }

  ngOnInit() {    
    this.setDateRange(true);
    
  }

  setStrokeColor() {
    if(this.winRate > 0 && this.winRate <= 50) {
      this.stroleColor = '#FF0000';
    } else if(this.winRate >= 51 && this.winRate <= 75) {  
      this.stroleColor = '#f2cd1a';
    }else if(this.winRate >= 76) {
      this.stroleColor = '#3ab802';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.selectedRange && changes.selectedRange.currentValue)) {
      console.log('applied filter ONCHANGES', this.appliedFilters);
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.additionalFilter).length) {
        this.setDateRange(false);
        console.log('this.appliedFilters', this.appliedFilters);
        this.isGameModeShop = this.appliedFilters.filter(appliedFilter => appliedFilter.filter === Constants.GAME_MODE && appliedFilter.id === "SHOP").length > 0;        
        this.getGameplayLeaderboard();
      }
    }
  }

  switchTab(index) {
    this.globalService.addAdminGoogleEvent('View_Detailed_Leaderboard_Report');
    this.changeTab.emit(index);
  }

  getGameplayLeaderboard() {
    console.log(this.selectedDashboardType);
    this.payload = this.preparePayload();
    console.log(this.payload);
    switch (this.selectedDashboardType) {
      case Dashboard.BY_TEAM:        
        this.getOverallProgress();
        this.topPlayerByTeam(this.payload);
        this.getGlobalPinnedGames();
        break;
    }    
    this.cdRef.detectChanges();
  }

  preparePayload() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
    let payload = {
      'company_id': this.companyId,
      'timezone': this.timeZone,
      'start_date': this.startDate,
      'end_date': this.endDate,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };

    
    const customFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['customFilterKey'] && appliedFilter['customFilterKey'] !== 'undefined';
    });

    console.log('customFilters',customFilters);
    console.log('appliedFilters',this.appliedFilters);
    const filter = this.appliedFilters && this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.GAME_MODE;
    });
    
    payload['game_mode'] = filter[0].id;
    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.CONTEST_NAME, this.appliedFilters, 'contest_id');
    if (!payload['group_id']) {
      payload = this.globalService.filtersApplied(payload, Constants.LOCATION_IDS, this.appliedFilters);
      payload = this.globalService.filtersApplied(payload, Constants.DEPARTMENT_IDS, this.appliedFilters);
    }    
    if (customFilters.length) {
      customFilters.forEach(customFilter => {
        if (customFilter['additionalFilter']) {
          payload = this.globalService.filtersApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        } else {
          payload = this.globalService.filterApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        }
      });
    }
    return payload;
  }

  setDateRange(refreshDashboard) {
    const dashboardLocalSetting = this.getDashboardFilter();
    this.selectedRange = dashboardLocalSetting && dashboardLocalSetting['range'] ? dashboardLocalSetting['range'] : Range.THIS_QT;
    this.startDate = dashboardLocalSetting && dashboardLocalSetting['start_date'] ?
      dashboardLocalSetting['start_date'] : moment().startOf('month').format(DATE_FORMAT);
    this.endDate = dashboardLocalSetting && dashboardLocalSetting['end_date'] ?
      dashboardLocalSetting['end_date'] : moment().endOf('month').format(DATE_FORMAT);
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  setCompanyDetails() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
  }


  topPlayerByTeam(payload, noOfItemsPerPage = 10) {
    payload['limit_offset'] = 0; // start limit
    payload['limit_perpage'] = noOfItemsPerPage; // player per page
    console.log(payload);
    this.isTopPlayerLoading = true;
    this.dashboardService.leaderboardByTeam(payload).subscribe((res) => {
      const response: any = res;
      this.isTopPlayerLoading = false;
      this.notScrolly = true;
      console.log(response);
      if (!response.success) {
        return;
      }
      const players = response.data.players;
      this.totalCount = response.data.total_count;

      if (players && players.length === 0) {
        this.notEmpty = false;
      }
      this.gamePlay = new MatTableDataSource(players);
    });    
  }

  getCustomAudiencePayload(payload) {
    const customFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['customFilterKey'] && appliedFilter['customFilterKey'] !== 'undefined';
    });

    if (customFilters.length) {
      customFilters.forEach(customFilter => {
        if (customFilter['additionalFilter']) {
          payload = this.globalService.filtersApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        } else {
          payload = this.globalService.filterApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        }
      });
    }
    console.log('customFilters1',customFilters);
  }
  getGlobalPinnedGames() {
    this.isPinnedGamedLoading = true;
    let payload  = {
      'company_id': this.companyId,
      'timezone': this.timeZone,
      'start_date': this.startDate,
      'end_date': this.endDate,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    }
    this.getCustomAudiencePayload(payload);
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    const filter = this.appliedFilters && this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.GAME_MODE;
    });
    payload['game_mode'] = filter[0].id;
    payload = this.globalService.filtersApplied(payload, Constants.LOCATION_IDS, this.appliedFilters);
    payload = this.globalService.filtersApplied(payload, Constants.DEPARTMENT_IDS, this.appliedFilters);
    this.dashboardService.getGlobalPinnedGames(payload).subscribe((res) => {
      const response: any = res;
      this.isPinnedGamedLoading = false;
      this.notScrolly = true;
      if (!response.success) {
        return;
      }
      this.winRate = response.data.company_pinned_games.overall_win_rate;
      this.pinnedGamesData = response.data.company_pinned_games.company_pinned_game_list;
      this.totalCountPineedGames = response.data.company_pinned_games.company_pinned_game_list.length;
      this.pinnedGames = new MatTableDataSource(response.data.company_pinned_games.company_pinned_game_list);
      this.setStrokeColor();
      
    });    
  }


  getOverallProgress(noOfItemsPerPage = 10) {
    
    this.isOverallLoading = true;
    let payload = {
      'company_id': this.companyId,
      'timezone': this.timeZone,
      'start_date': this.startDate,
      'end_date': this.endDate,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    }
    this.getCustomAudiencePayload(payload);
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    const filter = this.appliedFilters && this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.GAME_MODE;
    });
    
    payload['game_mode'] = filter[0].id;
    payload = this.globalService.filtersApplied(payload, Constants.LOCATION_IDS, this.appliedFilters);
    payload = this.globalService.filtersApplied(payload, Constants.DEPARTMENT_IDS, this.appliedFilters);
    
    
    this.dashboardService.getOverallDetailsByTeam(payload).subscribe((res) => {
      const response: any = res;
      this.isOverallLoading = false;
      this.notScrolly = true;
      console.log(response);
      if (!response.success) {
        return;
      }
      this.overall_details = response.data.overall_details;      
    });    
  }


  updatePinnedGames(event) {
    this.getGlobalPinnedGames();
  }

  viewAccuracyReport() {    
    const context = 'player-feedback';
    this.storageService.setFilters(context, []);
    this.globalService.addAdminGoogleEvent('feedback_expanded');     
    const queryParams = {
      showFeedbackReportByTeam :true
    };    
    this.router.navigate([Route.PLAYER_FEEDBACK], {
      queryParams: queryParams
    });
  }

  openPopup(){
    this.globalService.addAdminGoogleEvent('Winrate_info_popup');    
    const dialogRef = this.dialog.open(WinRateCalculationInfoComponent);
  }
  
}
