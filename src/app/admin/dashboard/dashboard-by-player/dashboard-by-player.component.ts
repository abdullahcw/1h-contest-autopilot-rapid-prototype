import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { Route } from 'src/app/services/login/login.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-dashboard-by-player',
  templateUrl: './dashboard-by-player.component.html',
  styleUrls: ['./dashboard-by-player.component.scss']
})
export class DashboardByPlayerComponent implements OnInit {

  @Input() appliedFilters = [];
  timeZone;
  @Input() startDate: Date;
  @Input() endDate: Date;
  @Input() resetView: any;
  @Input() selectedRange;
  @Input() fetchingAllLocations = false;
  @Input() tabIndex;
  @Output() changeTab: EventEmitter<any> = new EventEmitter<any>();
  player:any;
  isLoading = false;
  isCalendarLoading = false;
  context = 'dashboard';
  calendarStatisticsDates;
  currentDate: moment.Moment;
  diff = 0;
  streakCount;

  constructor(public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public router: Router,
    public translate: TranslateService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.resetView && !changes.resetView.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue) ||
      (changes.selectedRange && changes.selectedRange.currentValue)) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.PLAYER_NAME).length) {
        this.getPlayerDashboard();
      }
    }
  }

  getPlayerDashboard() {
    this.getPlayerDashboardDetails();
  }
 
  getPlayerDashboardDetails() {
    let payload = {
      "company_id": this.storageService.getCompanyId(),
      "start_date": this.startDate,
      "end_date": this.endDate,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    }

    payload = this.globalService.filterApplied(payload, Constants.PLAYER_NAME, this.appliedFilters, 'player_id');
    payload = this.globalService.filterApplied(payload, Constants.GAME_MODE, this.appliedFilters);

    this.isLoading = true;
    this.dashboardService.dashboardPlayerDetails(payload).subscribe(res => {
      const response:any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      console.log(response.data);
      this.player = response.data;
      this.timeZone = this.player.time_zone;
      this.getCalendarStatistics();
    });
  }

  getCalendarStatistics(startDate = moment().tz(this.timeZone).startOf('month').subtract(1, 'week').format(DATE_FORMAT), 
    endDate = moment().tz(this.timeZone).endOf('month').add(1, 'week').format(DATE_FORMAT), currentDate = moment()) {
    let payload = {
      "company_id": this.storageService.getCompanyId(),
      "start_date": startDate,
      "end_date": endDate
    }

    payload = this.globalService.filterApplied(payload, Constants.PLAYER_NAME, this.appliedFilters, 'player_id');
    
    this.isCalendarLoading = true;
    this.dashboardService.getCalendarStatistics(payload).subscribe(res => {
      const response: any = res;
      this.isCalendarLoading = false;
      if (!response.success) {
        return;
      }

      this.calendarStatisticsDates = response.data.calendar_statistics;
      this.streakCount = response.data.week_streak_count;
      this.currentDate = currentDate;
      this.diff = +moment(this.currentDate).diff(moment(), 'months', true).toFixed(0);
    });
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

  monthChanged(dates) {
    this.getCalendarStatistics(dates.startDate, dates.endDate, dates.currentDate);
  }

  switchTab(index) {
    this.changeTab.emit(index);
  }

  navigatetoAchievement() {
    const playerId = this.player.player_id;
    const startDate = this.startDate;
    const endDate = this.endDate;
    const companyId = this.storageService.getCompanyId();
    const timezone = this.timeZone;
    const name = this.player.first_name + ' ' + this.player.last_name;
    const queryParams: any = {
      playerId: playerId,
      startDate: startDate,
      endDate: endDate,
      companyId: companyId,
      timezone: timezone,
      name: name,
      selectedTab: '6'
    };
    this.router.navigate([Route.PLAYER_REPORT], {
      queryParams: queryParams,
    });
  }
}
