import { Component, OnInit, Inject, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ENTER, COMMA, ESCAPE, SPACE } from '@angular/cdk/keycodes';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DatePipe } from '@angular/common';
import { GlobalService } from '../../services/global/global.service';
const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-custom-datepicker',
  templateUrl: './custom-datepicker.component.html',
  styleUrls: ['./custom-datepicker.component.scss']
})
export class CustomDatepickerComponent implements OnInit {
  isDatePickerOpen = false;
  is_loading = false;
  is_editing = false;
  today;
  startDate;
  endDate;
  emails;
  disableEmail = false;
  isCompany = false;
  titleToBeDisplayed;
  selectedRange;
  readonly separatorKeysCodes: number[] = [ENTER, SPACE, COMMA];

  @Output() dateRangePicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() dateRangeCancel: EventEmitter<any> = new EventEmitter<any>();


  constructor(public dialogRef: MatDialogRef<any>,
    public storageService: StorageService,
    private datePipe: DatePipe,
    public dialog: MatDialog,
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
    const todayStr = this.datePipe.transform(new Date(), 'yyyy/MM/dd');
    this.today = this.globalService.formatDate(todayStr);
    const thisYear = (new Date()).getFullYear();
    this.startDate = new Date('1/1/' + thisYear);
    this.isCompany = this.data.isCompany;
    this.endDate = this.globalService.formatDate(todayStr);
    this.emails = this.data.emails;
    this.disableEmail = this.data.disableEmail;
    this.selectedRange = this.data.selectedRange;
    this.titleToBeDisplayed = this.data.title;
    if (this.isCompany) {
      this.startDate = this.data.startDate;
      this.endDate = this.data.endDate;
    }
  }


  startDateChanged(startDate) {
    this.startDate = startDate;
  }

  endDateChanged(endDate) {
    this.endDate = endDate;
  }

  removeFilter(email) {
    const index = this.emails.indexOf(email);
    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  cancelDialog() {
    if (this.isCompany) {
      this.dateRangeCancel.emit({ startDate: this.startDate, endDate: this.endDate });
    }
    this.dialogRef.close();
  }

  validateEmail(emailInput) {
    const re = new RegExp('\\S+@\\S+\\.\\S+');
    const emailNotValid = re.test(emailInput);
    return emailNotValid;
  }

  addEmailChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    const values = value.split(/[ ,]+/);
    if (values && values.length !== 0) {
      const totalEmails = values.length;
      for (let i = 0; i < totalEmails; i++) {
        if (!this.validateEmail(values[i])) { continue; }
        // Add email
        if ((values[i] || '').trim()) {
          this.emails.push(values[i].trim());
        }
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  sendEmail() {
    this.is_loading = true;
    this.dateRangePicked.emit({ startDate: this.startDate, endDate: this.endDate, emails: this.emails });
    this.dialogRef.close();

  }
  sendDate() {
    this.dateRangePicked.emit({ startDate: this.startDate, endDate: this.endDate });
    this.dialogRef.close();

  }
}
