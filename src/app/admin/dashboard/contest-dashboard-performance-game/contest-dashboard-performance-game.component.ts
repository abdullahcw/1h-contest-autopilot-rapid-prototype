import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-contest-dashboard-performance-game',
  templateUrl: './contest-dashboard-performance-game.component.html',
  styleUrls: ['./contest-dashboard-performance-game.component.scss']
})
export class ContestDashboardPerformanceGameComponent implements OnInit {
  @Input() selectedDashboardType;
  @Input() appliedFilters = [];
  @Input() tabIndex;
  @Input() contestState;
  @Input() showContestGameplay = false;
  @Input() playerId;
  @Input() contestId;
  @Input() selectedTab;
  @Output() changeTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeTabMlgReport: EventEmitter<any> = new EventEmitter<any>();
  companyId: number;
  levels:any = [];
  multilevelGame:any;
  isLoading = false;
  isMobile = false;
  isLive = false;
  isDataUnavailable = false;
  displayedColumns: string[];

  constructor(public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,) { }

  ngOnInit(): void {
    if (this.showContestGameplay) {
      this.displayedColumns = ['level', 'game_logo', 'game', 'high_score', 'start_win_rate', 'end_win_rate', 'growth', 'growth_indicator'];
    } else {
      this.displayedColumns = ['level', 'game_logo', 'game', 'start_win_rate', 'end_win_rate', 'growth', 'growth_indicator'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue) || this.showContestGameplay) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.CONTEST_NAME).length || (this.showContestGameplay && this.selectedTab == 0)) {
        // removed this as it was causing issue in contest dashboard
        this.getContestPerformanceByGames();
        
      }
    }
  }

  getContestPerformanceByGames() {
    const payload = this.preparePayload();
    this.isLoading = true;
    this.dashboardService.performanceGamesByContest(payload).subscribe(res => {
      const response: any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      const levels = response.data.performance_by_games;
      this.isLive = response.data.is_live;
      this.isDataUnavailable = response.data.data_unavailable;
      this.levels = new MatTableDataSource(levels);
    });
  }

  setCompanyDetails() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
  }

  preparePayload() {
    this.setCompanyDetails();
    let payload = {
      "company_id": this.companyId,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    }

    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.CONTEST_NAME, this.appliedFilters, 'contest_id');
    
    if (this.showContestGameplay) {
      payload['contest_id'] = this.contestId;
      payload['player_id'] = this.playerId;
      payload['player_status'] = "ACTIVE"
    }

    this.staticFiltersApplied(payload);
    
    return payload;
  }

  staticFiltersApplied(payload) {
    if (payload.player_status == 'ACTIVE') {
      this.globalService.addAdminGoogleEvent('Dashboard_Report_Active_Players_filter_applied');
    }
  }
}
