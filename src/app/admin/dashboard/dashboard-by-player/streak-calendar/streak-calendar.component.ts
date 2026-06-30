import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GameplayByDateComponent } from '../gameplay-by-date/gameplay-by-date.component';
import * as moment from 'moment';
import * as range from 'lodash.range';
import { GlobalService } from 'src/app/services/global/global.service';

export interface CalendarDate {
  mDate: moment.Moment;
  selected?: boolean;
  today?: boolean;
}

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-streak-calendar',
  templateUrl: './streak-calendar.component.html',
  styleUrls: ['./streak-calendar.component.scss']
})
export class StreakCalendarComponent implements OnInit {
  @Input() playerId;
  @Input() calendarStatisticsDates;
  @Input() timeZone;
  @Output() monthChanged: EventEmitter<any> = new EventEmitter();
  @Input() currentDate: moment.Moment;
  @Input() diff = 0;
  @Input() showPlayerGameplay = false;
  namesOfDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  weeks: Array<CalendarDate[]> = [];

  @ViewChild('calendar', {static: true}) calendar;

  constructor(public dialog: MatDialog,
    public globalService: GlobalService,
    public translate: TranslateService) { }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.calendarStatisticsDates && changes.calendarStatisticsDates.currentValue) ||
    (changes.currentDate && changes.currentDate.currentValue)) {
      this.currentDate = moment(this.currentDate);
      this.generateCalendar();
    }
  }

  getCapitalized(str) {
    return str && (str.charAt(0).toUpperCase() + str.slice(1));
  }

  generateCalendar(): void {
    const dates = this.fillDates(this.currentDate);
    const weeks = [];
    while (dates.length > 0) {
      weeks.push(dates.splice(0, 7));
    }
    this.weeks = weeks;
  }

  fillDates(currentMoment: moment.Moment) {
    const firstOfMonth = moment(currentMoment).startOf('month').subtract(1).day();
    const lastOfMonth = moment(currentMoment).endOf('month').subtract(1).day();

    const firstDayOfGrid = moment(currentMoment).startOf('month').subtract(firstOfMonth, 'days');
    const lastDayOfGrid = moment(currentMoment).endOf('month').subtract(lastOfMonth, 'days').add(8, 'days');

    const startCalendar = firstDayOfGrid.date();
    return range(startCalendar, startCalendar + lastDayOfGrid.diff(firstDayOfGrid, 'days')).map((date) => {
      const newDate = moment(firstDayOfGrid).date(date);
      return {
        today: this.isToday(newDate),
        selected: this.isSelected(newDate),
        mDate: newDate,
      };
    });
  }

  prevMonth(): void {
    if (this.diff < -2) return;
    this.currentDate = moment(this.currentDate).subtract(1, 'months');
    const dates = {
      startDate: moment(this.currentDate).tz(this.timeZone).startOf('month').subtract(1, 'week').format(DATE_FORMAT),
      endDate: moment(this.currentDate).tz(this.timeZone).endOf('month').add(1, 'week').format(DATE_FORMAT),
      currentDate: this.currentDate
    }
    this.monthChanged.emit(dates);
  }

  nextMonth(): void {
    if (this.diff >=0) return;
    this.currentDate = moment(this.currentDate).add(1, 'months');
    const dates = {
      startDate: moment(this.currentDate).tz(this.timeZone).startOf('month').subtract(1, 'week').format(DATE_FORMAT),
      endDate: moment(this.currentDate).tz(this.timeZone).endOf('month').add(1, 'week').format(DATE_FORMAT),
      currentDate: this.currentDate
    }
    this.monthChanged.emit(dates);
  }

  isToday(date: moment.Moment): boolean {
    return moment().isSame(moment(date), 'day');
  }

  isSelected(date: moment.Moment): boolean {
    let isSelected = false;
    if (this.calendarStatisticsDates) {
      this.calendarStatisticsDates.forEach(selectedDate => {
        if (isSelected) return;
        if (moment(new Date(selectedDate)).format('MM/DD/YYYY') === moment(date).format('MM/DD/YYYY')) {
          isSelected = true;
        }
      });
    }
    return isSelected;
  }

  showGamePlayByDate(date, isSelected) {
    if (!isSelected) return;
    const dialogRef = this.dialog.open(GameplayByDateComponent, {
      data: {
        highlightedDate: date, timezone: this.timeZone
      }
    });
    dialogRef.componentInstance.playerId = this.playerId;
    this.globalService.addAdminGoogleEvent('Dashboard_Calendar_day_clicked');
  }

}
