import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-mlg-save-pop-up',
  templateUrl: './mlg-save-pop-up.component.html',
  styleUrls: ['./mlg-save-pop-up.component.scss']
})
export class MlgSavePopUpComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<any>) {
  }

  ngOnInit() {
  }
  cancel() {
    this.dialogRef.close(null);
  }

  update() {
    this.dialogRef.close(true);
  }

}
