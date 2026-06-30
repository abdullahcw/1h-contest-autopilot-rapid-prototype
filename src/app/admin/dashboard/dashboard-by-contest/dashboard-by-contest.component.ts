import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-dashboard-by-contest',
  templateUrl: './dashboard-by-contest.component.html',
  styleUrls: ['./dashboard-by-contest.component.scss']
})
export class DashboardByContestComponent implements OnInit {
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
  contest:any;
  isLoading = false;
  context = 'dashboard';
  totalCount = 0;
  dashboard: any;

  constructor(
    public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
    public dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue) ||
      (changes.selectedRange && changes.selectedRange.currentValue)) {
      if (this.appliedFilters && this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.CONTEST_NAME).length) {
        this.getContestDashboard();
      }
    }
  }

  getContestDashboard() {
    this.getContestDashboardDetails();
  }

  getContestDashboardDetails() {
    this.setCompanyDetails();
    let payload = {
      "company_id": this.companyId,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    };
    payload = this.globalService.filterApplied(payload, Constants.CONTEST_NAME, this.appliedFilters, 'contest_id');
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.MLG_COMPLETENESS, this.appliedFilters);

    this.isLoading = true;
    this.dashboardService.dashboardContestDetails(payload).subscribe(res => {
      const response:any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      console.log(response.data);
      this.contest = response.data;
      this.storageService.setObject('contest-state', this.contest.contest_status);
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

}
