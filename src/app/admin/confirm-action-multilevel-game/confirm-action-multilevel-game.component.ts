import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-action-multilevel-game',
  templateUrl: './confirm-action-multilevel-game.component.html',
  styleUrls: ['./confirm-action-multilevel-game.component.scss']
})
export class ConfirmActionMultilevelGameComponent implements OnInit {

  onPositiveAction: EventEmitter<any> = new EventEmitter();
  onNegativeAction: EventEmitter<any> = new EventEmitter();

  title: string;
  message: string;
  description: string;
  negativeButtonText: string;
  positiveButtonText: string;
  isMultiOption = true;
  isCheckbox = false;
  isMLGLIVE = false;
  messageForCheckbox = 'Notify Players';
  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
  }
  isCaptchaValid = false;
  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
    if (this.onNegativeAction) {
      this.onNegativeAction.emit();
    }
  }
  closePopUp() {
    this.dialogRef.close();
  }
  actionConfirmed() {
    this.dialogRef.close();
    if (this.onPositiveAction && this.messageForCheckbox) {
      this.onPositiveAction.emit(this.isCheckbox);
      return;
    }
    if (this.onPositiveAction) {
      this.onPositiveAction.emit();
    }
  }
}
