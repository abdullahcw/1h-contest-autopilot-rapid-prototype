import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-paywall-action',
  templateUrl: './paywall-action.component.html',
  styleUrls: ['./paywall-action.component.scss']
})
export class PaywallActionComponent implements OnInit {

  title = '';
  message: any;
  sdr = {
    sdr_email: '',
    sdr_name: ''
  };
  csr = {
    csr_email: '',
    csr_name: ''
  };

  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.sdr = {
      'sdr_name': this.data.sdr.sdr_name,
      'sdr_email': this.data.sdr.sdr_email
    };
    this.csr = {
      'csr_name': this.data.csr.csr_name,
      'csr_email': this.data.csr.csr_email
    };
  }

  closePopUp() {
    this.dialogRef.close();
  }

  shouldDisable() {
    return this.sdr.sdr_name || this.csr.csr_name;
  }
}
