import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-win-rate-calculation-info',
  templateUrl: './win-rate-calculation-info.component.html',
  styleUrls: ['./win-rate-calculation-info.component.scss']
})
export class WinRateCalculationInfoComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<any>) { }

  ngOnInit(): void {
  }

  cancelCompany(){
    this.dialogRef.close();
  }

}
