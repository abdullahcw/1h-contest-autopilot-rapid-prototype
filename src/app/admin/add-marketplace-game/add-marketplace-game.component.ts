import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GlobalService, UsageLimit } from 'src/app/services/global/global.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Role } from 'src/app/services/permissions/permissions.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { environment } from '../../../environments/environment';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';


@Component({
  selector: 'app-add-marketplace-game',
  templateUrl: './add-marketplace-game.component.html',
  styleUrls: ['./add-marketplace-game.component.scss']
})
export class AddMarketplaceGameComponent implements OnInit {
  public Editor = ClassicEditor;
  shopGame: any = {};
  is_loading: boolean;
  isEditing = false;
  is_added = false;
  showHeader = false;
  role = Role;
  profile_image_url: '';
  croppedImage = {
    'path': '',
    'blob': null
  };
  showScreenShotLength = 6;
  game_preview_urls = [];
  context = 'shop';
  gameRating;
  gameDescription;
  displayInnerHTML;
  shopGameEdited;
  screenshotsChanged;
  constructor(
    public storageService: StorageService,
    public globalService: GlobalService,
    private headerService: HeaderService,
    public breadcrumbService: BreadcrumbsService,
    public snackBar: MatSnackBar,
    public translate: TranslateService,
    public marketplaceService: MarketplaceService,
    private uploaderService: UploaderService,
    private dialog: MatDialog,
    private getImageURLService: GetImageURLService,

  ) {
  }

  ngOnInit() {
    this.headerService.showCompanyFilter(false);
    this.shopGame = this.storageService.getObject(this.context);
    this.getShopPreview();
  }

