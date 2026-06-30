import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { Paginations, UsageLimit } from 'src/app/services/global/global.service';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { StorageService } from '../../services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalService } from 'src/app/services/global/global.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Constants } from '../../services/network/api.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { Route } from '../../services/login/login.service';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { environment } from 'src/environments/environment';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { AddToMarketplaceComponent } from '../add-to-marketplace/add-to-marketplace.component';
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
import { ChangeGamePositionComponent } from '../change-game-position/change-game-position.component';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AnimationOptions } from 'ngx-lottie';

const WARNING_ICON = '/assets/img/icon/warning.png';

@Component({
  selector: 'app-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit, OnDestroy {

  is_loading: boolean;
  noOfItemsPerPage = 6;
  games = [];
  gamesObject = [];
  totalGames = 0;
  breakpoint = 6;
  breakpoint_shopHomePage = 6;
  startLimit = 0;
  shopPermission: any;
  pageIndex = 0;
  pageSizeOptions: number[];
  role = Role;
  gameCategories = [];
  currentShopGameCategories = [];
  gamesWithAllCategories = [];
  viewAll = false;
  selectedCategory;
  marketplaceBannerImage;
  isMultilevelTab: boolean;
  filterGames = new FormControl();
  searchText: string = null;
  isSearchText =false; 
  isSearchData =false; 
  scrollDistance = 2;
  shopListstartLimit = 0;
  // shopListNoOfItemsPerPage and shopListPaginationCount inital values should be same
  shopListNoOfItemsPerPage: number = 3;
  shopListPaginationCount = 3;
  options: AnimationOptions = {
    path: '/assets/animation_json/magnifying_glass_text.json',
    loop: true
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  croppedImage = {
    'path': '',
    'blob': null
  };
  showGameLength = 6;
  context = 'shop';
  notScrolly = true;
  constructor(public breadcrumbService: BreadcrumbsService, public authService: StorageService, public storageService: StorageService,
    private headerService: HeaderService, public marketplaceService: MarketplaceService, private dialog: MatDialog,
    public translate: TranslateService, public globalService: GlobalService,
    private uploaderService: UploaderService, public getImageURLService:GetImageURLService,
    public permissionService: PermissionsService, public cdRef: ChangeDetectorRef, public snackBar: MatSnackBar, public router: Router) {
    this.pageSizeOptions = [...Paginations.PAGE_SIZE_OPTIONS];
    if (this.pageSizeOptions.indexOf(200) === -1) {
      this.pageSizeOptions.push(200);
    }
    if (this.storageService.getTab() === 'mlg') {
      this.isMultilevelTab = false;
    } else {
      this.isMultilevelTab = true;
    }
    // this.breadcrumbService.breadcrumbClicked.subscribe((res) => {
    //   const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
    //   if (breadcrumbs[0] && breadcrumbs[0].url === Route.MARKETPLACE) {
    //     breadcrumbs.splice(1, 1);
    //     this.viewAll = false;
    //     this.selectedCategory = null;
    //     this.scrollToTop();
    //   }
    // });
  }
  isSticky: boolean = false;

  @HostListener('window:scroll', ['$event'])
  onScroll(event) {
  console.log(event.target)
  }
  onWindowScroll($event) {
    console.log("scrolling...");
  }
  ngOnInit() {
    this.headerService.showCompanyFilter(false);
    // this.breadcrumbService.updateBreadcrumbLabel(this.translate.instant(''));
    this.setGamePermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setGamePermission();
    });
    // this.getMarketplaceBannerImage();
    // this.getMarketplaceGameCategories();
    this.getAllShopCategoryAndGames();
    // this.getShopGameCategories();
    // this.getMarketplaceGames();
    this.calculateBreakpoint();
    this.calculateBreakpointForViewall();
    const breadcrum = this.breadcrumbService.getBreadcrumbs();
    if (breadcrum.length > 1) {
      breadcrum.splice(1, 1);
    }
  }
  ngAfterViewInit() {
    this.filterGames.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((res) => {
        this.searchText = res;
        if(this.searchText){
          this.isSearchText = true;
        }else{
          this.isSearchText = false;
        }
        // console.log(this.searchText.length);
        if(this.searchText.length >= 2){
          this.getShopGames(this.searchText);
        }
      });
    this.cdRef.detectChanges();
  }
  onSearch(event) {
    // this.globalService.addAdminGoogleEvent('');
  }
  getShopGames(data){
    // console.log('typing',data);
    this.marketplaceService.getMarketplaceGameBySearch(data).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      //  this.games = response.data.game_category_list;
      if (response.success) {
        this.gamesObject = response.data.games;
      }
    });

    
  }
  setGamePermission() {
    this.shopPermission = this.permissionService.getPermissions(PermissionsKey.SHOP);
    // console.log('shopPermission', this.shopPermission);

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateBreakpoint();
    this.calculateBreakpointForViewall();
  }

  calculateBreakpointForViewall() {
    this.breakpoint = window.innerWidth / 250;
    if (window.innerWidth <= 440) {
      this.breakpoint_shopHomePage = 1;
      this.breakpoint = 1;
    } else {
      this.breakpoint_shopHomePage = window.innerWidth / 250;
    }
  }

  calculateBreakpoint() {
    if (window.innerWidth <= 1370 && window.innerWidth > 1125) {
      this.showGameLength = 5;
    } else if (window.innerWidth <= 1125 && window.innerWidth > 875) {
      this.showGameLength = 4;
    } else if (window.innerWidth <= 875 && window.innerWidth > 630) {
      this.showGameLength = 3;
    } else if (window.innerWidth <= 800 && window.innerWidth > 620) {
      this.showGameLength = 2;
    } else if (window.innerWidth <= 440) {
      this.showGameLength = 1;
    } else {
      this.showGameLength = 6;
    }
    // return;
    // this.breakpoint = window.innerWidth / 400;
    // if (this.breakpoint <= 1.8 && this.breakpoint > 1.2) {
    //   this.breakpoint = 1.4;
    // }
  }

  // getMarketplaceBannerImage() {
  //   this.marketplaceService.getMarketplaceBannerImage().subscribe((res) => {
  //     const response = res;
  //     if (!response.success) {
  //       this.globalService.showMessage(this.translate.instant('something_went_wrong'));
  //       return;
  //     }
  //     // setTimeout(() => {
  //     this.imageUrlUpdated(response.data.market_place_home.banner_url);
  //     // },500);
      
  //     // this.marketplaceBannerImage = response.data.market_place_home.banner_url;
  //     console.log(this.marketplaceBannerImage);
  //   });
  // }
  addNewDataToSource() {
    // console.log(this.shopListstartLimit)
    // console.log(this.shopListNoOfItemsPerPage)
    // console.log(this.gamesWithAllCategories.length)
    // console.log(this.currentShopGameCategories)
    if (this.shopListstartLimit < this.gamesWithAllCategories.length) {
      this.is_loading = true;
      setTimeout(() => {
        
        this.shopListstartLimit =
          this.shopListstartLimit + this.shopListPaginationCount;
        this.shopListNoOfItemsPerPage =
          this.shopListNoOfItemsPerPage + this.shopListPaginationCount;
        // console.log(this.shopListstartLimit);
        // console.log(this.shopListNoOfItemsPerPage);        
        // console.log(this.shopListNoOfItemsPerPage);
        const newdata = this.gamesWithAllCategories.slice(
          this.shopListstartLimit,
          this.shopListNoOfItemsPerPage
        );
        // console.log(newdata);
        this.currentShopGameCategories = [...this.currentShopGameCategories, ...newdata];
        // console.log(this.currentShopGameCategories)

        // if source and scrolled array length is same then stop this function
        if(this.currentShopGameCategories.length != this.gamesWithAllCategories.length){          
          this.notScrolly = true;
        }        
        this.is_loading = false;
      },700);
    }
  }
  onListScroll() {
    if(this.notScrolly){
      this.notScrolly = false;
      this.addNewDataToSource();
      // console.log('in here')        
    }
    this.cdRef.detectChanges();
  }

  getShopGameCategories(response,isShopGameEdited = false) {

  response.data.categories.map(item =>{
    item.games.map(game =>{
      game['cardImg'] = game.game_image_url;
        game['cardTitle'] = game.game_name;
        game['cardSubtitle'] = game.game_description;
        game['cardOwnerName'] = game.author_name;
        game['cardAdded'] = game.is_added;
        game['cardAddPermission'] = ((this.shopPermission && this.shopPermission.add) &&
          (this.storageService.getAccessType() !== Role.ADMIN));
    })
  })
    // console.log(response.data.categories)
    this.gamesWithAllCategories = response.data.categories;
    if(isShopGameEdited){
      this.shopListstartLimit = response.data.categories.length + 1;
      this.currentShopGameCategories = response.data.categories; // this will run when shop will get edited and games sequece will changed
    }else{
      this.currentShopGameCategories = this.gamesWithAllCategories.slice(this.shopListstartLimit,this.shopListNoOfItemsPerPage);
    }
    this.is_loading = false;
    // console.log(this.currentShopGameCategories);
    // console.log(this.gamesWithAllCategories);
  }
  // getMarketplaceGameCategories() {
  //   this.marketplaceService.getMarketplaceGameCategories().subscribe((res) => {
  //     const response: any = res;
  //     //  this.games = response.data.game_category_list;
  //     if (response.success) {
  //       this.gameCategories = response.data.marketplace_category_list;
  //       this.gameCategories.forEach(category => {
  //         // category['games'] = [];
  //         // category['total_category_games'] = null;
  //         category['category_name'] = category.name;
  //         // this.getGames(category);
  //       });

  //       console.log(this.gameCategories)
  //     }
  //   });
  // }

  getAllShopCategoryAndGames(isShopGameEdited = false) {
    this.is_loading = true;
    const company_id = this.authService.getCompanyId();
    this.marketplaceService.getAllShopCategoryAndGames(company_id).subscribe((res) => {
      const response: any = res;
      //  this.games = response.data.game_category_list;
      // console.log(response)
      this.gameCategories = response.data.categories;
      this.getShopGameCategories(response,isShopGameEdited);      
      this.imageUrlUpdated(response.data.banner_image.image_url);
      // if (response.success) {
      //   this.gameCategories = response.data.marketplace_category_list;
      //   this.gameCategories.forEach(category => {
      //     // category['games'] = [];
      //     // category['total_category_games'] = null;
      //     category['category_name'] = category.name;
      //     // this.getGames(category);
      //   });

      //   console.log(this.gameCategories)
      // }
    });
  }

  getGames(category, isEdit = false) { // need to remove this code
    this.is_loading = true;
    // const index = this.gameCategories.findIndex(gameCat => category.game_category_id === gameCat.game_category_id);
    
    this.games = [];
    this.marketplaceService.getMarketplaceGames(category.game_category_id, this.startLimit, this.noOfItemsPerPage).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        // this.gameCategories[index].games = [];
        // if (isEdit) {
        //   this.gameCategories[index].games = [];
        // }
        // this.gameCategories[index].total_category_games = response.data.total_game;
        response.data.game_list.forEach(game => {
          game['cardImg'] = game.game_image_url;
          game['cardTitle'] = game.game_name;
          game['cardSubtitle'] = game.game_description;
          game['cardOwnerName'] = game.author_name;
          game['cardAdded'] = game.is_added;
          game['cardAddPermission'] = ((this.shopPermission && this.shopPermission.add) &&
            (this.storageService.getAccessType() !== Role.ADMIN));
          // this.gameCategories[index].games.push(game);
        });
        // console.log(category)
        // console.log(this.currentShopGameCategories)

        const indexForSource = this.gamesWithAllCategories.findIndex(gameCat => category.game_category_id === gameCat.category_id);
          // console.log(indexForSource,this.gamesWithAllCategories[indexForSource])
          if(indexForSource >= 0){
            this.gamesWithAllCategories[indexForSource].games = [];
            this.gamesWithAllCategories[indexForSource].games = response.data.game_list;
          } 
          
        const index = this.currentShopGameCategories.findIndex(gameCat => category.game_category_id === gameCat.category_id);
        // console.log(index)
        if(index >= 0){
          this.currentShopGameCategories[index].games = [];
          this.currentShopGameCategories[index].games = response.data.game_list;
        }     
        
      }
    });
  }

  viewCategoryGames(category, viewAll) {
    // const catName = category.category_name;
    // catName = catName.trim().toLowerCase();
    // this.router.navigate([], {
    //   queryParams: {
    //     query: catName && catName.trim().toLowerCase()
    //   }
    // });
    // this.router.navigate([Route.CREATE_CONTEST], { queryParams: { id: this.contest.contest_id } });
    // console.log(category)
    const shop = {
      category_id: category.category_id
    };
    this.storageService.setObject(this.context, shop);
    this.router.navigate([Route.MARKETPLACE_CATEGORY]);
    // console.log(this.selectedCategory, this.breadcrumbService.getBreadcrumbs());
    if(!viewAll){
      this.globalService.addGoogleEvent('Shop_Category_Tab_Clicked', 'The Shop', ` ${category.category_name}`);
    }else{
      this.globalService.addGoogleEvent('Category_Expanded', 'Marketplace', `Expanded ${category.category_name} to view more games`);
    }
    return;
  }

  scrollToTop() {
    const scrollToTop = document.getElementById('container');
    if (scrollToTop) {
      scrollToTop.scrollIntoView(true);
    }
  }

  // gameList(categoryId) {
  //   // if (!this.games.length) { return; }
  //   return this.games.filter((game) => game.game_category_id === categoryId);

  // }

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
    // dialogRef.componentInstance.aspectRatio = 1.65;
    dialogRef.componentInstance.isFixedWidth = true;
    dialogRef.componentInstance.maxWidth = 2752;
    dialogRef.componentInstance.maxHeight = 2752;
    // dialogRef.componentInstance.maxWidth = 4096;
    // dialogRef.componentInstance.maxHeight = 962;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let path;
        // console.log(this.selectedCategory)
        // if (this.selectedCategory && this.selectedCategory.game_category_id && this.viewAll) {  // remove with optimisation
        //   this.selectedCategory.banner_url = result.base64;
        //   path = `${environment.env_name}/theShop/banner-image/banner-${this.selectedCategory.game_category_id}.jpg`;
        // } else {
          path = `${environment.env_name}/theShop/banner-image/home-banner.jpg`;
        // }
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        // console.log('image added');
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
        // console.log(this.selectedCategory)
        // if (this.selectedCategory && this.selectedCategory.game_category_id && this.viewAll) { // remove with optimisation
        //   this.selectedCategory.banner_url = data.Location;
        // } else {         
          this.imageUrlUpdated(data.Location)
        // }
        that.updateBannerImage(data.Location);
        this.globalService.addAdminGoogleEvent('Marketplace_By_Edit_Banner');
      });
    }
  }

  updateBannerImage(imageUrl) {
    let payload;
    // console.log(this.selectedCategory)
    // if (this.selectedCategory && this.selectedCategory.game_category_id && this.viewAll) {
    //   payload = {
    //     game_category_id: this.selectedCategory.game_category_id,
    //     is_marketplace_home_banner: false,
    //     banner_url: this.selectedCategory.banner_url
    //   };
    // } else {
      payload = {
        is_marketplace_home_banner: true,
        banner_url: imageUrl
        // banner_url: this.marketplaceBannerImage
      };
    // }
    this.marketplaceService.updateMarketplaceBannerImage(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
        return;
      }
    });
  }

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
      // console.log('game_added', response);
    });
  }

  gameLimitExceedAlert(response) {
    // const html = `<a href="mailto:support@1huddle.co" target="_blank"> support@1huddle.co </a>`;
    // const message = `${this.translate.instant('game_limit_reached_msg')} <br>
    // ${this.translate.instant('contaact_support_for_games').replace('%s', html)}`;
    // this.showAlert(this.translate.instant('game_limit_reached'), message, WARNING_ICON);
    const displayData = this.globalService.usageLimit(response.data, UsageLimit.GAME_EXCEEDED);
    const dialogRef = this.dialog.open(PaywallActionComponent,
      {
        disableClose: true,
        data: displayData
      });
    dialogRef.componentInstance.title = displayData.title;
    dialogRef.componentInstance.message = displayData.message;
    this.globalService.addAdminGoogleEvent('Contract_Enforcement_Games_Added_From_Shop');
    // this.globalService.addAdminGoogleEvent('Marketplace_Game_Limit_Exceeded');
  }

  changeShopGamePosition(positionObj) {
    const dialogRef = this.dialog.open(ChangeGamePositionComponent, {
      data: positionObj.cardData
    });
    dialogRef.componentInstance.total_count = positionObj.total_count;

    dialogRef.afterClosed().subscribe(result => {
      // console.log('result', result);
      if (result && result.positionChanged) {
        this.getGames(result.cardData, true); // to reload specfic category data
        this.globalService.addAdminGoogleEvent('Marketplace_Game_Position_Changed');
      }
    });
  }
  editShopGame(selectedShopGame) {    
    const dialogReference = this.dialog.open(AddToMarketplaceComponent, {
      data: { game: selectedShopGame, name: this.translate.instant('edit_game_information') }
    });
    dialogReference.componentInstance.gameEditInShop = true;
    // dialogReference.afterClosed().subscribe(result => {
    //   if (result) {
    //     for (const p in result.newCat) {
    //       if (result.oldCat && result.oldCat.hasOwnProperty(p)) {
    //         if (result.oldCat[p] !== result.newCat[p]) {
    //           console.log(p);
    //           if (p == 'game_category_id') {
    //             this.getGames(result.newCat);
    //             this.getGames(result.oldCat);
    //           } else {
    //             this.getGames(result.newCat);
    //           }
    //         }
    //       }
    //     }
    //   }
    // });
    dialogReference.afterClosed().subscribe(result => {
      if (result) {
        if (result.oldCat) {
          // if (this.viewAll) {
          //   this.getGames(result.oldCat);
          // } else {
          // this.getAllShopCategoryAndGames(true);
          this.getGames(result.oldCat, result.isEdit);
          this.getGames(result.newCat, result.isEdit);

          // }
        } else {
          // this.getAllShopCategoryAndGames(true);
          this.getGames(result.newCat, result.isEdit);
        }
      }
    });
  }

  removeShopGame(selectedShopGame) {
    // console.log(selectedShopGame);
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: selectedShopGame.game_id,
    });
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_game');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      const index = this.gameCategories.findIndex(gameCat => selectedShopGame.game_category_id === gameCat.category_id);
      this.gameCategories[index].games.forEach((game, gameIndex) => {
        if (game.game_id === selectedShopGame.game_id) {
          this.gameCategories[index].games.splice(gameIndex, 1);
        }
      });
      this.removeGame(selectedShopGame);
    });
  }

  removeGame(selectedShopGame) {
    const payload = {
      game_id: selectedShopGame.game_id
    };
    this.marketplaceService.removeMarketplaceGame(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
      } else {
        this.globalService.showMessage(this.translate.instant('game_deleted'), 'right', 'bottom');
        this.globalService.addAdminGoogleEvent('Marketplace_By_Delete_Shop_Game');
      }
      this.getGames(selectedShopGame, true);
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

  // getGamesOverPagination(pageEvent) {
  //   this.noOfItemsPerPage = pageEvent.pageSize;
  //   this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
  //   this.getGames(this.selectedCategory);
  // }

  navigateToShopPreview(shopGame = null, context) {
    const shop = {
      category_id: shopGame.game_category_id,
      game_id: shopGame.game_id
    };
    this.storageService.setObject(this.context, shop);
    this.marketplaceService.shopGameBeingEdited = shopGame;
    if(context === 'search'){
      this.globalService.addAdminGoogleEvent('Shop_Search_Game_Clicked');
    }else{
      this.globalService.addAdminGoogleEvent('Marketplace_Game_Preview_Screen_Viewed');
    }
    this.router.navigate([Route.MARKETPLACE_GAME]);
  }

imageUrlUpdated(imageUrl){
  const that = this;
  const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
  // console.log(relativePath)
  this.getImageURLService.getURL(relativePath, function (err, data) {
    // console.log(data)        
    that.marketplaceBannerImage = data;
  });  
}
openLink() {
  window.open(environment.request_game);
}
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // this.breadcrumbService.breadcrumbClicked.unsubscribe();
    // console.log('check', this.breadcrumbService.breadcrumbClicked);
    // Reset Company selection filter
    this.headerService.showCompanyFilter(true);
  }
}
