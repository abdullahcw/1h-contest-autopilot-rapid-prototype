import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-validation-dialog',
  templateUrl: './validation-dialog.component.html',
  styleUrls: ['./validation-dialog.component.scss']
})
export class ValidationDialogComponent implements OnInit {

  title = 'Validation Message';
  message: string;
  is_loading = false;
  is_game_validation = true;
  constructor(public dialogRef: MatDialogRef<any>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public validationMessage: any) { }

  ngOnInit() {
    console.log('validationMessage', this.validationMessage);
  }

  cancel() {
    this.dialogRef.close();
  }


}