  getShopPreview() {
    this.is_loading = true;
    this.marketplaceService.shopPreviewDetails(this.shopGame.game_id).subscribe((res) => {
      const response = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
        return;
      }
      this.is_loading = false;
      this.shopGame = response.data.game_preview_details;
      this.game_preview_urls = [...this.shopGame.game_preview_urls];
      const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
      breadcrumbs[1].key = this.shopGame.game_category_name;
      breadcrumbs[2].key = this.shopGame.game_name;
      this.imageUrlUpdated(this.shopGame.game_image_url);
      if (this.shopGame.game_rating) {
        this.gameRating = this.shopGame.game_rating;
        this.gameDescription = this.shopGame.game_description;
        this.displayInnerHTML = JSON.parse(JSON.stringify(this.shopGame.game_description));
        if (this.checkRating()) {
          this.calculateRating();
        }
      }
    });
  }

  addGameToMyLibrary(selectedGame) {
    selectedGame.is_added = true;
    const payload = {
      'shop_game_id': selectedGame.game_id,
    };
    this.marketplaceService.addMarketplaceGameToLibrary(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        selectedGame.is_added = false;
        if (response.message_code === 'GAME_LIMIT_EXCEEDED') { // error code for game limit exceeding
          this.gameLimitExceedAlert(response);
          return;
        } else if (response.message_code === 'SHOP_GAME_EXIST_IN_LIBRARY') { // error code for game already added
          selectedGame.is_added = true;
          this.globalService.showMessage(this.translate.instant('shop_game_exist_in_library'), 'right', 'bottom');
          return;
        } else {
          this.globalService.showMessage(this.translate.instant('something_went_wrong'));
          return;
        }
      }
      selectedGame.is_added = true;
      this.globalService.showMessage(this.translate.instant('shop_game_added_to_library'), 'right', 'bottom');
      this.globalService.addAdminGoogleEvent('Marketplace_Add_To_Game_Library_After_Preview');
    });
  }


  gameLimitExceedAlert(response) {
    const displayData = this.globalService.usageLimit(response.data, UsageLimit.GAME_EXCEEDED);
    const dialogRef = this.dialog.open(PaywallActionComponent,
      {
        disableClose: true,
        data: displayData
      });
    dialogRef.componentInstance.title = displayData.title;
    dialogRef.componentInstance.message = displayData.message;
    this.globalService.addAdminGoogleEvent('Contract_Enforcement_Games_Added_From_Shop');
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
        const imageSize = event.target.files[0].size / 1024 / 1024;
        if (imageSize && imageSize > 10) {
          this.showAlert(this.translate.instant('file_too_large'), this.translate.instant('img_max_10mb'));
          return;
        }
        if (img.width < 100 || img.height < 100) {
          this.showAlert(this.translate.instant('img_too_small'), this.translate.instant('valid_img_size_msg_100x100'));
        } else {
          that.openCropper(event);
        }
      };
      img.src = fr.result as string; // This is the data URL
    };
    fr.readAsDataURL(file);
  }

  confirmDelete(event, index) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('confirm_img_delete');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.game_preview_urls.splice(index, 1);
      if (!this.checkScreenshotEquals(this.game_preview_urls, this.shopGame.game_preview_urls)) {
        this.shopGameEdited = true;
      }
    });

  }

  openCropper(event) {

    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event
    });
    dialogRef.componentInstance.maxHeight = 2436;
    dialogRef.componentInstance.maxWidth = 1125;
    dialogRef.componentInstance.aspectRatio = 9 / 19.5;
    dialogRef.componentInstance.title = this.translate.instant('edit_profile_img');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.profile_image_url = result.base64;
        const game_identifier = this.game_preview_urls.length + 1;
        const url_time_stamp = Date.now();
        const path =
          // tslint:disable-next-line:max-line-length
          `${environment.env_name}/shop_game_previews/${this.shopGame.game_id}/shop-${this.shopGame.game_id}-${game_identifier}-${url_time_stamp}.jpg`;
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        const that = this;
        this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, function (err, data) {
          if (!data) {
            that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
            return;
          }
          that.profile_image_url = data.Location;
          that.game_preview_urls.push({
            preview_url: that.profile_image_url
          });
          if (!that.checkScreenshotEquals(that.game_preview_urls, that.shopGame.game_preview_urls)) {
            that.shopGameEdited = true;
          }
        });
      }
    });
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  editMode() {
    this.isEditing = true;
    if (this.shopGame.game_description == this.gameDescription ||
      this.shopGame.game_rating == this.gameRating ||
      this.checkScreenshotEquals(this.game_preview_urls, this.shopGame.game_preview_urls)) {
      this.shopGameEdited = false;
    }
    this.scrollToTop();
  }

  checkScreenshotEquals(oldScreenshot, newScreenshot) {
    return Array.isArray(oldScreenshot) &&
      Array.isArray(newScreenshot) &&
      oldScreenshot.length === newScreenshot.length &&
      oldScreenshot.every((val, index) => val === newScreenshot[index]);
  }

  cancel() {
    this.isEditing = false;
    this.game_preview_urls = [...this.shopGame.game_preview_urls];
    if (this.shopGame.game_rating == this.gameRating) {
      if (this.checkRating()) {
        this.calculateRating();
      }
    } else {
      this.shopGame.game_rating = this.gameRating;
      if (this.checkRating()) {
        this.calculateRating();
      }
    }
    this.shopGame.game_description == this.gameDescription ?
      this.gameDescription = this.shopGame.game_description : this.shopGame.game_description = this.gameDescription;
    this.displayInnerHTML = JSON.parse(JSON.stringify(this.gameDescription));
    this.scrollToTop();
  }


  calculateRating() {
    let starPercentageRounded;
    if (this.shopGame.game_rating <= 5) {
      if (this.shopGame.game_rating > 4 && this.shopGame.game_rating < 5) {
        starPercentageRounded = '92%';
      } else if (this.shopGame.game_rating > 3 && this.shopGame.game_rating < 4) {
        starPercentageRounded = '71.5%';
      } else if (this.shopGame.game_rating > 2 && this.shopGame.game_rating < 3) {
        starPercentageRounded = '51.5%';
      } else if (this.shopGame.game_rating > 1 && this.shopGame.game_rating < 2) {
        starPercentageRounded = '30%';
      } else if (this.shopGame.game_rating > 0 && this.shopGame.game_rating < 1) {
        starPercentageRounded = '9%';
      } else if (this.shopGame.game_rating == 5) {
        starPercentageRounded = '100%';
      } else if (this.shopGame.game_rating == 4) {
        starPercentageRounded = '80%';
      } else if (this.shopGame.game_rating == 3) {
        starPercentageRounded = '60%';
      } else if (this.shopGame.game_rating == 2) {
        starPercentageRounded = '40%';
      } else if (this.shopGame.game_rating == 1) {
        starPercentageRounded = '20%';
      } else if (this.shopGame.game_rating == 0) {
        document.getElementById('stars-inner').style.width = null;
      }
      document.getElementById('stars-inner').style.width = starPercentageRounded;
    }
  }

  saveShopGameContent() {
    if (this.checkRating()) {
      this.calculateRating();
    }
    this.gameRating = this.shopGame.game_rating;
    this.displayInnerHTML = JSON.parse(JSON.stringify(this.shopGame.game_description));
    this.isEditing = false;
    this.checkGamePreviews();
    this.updateGameDetails();
    this.scrollToTop();
  }

  checkGamePreviews() {
    this.shopGame.game_preview_urls = [...this.game_preview_urls];
  }

  updateGameDetails() {
    this.is_loading = true;
    this.marketplaceService.updateShopGameDetails(this.shopGame).subscribe((res) => {
      const response = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
        return;
      }
      this.is_loading = false;
      this.game_preview_urls = [...this.shopGame.game_preview_urls];
      this.gameDescription = this.shopGame.game_description;
      this.globalService.addAdminGoogleEvent('Marketplace_By_Edit_Marketplace_Game_Preview');
    });
  }

  floatOnly(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    const number = this.shopGame.game_rating.split('.');
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    if (number.length > 1 && charCode == 46) {
      return false;
    }
    if (this.shopGame.game_rating > 5) {
      return false;
    }
    if (this.gameRating != this.shopGame.game_rating) {
      this.shopGameEdited = true;
    }
  }

  descriptionChange(event) {
    this.shopGame.game_description = this.shopGame.game_description.replace(/<p>(&nbsp;)+<\/p>/i, '');
    if (!this.shopGame.game_description) {
      return false;
    }
    if (this.gameDescription != this.shopGame.game_description) {
      this.shopGameEdited = true;
    }
  }

  checkEmoji() {
    const ranges = [
      '((\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\:\w+\:|\<[\/\\]?3|[\(\)\\\D|\*\$][\-\^]?[\:\;\=]|[\:\;\=B8][\-\^]?[3DOPp\@\$\*\\\)\(\/\|])(?=\s|[\!\.\?]|$))' // U+1F680 to U+1F6FF
    ];
    if (this.shopGame.game_rating.match(ranges.join('|'))) {
      return true;
    } else {
      return false;
    }
  }

  checkRating() {
    const decimal = new RegExp(/^(\d+)?([.]?\d{0,2})?$/);
    const valid = decimal.test(this.shopGame.game_rating);
    return valid;
  }

  shouldDisable() {
    return !this.shopGame.game_rating || this.shopGame.game_rating > 5 || !this.shopGameEdited || this.handleZero() || this.checkEmoji();
  }

  handleZero() {
    if (
      this.shopGame.game_rating == '00' ||
      this.shopGame.game_rating == '000' ||
      this.shopGame.game_rating == '.' ||
      this.shopGame.game_rating == '01' ||
      this.shopGame.game_rating == '02' ||
      this.shopGame.game_rating == '03' ||
      this.shopGame.game_rating == '04' ||
      this.shopGame.game_rating == '05' ||
      this.shopGame.game_rating == '06' ||
      this.shopGame.game_rating == '07' ||
      this.shopGame.game_rating == '08' ||
      this.shopGame.game_rating == '0.' ||
      this.shopGame.game_rating == '1.' ||
      this.shopGame.game_rating == '2.' ||
      this.shopGame.game_rating == '3.' ||
      this.shopGame.game_rating == '4.' ||
      this.shopGame.game_rating == '5.'
    ) {
      return true;
    }
  }

  scrollToTop() {
    const scrollToTop = document.getElementById('container');
    if (scrollToTop) {
      scrollToTop.scrollIntoView(true);
    }
  }

  transform(value: any): any {
    if (value) {
      return value.split('<a ').join('<a target="_blank"');
    }
  }

  disablePaste(e) {
    e.preventDefault();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset Company selection filter
    this.headerService.showCompanyFilter(true);
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.shopGame.game_image_url = data;
    });  
  }
}
