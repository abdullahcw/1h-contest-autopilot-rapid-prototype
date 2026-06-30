import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MlgGamePlayReportDialogComponent } from '../mlg-game-play-report-dialog/mlg-game-play-report-dialog.component';

@Component({
  selector: 'app-mlg-dashbaord-leaderboard',
  templateUrl: './mlg-dashbaord-leaderboard.component.html',
  styleUrls: ['./mlg-dashbaord-leaderboard.component.scss']
})
export class MlgDashbaordLeaderboardComponent implements OnInit {

  @Input() selectedDashboardType;
  @Input() resetView: any;
  @Input() appliedFilters = [];
  @Input() tabIndex;
  @Input() gametype = false;
  @Input() multilevelGame:any = null;
  @Input() game:any;
  @Input() startDate: Date;
  @Input() endDate: Date;
  @Input() selectedRange;
  startLimit = 0;
  isLoading = false;
  context = 'dashboard';
  totalCount = 0;
  companyId: number;
  mlgPlay:any = [];
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();

  isMobile = false;
  displayedColumns: string[];

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  constructor(public globalService: GlobalService,
    private storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
    public dialog: MatDialog) {
  }

  ngOnInit() {
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue) ||
      (changes.selectedRange && changes.selectedRange.currentValue)) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.MLG_NAME).length) {
        this.getMLGLeaderboard();
      }
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.GAME_NAME).length) {
        this.getSLGLeaderboard();
      }
    }
  }

  getMLGLeaderboard() {
    const payload = this.preparePayload();
    this.isLoading = true;
    this.dashboardService.leaderboardByMLG(payload).subscribe(res => {
      const response: any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      const players = response.data.players;
      this.totalCount = response.data.total_count;
      this.mlgPlay = new MatTableDataSource(players);
        this.displayedColumns = ['rank', 'player_logo', 'player', 'games_played', 'points', 'status'];
    });
  }

  getSLGLeaderboard() {
    const payload = this.preparePayload()
    this.isLoading = true;
    this.dashboardService.leaderboardByGame(payload).subscribe((res) => {
      const response: any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      const players = response.data.players;
      this.totalCount = response.data.total_count;
      this.mlgPlay = new MatTableDataSource(players);
      this.displayedColumns = ['rank', 'player_logo', 'player', 'games_played', 'points', 'win_rate'];
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
      "limit_offset": this.startLimit,
      "limit_perpage": this.gametype ? 10 : 50
    }
    if (this.gametype) {
      payload['start_date'] = this.startDate;
      payload['end_date'] = this.endDate;
    }
     
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.MLG_NAME, this.appliedFilters, 'mlg_id');
    payload = this.globalService.filterApplied(payload, Constants.GAME_NAME, this.appliedFilters, 'game_id');

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

  viewAll() {
    const tabIndex = 1;
    this.selectedDashboardType === 4 ? this.globalService.addAdminGoogleEvent('Dashboard_Report_Leaderboard_view_all_clicked')
      : this.globalService.addAdminGoogleEvent('Dashboard_SLG_detailed_report_clicked');
    this.switchTab.emit(tabIndex);
  }


  navigateToPlayerReport(player) {
    this.globalService.addAdminGoogleEvent('Dashboard_Report_Player_report_expanded');
    const dialogRef = this.dialog.open(MlgGamePlayReportDialogComponent, {
      data: {
        company_id : this.storageService.getCompanyId(),
        player_id : player.player_id,
      }
    });
    dialogRef.componentInstance.mlg_id = this.multilevelGame.mlg_id;
    dialogRef.componentInstance.mlg_name = this.multilevelGame.mlg_name;
    dialogRef.componentInstance.appliedFilters = this.storageService.getFilterArray('dashboard');
    dialogRef.afterClosed().subscribe(redirect => {
      if (redirect) {
        console.log('redirect', redirect);
      }
    });

  }
}