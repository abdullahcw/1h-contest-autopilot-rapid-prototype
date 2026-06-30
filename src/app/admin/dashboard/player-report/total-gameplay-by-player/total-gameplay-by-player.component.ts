import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Dashboard, DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import * as moment from 'moment';
import { Constants } from 'src/app/services/network/api.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-total-gameplay-by-player',
  templateUrl: './total-gameplay-by-player.component.html',
  styleUrls: ['./total-gameplay-by-player.component.scss']
})
export class TotalGameplayByPlayerComponent implements OnInit {

  timeZone;
  @Input() startDate: Date;
  @Input() endDate: Date;
  @Input() selectedTab;
  @Input() playerId;
  @Input() gameId;
  @Input() showPlayerGameplay = false;
  @Input() gameMode;
  appliedFilters = [];
  player:any;
  isLoading = false;
  isCalendarLoading = false;
  context = 'dashboard';
  calendarStatisticsDates;
  currentDate: moment.Moment;
  diff = 0;
  streakCount;
  dashboard;

  constructor(public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService) {
      this.dashboard = Dashboard;
    }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if (this.selectedTab == 0) {
      this.getPlayerDashboard();
    }
  }

  getPlayerDashboard() {
    if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
      this.getPlayerDashboardDetails();
    } else {
      this.getSLGPlayerDashboardDetails();
    }
    this.appliedFilters = this.storageService.getFilterArray(this.context);
  }
 
  getPlayerDashboardDetails() {
    let payload = {
      "company_id": this.storageService.getCompanyId(),
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
      "start_date": this.startDate  ? `${this.startDate} 00:00:00` : null,
      "end_date": this.endDate ? `${this.endDate} 23:59:59` : null,
      "player_id": this.playerId,
      "game_mode": this.gameMode
    }

    this.isLoading = true;
    this.dashboardService.dashboardPlayerDetails(payload).subscribe(res => {
      const response:any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      this.player = response.data;
      this.timeZone = this.player.time_zone;
      this.getCalendarStatistics();
    });
  }

  getSLGPlayerDashboardDetails() {
    let payload = {
      "company_id": this.storageService.getCompanyId(),
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
      "start_date": this.startDate,
      "end_date": this.endDate,
      "player_id": this.playerId,
      "game_id": this.gameId,
    }

    this.prepareFilters(payload);

    this.isLoading = true;
    this.dashboardService.dashboardSLGPlayerDetails(payload).subscribe(res => {
      const response:any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
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
      "end_date": endDate,
      'player_id': this.playerId
    }

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

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  prepareFilters(payload) {

    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');

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

  switchTab(index) {
    // this.changeTab.emit(index);
  }
}
