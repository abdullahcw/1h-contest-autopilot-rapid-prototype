import {
  Component,
  OnInit,
  ViewChild,
  Input,
  EventEmitter,
  Output,
  SimpleChanges,
  ChangeDetectorRef,
  HostListener,
} from "@angular/core";
import { GameIconPickerComponent } from "../../game-icon-picker/game-icon-picker.component";
import { MatDialog } from "@angular/material/dialog";
import { GamesService } from "../../../services/games/games.service";
import { CropImageComponent } from "../../../shared/crop-image/crop-image.component";
import { environment } from "../../../../environments/environment";
import { UploaderService } from "../../../services/uploader/uploader.service";
import { StorageService } from "../../../services/storage/storage.service";
import { FormControl } from "@angular/forms";
import { ConfirmActionComponent } from "../../confirm-action/confirm-action.component";
import { Router } from "@angular/router";
import { LoginService, Route } from "../../../services/login/login.service";
import { GlobalService } from "src/app/services/global/global.service";
import { ApiService } from "src/app/services/network/api.service";
import { BreadcrumbsService } from "src/app/services/breadcrumbs/breadcrumbs.service";
import { TranslateService } from "@ngx-translate/core";
import { GetImageURLService } from "src/app/services/get-image-URL/get-image-url.service";
import { LanguagesSelectionDialogComponent } from "../../languages-selection-dialog/languages-selection-dialog.component";
import { GameBuilderNudgeComponent } from "../game-builder-nudge/game-builder-nudge.component";
import { DialogComponent } from "src/app/shared/dialog/dialog.component";
import { TutorialVideoComponent } from "../../tutorial-video/tutorial-video.component";
import { GamePathwayService } from "src/app/services/game-pathway/game-pathway.service";
import { PathwayListMobileComponent } from "../pathway-list-mobile/pathway-list-mobile.component";
import { CategoryListMobileComponent } from "../category-list-mobile/category-list-mobile.component";

@Component({
  selector: "app-add-game-header",
  templateUrl: "./add-game-header.component.html",
  styleUrls: ["./add-game-header.component.scss"],
})
export class AddGameHeaderComponent implements OnInit {
  @ViewChild("imgInput", { static: true }) imgInput;
  @Input() game: any;  
  @Input() gameUpdated: any;
  @Input() validFormRef: any;
  @Input() validStatusRef: any;
  @Input() textEditorScenarioRef: any;
  @Input() textEditorInfomationRef: any;
  @Input() viewbutton: any;
  @Input() pinGameLimitReached: any;
  @Input() isLoading: any;
  @Output() goToNextStep: EventEmitter<any> = new EventEmitter();
  @Output() status: EventEmitter<any> = new EventEmitter<any>();
  @Output() switchLanguage: EventEmitter<any> = new EventEmitter<any>();
  @Output() allLanguageData: EventEmitter<any> = new EventEmitter<any>();

