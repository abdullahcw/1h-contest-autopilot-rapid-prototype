import { Component, OnInit, ViewChild, Input , EventEmitter, Output} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/services/global/global.service';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Route } from '../../../services/login/login.service';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { environment } from 'src/environments/environment';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { AddRulesComponent } from '../../add-rules/add-rules.component';
import { MlgSavePopUpComponent} from 'src/app/admin/create-multilevel-game/mlg-save-pop-up/mlg-save-pop-up.component';

import { MlgTrophyComponent } from '../../mlg-trophy/mlg-trophy.component';
import { ConfirmActionMultilevelGameComponent } from '../../confirm-action-multilevel-game/confirm-action-multilevel-game.component';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';

@Component({
  selector: 'app-create-multilevel-game-header',
  templateUrl: './create-multilevel-game-header.component.html',
  styleUrls: ['./create-multilevel-game-header.component.scss']
})
export class CreateMultilevelGameHeaderComponent implements OnInit {
  @ViewChild('imgInput', { static: true }) imgInput;

  @Input() multilevelGameData: any;
  @Input() viewbutton: any;
  @Input() disableSave: any;
  @Output() cancelEvent = new EventEmitter();
  @Output() saveAddedLevels = new EventEmitter();
  gameName;
  hasChanged = false;
  tabIndex = 0;
  croppedImage = {
    'path': '',
    'blob': null
  };
  access_type;
  is_loading: boolean;
  mlgBannerImg;
  constructor(
    public storageService: StorageService,
    private dialog: MatDialog,
    public breadcrumbService: BreadcrumbsService,
    public apiService: ApiService,
    public globalService: GlobalService,
    public router: Router,
    public translate: TranslateService,
    public multilevelGameService: MultilevelGamesService,
    private uploaderService: UploaderService,
    public getImageURLService:GetImageURLService
  ) {
    this.access_type = this.storageService.getAccessType();
  }
  

  ngOnInit() {
    if (this.multilevelGameData && this.multilevelGameData.mlg_name) {
      this.gameName = this.multilevelGameData.mlg_name;
    }
  }
  saveButtonClicked() {
    this.router.navigate([Route.MULTILEVEL_GAMES]);
  }

  callCancel() {
    this.cancelEvent.emit();
  }

