import { Component, OnInit, Output, EventEmitter, Inject, HostListener } from '@angular/core';
import { ENTER, SPACE, COMMA, ESCAPE } from '@angular/cdk/keycodes';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-datepicker-range',
  templateUrl: './datepicker-range.component.html',
  styleUrls: ['./datepicker-range.component.scss']
})
export class DatepickerRangeComponent implements OnInit {

  isDatePickerOpen = false;
  is_loading = false;
  is_editing = false;
  today = new Date();
  startDate;
  endDate;
  minDate;
  maxDate;
  titleToBeDisplayed;
  isRequired = false;

  @Output() dateRangePicked: EventEmitter<any> = new EventEmitter<any>();


  constructor(public dialogRef: MatDialogRef<any>,
    public storageService: StorageService,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    public translate: TranslateService,
    private globalService: GlobalService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dialogRef.disableClose = true;
  }

  @HostListener('window:keydown', ['$event']) closeOnEscape(event) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  ngOnInit() {
    this.startDate = this.data.startDate;
    this.endDate = this.data.endDate;
    this.titleToBeDisplayed = this.data.title;
    this.maxDate = this.data.maxDate;
    this.minDate = this.data.minDate;
    this.isRequired = this.data.isRequired;
  }
  startDateChanged(startDate) {
    this.startDate = startDate;
  }
  endDateChanged(endDate) {
    this.endDate = endDate;
  }
  cancelDialog() {
    this.dialogRef.close();
  }
  send() {
    this.is_loading = true;
    this.dateRangePicked.emit({ startDate: this.startDate, endDate: this.endDate });
    this.cancelDialog();
  }

}
