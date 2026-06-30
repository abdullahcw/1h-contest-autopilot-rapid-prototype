import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-configuration-preview',
  templateUrl: './configuration-preview.component.html',
  styleUrls: ['./configuration-preview.component.scss']
})
export class ConfigurationPreviewComponent implements OnInit {

  onPositiveAction: EventEmitter<any> = new EventEmitter();
  constructor(public dialogRef: MatDialogRef<any>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = true; }

  ngOnInit() {
  }


  done() {
    this.onPositiveAction.emit();
    this.dialogRef.close();
  }
}
