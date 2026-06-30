import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-add-game-limits',
  templateUrl: './add-game-limits.component.html',
  styleUrls: ['./add-game-limits.component.scss']
})
export class AddGameLimitsComponent implements OnInit {
  allAudience: any;
  selectedAudiences = [];
  dataSource: any;
  limits = [];
  attempts;
  maxDate;
  limit_type;
  startDate: Date;
  endDate: Date;
  isDatePickerOpen = false;
  isMultipleAttempts = false;
  minDate = this.globalService.getCurrentDate();
  isFormInvalid = false;
  appliedFilters = [];
  assignmentData = [];
  editAttempts;

  @Output() limitsUpdated: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService,
    private datePipe: DatePipe,
    private globalService: GlobalService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.attempts = this.assignmentData.length ? this.assignmentData[0].attempt_details.max_attempts : 1;
    for (let index = 1; index < this.assignmentData.length; index++) {
      const attempts = this.assignmentData[index].attempt_details && this.assignmentData[index].attempt_details.max_attempts ?
        this.assignmentData[index].attempt_details.max_attempts : 1;
      if (this.attempts !== attempts) {
        this.isMultipleAttempts = true;
        this.attempts = null;
        break;
      }
    }
    this.checkForMultipleProperties();
  }

  startDateChanged() {
    const startDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    const endDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    if (this.endDate) {
      this.isFormInvalid = startDate > endDate;
    } else {
      this.isFormInvalid = false;
      for (let index = 0; index < this.limits.length; index++) {
        const limit = this.limits[index];
        if (startDate > limit.endDate) {
          this.isFormInvalid = true;
          break;
        }
      }
    }
  }

  endDateChanged() {
    const startDate = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    const endDate = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
    if (endDate >= startDate) {
      this.isFormInvalid = false;
    }
  }

  checkForMultipleProperties() {
    this.checkForMultipleAttempts();
    this.checkForMultipleStartDates();
    this.checkForMultipleEndDates();
    this.checkForMultipleLimitValues();
  }

  next() {
    // Tapped next on location selection screen
    this.prepareLimits();
    this.applyScheduleToLimits();
    this.limits['appliedFilters'] = this.assignmentData;
    this.limitsUpdated.emit(this.limits);
    this.dialogRef.close();

  }

  applyScheduleToLimits() {
    this.limits.forEach(limit => {
      if (this.limit_type) {
        limit.limit_type = this.limit_type;
      }
      if (this.attempts) {
        limit.attempts = +this.attempts;
      }
      if (this.startDate) {
        limit.startDate = this.startDate;
        const start_date = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
        limit.start_date = start_date;
      }
      if (this.endDate) {
        const end_date = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
        limit.end_date = end_date;
        limit.endDate = this.endDate;
      }
    });
  }

  prepareLimits() {
    const limits = [];
    // Check if all audiemces are selected
    let startDate;
    let endDate;
    if (this.startDate && this.endDate) {
      startDate = this.globalService.getCurrentDate();
      endDate = this.globalService.getCurrentDate();
    }
    // preparing the multiple limit row for audiences

    if (this.assignmentData.length && !this.appliedFilters.length) {
      this.appliedFilters = this.assignmentData.map(assignment => {
        return assignment.appliedFilters;
      });
    }

    this.appliedFilters.forEach(filter => {
      const limit = this.prepareLimit(filter.id, filter.searchingIn, filter.isAll,
        startDate, endDate, filter.filter, filter.value, filter.customFilterKey);
      limits.push(limit);
    });
    this.limits = limits;
  }

  prepareLimit(filterId, searchingIn, isAll, startDate, endDate, filter, value, filterKey) {
    const start_date = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    const end_date = this.datePipe.transform(endDate, 'yyyy-MM-dd');
    const limit: any = {
      id: filterId,
      value: value,
      startDate: startDate,
      endDate: endDate,
      filter: filter,
      filter_key: filterKey,
      isAll: isAll,
      searchingIn: searchingIn,
      attempts: 1,
      limit_type: 'daily',
      start_date: start_date,
      end_date: end_date
    };
    return limit;
  }

  checkForMultipleAttempts() {
    this.attempts = this.assignmentData.length ? this.assignmentData[0].attempt_details.max_attempts : 1;
    for (let index = 1; index < this.assignmentData.length; index++) {
      const attempts = this.assignmentData[index].attempt_details && this.assignmentData[index].attempt_details.max_attempts ?
        this.assignmentData[index].attempt_details.max_attempts : 1;
      if (this.attempts !== attempts) {
        if (this.isMultipleAttempts) {
          this.isMultipleAttempts = true;
        }
        this.attempts = null;
        break;
      }
    }
  }

  checkForMultipleLimitValues() {
    this.limit_type = this.assignmentData.length ? this.assignmentData[0].attempt_details.attempts_type.toLowerCase() : 'daily';
    for (let index = 1; index < this.assignmentData.length; index++) {
      const limit_type = this.assignmentData[index].attempt_details && this.assignmentData[index].attempt_details.attempts_type ?
        this.assignmentData[index].attempt_details.attempts_type.toLowerCase() : 'daily';
      if (this.limit_type !== limit_type) {
        this.limit_type = 'daily';
        break;
      }
    }
  }

  checkForMultipleStartDates() {
    this.startDate = this.assignmentData.length ?
      this.assignmentData[0].startDate : this.datePipe.transform(this.globalService.getCurrentDate(), 'yyyy-MM-dd');
    for (let index = 1; index < this.assignmentData.length; index++) {
      const startDate = this.assignmentData[index].startDate ?
        this.assignmentData[index].startDate : this.datePipe.transform(this.globalService.getCurrentDate(), 'yyyy-MM-dd');
      if (this.startDate !== startDate) {
        this.startDate = null;
        break;
      }
    }
  }

  checkForMultipleEndDates() {
    this.endDate = this.assignmentData.length ?
      this.assignmentData[0].endDate : this.datePipe.transform(this.globalService.getCurrentDate(), 'yyyy-MM-dd');
    for (let index = 1; index < this.assignmentData.length; index++) {
      const endDate = this.assignmentData[index].endDate ?
        this.assignmentData[index].endDate : this.datePipe.transform(this.globalService.getCurrentDate(), 'yyyy-MM-dd');
      if (this.endDate !== endDate) {
        this.endDate = null;
        break;
      }
    }
  }

  back() {
    const assignmentPayload = {
      'assignment_data': this.assignmentData,
      'applied_filters': this.appliedFilters,
      'is_changed': false
    };
    this.dialogRef.close(assignmentPayload);
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (event.target.value.length == 0 && event.which == 48) {
      return false;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  cancel() {
    this.dialogRef.close();
  }

}
