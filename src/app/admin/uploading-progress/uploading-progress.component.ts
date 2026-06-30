import { Component, OnInit, Input, Inject, DoCheck, ChangeDetectorRef, HostListener } from '@angular/core';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-uploading-progress',
  templateUrl: './uploading-progress.component.html',
  styleUrls: ['./uploading-progress.component.scss']
})
export class UploadingProgressComponent implements OnInit, DoCheck {
  progress = 0;
  uploadTitle = 'Uploading...';
  constructor(
    @Inject(MAT_DIALOG_DATA) public progressCount: any,
    public dialogRef: MatDialogRef<any>,
    // public uploaderService: UploaderService,
  ) {
    // this.uploaderService.uploadingProgress.subscribe(progress => {
    //   // console.log('progress', progress);
    //   this.progress = Math.round(progress);
    //   if (this.progress === 100) {
    //     this.dialogRef.close();
    //   }
    // });
  }
  @HostListener('window:beforeunload', ['$event']) function(event) {
    const confirmationMessage = 'dummyString';
    event.returnValue = confirmationMessage;
    return false;
  }
  ngOnInit() {
    // if (this.progressCount.count === 100) {
    //   this.dialogRef.close();
    // }
  }
  ngDoCheck() {
    //  console.log(this.progressCount)

    setTimeout(() => {
      if (this.progressCount.count === 100) {
        this.progressCount.count = 0;
        this.dialogRef.close();
      }
    }, 1000);
  }

}
