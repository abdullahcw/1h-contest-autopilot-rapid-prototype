import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { MatDialog } from '@angular/material/dialog';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { environment } from 'src/environments/environment';
import { UploaderService } from 'src/app/services/uploader/uploader.service';

import { StorageService } from 'src/app/services/storage/storage.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { NgForm } from '@angular/forms';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';


@Component({
  selector: 'app-add-to-marketplace',
  templateUrl: './add-to-marketplace.component.html',
  styleUrls: ['./add-to-marketplace.component.scss']
})

export class AddToMarketplaceComponent implements OnInit {
  @ViewChild('addToShop', { static: true }) addToShop: NgForm;
  marketplaceGameCategories;
  is_loading = false;
  is_imageAdded = false;
  selectedGameId;
  hideAddToShop = true;
  gameEditInShop = false;
  viewAll = false;
  shopGame = {};
  gameLogoURL = null;
  newShopGame = {
    game_id: '',
    game_image_url: null,
    game_category_id: '',
    author_name: '',
    game_description: '',
  };
  croppedImage = {
    'path': '',
    'blob': null
  };

  constructor(public dialogRef: MatDialogRef<any>,
    public marketplaceService: MarketplaceService,
    public translate: TranslateService,
    private storageService: StorageService,
    public globalService: GlobalService,
    private dialog: MatDialog,
    public permissionService: PermissionsService,
    private uploaderService: UploaderService,
    public getImageURLService:GetImageURLService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.newShopGame.game_id = this.data.game.game_id;
    this.selectedGameId = this.data;
    if (this.gameEditInShop) {
      this.newShopGame = {
        'game_id': this.data.game.game_id,
        'game_image_url': this.data.game.game_image_url,
        'game_category_id': this.data.game.game_category_id,
        'author_name': this.data.game.author_name,
        'game_description': this.data.game.game_description,
      };
      setTimeout(() =>{
        this.imageUrlUpdated(this.data.game.game_image_url);
      });
      this.shopGame = this.data.game;
    }
    this.getMarketplaceGameCategories();
  }

  getMarketplaceGameCategories() {
    this.is_loading = true;
    this.marketplaceService.getMarketplaceGameCategories().subscribe(res => {
      this.is_loading = false;
      this.marketplaceGameCategories = res.data.marketplace_category_list;
    });
  }

  shouldDisable() {
    return !this.gameLogoURL || !this.newShopGame.game_category_id || !this.newShopGame.author_name ||
      !this.newShopGame.game_description;
  }

  cancel() {
    this.dialogRef.close();
  }

  addGameToMarketplace() {
    this.is_loading = true;
    this.marketplaceService.addGameToMarketplace(this.newShopGame).subscribe(res => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
        return;
      } else {
        this.globalService.showMessage(this.translate.instant('game_added_to_shop'), 'right', 'bottom');
        this.globalService.addAdminGoogleEvent('Marketplace_By_ADD_To_SHOP');
        this.cancel();
      }
    });
  }

  save() {
    this.gameEditInShop ? this.updateShopGame() : this.addGameToMarketplace();
  }

  updateShopGame() {
    this.is_loading = true;
    this.marketplaceService.updateMarketplaceGame(this.newShopGame).subscribe(res => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
        return;
      } else {
        this.globalService.showMessage(this.translate.instant('shop_game_updated'), 'right', 'bottom');
        this.globalService.addAdminGoogleEvent('Marketplace_By_Edit_Shop_Game_Card');
        for (const p in this.newShopGame) {
          if (this.shopGame.hasOwnProperty(p)) {
            if (this.shopGame[p] !== this.newShopGame[p]) { // this will fetch you difference in the key value changes
              if (p == 'game_category_id') {
                const categoriesObj = {
                  oldCat: this.shopGame,
                  newCat: this.newShopGame,
                  isEdit: true
                };
                this.dialogRef.close(categoriesObj);
                return;
              } else {
                const categoriesObj = {
                  oldCat: null,
                  newCat: this.newShopGame,
                  isEdit: true
                };
                this.dialogRef.close(categoriesObj);
              }
            } else {
              if (p == 'game_category_id') {
                const categoriesObj = {
                  oldCat: null,
                  newCat: this.newShopGame,
                  isEdit: true
                };
                this.dialogRef.close(categoriesObj);
                return;
              }
            }
          }
        }
      }
    });
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    const pathComponents = event.target.value.split('.');
    const type = pathComponents[pathComponents.length - 1].toLowerCase();
    const fileSize = event.target.files[0].size / 1024 / 1024;
    if (type.indexOf('png') === -1 && type.indexOf('jpg') === -1 && type.indexOf('jpeg') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('valid_img_format_msg'));
      return;
    } else if (fileSize && fileSize > 10) { // 10 MB
      this.showAlert(this.translate.instant('file_too_large'), this.translate.instant('img_max_10mb'));
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
      data: event,
    });
    this.hideAddToShop = false;
    dialogRef.componentInstance.maxWidth = 600;
    dialogRef.componentInstance.maxHeight = 600;
    dialogRef.componentInstance.is_from_Shop = true;
    dialogRef.componentInstance.isFixedWidth = true;
    dialogRef.componentInstance.aspectRatio = 1.65;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const game_banner_time = Date.now();
        const path = `${environment.env_name}/theShop/card-image/card-${this.newShopGame.game_id}_${game_banner_time}.jpg`;
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        this.addToShop.form.markAsDirty();
        this.uploadAsset();
      } else {
        this.hideAddToShop = true;
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('add_game_banner');
  }

  uploadAsset() {
    if (this.croppedImage.path) {
      const that = this;
      this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, (err, data) => {
        if (!data || err) {
          that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
          return;
        }
        that.newShopGame.game_image_url = data.Location;
        that.imageUrlUpdated(data.Location);    
        this.hideAddToShop = true;
      }, true, 'Adding Game Banner');
    }
  }

  showAlert(title, message, icon = null) {
    const dialogReference = this.dialog.open(ConfirmActionComponent);
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.imgAsIcon = icon;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl);
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.gameLogoURL  = data;
    });  
  }
}
