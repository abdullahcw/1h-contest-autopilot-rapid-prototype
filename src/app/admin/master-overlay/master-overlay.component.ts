import { Component, OnInit, Input, EventEmitter, Inject, NgModule } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContestRulesComponent } from '../contest-rules/contest-rules.component';

@Component({
  selector: 'app-master-overlay',
  templateUrl: './master-overlay.component.html',
  styleUrls: ['./master-overlay.component.scss'],
})
export class MasterOverlayComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = true; }

    ngOnInit() {
    // console.log(this.data);
  }
  cancel() {

    this.dialogRef.close();
  }

  save() {
    this.cancel();
  }
}
