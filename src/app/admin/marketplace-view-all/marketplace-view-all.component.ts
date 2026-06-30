import { ChangeDetectorRef, Component, HostListener, OnInit , ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { GlobalService, Paginations ,UsageLimit } from 'src/app/services/global/global.service';
import { Route } from 'src/app/services/login/login.service';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';
import { PermissionsKey, PermissionsService, Role } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { AddToMarketplaceComponent } from '../add-to-marketplace/add-to-marketplace.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
import { environment } from 'src/environments/environment';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { ChangeGamePositionComponent } from '../change-game-position/change-game-position.component';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-marketplace-view-all',
  templateUrl: './marketplace-view-all.component.html',
  styleUrls: ['./marketplace-view-all.component.scss']
})
export class MarketplaceViewAllComponent implements OnInit {
  selectedCategory;
  is_loading = false;
  breakpoint;
  games = [];
  gamesObject = [];
  startLimit = 0;
  shopPermission: any;
  pageIndex = 0;
  pageSizeOptions: number[];
  noOfItemsPerPage;
  totalGames;
  filterGames = new FormControl();
  marketplaceBannerImage;
  games_category_count = null;
  context = 'shop';
  contentHeight = null ;
  croppedImage = {
    'path': '',
    'blob': null
  };
  searchText: string = null;
  isSearchText =false; 
  options: AnimationOptions = {
    path: '/assets/animation_json/magnifying_glass_text.json',
    loop: true
  };

  @ViewChild('scrollLength') scrollLength;

  constructor(public breadcrumbService: BreadcrumbsService, public authService: StorageService, public storageService: StorageService,
    public marketplaceService: MarketplaceService, public translate: TranslateService, public globalService: GlobalService,
    private dialog: MatDialog, public permissionService: PermissionsService, public cdRef: ChangeDetectorRef,
    public getImageURLService:GetImageURLService,
    private uploaderService: UploaderService, private activatedRoute: ActivatedRoute, public snackBar: MatSnackBar, public router: Router) {
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    if (this.pageSizeOptions.indexOf(200) === -1) {
      this.pageSizeOptions.push(200);
    }
  }

  ngOnInit() {
    this.calculateBreakpointForViewall();
    const shopInfo = this.storageService.getObject(this.context);
    console.log('shopInfo.category_id',shopInfo.category_id);
    // this.getGameCategory(shopInfo.category_id);
    this.getGames(shopInfo.category_id)
    // when click from breadcrum
    this.setShopPermission();
    // when page refresh
    this.globalService.permissionReceived$.subscribe(res => {
      this.setShopPermission();
    });
  }
  ngAfterViewInit() {
    this.filterGames.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((res) => {
        this.searchText = res;
        if(this.searchText){
          // this.startLimit = 0;
          // this.paginator.pageIndex = 0;
          this.isSearchText = true;
        }else{
          this.isSearchText = false;
        }
        // this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
        // this.getAudienceDetails();
        this.getShopGames(this.searchText);
      });
    // this.globalService.getFormattedPaginationLabel(this.paginator);
    this.cdRef.detectChanges();
  }
  onSearch(event) {
    // this.globalService.addAdminGoogleEvent('');
  }
  getShopGames(data){
    const shopInfo = this.storageService.getObject(this.context);
    console.log('typing',data);
    this.marketplaceService.getMarketplaceGameBySearch(data , shopInfo.category_id).subscribe((res) => {
      const response: any = res;
      //  this.games = response.data.game_category_list;
      if (response.success) {
        // this.gameCategories = response.data.marketplace_category_list;
        // this.gameCategories.forEach(category => {
        //   category['games'] = [];
        //   category['total_category_games'] = null;
        //   category['category_name'] = category.name;
        //   this.getGames(category);
        // });
        this.gamesObject = response.data.games;
        // console.log(this.gameCategories)
      }
    });

    
  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateBreakpointForViewall();
  }