  hasChanged = false;
  isNudge = false;
  isNewGameFormatNudge = false;
  gameCategories;
  gamePathways;
  gameCategoriesSource = [];
  gamePathwaysSource = [];
  gameName;
  myControl = new FormControl();
  updating = false;
  is_loading = false;
  staticIcons = [];
  pinGamePayload;
  tooltipMsg;
  showUnpin = false;
  gameLogoURL;
  allLanguage = [];
  defaultLanguage;
  selected;
  gameBuilderLanguage;
  isLoadingLanguage = false;
  gameNamePlaceHolder: any;
  selectedLang;
  isMobile;
  selectedPathways = [];
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768 || event.target.innerWidth <= 1024) {
      this.isMobile = true;
    } else {
      this.isMobile = false;      
    }
  }
  constructor(
    public dialog: MatDialog,
    public gameService: GamesService,
    public loginService: LoginService,
    public router: Router,
    public translate: TranslateService,
    public apiSerivce: ApiService,
    public breadcrumbService: BreadcrumbsService,
    public globalService: GlobalService,
    public uploaderService: UploaderService,
    public getImageURLService: GetImageURLService,
    public storageService: StorageService,
    public gamePathwayService : GamePathwayService,
    private cdf: ChangeDetectorRef
  ) {

    this.gameService.createGameFromBuilder$.subscribe((gameIdwithFlag) => {
      if (gameIdwithFlag.reload) {
        this.game["game_id"] = gameIdwithFlag.gameId,
        this.getGameLangauge();
      }
    });

    this.gameService.getGameDetails$.subscribe((data) => {
      console.log('datadatadatadata',data)      
      if(data.game_category_name){
        this.game.game_category_name = data.game_category_name;
      }
      if(data.default_lang_id){
        this.game.default_lang_id = data.default_lang_id;
      }
      if(data.game_name){
        this.game.game_name = data.game_name;
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.imageUrlUpdated(this.game.game_logo);
    }, 1000);
  }

  ngOnInit() {
    this.selected = this.storageService.getGameLanguage();
    this.gameName = this.game && this.game.game_name;
    this.getGameLangauge();
    this.getGameCategories();
    this.getGamePathway();
    this.getStaticIcons();
    this.gameService.textEditorValidation$.subscribe((hide) => {
      this.textEditorScenarioRef = hide;
    });
    this.gameService.textEditorValidationInformation$.subscribe((hide) => {
      this.textEditorInfomationRef = hide;
    });
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
  }

  getGameCategories() {
    const company_id = this.storageService.getCompanyId();
    this.gameService.getGameCategories(company_id).subscribe((res) => {
      this.gameCategories = res.data && res.data.game_category_list;
      this.gameCategoriesSource = this.gameCategories.map(element => ({ id: element.game_cat_id, title: element.category_name }));
    });
  }

  preparePathwayDatasource() {   
    console.log('this.game.pathway_ids',this.game) 
    console.log('this.game.pathway_ids',this.game.pathway_ids) 
    const gamePathways = []
    this.gamePathways.forEach(element => {
      gamePathways.push({ id: element.pathway_id, title: element.pathway_name });
    });    
    if (this.game.pathway_ids) {
      this.game.pathway_ids.forEach(pathwayID => {
        gamePathways.forEach(item => {
          if (item.id === pathwayID) {
            item.isSelected = true;
          }
        });
      });
      this.gamePathwaysSource = [...gamePathways];
      this.triggerChangeDetection();
    }else{
      this.gamePathwaysSource = [...gamePathways];
      this.triggerChangeDetection();
    }
  }
  getGamePathway() {
    console.log('this.game',this.game);  
    console.log('this.pathway_ids',this.game.pathway_ids);  
    const company_id = this.storageService.getCompanyId();
    this.gamePathwayService.getGamePathway(company_id,null,null,0,500).subscribe((res) => {      
      this.gamePathways = res.data && res.data.pathways;      
    const gamePathways = []
    this.gamePathways.forEach(element => {
      gamePathways.push({ id: element.pathway_id, title: element.pathway_name });
    }); 
    console.log('this.game',this.game) 
    console.log('this.game.pathway_ids',this.game.pathway_ids) 

      if (this.game.pathway_ids) {
      this.game.pathway_ids.forEach(pathwayID => {
        gamePathways.forEach(item => {
          if (item.id === pathwayID) {
            item.isSelected = true;
          }
        });
      });
      this.gamePathwaysSource = [...gamePathways];
    }else{
      this.gamePathwaysSource = [...gamePathways];
    }
    });
  }

  getStaticIcons() {
    this.gameService.getStaticIcons().subscribe((res) => {
      if (res.success) {
        this.staticIcons = res.data.game_icon;
      }
    });
  }

  openGameIconPicker() {
    const dialogReference = this.dialog.open(GameIconPickerComponent, {
      data: null,
    });
    dialogReference.componentInstance.staticImages = this.staticIcons;
    dialogReference.componentInstance.imageSelected.subscribe(
      (selectedImage) => {
        this.game.game_logo = selectedImage.icon_url;
        this.saveGame("icon_id", selectedImage.icon_id);
      }
    );
    dialogReference.componentInstance.attachImageClicked.subscribe((_event) => {
      const el: HTMLElement = this.imgInput.nativeElement as HTMLElement;
      el.click();
    });
    +this.game.game_type === 1
      ? this.globalService.addAdminGoogleEvent(
          "Game_Builder_Single_level_By_Add_Game_Image"
        )
      : this.globalService.addAdminGoogleEvent(
          "Game_Builder_Multi_Player_By_Add_Game_Image"
        );
    dialogReference.componentInstance.selectedImage = {
      icon_url: this.game.game_logo,
    };
  }

  getGameCategoryName(game_cat_id) {    
    return this.gameCategoriesSource.find(element => element.id === game_cat_id);
  }
  onPathwayClosed(event){
    console.log('newlyLinkedPathway1',event);
    this.selectedPathways = event.map(pathway => pathway.id);
      this.globalService.addAdminGoogleEvent('Pathway_Selected');
      this.game.pathway_ids = this.selectedPathways;
      this.saveGame("pathway_ids", this.selectedPathways);
  }
  onPathwaySelected(newlyLinkedPathway) {
  }
  onSelectionChanged(game_cat_id) {
    this.game.game_category_id = game_cat_id;
    console.log(game_cat_id) 
    const selectedCat = this.getGameCategoryName(game_cat_id)
    console.log(selectedCat);
    if(selectedCat){
      this.globalService.addGoogleEvent('Game_Category_Selected',"Game Builder-Single level",selectedCat.title,"")
    }
    this.saveGame("game_category_id", game_cat_id);
    return;
  }
  googleEvent(game_cat_id) {
    let cat_name;
    let cat_name_label;

    const selectedGameCategory = this.gameCategories.find(
      (gameCat) => gameCat.game_cat_id === game_cat_id
    );

    if (selectedGameCategory) {
      cat_name = selectedGameCategory.category_name.replace(/ /g, "_");
      cat_name = "Game_Category_" + cat_name;
      cat_name_label = selectedGameCategory.category_name + " Selected";

      const gameType = +this.game.game_type === 1 ? "Game Builder-Single level" : "Game Builder-Multi Player";

      this.globalService.addGoogleEvent(
        cat_name,
        gameType,
        cat_name_label,
        ""
      );
    }
  }
  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    const pathComponents = event.target.value.split(".");
    const type = pathComponents[pathComponents.length - 1].toLowerCase();
    if (
      type.indexOf("png") === -1 &&
      type.indexOf("jpg") === -1 &&
      type.indexOf("jpeg") === -1
    ) {
      this.showAlertMessage(
        this.translate.instant("invalid_file_format"),
        this.translate.instant("valid_img_format_msg"),
        false,
        this.translate.instant("ok_uppercase")
      );
      return;
    }

    // Pass picked image file to Crop Component
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event,
    });
    dialogRef.componentInstance.maxHeight = 512;
    dialogRef.componentInstance.maxWidth = 512;
    dialogRef.componentInstance.title =
      this.translate.instant("edit_game_icon");
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Apply cropped image changes
        // tslint:disable-next-line:max-line-length
        +this.game.game_type === 1
          ? this.globalService.addAdminGoogleEvent(
              "Game_Builder_Single_level_By_Upload_Game_Image"
            )
          : this.globalService.addAdminGoogleEvent(
              "Game_Builder_Multi_Player_By_Upload_Game_Image"
            );
        this.game.game_logo = result.base64;
        this.updateCustomIcon(result.blobedData);
      }
    });
  }
  showAlertMessage(title, message, isMultiOption, positiveButtonText) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event,
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = isMultiOption;
    dialogReference.componentInstance.positiveButtonText = positiveButtonText;
  }
  // Generate unique string using crypto API
  generateUniqueString(): string {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  updateCustomIcon(blob) {
    const company = this.storageService.getCompany();
    const selectedLanguage = this.storageService.getGameLanguage();
    const company_identifier = company.company_name.replace(/\s/g, "");
    
    // Generate unique string for filename
    const uniqueString = this.generateUniqueString();
    
    const path =  environment.env_name + "/" +
      company_identifier +
      "/cust_game_icon/" +
      this.game["game_id"] +
      "_" +
      uniqueString +
      "_" +
      selectedLanguage +
      ".jpg";
    const that = this;
    this.uploaderService.upload(path, blob, function (err, data) {
      if (!data) {
        return;
      }
      if (data.Location) {
        that.imageUrlUpdated(data.Location);
      }
      that.saveGame("game_logo", data.Location);
    });
  }
  gameNameValidation(key, value) {
    if (!value) {
      this.game.game_name = this.gameName;
      return;
    } else if (value.length < 1) {
      this.game.game_name = this.gameName;
      this.globalService.showMessage(
        this.apiSerivce.getErrorMessage("GAME_NAME_VALIDATION")
      );
      return;
    } else {
      this.breadcrumbService.updateBreadcrumbLabel(this.game.game_name);
      this.saveGame(key, value);
      +this.game.game_type === 1
        ? this.globalService.addAdminGoogleEvent(
            "Game_Builder_Single_level_By_Rename_Game_Name"
          )
        : this.globalService.addAdminGoogleEvent(
            "Game_Builder_Multi_Player_By_Rename_Game_Name"
          );
    }
  }
  saveGame(key, value) {
    this.updating = true;
    this.status.emit(this.updating);
    if(key == 'game_category_id'){     
      this.game.is_default_game_category = false;
    }
    this.storageService.setGameObject(this.game); // to update localstorage with latest values
    const payload = {
      game_id: +this.game["game_id"],
      company_id: +this.game["company_id"],
      lang_id: this.selected,
    };
    payload[key] = value;        
    this.gameService.saveGame(payload).subscribe(res => {
      this.updating = false;
      this.status.emit(this.updating);
    });
  }

  nextButtonClicked() {
    console.log('in here',this.game.is_default_game_category)
    if(this.game.is_default_game_category){
      const dialogRef = this.dialog.open(DialogComponent);
      return
    }
    
    if (+this.game.game_type === 2) {
      this.globalService.addAdminGoogleEvent(
        "Game_Builder_Multi_Player_By_Profile_Button_Clicked"
      );
    }
    if (!this.viewbutton) {
      +this.game.game_type === 1
        ? this.globalService.addAdminGoogleEvent(
            "Game_Builder_Single_level_By_Game_Building_Done"
          )
        : this.globalService.addAdminGoogleEvent(
            "Game_Builder_Multi_Player_By_Game_Building_Done"
          );
    }
    this.goToNextStep.emit();
  }
  saveButtonClicked() {
    this.router.navigate([Route.GAMES]);
  }

  //pin and unpin function

  pinGame(gameObj) {
    if (this.pinGameLimitReached && !gameObj.is_pinned) return;
    const updatePinGamePayload = {
      company_id: this.storageService.getCompanyId(),
      manager_id: this.storageService.getLoginUserID(),
      game_id: gameObj.game_id,
      is_pinned: !gameObj.is_pinned,
    };
    this.pinGamePayload = updatePinGamePayload;
    this.is_loading = true;
    this.gameService.updatePinGame(updatePinGamePayload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.success) {
        if (!gameObj.is_pinned) {
          this.globalService.showMessage(
            this.translate.instant("pin_added"),
            "right",
            "bottom"
          );
          this.globalService.addAdminGoogleEvent(
            "Pinned_Games_Pin_Game_Game_Builder"
          );
        } else {
          this.globalService.showMessage(
            this.translate.instant("pin_remove"),
            "right",
            "bottom"
          );
          this.globalService.addAdminGoogleEvent(
            "Pinned_Games_Remove_Pin_Game_Builder"
          );
        }
      }
      if (this.game) {
        this.game["is_pinned"] = !gameObj.is_pinned;
      }
      this.pinGameLimitReached = gameObj.is_pinned;
      this.storageService.setGameObject(this.game); // to update localstorage with latest values
      if (
        !this.storageService.getKeyForFirstManagerLogin(
          "manager-first-pin-game"
        )
      ) {
        this.getCompanySetting(updatePinGamePayload.company_id);
      }
    });
  }

  showPinStatus(game) {
    if (this.pinGameLimitReached && !game.is_pinned) {
      this.tooltipMsg = this.translate.instant("pin_games_limit_reach");
      return this.tooltipMsg;
    } else {
      if (game.is_pinned) {
        this.tooltipMsg = this.translate.instant("remove_pin");
      } else {
        this.tooltipMsg = this.translate.instant("click_here_to_pin_game");
      }
      return this.tooltipMsg;
    }
  }

  getCompanySetting(companyID) {
    this.loginService.getSettings(companyID).subscribe((res) => {
      const response = res;
      this.globalService.setCompanyRoles(
        response &&
          response.data &&
          response.data.settings &&
          response.data.settings.role
      );
      this.globalService.setCompanySetting(
        response &&
          response.data &&
          response.data.settings &&
          response.data.settings.permission
      );
      this.globalService.companySettingReceived();
    });
  }

  noSpace(event = null) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode === 32 && !this.game.game_name.trim().length) {
      return false;
    }
  }
  imageUrlUpdated(imageUrl) {
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl);
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.game.game_logo = data;
    });
  }

  getGameLangauge() {
    this.isLoadingLanguage = true;
    this.gameService
      .getGameLanguage(this.game["company_id"], this.game["game_id"])
      .subscribe((res) => {
        const response = res;
        if (response.success) {
          this.isLoadingLanguage = false;
          this.allLanguage = response.data;
          this.allLanguageData.emit(this.allLanguage);
          this.storageService.setAllLanguage(response.data);
          this.defaultLanguage = response.data.default_language;
          this.selectedLanguage(response.data.selected_language);
          this.game["selected_lang_id"] = response.data.default_language.id;

          if (response.data && response.data.localisation_nudge && this.game.game_type == 1) {
            this.isNudge = response.data.localisation_nudge;
            this.openNudge();
          }
          if (response.data && response.data.new_game_format_nudge) {
            this.isNewGameFormatNudge = response.data.new_game_format_nudge;
            this.openNewGameFormatNudge();
          }
          if (this.storageService.getGameLanguage()) {
            this.selected = this.storageService.getGameLanguage();
            this.storageService.setGameLanguage(this.selected);
            this.switchLanguage.emit(this.selected);
          } else {
            this.selected = response.data.default_language.id;
            this.storageService.setGameLanguage(this.selected);
            this.switchLanguage.emit(this.selected);
          }
        }
      });
  }
  selectedLanguage(language: any[]) {
    this.selectedLang = language.filter(lang => lang.checked);
    this.storageService.setSelectedLanguage(this.selectedLang);
    this.triggerChangeDetection();
  }
  
  triggerChangeDetection() {
    this.cdf.detectChanges();
  }
  selectLanguage() {
    this.globalService.addAdminGoogleEvent("SLG_Language_Preference_Clicked");
    const dialogRef = this.dialog.open(LanguagesSelectionDialogComponent, {
      data: {
      allLanguage: this.allLanguage,
      game_id: this.game.game_id,
      },
    });
    dialogRef.componentInstance.gameStatus =
      this.game.game_state === "DRAFT" ? false : true;
    dialogRef.componentInstance.onPositiveAction.subscribe((data) => {
      this.selectedLang = data.selected_language;
      this.defaultLanguage = data.default_language;
      this.saveGameLanguage();
    });
  }
  saveGameLanguage() {
    const selectedLangIds = this.selectedLang.map((language) => language.id);
    const payload = {
      company_id: this.game.company_id,
      default_language: this.defaultLanguage.id,
      game_id: this.game.game_id,
      selected_language: selectedLangIds,
    };
    this.gameService.saveGameLanguage(payload).subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.getGameLangauge();
        this.game.selected_lang_id = this.defaultLanguage.id;
        this.switchLanguage.emit(this.defaultLanguage.id);
      }
    });
  }
  setLang(value) {
    this.gameBuilderLanguage = value;
    this.selected = value;
    this.game["selected_lang_id"] = this.gameBuilderLanguage;
    this.storageService.setGameLanguage(value);
    this.switchLanguage.emit(this.gameBuilderLanguage);
    this.allLanguageData.emit(this.allLanguage);
  }
  gameNameTranslate(gameNameTranslate) {
    return (gameNameTranslate = this.translate.instant("game_name", "ar"));
  }  
  getImg(Id) {
    return this.allLanguage["selected_language"].find((lang) => lang.id === Id)?.img;
  }
  openNudge() {
    const dialogReference = this.dialog.open(GameBuilderNudgeComponent, {
      data: event,
      position: { right: "30", bottom: "30" },
      backdropClass: "hello",
      panelClass: "my-css-class",
    });
    dialogReference.afterClosed().subscribe((result) => {
      if (result) {
        this.isNudge = false;
      }
    });
  }
  openNewGameFormatNudge() {
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { 
          name: this.translate.instant('SELECT_GAME_FORMAT'),
          isNewGameFormatNudge: this.isNewGameFormatNudge,
          url: this.globalService.tutorialVideo.NEW_GAME_FORMAT 
        }
      });
  }

  openPathwayPopup(){
    const dialogRef = this.dialog.open(PathwayListMobileComponent,{
      data: this.gamePathwaysSource
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if(result.selectedPathways.length){
          console.log(result.selectedPathways)
          this.saveGame("pathway_ids", result.selectedPathways);
        }
      }
    });
    
  }
  openCategoryPopup(){
    
    console.log('this.game.game_category_id',this.game.game_category_id)
    const dialogRef = this.dialog.open(CategoryListMobileComponent,{
      data: this.gameCategoriesSource
    });
    dialogRef.componentInstance.game_category_id = this.game.game_category_id;
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        if(result.selectedId){
          console.log(result.selectedId)
          this.game.game_category_id = result.selectedId;
          const selectedCat = this.getGameCategoryName(result.selectedId)   
          console.log('tsss',selectedCat.title)
          this.game.game_category_name = selectedCat.title;
          if(selectedCat){
          this.globalService.addGoogleEvent('Game_Category_Selected',"Game Builder-Single level",selectedCat.title,"")
          }
          this.saveGame("game_category_id", result.selectedId);
        }
      }
    });
  }
}
