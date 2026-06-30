import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Range } from 'src/app/services/dashboard/dashboard.service';

import moment from 'moment-timezone';
import { StorageService } from 'src/app/services/storage/storage.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-date-range-filter',
  templateUrl: './date-range-filter.component.html',
  styleUrls: ['./date-range-filter.component.scss']
})
export class DateRangeFilterComponent implements OnInit {

  @Input() showRange;
  @Input() showCustom;
  @Input() selectedRange;
  @Input() isCustomRequired;
  @Output() getGenericDateRange: EventEmitter<any> = new EventEmitter<any>();
  @Output() getCustomDateRange: EventEmitter<any> = new EventEmitter<any>();

  range;
  startDate;
  endDate;
  timeZone: string = null;

  constructor(private storageService: StorageService) {

    this.storageService.$defaultSetAsClear.subscribe((value) => {
      if (value === Range.CLEAR) {
        this.selectedRange = value;
      }
    });
    this.range = Range;
  }

  ngOnInit() {
    this.setDateRange();
  }

  setDateRange() {
    const companyLocalSetting = this.getCompanyFilter();
    if (companyLocalSetting && companyLocalSetting['range'] === Range.CUSTOM) {
      this.selectedRange = Range.CLEAR;
      if (!this.startDate || !this.endDate) {
        this.setRange(this.selectedRange);
      }
    } else {
      this.selectedRange = companyLocalSetting && companyLocalSetting['range'] ? companyLocalSetting['range'] : Range.CLEAR;
      if (!this.startDate || !this.endDate) {
        this.setRange(this.selectedRange);
      }
    }

    // Set this start and end date of month as default start date
    this.startDate = companyLocalSetting && companyLocalSetting['start_date'] ?
      companyLocalSetting['start_date'] : moment().startOf('month').format(DATE_FORMAT);
    this.endDate = companyLocalSetting && companyLocalSetting['end_date'] ?
      companyLocalSetting['end_date'] : moment().endOf('month').format(DATE_FORMAT);
  }

  setRange(value) {
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    switch (value) {
      case Range.THIS_WK: // isoWeek - wk starts from Monday, week - Wk start from Sunday
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('isoWeek').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('isoWeek').format(DATE_FORMAT);
        }
        break;
      case Range.THIS_MONTH:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('month').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('month').format(DATE_FORMAT);
        }
        break;
      case Range.NEXT_90_DAYS:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).add(89, 'days').format(DATE_FORMAT);
        }
        break;
      case Range.THIS_YEAR:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('year').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('year').format(DATE_FORMAT);
        }
        break;
      case Range.NEXT_YEAR:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).add(1, 'years').startOf('year').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).add(1, 'years').endOf('year').format(DATE_FORMAT);
        }
        break;
      case Range.CLEAR:
        this.startDate = null;
        this.endDate = null;
        break;
    }

    const data = {
      'startDate': this.startDate,
      'endDate': this.endDate,
      'selectedRange': this.selectedRange
    };
    this.getGenericDateRange.emit(data);
  }

  getCompanyFilter() {
    return this.storageService.getObject('companies');
  }

  openCustomDateRange(value) {
    this.getCustomDateRange.emit(value);
  }

}
