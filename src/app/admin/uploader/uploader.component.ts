import { Component, OnInit, ViewChild, Inject, EventEmitter, Output } from '@angular/core';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { NgForm } from '@angular/forms';
import { PlayerService } from 'src/app/services/player/player.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss']
})
export class UploaderComponent implements OnInit {
  fileURL;
  showError = false;
  errorMessage;
  uplaodeFileURL;
  is_loading = false;
  fileSelected = true;
  uploadSuccess = false;
  dataAdded = false;
  playersAdded = false;
  uploadedData;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onUploadComplete = new EventEmitter();
  @Output() sendOnboardingEmail = new EventEmitter();
  onNegativeAction: EventEmitter<any> = new EventEmitter();
  @ViewChild('addUser', { static: true }) addUser: NgForm;

  constructor(
    public uploaderService: UploaderService,
    public playerService: PlayerService,
    public globalService: GlobalService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<any>,
    // @Inject(MAT_DIALOG_DATA) public CSVSample: any  ) { }
    @Inject(MAT_DIALOG_DATA) public CSVSample: any) { }

  ngOnInit() {
  }
  cancel() {
    this.dialogRef.close(false);
  }
  OK() {
    if (this.dataAdded) {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close(false);
    }
  }
  downloadSample() {
    window.location.assign(this.CSVSample);
    this.globalService.showMessage(this.translate.instant('downloading_file'));

  }

  fileChangeEvent(event: any): void {
    this.fileURL = '';
    this.fileSelected = true;
    this.showError = false;
    const fileType = event.target.files[0].name.split('.');
    if (fileType[fileType.length - 1].toLowerCase() !== 'csv') {
      this.showError = true;
      // this.addUser.form.markAsDirty();
      this.errorMessage = this.translate.instant('invalid_file_format_confirm_csv');
      return;
    }


    if (event.target.files && event.target.files[0]) {

      // this.is_video = true;
      this.fileSelected = false;
      this.fileURL = event.target.files[0];
      // this.uplaodCSV(fileURL);
    }
  }
  uplaodCSV() {
    const filename = this.globalService.getCurrentDate().getTime();
    // Hard code folder name, don't dare to change it, configure with server
    const path = '1huddle-public-uploads/' + filename + '.csv';
    this.is_loading = true;
    this.uploadAsset(this.fileURL, path);
  }

  uploadAsset(file, path) {
    const that = this;
    // this.isVideoUploading = true;
    this.uploaderService.uploadPrivateCSV(path, file, function (err, data) {
      // that.isVideoUploading = false;
      if (err) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('problem_uploading'), false, 'Ok');
        return;
      }
      if (data) {
        const url = data.Location;
        that.onUploadComplete.emit(url);
        // that.uplaodeFileURL = url;
        // that.uploadPlayerCSV(url);
      }
    }, false);
    // });
  }

  sendEmail() {
    this.is_loading = true;
    this.sendOnboardingEmail.emit();
  }

}