  onScroll() {
    if(!this.contentHeight){
    this.contentHeight = this.scrollLength.nativeElement.scrollHeight;
    }
  }
  calculateBreakpointForViewall() {
    this.breakpoint = window.innerWidth / 250;
    if (window.innerWidth <= 440) {
      this.breakpoint = 1;
    }
  }
  setShopPermission() {
    this.shopPermission = this.permissionService.getPermissions(PermissionsKey.SHOP);
  }

  // getGameCategory(categoryId) {
  //   this.is_loading = true;
  //   this.marketplaceService.getMarketplaceGameCategories(categoryId).subscribe((res) => {
  //     const response: any = res;
  //     this.is_loading = false;
  //     if (response.success) {
  //       this.selectedCategory = response.data.marketplace_category_list[0];
  //       setTimeout(() => {
  //         this.imageUrlUpdated(response.data.marketplace_category_list[0].banner_url);
  //         });
  //       this.breadcrumbService.updateBreadcrumbLabel(this.selectedCategory.name);
  //       this.getGames(this.selectedCategory);
        
  //     }
  //   });
  // }

  getGames(category) {
    console.log()
    this.is_loading = true;
    this.games = [];
    console.log(category);
    this.marketplaceService.getMarketplaceGames(category, this.startLimit, this.noOfItemsPerPage).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.games_category_count = response.data.total_game;
        response.data.game_list.forEach(game => {
          game['cardImg'] = game.game_image_url;
          game['cardTitle'] = game.game_name;
          game['cardSubtitle'] = game.game_description;
          game['cardOwnerName'] = game.author_name;
          game['cardAdded'] = game.is_added;
          game['cardAddPermission'] = ((this.shopPermission && this.shopPermission.add) &&
            (this.storageService.getAccessType() !== Role.ADMIN));
          this.games.push(game);
        });
        this.totalGames = response.data.total_game;
        this.selectedCategory = response.data.category_details;
        setTimeout(() => {
          this.imageUrlUpdated(response.data.category_details.banner_url);
          });
        this.breadcrumbService.updateBreadcrumbLabel(this.selectedCategory.name);

      }
    });

    console.log('this.games', this.games);
    console.log('cardAddPermission', this.shopPermission);
  }

  // addMarketplaceGame(selectedShopGame) {
  //   console.log(selectedShopGame);
  // }


  addMarketplaceGame(data) {
    data.cardAdded = true;
    const payload = {
      'shop_game_id': data.game_id,
    };
    this.marketplaceService.addMarketplaceGameToLibrary(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        data.cardAdded = false;
        if (response.message_code === 'GAME_LIMIT_EXCEEDED') { // error code for game limit exceeding
          this.gameLimitExceedAlert(response);
          return;
        } else if (response.message_code === 'SHOP_GAME_EXIST_IN_LIBRARY') { // error code for game already added
          data.cardAdded = true;
          this.globalService.showMessage(this.translate.instant('shop_game_exist_in_library'), 'right', 'bottom');
          return;
        } else {
          this.globalService.showMessage(this.translate.instant('something_went_wrong'));
          return;
        }
      }
      data.cardAdded = true;
      this.globalService.showMessage(this.translate.instant('shop_game_added_to_library'), 'right', 'bottom');
      this.globalService.addAdminGoogleEvent('Marketplace_Game_Added_to_Library');
      console.log('game_added', response);
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

  editShopGame(selectedShopGame) {
    console.log(selectedShopGame);
    const dialogReference = this.dialog.open(AddToMarketplaceComponent, {
      data: { game: selectedShopGame, name: this.translate.instant('edit_game_information') }
    });
    dialogReference.componentInstance.gameEditInShop = true;
    dialogReference.componentInstance.viewAll = true;
    dialogReference.afterClosed().subscribe(result => {
      if (result) {
        console.log(result.newCat);
        // this.getGames(result.newCat);
        this.getGames(this.selectedCategory.game_category_id);
      }
    });
  }

  changeShopGamePosition(positionObj) {
    const dialogRef = this.dialog.open(ChangeGamePositionComponent, {
      data: positionObj.cardData
    });
    dialogRef.componentInstance.total_count = positionObj.total_count;

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result.positionChanged) {
        this.getGames(result.cardData.game_category_id);
        this.globalService.addAdminGoogleEvent('Marketplace_Game_Position_Changed');
      }
    });
  }

  removeShopGame(selectedShopGame) {
    console.log(selectedShopGame);
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: selectedShopGame.game_id,
    });
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_game');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      
      // this.games.forEach((game, index) => {
      //   if (game.game_id === selectedShopGame.game_id) {          
      //     this.games.splice(index, 1);
      //   }
      // });      
      // this.cdRef.detectChanges();
      // const shopInfo = this.storageService.getObject(this.context);
      // this.getGameCategory(shopInfo.category_id);
      // this.getGames(shopInfo.category_id);
      this.removeGame(selectedShopGame);
    });
  }

  removeGame(selectedShopGame) {
    const payload = {
      game_id: selectedShopGame.game_id
    };
    this.is_loading = true;
    this.marketplaceService.removeMarketplaceGame(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
      } else {
        const shopInfo = this.storageService.getObject(this.context);
        this.getGames(shopInfo.category_id);
        this.globalService.showMessage(this.translate.instant('game_deleted'), 'right', 'bottom');
      }
    });
  }

  getGamesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.contentHeight = null ;
    this.getGames(this.selectedCategory.game_category_id);
  }

  navigateToShopPreview(shopGame = null) {
    const shop = {
      category_id: shopGame.game_category_id,
      game_id: shopGame.game_id
    };
    this.storageService.setObject(this.context, shop);
    this.marketplaceService.shopGameBeingEdited = shopGame;
    this.router.navigate([Route.MARKETPLACE_GAME]);
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
        // if (img.width < 100 || img.height < 100) {
        //   this.showAlert(this.translate.instant('img_too_small'), this.translate.instant('valid_img_size_msg_100x100'));
        // } else {
        that.openCropper(event);
        // }
      };
      img.src = fr.result as string; // This is the data URL
    };
    fr.readAsDataURL(file);
  }

  openCropper(event) {
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event
    });
    dialogRef.componentInstance.aspectRatio = 4.25;
    dialogRef.componentInstance.isFixedWidth = true;
    // dialogRef.componentInstance.maxWidth = 2048;
    // dialogRef.componentInstance.maxHeight = 481;
    dialogRef.componentInstance.maxWidth = 2752;
    dialogRef.componentInstance.maxHeight = 2752;

    // dialogRef.componentInstance.maxWidth = 4096;
    // dialogRef.componentInstance.maxHeight = 962;
    dialogRef.afterClosed().subscribe(result => {
    let path;
      if (result) {
        if (this.selectedCategory && this.selectedCategory.game_category_id) {
          this.selectedCategory.banner_url = result.base64;
          path = `${environment.env_name}/theShop/banner-image/banner-${this.selectedCategory.game_category_id}.jpg`;
        }
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        this.uploadAsset();
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('edit_banner_image');
  }

  uploadAsset() {
    if (this.croppedImage.path) {
      const that = this;
      this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, (err, data) => {
        if (!data || err) {
          that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
          return;
        }
        if (this.selectedCategory && this.selectedCategory.game_category_id) {
          // this.selectedCategory.banner_url = data.Location;
          this.imageUrlUpdated(data.Location)

        }
        that.updateBannerImage(data.Location);
      });
    }
  }

  updateBannerImage(url) {
    let payload;
    if (this.selectedCategory && this.selectedCategory.game_category_id) {
      payload = {
        game_category_id: this.selectedCategory.game_category_id,
        is_marketplace_home_banner: false,
        banner_url: url
      };
    }
    this.marketplaceService.updateMarketplaceBannerImage(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
        return;
      }
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
  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    console.log(relativePath)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      console.log(data)        
      that.marketplaceBannerImage = data;
    });  
  }
  openLink() {
    window.open(environment.request_game);
  }
}
