import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-action',
  templateUrl: './confirm-action.component.html',
  styleUrls: ['./confirm-action.component.scss']
})
export class ConfirmActionComponent implements OnInit {
  onPositiveAction: EventEmitter<any> = new EventEmitter();
  onNegativeAction: EventEmitter<any> = new EventEmitter();

  title = 'Confirm Action';
  message: any;
  negativeButtonText = this.translate.instant('no_uppercase');
  positiveButtonText = this.translate.instant('yes_uppercase');
  isMultiOption = true;
  isCheckbox = false;
  messageForCheckbox = '';
  icon = '';
  imgAsIcon = '';
  isLinked = false;
  constructor(public dialogRef: MatDialogRef<any>, public translate: TranslateService, private sanitized: DomSanitizer) { }
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
    if (this.onPositiveAction && this.messageForCheckbox) {
      this.onPositiveAction.emit(this.isCheckbox);
    } else if (this.onPositiveAction) {
      this.onPositiveAction.emit();
    }
    this.dialogRef.close();
  }
}

