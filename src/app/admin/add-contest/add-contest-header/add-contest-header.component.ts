import { Component, OnInit, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { GlobalService } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { MatDialog } from '@angular/material/dialog';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ApiService } from 'src/app/services/network/api.service';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ContestService } from 'src/app/services/contest/contest.service';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { ValidationDialogComponent } from '../../validation-dialog/validation-dialog.component';
import { ContestRulesComponent } from '../../contest-rules/contest-rules.component';
import { ContestRewardComponent } from '../../contest-reward/contest-reward.component';
import { ScheduleContestComponent } from '../../schedule-contest/schedule-contest.component';
import { ContestNotificationComponent } from '../../contest-notification/contest-notification.component';
import { ContestTrophyComponent } from '../../contest-trophy/contest-trophy.component';
import { ConfigurationPreviewComponent } from '../../configuration-preview/configuration-preview.component';
import { TutorialVideoComponent } from '../../tutorial-video/tutorial-video.component';
import { AlertComponent } from '../../alert/alert.component';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import { Role } from 'src/app/services/permissions/permissions.service';
import { LocationService } from 'src/app/services/location/location.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-add-contest-header',
  templateUrl: './add-contest-header.component.html',
  styleUrls: ['./add-contest-header.component.scss']
})
export class AddContestHeaderComponent implements OnInit {


  is_loading = false;
  hasChanged = false;
  isDatePickerOpen = false;
  currentDate = new Date();
  tomorrow;
  contest: any = {
    contest_id: '',
    contest_name: '',
    contest_image_url: '',
    contest_start_date: this.currentDate,
    contest_end_date: this.currentDate
  };
  contest_img;
  croppedImage = {
    'path': '',
    'blob': null
  };
  property = '';
  tempContestName;
  tempContestStartDate;
  tempContestEndDate;
  contestMaxDate;
  validStartDate;

  @Output() contestProperty: EventEmitter<any> = new EventEmitter();
  @Output() contestDetails: EventEmitter<any> = new EventEmitter();
  @Output() updateGames: EventEmitter<any> = new EventEmitter();
  @Output() refreshGamesList: EventEmitter<any> = new EventEmitter();
  fetchingTimezones: boolean;
  timeZoneList: any[];

  @Input()
  set newContest(value) {
    if (value === true) {
      this.ngOnInit();
    }
  }

