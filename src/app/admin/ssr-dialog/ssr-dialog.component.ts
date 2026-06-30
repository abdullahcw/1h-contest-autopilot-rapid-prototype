import { Component, OnInit, HostListener } from '@angular/core';
// import { TutorialVideoComponent } from '../tutorial-video/tutorial-video.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// import { TutorialVideo } from '../../services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { environment } from '../../../environments/environment';
import { TutorialVideoComponent } from '../tutorial-video/tutorial-video.component';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SelfServiceRegistrationService, Screen } from 'src/app/services/self-service-registration/self-service-registration.service';
import { ApiService } from 'src/app/services/network/api.service';

@Component({
  selector: 'app-ssr-dialog',
  templateUrl: './ssr-dialog.component.html',
  styleUrls: ['./ssr-dialog.component.scss']
})
export class SsrDialogComponent implements OnInit {
  vipCode: any;
  is_loading = false;
  fileSelected = true;
  fileURL;
  videoUrl;
  loginUser: any;
  hidePopup = false;

  constructor(private dialog: MatDialog, public dialogRef: MatDialogRef<any>,
    public selfserviceregistration: SelfServiceRegistrationService, public apiService: ApiService,
    public storageService: StorageService, public uploaderService: UploaderService,
    public translate: TranslateService, public snackBar: MatSnackBar, public globalService: GlobalService) { }

  showScreen = {
    first: true,
    second: false,
    third: false,
    fourth: false,
    fifth: false,
    sixth: false,
    seventh: false,
  };

  ngOnInit() {
    if (this.showScreen.first) {
      this.gaEvent('SSR_Company_created_popup1');
    }

  }

  showVideo(screen, key) {
    this.hidePopup = true;
    switch (screen) {
      case Screen.THIRD_SCREEN:
        this.videoUrl = this.globalService.tutorialVideo.EXPLORE_SHOP_GAME;
        break;
      case Screen.FOURTH_SCREEN:
        this.videoUrl = this.globalService.tutorialVideo.CREATE_GAME_IN_MIN;
        break;
      case Screen.FIFTH_SCREEN:
        this.videoUrl = this.globalService.tutorialVideo.FREE_CREDIT_OFFER;
        break;
    }
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { url: this.videoUrl }
      });
    dialogRef.afterClosed().subscribe(result => {
      this.hidePopup = false;
    });
    this.gaEvent(key);
  }

  gotoSecond() {
    this.showScreen.first = false;
    this.showScreen.second = true;
    this.showScreen.third = false;
    this.gaEvent('SSR_Company_created_popup2');
  }
  gotoFirst() {
    this.showScreen.first = true;
    this.showScreen.second = false;
  }

  gotoThird() {
    this.showScreen.second = false;
    this.showScreen.third = true;
    this.showScreen.fourth = false;
    this.gaEvent('SSR_Company_created_popup3');
  }

  gotoFourth() {
    this.showScreen.third = false;
    this.showScreen.fourth = true;
    this.showScreen.fifth = false;
    this.gaEvent('SSR_Company_created_popup4');
  }

  gotoFifth() {
    this.showScreen.fourth = false;
    this.showScreen.fifth = true;
    this.showScreen.sixth = false;
    this.gaEvent('SSR_Company_created_popup5');
  }

  gotoSixth() {
    this.showScreen.fifth = false;
    this.showScreen.sixth = true;
    this.showScreen.seventh = false;
    const company = this.storageService.getCompany();
    this.vipCode = company.vip_code;
    this.gaEvent('SSR_Company_created_popup6');
  }

  gotoSeventh() {
    this.showScreen.sixth = false;
    this.showScreen.seventh = true;
  }

  gotoEnd() {
    localStorage.removeItem('show_ssr_dialog');
    this.gaEvent('SSR_Company_created_popup7');
    this.dialogRef.close();
  }


  fileChangeEvent(event: any): void {
    this.fileURL = '';
    this.fileSelected = true;
    const fileType = event.target.files[0].name;
    const fileSize = event.target.files[0].size / 1024 / 1024;

    if (fileType.indexOf('doc') === -1 && fileType.indexOf('ppt') === -1 && fileType.indexOf('pdf') === -1
      && fileType.indexOf('docx') === -1 && fileType.indexOf('pptx') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('valid_file_format_msg'));
      return;
    } else if (fileSize && fileSize > 15) { // 15 MB
      this.showAlert(this.translate.instant('file_too_large'), this.translate.instant('invalid_pdf_size'));
      return;
    }

    if (event.target.files && event.target.files[0]) {
      this.fileSelected = false;
      this.fileURL = event.target.files[0];
      const url_time_stamp = Date.now();
      const path = `${environment.env_name}/self_serve_upload/${url_time_stamp}/${fileType}`;
      this.uploaderService.upload(path, this.fileURL, (err, data) => {
        // that.isVideoUploading = false;
        if (err) {
          this.showAlert(this.translate.instant('error'), this.translate.instant('problem_uploading'));
          return;
        }
        if (data) {
          const url = data.Location;
          this.uploadAsset(url);
        }
      }, true);
    }
  }

  uploadAsset(url) {
    this.is_loading = true;
    this.loginUser = JSON.parse(this.storageService.getUser());
    const learningAsset = {
      company_id: this.storageService.getCompanyId(),
      manager_id: this.loginUser.manager_id,
      assets_url: url
    };
    this.selfserviceregistration.addLearningAssets(learningAsset).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        this.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.showMessage(this.translate.instant('file_upload_msg'), 'right', 'bottom');
    });
  }

  showAlert(title, message, icon = null) {
    const dialogReference = this.dialog.open(ConfirmActionComponent);
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.imgAsIcon = icon;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  gaEvent(key) {
    this.globalService.addAdminGoogleEvent(key);
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  copyVipCode(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.gaEvent('SSR_Company_created_popup6_copied');
  }
}

