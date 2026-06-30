import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-blocker-popup',
  templateUrl: './blocker-popup.component.html',
  styleUrls: ['./blocker-popup.component.scss']
})
export class BlockerPopupComponent implements OnInit {


  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService) { }

  ngOnInit(): void {
  }

}