  constructor(
    public translate: TranslateService, private storageService: StorageService, private breadcrumbService: BreadcrumbsService,
    public router: Router, private cdRef: ChangeDetectorRef,
    public getImageURLService:GetImageURLService,
    private datePipe: DatePipe, private dialog: MatDialog, private apiService: ApiService, private activatedRoute: ActivatedRoute,
    public contestService: ContestService, private globalService: GlobalService, 
    private uploaderService: UploaderService,
    private locationService: LocationService
  ) {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.breadcrumbService.updateBreadcrumbLabel(this.contest.contest_name);
    });
  }

  ngOnInit() {
    const contest = JSON.parse(this.storageService.getContest());
    if (!contest) {
      // New contest — emit defaults so parent clears its spinner
      this.getValidStartDate();
      this.getTimeZone();
      setTimeout(() => this.contestDetails.emit(this.contest), 0);
      return;
    }
    this.contest.contest_id = contest.contest_id;
    this.getContest();
    this.getValidStartDate();
    this.getTimeZone();
  }

  getValidStartDate() {
    const company_id = this.storageService.getCompanyId();
    this.contestService.getValidContestDate(company_id).subscribe((res) => {
      const response = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }  
      this.validStartDate = new Date(response.data.valid_start_date);
      this.contestService.validStartDate = new Date(response.data.valid_start_date);
      this.setDateRangeValidation();
    });
  }

  setDateRangeValidation() {
    this.tomorrow = this.validStartDate;
    this.contestMaxDate = new Date(new Date().setDate(this.tomorrow.getDate() + 89));
    if (this.contestService.contestProperty) {
      this.property = this.contestService.contestProperty;
      this.contestProperty.emit(this.contestService.contestProperty);
    }
  }


  getContest() {
    const companyId = this.storageService.getCompanyId();
    this.contestService.getContest(this.contest.contest_id, companyId).subscribe(res => {
      const response: any = res;
      if (response.success) {
        this.contest = res.data.contest_description;
        setTimeout(() => {
          this.imageUrlUpdated(this.contest.contest_image_url); 
        });
       this.contestService.isContestEditable = res.data.contest_description.is_editable && res.data.contest_description.is_authorized;
        this.contest.contest_start_date = this.globalService.convertDateForRangeSlider(res.data.contest_description.contest_start_date);
        this.contest.contest_end_date = this.globalService.convertDateForRangeSlider(res.data.contest_description.contest_end_date);
        this.contest.tz_id = res.data.contest_description.tz_id;
        this.contestService.setContestDetails(this.contest);
        this.changeGameDateFormat(this.contest.game_details);
        if (!this.tempContestName) { this.isDateRangeValid(); }
        this.tempContestName = this.contest.contest_name;
        this.tempContestStartDate = this.contest.contest_start_date;
        this.tempContestEndDate = this.contest.contest_end_date;
      }
    });
  }

  changeGameDateFormat(contestGames) {
    if (contestGames.length) {
      contestGames.forEach(game => {
        // ponytail: slider stepsArray uses timestamps; convert Date → number
        game.game_start_date = this.globalService.convertDateForRangeSlider(game.game_start_date).getTime();
        game.game_end_date = this.globalService.convertDateForRangeSlider(game.game_end_date).getTime();
      });
    }
    this.updateContest(this.contest);
  }
  convertDateForUpdate(sourceDate) {

  }
  updateContest(contest, key = null) {
    this.contest = contest;
    this.contestService.setContestDetails(this.contest);
    this.breadcrumbService.updateBreadcrumbLabel(this.contest.contest_name);
    const date = key ? new Date(contest[key]) : new Date(contest.contest_start_date);
    this.contestMaxDate = new Date(date.setDate(date.getDate() + 89));
    this.contestDetails.emit(this.contest);
  }
  isDateRangeValid() {
    if (!this.contestService.validateContestDateRange()) {
      const startDate = JSON.parse(JSON.stringify(this.contest.contest_start_date));
      const contestMaxDate = new Date(new Date(startDate).setDate(this.contest.contest_start_date.getDate() + 89));
      const message = this.contest.contest_start_date.getTime() < this.contestService.validStartDate.getTime() ?
        this.translate.instant('correct_contest_start_date') :
        this.contest.contest_end_date.getTime() > contestMaxDate.getTime() ? this.translate.instant('correct_date_range') :
          this.translate.instant('correct_contest_end_date');
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        data: event
      });

      dialogRef.componentInstance.title = this.translate.instant('invalid_date_range');
      dialogRef.componentInstance.message = message;
      dialogRef.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
      dialogRef.componentInstance.isMultiOption = false;
      return false;
    }
    return true;
  }
  updateContestDetails(key = null, value = null) {
    const company_id = this.storageService.getCompanyId();
    const contest = JSON.parse(this.storageService.getContest());
    const payload = {
      'company_id': company_id,
      'contest_id': contest.contest_id,
    };
    payload[key] = value;
    this.contestService.updateContestDetails(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.getValidStartDate();
      }
    });
  }

  sendProperty(item) {
    this.property = item;
    this.contestService.contestProperty = item;
  }

  openPropertyDialog(property) {
    switch (property) {
      case 'rule':
        const dialogRef = this.dialog.open(ContestRulesComponent, {
          data: { 'property': property, 'contestRule': this.contest.contest_rule }
        });
        dialogRef.afterClosed().subscribe((data) => {
          this.getContest();
        });
        this.globalService.addAdminGoogleEvent('Contests_Contests_Rules_Added');
        break;
      case 'reward':
        const dialog = this.dialog.open(ContestRewardComponent, {
          data: { 'property': property, 'contestReward': this.contest.rewards }
        });
        dialog.afterClosed().subscribe((data) => {
          this.getContest();
        });
        this.globalService.addAdminGoogleEvent('Contests_Contests_Reward_Selected');
        break;
      case 'schedule':
        let scheduleDialog;
        localStorage.removeItem('schedule_contest');
        scheduleDialog = this.dialog.open(ScheduleContestComponent, {
          data: { 'property': property, 'ownerId': this.contest.owner_id }
        });
        scheduleDialog.afterClosed().subscribe((data) => {
          if (data) {
            this.getContest();
            this.refreshGamesList.emit();
          }
        });
        break;
      case 'notification':
        this.dialog.open(ContestNotificationComponent, {
          data: property
        });
        break;
      case 'trophy':
        this.dialog.open(ContestTrophyComponent, {
          data: { 'property': property, 'contestTrophy': this.contest.trophy }
        });
        this.globalService.addAdminGoogleEvent('Contests_Contests_Trophy_Viewed');
        break;
    }
  }

  fileChangeEvent(event) {
    const file = event.target.files[0];
    const pathComponents = event.target.value.split('.');
    const type = pathComponents[pathComponents.length - 1].toLowerCase();
    if (type.indexOf('png') === -1 && type.indexOf('jpg') === -1 && type.indexOf('jpeg') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('valid_img_format_msg'));
      return;
    }

    const that = this;
    const fr = new FileReader();
    fr.onload = () => { // when file has loaded
      const img = new Image();
      img.onload = () => {
        that.openCropper(event);
      };
      img.src = fr.result as string; // This is the data URL
    };
    fr.readAsDataURL(file);
  }

  openCropper(event) {
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event
    });
    dialogRef.componentInstance.aspectRatio = 16 / 9;
    dialogRef.componentInstance.maintainAspectRatio = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contest_img = result.base64;
        this.contest.contest_image_url = result.base64;
        const companyIdentifier = this.storageService.getCompany().company_name.replace(/\s/g, '');
        const path = environment.env_name + '/' + companyIdentifier + '/company/contest-banners/' + this.contest.contest_id + '.jpg';
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        this.uploadAsset();
        this.globalService.addAdminGoogleEvent('Contests_Contests_Game_Icon_Changed');
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('add_contest_banner');
  }

  uploadAsset() {
    if (this.croppedImage.path) {
      const that = this;
      this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, function (err, data) {
        if (!data) {
          that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
          return;
        }
        const URL = `${data.Location}?t=${Date.now()}`;
        that.imageUrlUpdated(URL);       
        that.updateContestDetails('contest_image_url', data.Location);
      });
    }
  }

  contestNameValidation(key, value) {
    if (!value) {
      this.contest.contest_name = this.tempContestName;
      return;
    } else if (value.length < 1) {
      this.contest.contest_name = this.tempContestName;
      this.globalService.showMessage(this.apiService.getErrorMessage('CONTEST_NAME_VALIDATION'));
      return;
    } else {
      this.breadcrumbService.updateBreadcrumbLabel(this.contest.contest_name);
      this.tempContestName = this.contest.contest_name;
      this.updateContestDetails(key, value);
      this.updateContest(this.contest);
    }
  }
  contestStartDateValidation(key, contest) {
    if (contest.contest_start_date.getTime() < this.contestService.validStartDate.getTime()) {
      this.cdRef.detectChanges();
      this.contest.contest_start_date = this.tempContestStartDate;
      this.showAlert(this.translate.instant('invalid_date'), this.translate.instant('correct_contest_start_date'));
      return;
    }
    if (contest.contest_start_date.getTime() > contest.contest_end_date.getTime()) {
      this.contest.contest_end_date = contest.contest_start_date;
      const endDate = `${this.globalService.formatDateForPayload(new Date(contest.contest_end_date))} 23:59:59`;
      this.updateContestDetails('contest_end_date', endDate);
      this.tempContestEndDate = contest.contest_start_date;
      this.updateContest(contest, 'contest_end_date');
    }
    const startDate = `${this.globalService.formatDateForPayload(new Date(contest.contest_start_date))} 00:00:00`;
    this.updateContestDetails(key, startDate);
    this.tempContestStartDate = contest.contest_start_date;
    this.updateContest(contest);
    if (!this.contestService.validateContestDateRange()) { return; }
    this.updateGames.emit();
  }
  contestEndtDateValidation(key, contest) {
    if (contest.contest_end_date.getTime() < contest.contest_start_date.getTime() ||
      contest.contest_end_date.getTime() < this.contestService.validStartDate.getTime()) {
      this.cdRef.detectChanges();
      this.contest.contest_end_date = this.tempContestEndDate;
      this.showAlert(this.translate.instant('invalid_date'), this.translate.instant('correct_contest_end_date'));
      return;
    } else if (this.contest.contest_end_date.getTime() > this.contestMaxDate.getTime()) {
      this.cdRef.detectChanges();
      this.contest.contest_end_date = this.tempContestEndDate;
      this.showAlert(this.translate.instant('invalid_date'), this.translate.instant('correct_date_range'));
      return;
    }
    const endDate = `${this.globalService.formatDateForPayload(new Date(contest.contest_end_date))} 23:59:59`;
    this.updateContestDetails(key, endDate);
    this.tempContestEndDate = contest.contest_start_date;
    this.updateContest(contest);
    if (!this.contestService.validateContestDateRange()) { return; }
    this.updateGames.emit();
  }
  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  readyToPublishContest() {
    const contest = this.contestService.getContestDetails();
  }

  openErrorPopUp(errorDetails) {
    const validationRef = this.dialog.open(ValidationDialogComponent, {
      data: errorDetails
    });
    validationRef.componentInstance.is_game_validation = false;
  }

  publishContest() {
    if (!this.isDateRangeValid()) { return; }
    this.is_loading = true;
    const contest = this.contestService.getContestDetails();
    const company_id = this.storageService.getCompanyId();
    const payload = {
      'company_id': company_id,
      'contest_id': contest.contest_id
    };
    this.contestService.publishContest(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'RESTRICT_GAME_DELETE_ON_CONTEST_MLG') {
          this.checkIsGameLive();          
          return;
        }        
      }
      if (response.success) {
        const configPreview = this.dialog.open(ConfigurationPreviewComponent, {
          data: this.contest
        });
        configPreview.componentInstance.onPositiveAction.subscribe((data) => {
          this.globalService.addAdminGoogleEvent('Contests_Contests_Scheduled');
          this.router.navigate(['/admin/contests']);
        });
      } else {
        this.getValidStartDate();
        if (!Object.keys(response.data).length) {
          this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
          return;
        }
        this.openErrorPopUp(response.data.details);
      }
    });
  }


  checkIsGameLive(){
    const dialogRef = this.dialog.open(AlertComponent, {
      data: event
    });    
    dialogRef.componentInstance.message = this.translate.instant('remove_delete_games');
    dialogRef.componentInstance.title = this.translate.instant('game_not_available_title');
    dialogRef.componentInstance.showOKbtn = true;
  }


  showVideo() {
    this.globalService.addAdminGoogleEvent('Contests_Video_Play');
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { name: this.translate.instant('how_to_create_contests'), 
        url: this.globalService.tutorialVideo.CREATE_CONTEST }
      });
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.contest_img   = data;
    });
  }
  getTimeZone() {
    this.fetchingTimezones = true;
    this.locationService.getTimeZone().subscribe((res) => {
      const response: any = res;
      if (response.success) {
        const timezones = response.data.timezone_list;
        this.timeZoneList = [];
        timezones.forEach(timezone => {
          this.timeZoneList.push({ id: timezone.tz_id, title: timezone.tz_name, subtitle: timezone.tz_unit });
        });
      }
      this.fetchingTimezones = false;
    });
  }

  onTimeZoneSelectionChanged(Id){
    this.contest['tz_id'] = Id;
    this.updateContestDetails('tz_id',  this.contest.tz_id);
    this.globalService.addAdminGoogleEvent('Contests_Contests_Timezone_selected');
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.contestService.contestProperty = '';
  }
}
