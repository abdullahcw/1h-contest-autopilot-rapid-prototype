import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Dashboard, DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-player-dashboard-performance',
  templateUrl: './player-dashboard-performance.component.html',
  styleUrls: ['./player-dashboard-performance.component.scss']
})
export class PlayerDashboardPerformanceComponent implements OnInit {
  @Input() selectedDashboardType;
  @Input() appliedFilters = [];
  @Input() tabIndex;
  @Input() resetView: any;
  @Input() isPinned;
  @Input() playerId;
  @Input() showViewDetailsReport = true;
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();
  companyId: number;
  games:any = [];
  totalCount;
  multilevelGame:any;
  isLoading = false;
  isMobile = false;
  displayedColumns: string[] = ['level', 'game_logo', 'game', 'rank', 'points', 'high_score', 'win_rate'];

  constructor(public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,) { }

  ngOnInit(): void {
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue)) {
          console.log('changes.appliedFilters', changes.appliedFilters);
          console.log('dashboard_by', this.getDashboardFilter()['dashboard_by']);
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.PLAYER_NAME).length) {
        this.getPlayerPerformance();
      }
      if(this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM){
        this.getPlayerPerformance();
      }
    }
  }

  getPlayerPerformance() {
    let payload = {
      "company_id": this.storageService.getCompanyId(),
      "performance_for": this.isPinned ? "TOP" : "BEST",
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    }

    if (this.isPinned) {
      payload['manager_id'] = this.storageService.getLoginUserID();
    }

    payload = this.globalService.filterApplied(payload, Constants.PLAYER_NAME, this.appliedFilters, 'player_id');
    
    if(this.playerId &&  this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM){
      payload['player_id'] = this.playerId
    }
    this.isLoading = true;
    this.dashboardService.getPlayerPerformance(payload).subscribe(res => {
      const response: any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      const games = response.data.games;
      this.totalCount = response.data.total_count;
      this.games = new MatTableDataSource(games);
    });
  }

  viewAll() {
    const tabIndex = 1;
    this.switchTab.emit(tabIndex);
  }

  getOrdinalNumber(i) {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return i + 'st';
    }
    if (j === 2 && k !== 12) {
      return i + 'nd';
    }
    if (j === 3 && k !== 13) {
      return i + 'rd';
    }
    return i + 'th';
  }
}
