import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/services/global/global.service';


@Component({
  selector: 'app-user-restrict-dialog',
  templateUrl: './user-restrict-dialog.component.html',
  styleUrls: ['./user-restrict-dialog.component.scss']
})
export class UserRestrictDialogComponent implements OnInit {


  message: string;
  managerName: string;
  contactDetails: string;
  accountTypePaid = false;
  date;

  constructor(public dialogRef: MatDialogRef<any>, private datePipe: DatePipe, private globalService: GlobalService) { }
  isCaptchaValid = false;
  ngOnInit() {
  }
  getDateTime(date) {
    return this.datePipe.transform(date.replace(/ /g, 'T'), 'MM/dd/yyyy');
  }
  track(type) {
    this.globalService.addAdminGoogleEvent(type);
  }

}
