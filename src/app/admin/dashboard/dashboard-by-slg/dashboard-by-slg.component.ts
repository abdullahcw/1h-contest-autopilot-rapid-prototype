import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Route } from 'src/app/services/login/login.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AnimationOptions } from 'ngx-lottie';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-dashboard-by-slg',
  templateUrl: './dashboard-by-slg.component.html',
  styleUrls: ['./dashboard-by-slg.component.scss']
})
export class DashboardBySlgComponent implements OnInit {

  @Input() selectedDashboardType: number;
  @Input() resetView: any;
  @Input() appliedFilters = [];
  @Input() selectedRange;
  @Input() fetchingAllLocations = false;
  @Input() timeZone: string = null;
  @Input() tabIndex;
  @Input() startDate: Date;
  @Input() endDate: Date;
  @Output() changeTab: EventEmitter<any> = new EventEmitter<any>();
  companyId: number;
  game:any;
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
  gameChartData:any;
  hide = false;

  options: AnimationOptions = {
    path: '/assets/animation_json/tick_radial.json',
    loop: false
  };

  constructor(
    public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
    public dialog: MatDialog,
    public router: Router,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void { 
  }

  getSLGDashboardChartDetails() {
    let payload = {
      
      "company_id": this.storageService.getCompanyId(),
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    };
    console.log(this.appliedFilters)
    payload = this.globalService.filterApplied(payload, Constants.GAME_NAME, this.appliedFilters, 'game_id');
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.GAME_MODE, this.appliedFilters);

    this.prepareFilters(payload);

    this.chartLoading = true;
    this.dashboardService.dashboardSLGChartDetails(payload).subscribe(res => {
      const response:any = res;
      if (!response.success) {
        return;
      }      
      const labels = [];
      const game_play_counts = [];
      console.log(response)
      if(response.data.total_game_played.length){
        response.data.total_game_played.map(
          element => {            
            labels.push(element.label);
            game_play_counts.push(element.game_play);
          });

        const ceil_max_gameplay = Math.ceil(response.data.max_game_play/5)*5
        console.log(ceil_max_gameplay)
        this.gameChartData = { 
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


  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue) ||
      (changes.selectedRange && changes.selectedRange.currentValue)) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.GAME_NAME).length) {
        this.getSLGDashboard();
      }
      this.hide = false;
    }
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  viewAccuracyReport(gameId, type) {
    const queryParams = {
      game_id: gameId,
    };
    const reportType = type === 'accuracy' ? 'showAccuracyReport' : 'showFeedbackReport';
    queryParams[reportType] = true
    const route = type === 'accuracy' ? [Route.QUESTION_REPORT] : [Route.PLAYER_FEEDBACK];
    type === 'accuracy' ? this.globalService.addAdminGoogleEvent('Dashboard_SLG_question_accuracy_report_clicked') 
      : this.globalService.addAdminGoogleEvent('Dashboard_SLG_open_feedback_clicked');
    this.router.navigate(route, {
      queryParams: queryParams
    });
  }

  getSLGDashboard() {
    this.getSLGDashboardDetails();
    this.getSLGDashboardChartDetails();
  }

  getSLGDashboardDetails() {
    let payload = {
      "company_id": this.storageService.getCompanyId(),
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
      "start_date": this.startDate,
      "end_date": this.endDate,
    };
    payload = this.globalService.filterApplied(payload, Constants.GAME_NAME, this.appliedFilters, 'game_id');
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    this.prepareFilters(payload);

    this.isLoading = true;
    this.dashboardService.dashboardSLGDetails(payload).subscribe(res => {
      const response:any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      this.game = response.data;
    });
  }
  
  switchTab(index) {
    this.changeTab.emit(index);
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

  complete(event) {
    console.log(event);
    this.hide = true;
    this.cdRef.detectChanges()
  }
}
