import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  title = 'Confirm Action';
  message: any;
  showOKbtn = false;

  constructor(public dialogRef: MatDialogRef<any>) { }
  isCaptchaValid = false;
  ngOnInit() {

  }
  cancel() {
    this.dialogRef.close();
  }

}
