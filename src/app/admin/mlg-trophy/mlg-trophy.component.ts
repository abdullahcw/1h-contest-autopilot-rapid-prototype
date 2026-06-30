import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-mlg-trophy',
  templateUrl: './mlg-trophy.component.html',
  styleUrls: ['./mlg-trophy.component.scss']
})
export class MlgTrophyComponent implements OnInit {

  trophyDetails = {
    mlg_id: null,
    description: '',
    img_url: '',
    name: ''
  };
  is_loading = false;
  constructor(public translate: TranslateService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = true; }

  ngOnInit() {
    this.trophyDetails = this.data.trophy;
  }

  save() {
    this.cancel();
  }
  cancel() {
    this.dialogRef.close();
  }
}
