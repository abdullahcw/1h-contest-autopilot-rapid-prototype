import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-company',
  templateUrl: './delete-company.component.html',
  styleUrls: ['./delete-company.component.scss']
})
export class DeleteCompanyComponent implements OnInit {
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onDeleteConfirmation: EventEmitter<any> = new EventEmitter();

  constructor(public dialogRef: MatDialogRef<any>) { }
  isCaptchaValid = false;
  ngOnInit() {
  }

  resolved(captchaResponse: string) {
    this.isCaptchaValid = true;
    console.log(`Resolved captcha with response ${captchaResponse}:`);
  }

  cancel() {
    this.dialogRef.close();
  }

  deleteCompany() {
    this.dialogRef.close();
    this.onDeleteConfirmation.emit();
  }

}

