import { Component, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-contest-dashboard-leaderboard',
  templateUrl: './contest-dashboard-leaderboard.component.html',
  styleUrls: ['./contest-dashboard-leaderboard.component.scss']
})
export class ContestDashboardLeaderboardComponent implements OnInit {
  @Input() selectedDashboardType;
  @Input() resetView: any;
  companyId: number;
  contestPlay:any = [];
  @Input() appliedFilters = [];
  @Input() tabIndex;
  isLoading = false;
  context = 'dashboard';
  totalCount = 0;
  @Input() contest:any;

  startLimit = 0;
  noofItemsPerPage = 50;
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();

  isMobile = false;
  displayedColumns: string[] = ['rank', 'player_logo', 'player', 'games_played', 'points', 'high_score'];

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
      (changes.tabIndex && !changes.tabIndex.currentValue)) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.CONTEST_NAME).length) {
        this.getContestLeaderboard();
      }
    }
  }

  getContestLeaderboard() {
    const payload = this.preparePayload();
    this.isLoading = true;
    this.dashboardService.leaderboardByContest(payload).subscribe(res => {
      const response: any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      const players = response.data.players;
      this.totalCount = response.data.total_count;
      this.contestPlay = new MatTableDataSource(players);
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
      "limit_perpage": this.noofItemsPerPage
    }
     
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.CONTEST_NAME, this.appliedFilters, 'contest_id');
    this.staticFiltersApplied(payload);
    
    return payload;
  }

  staticFiltersApplied(payload) {
    if (payload.player_status == 'ACTIVE') {
      this.globalService.addAdminGoogleEvent('Dashboard_Report_Active_Players_filter_applied');
    }
  }

  viewAll() {
    const tabIndex = 1;
    this.globalService.addAdminGoogleEvent('Dashboard_Report_Leaderboard_view_all_clicked');
    this.switchTab.emit(tabIndex);
  }

}
