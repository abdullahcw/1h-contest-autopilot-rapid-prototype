import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-mlg-dashbaord-performance-level',
  templateUrl: './mlg-dashbaord-performance-level.component.html',
  styleUrls: ['./mlg-dashbaord-performance-level.component.scss']
})
export class MlgDashbaordPerformanceLevelComponent implements OnInit {

  @Input() selectedDashboardType;
  @Input() appliedFilters = [];
  @Input() tabIndex;
  companyId: number;
  levels:any = [];
  multilevelGame:any;
  isLoading = false;
  isMobile = false;
  displayedColumns: string[] = ['level', 'game_logo', 'game', 'high_score', 'players_won'];

  constructor(public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue)) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.MLG_NAME).length) {
        this.getMLGPerformanceByLevel();
      }
    }
  }

  getMLGPerformanceByLevel() {
    const payload = this.preparePayload();
    this.isLoading = true;
    this.dashboardService.performanceLevelByMLG(payload).subscribe(res => {
      const response: any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      const levels = response.data.levels_list;
      this.levels = new MatTableDataSource(levels);
    });
  }

  setCompanyDetails() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
  }

  preparePayload(isLeaderboard = false) {
    this.setCompanyDetails();
    let payload = {
      "company_id": this.companyId,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    }

    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.MLG_NAME, this.appliedFilters, 'mlg_id');

    this.prepareFilters(payload);
    this.staticFiltersApplied(payload);
    
    return payload;
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

  staticFiltersApplied(payload) {
    if (payload.mlg_completeness == 'COMPLETE') {
      this.globalService.addAdminGoogleEvent('Dashboard_Report_Won_filter_applied');
    }
    if (payload.mlg_completeness == 'INCOMPLETE') {
      this.globalService.addAdminGoogleEvent('Dashboard_Report_Inprogress_filter_applied');
    }
    if (payload.player_status == 'ACTIVE') {
      this.globalService.addAdminGoogleEvent('Dashboard_Report_Active_Players_filter_applied');
    }
  }

}
