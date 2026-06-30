import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-sso-message',
  templateUrl: './sso-message.component.html',
  styleUrls: ['./sso-message.component.scss']
})
export class SsoMessageComponent implements OnInit {

  onPositiveAction: EventEmitter<any> = new EventEmitter();
  onNegativeAction: EventEmitter<any> = new EventEmitter();

  title = 'Confirm Action';
  message: string;
  negativeButtonText = 'NO';
  positiveButtonText = 'YES';
  isMultiOption = true;

  constructor(public dialogRef: MatDialogRef<any>) { }
  isCaptchaValid = false;
  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
    if (this.onNegativeAction) {
      this.onNegativeAction.emit();
    }
  }

  actionConfirmed() {
    this.dialogRef.close();
    if (this.onPositiveAction) {
      this.onPositiveAction.emit();
    }
  }

}
