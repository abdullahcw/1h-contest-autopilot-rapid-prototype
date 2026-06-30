
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-translations-error-popup',
  templateUrl: './translations-error-popup.component.html',
  styleUrls: ['./translations-error-popup.component.scss']
})
export class TranslationsErrorPopupComponent implements OnInit {
  onPositiveAction: EventEmitter<any> = new EventEmitter();
  onNegativeAction: EventEmitter<any> = new EventEmitter();
  title = 'Confirm Action';
  message: any;
  negativeButtonText;
  positiveButtonText;
  // isMultiOption = true;
  // isCheckbox = false;
  // messageForCheckbox = '';
  // icon = '';
  // imgAsIcon = '';
  // isLinked = false;
  constructor(public dialogRef: MatDialogRef<any>, public translate: TranslateService, private sanitized: DomSanitizer) { }
  // isCaptchaValid = false;
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