  openUpdatePopUp() {
    const dialogRef = this.dialog.open(MlgSavePopUpComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_Limit_Level_Updated_Clicked');
        this.saveAddedLevels.emit();
      }
    });
  }

  fileChangeEvent(event: any): void {
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
        this.mlgBannerImg = result.base64;
        const companyIdentifier = this.storageService.getCompany().company_name.replace(/\s/g, '');
        const path = environment.env_name + '/' + companyIdentifier + '/company/mlg-banner/' + this.multilevelGameData.mlg_id + '.jpg';
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        this.uploadAsset();
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('add_mlg_banner');
  }

  ngAfterViewInit() {
    setTimeout(() =>{
    this.imageUrlUpdated(this.multilevelGameData.mlg_logo);
  },600)
  }
  
  uploadAsset() {
    if (this.croppedImage.path) {
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Upload_Game_Image');
      const that = this;
      this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, function (err, data) {
        if (!data) {
          that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
          return;
        }
        const URL = `${data.Location}?t=${Date.now()}`;
        that.imageUrlUpdated(URL); 
        that.saveMlg('mlg_logo', data.Location);
      });
    }
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

  checkMultilevelGameReadiness() {
    const payload = {
      'company_id': this.multilevelGameData.company_id,
      'mlg_id': this.multilevelGameData.mlg_id
    };
    this.multilevelGameService.checkMultilevelGameReadiness(payload).subscribe((res) => {
      const response = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      if (!response.data.atleast_one_criteria_in_level || !response.data.atleast_two_levels) {
        response.data['level_count'] = this.multilevelGameData.games.length;
        const dialogReference = this.dialog.open(ConfirmActionMultilevelGameComponent, {
          data: response.data
        });
        dialogReference.componentInstance.title = !response.data.atleast_two_levels ? this.translate.instant('game_not_complete') :
          this.translate.instant('criteria_needed');
          dialogReference.componentInstance.positiveButtonText = this.translate.instant('keep_editing');
        dialogReference.componentInstance.isMultiOption = false;
        dialogReference.componentInstance.isCheckbox = false;
        return;
      }
      this.gotoAddPlayer();
    });
  }

  gotoAddPlayer() {
    this.router.navigate([Route.MULTILEVEL_SCHEDULE_GAME]);
  }
  deleteMlg(gameData) {

    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });

    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_mltilevelgame');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.is_loading = true;
      const companyId = this.multilevelGameData.company_id;
      const mlgId = gameData.mlg_id;
      this.multilevelGameService.deleteMlg(companyId, mlgId).subscribe((res) => {
        const response = res;
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
          return;
        }
        this.storageService.setTeb('mlg');
        this.router.navigate([Route.GAMES]);
      });
    });
  }

  openRulesDialog() {
    const dialogRef = this.dialog.open(AddRulesComponent, {
      data: this.multilevelGameData
    });
    dialogRef.afterClosed().subscribe((data) => {
      this.getGameDetails();
    });
  }

  getGameDetails() {

    this.multilevelGameService.getGameDetails(this.multilevelGameData.mlg_id, this.multilevelGameData.company_id).subscribe(res => {
      if (res.success) {
        this.multilevelGameData = res.data.mlg_description;
        if (this.access_type === 'MM') {
          this.multilevelGameData.is_editable = false;
        }
      }
    });
  }

  openTrophyDialog() {
    this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_View_Trophy');
    this.dialog.open(MlgTrophyComponent, {
      data: this.multilevelGameData
    });
  }

  gameNameValidation(key, value) {
    if (!value) {
      this.multilevelGameData.game_name = this.gameName;
      return;
    } else if (value.length < 1) {
      this.multilevelGameData.game_name = this.gameName;
      this.globalService.showMessage(this.apiService.getErrorMessage('GAME_NAME_VALIDATION'));
      return;
    } else {
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Rename_Game_Name');
      this.multilevelGameData.game_name = value;
      this.breadcrumbService.updateBreadcrumbLabel(this.multilevelGameData.game_name);
      this.saveMlg(key, value);
    }
  }

  saveMlg(key, value) {
    this.storageService.setmultilevelGameObject(this.multilevelGameData); // to update localstorage with latest values
    const payload = {
      'mlg_id': +this.multilevelGameData['mlg_id'],
      'company_id': +this.multilevelGameData['company_id']
    };
    payload[key] = value;
    this.multilevelGameService.saveGame(payload).subscribe(res => {
      console.log('save game response : ', res);
      if (res.success && key === Constants.MLG_NAME) {
        this.getGameDetails();
      }
      if (res.success && key === 'mlg_logo') {
        this.addEvent();
      }
    });
  }

  addEvent() {
    this.multilevelGameData && this.multilevelGameData.mlg_state === 'LIVE' ?
      this.globalService.addAdminGoogleEvent('Banner_Replaced_live') :
      this.multilevelGameData.mlg_state === 'DRAFT' ? this.globalService.addAdminGoogleEvent('Banner_Replaced_draft') :
      this.globalService.addAdminGoogleEvent('Banner_Replaced_ready');
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.mlgBannerImg  = data;
    });  
  }
  onMlgLockUnlockChanged(){
    if(this.multilevelGameData.is_mlg_preview_locked){
      this.showConfirmationPopupLock();
    }else{
      this.showConfirmationPopupUnlock();
    }
  }

  showConfirmationPopupLock() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.title = this.translate.instant('MLG_LOCK_UNLOCK_TITLE');
    dialogRef.componentInstance.message = this.translate.instant('confitm_lock_unlock_message2');
    dialogRef.componentInstance.negativeButtonText = 'YES';
    dialogRef.componentInstance.positiveButtonText = 'NO';
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.globalService.addAdminGoogleEvent('MLG_Preview_Unlocked');       
      this.multilevelGameData.is_mlg_preview_locked = false;
        this.saveMlg('is_mlg_preview_locked', this.multilevelGameData.is_mlg_preview_locked);
    });
  }

  showConfirmationPopupUnlock() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.title = this.translate.instant('MLG_LOCK_UNLOCK_TITLE');
    dialogRef.componentInstance.message = this.translate.instant('confitm_lock_unlock_message1');
    dialogRef.componentInstance.negativeButtonText = 'YES';
    dialogRef.componentInstance.positiveButtonText = 'NO';
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.multilevelGameData.is_mlg_preview_locked = true;
      this.globalService.addAdminGoogleEvent('MLG_Preview_Locked');   
        this.saveMlg('is_mlg_preview_locked', this.multilevelGameData.is_mlg_preview_locked);
    });
  }

}
