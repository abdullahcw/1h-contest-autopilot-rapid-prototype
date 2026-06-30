import { MatDialog } from '@angular/material/dialog';
import { GamePlayReportPopupComponent } from '../game-play-report-popup/game-play-report-popup.component';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import moment from 'moment';
import { Constants } from 'src/app/services/network/api.service';
import { DashboardService, Range } from 'src/app/services/dashboard/dashboard.service';
import { TranslateService } from '@ngx-translate/core';

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-dashboard-by-mlg',
  templateUrl: './dashboard-by-mlg.component.html',
  styleUrls: ['./dashboard-by-mlg.component.scss']
})
export class DashboardByMlgComponent implements OnInit {

  @Input() selectedDashboardType: number;
  @Input() resetView: any;
  @Input() appliedFilters = [];
  @Input() selectedRange;
  @Input() fetchingAllLocations = false;
  @Input() timeZone: string = null;
  @Input() tabIndex;
  @Output() changeTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeTabMlgReport: EventEmitter<any> = new EventEmitter<any>();
  companyId: number;
  startDate;
  endDate;
  multilevelGame:any;
  multilevelGameChartData:any;
  multilevelGameCircleChartData:any;
  isTopPlayerLoading = false;
  isLoading = false;
  context = 'dashboard';
  totalCount = 0;
  dashboard: any;
  startLimit = 0;
  noofItemsPerPage = 50;
  isMlgIdPresent = false;
  chartLoading = false;
  circleChartLoading = false;
  constructor(
    public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
    public dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    
  }
  viewMlgReport(type){
    if (type == 0) {
      this.globalService.addAdminGoogleEvent('Dashboard_Report_Inprogress_report_expanded');
    } else {
      this.globalService.addAdminGoogleEvent('Dashboard_Report_Won_report_expanded');
    }
    const dialogRef = this.dialog.open(GamePlayReportPopupComponent, {
      data: {
          company_id :  this.companyId,
          appliedFilters:  this.appliedFilters,
          type: type == 0 ? this.translate.instant('in_progress') : this.translate.instant('won'),
      }
    });
    dialogRef.componentInstance.mlg_id = this.multilevelGame.mlg_id;
    dialogRef.componentInstance.mlg_name = this.multilevelGame.mlg_name;
    dialogRef.componentInstance.appliedFilters = this.storageService.getFilterArray('dashboard');
    dialogRef.afterClosed().subscribe(redirect => {
      if (redirect) {
        this.switchTab(1);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue) ||
      (changes.selectedRange && changes.selectedRange.currentValue)) {
      this.setDateRange(false);
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.MLG_NAME).length) {
        this.getMLGDashboard();
      }
    }
  }

  setDateRange(refreshDashboard) {
    const dashboardLocalSetting = this.getDashboardFilter();
    this.selectedRange = dashboardLocalSetting && dashboardLocalSetting['range'] ? dashboardLocalSetting['range'] : Range.THIS_QT;

    // // Set this start and end date of month as default start date
    this.startDate = dashboardLocalSetting && dashboardLocalSetting['start_date'] ?
      dashboardLocalSetting['start_date'] : moment().startOf('month').format(DATE_FORMAT);
    this.endDate = dashboardLocalSetting && dashboardLocalSetting['end_date'] ?
      dashboardLocalSetting['end_date'] : moment().endOf('month').format(DATE_FORMAT);
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  getMLGDashboard() {
    this.getMLGDashboardDetails();
    this.getMLGDashboardChartDetails();
    this.getMLGDashboardParticipation();
    
  }

  getMLGDashboardDetails() {
    this.setCompanyDetails();
    let payload = {
      "company_id": this.companyId,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    };
    payload = this.globalService.filterApplied(payload, Constants.MLG_NAME, this.appliedFilters, 'mlg_id');
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.MLG_COMPLETENESS, this.appliedFilters);
    this.prepareFilters(payload);

    this.isLoading = true;
    this.dashboardService.dashboardMLGDetails(payload).subscribe(res => {
      const response:any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      this.multilevelGame = response.data;
    });
  }

  getMLGDashboardChartDetails() {
    let payload = {
      "company_id": this.companyId,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    };
    payload = this.globalService.filterApplied(payload, Constants.MLG_NAME, this.appliedFilters, 'mlg_id');
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');

    this.prepareFilters(payload);

    this.chartLoading = true;
    this.dashboardService.dashboardMLGChartDetails(payload).subscribe(res => {
      const response:any = res;
      if (!response.success) {
        return;
      }
      const labels = [];
      const game_play_counts = [];
      if(response.data.total_game_played.length){
        response.data.total_game_played.map(
          element => {            
            labels.push(element.label);
            game_play_counts.push(element.game_play);
          });

        const ceil_max_gameplay = Math.ceil(response.data.max_game_play/5)*5
        console.log(ceil_max_gameplay)
        this.multilevelGameChartData = { 
          labels:labels,
          game_play_counts:game_play_counts,
          step_size: (response.data.max_game_play / 5),
          max_game_play: response.data.max_game_play,
          ceil_max_gameplay: ceil_max_gameplay
        }

        this.chartLoading = false;
      }
    });
  }

  getMLGDashboardParticipation() {
    let payload = {
      "company_id": this.companyId,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    };
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.MLG_NAME, this.appliedFilters, 'mlg_id');
    this.prepareFilters(payload);

    this.circleChartLoading = true;
    this.dashboardService.dashboardMLGParticipation(payload).subscribe(res => {
      const response:any = res;
      if (!response.success) {
        return;
      }

      const circleChartData = [response.data.mlg_won ,response.data.mlg_in_progress];      
      this.multilevelGameCircleChartData = circleChartData
      this.circleChartLoading = false;       
    });
  }

  setCompanyDetails() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
  }
  
  switchTab(index) {
    this.changeTab.emit(index);
  }

  convertToHHMMSS(seconds) {
    let hours, minutes: any;
    hours = Math.floor(seconds / 3600);
    minutes = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = seconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }
    const time = hours + ':' + minutes + ':' + seconds;
    return time;
  }

  prepareFilters(payload) {

    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    
    // Handle location and department filters (these are standard filters, not custom)
    payload = this.globalService.filtersApplied(payload, Constants.LOCATION_IDS, this.appliedFilters);
    payload = this.globalService.filtersApplied(payload, Constants.DEPARTMENT_IDS, this.appliedFilters);

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
  }
}

