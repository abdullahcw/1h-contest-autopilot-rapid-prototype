import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contest-notification',
  templateUrl: './contest-notification.component.html',
  styleUrls: ['./contest-notification.component.scss']
})
export class ContestNotificationComponent implements OnInit {

  constructor(public translate: TranslateService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = true; }
  isDatePickerOpen;
  today = new Date();
  is_updating = false;
  notification = '';
  notification_date = this.today; // fix me
  ngOnInit() {
  }
  saveNotification() {
    console.log(this.notification);
  }
  dateChanged() {
    console.log(this.notification_date);
    this.saveNotification();
  }

  cancel() {
    this.dialogRef.close();
  }
}
