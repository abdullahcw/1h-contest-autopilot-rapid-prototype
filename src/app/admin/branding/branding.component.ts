import { Component, OnInit, HostListener, OnDestroy } from "@angular/core";
import { CompanyService } from "../../services/company/company.service";
import { StorageService } from "../../services/storage/storage.service";
import { CropImageComponent } from "../../shared/crop-image/crop-image.component";
import { MatDialog } from "@angular/material/dialog";
import { ImagePreviewComponent } from "../image-preview/image-preview.component";
import { UploaderService } from "../../services/uploader/uploader.service";
import { environment } from "../../../environments/environment";
import { DelegateService } from "../../services/delegate/delegate.service";
import { Router } from "@angular/router";
import { BrandingPreviewComponent } from "../branding-preview/branding-preview.component";
import { ConfirmActionComponent } from "../confirm-action/confirm-action.component";
import { TranslateService } from "@ngx-translate/core";
import { GlobalService } from "src/app/services/global/global.service";
import { GetImageURLService } from "src/app/services/get-image-URL/get-image-url.service";

@Component({
  selector: "app-branding",
  templateUrl: "./branding.component.html",
  styleUrls: ["./branding.component.scss"],
})
export class BrandingComponent implements OnInit, OnDestroy {
  is_loading: boolean;
  branding = {
    image: "",
    sound: [],
    theme: "",
  };
  noOfColumns = 5;
  selectedItem = {};
  fileAcceptType = "";
  sortingOrder = [106, 103, 107, 111, 102, 104, 105, 101, 110, 109]; // removed 108 short whistle
  assetKeys;

  audio: HTMLAudioElement;
  company: any;
  breakpoint = 7;
  currentPlaying;
  delegateSubscription;
  brandingTheme;

  constructor(
    public companyService: CompanyService,
    public dialog: MatDialog,
    public uploaderService: UploaderService,
    public storageService: StorageService,
    public delegateService: DelegateService,
    public translate: TranslateService,
    public globalService: GlobalService,
    public router: Router,
    public getImageURLService:GetImageURLService,
  ) {
    this.delegateSubscription =
      this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
        if (this.router.url.indexOf("branding") !== -1) {
          this.company = this.storageService.getCompany();
          this.resetAudioPlayer();
          this.getBranding();
        }
      });
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.calculateBreakpoint();
  }
  @HostListener("window:blur") onBlur() {
    this.audioPause();
  }
  ngOnInit() {
    this.company = this.storageService.getCompany();
    this.assetKeys = {
      background_image: this.translate.instant("background_img"),
      timerSound: this.translate.instant("timer"),
      buttonSound: this.translate.instant("button"),
      profileThemeSound: this.translate.instant("preview_music"),
      buzzerSound: this.translate.instant("buzzer"),
      correctAnswerSound: this.translate.instant("correct_ans"),
      introSound: this.translate.instant("intro_music"),
      winScreenSound: this.translate.instant("end_game_music"),
      whistleLongSound: this.translate.instant("initiating_text"),
      wrongAnswerSound: this.translate.instant("wrong_answer"),
      hundredPercentAnimationSound: this.translate.instant(
        "100_percentage_score"
      ),
    };
    this.calculateBreakpoint();
    this.getBranding();
  }

  resetAudioPlayer() {
    if (this.audio) {
      this.audio.pause();
    }
    this.currentPlaying = "";
  }

  calculateBreakpoint() {
    this.breakpoint = window.innerWidth / 200;
  }

  getBranding() {
    const companyId = this.storageService.getCompanyId();
    this.is_loading = true;
    this.companyService.getBranding(companyId).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        return;
      }
      this.branding = response.data;
      const image = this.branding["image"]?.[0];
      if (image && image["url"]) {
        this.selectedItem["url"] = image["url"];
      }

      const sounds = [];
      if (this.branding.sound && this.branding.sound.length) {
        this.sortingOrder.forEach((element) => {
          const filteredArray = this.branding.sound.filter((sound) => {
            return sound.list_id === element;
          });
          if (filteredArray[0]) {
            sounds.push(filteredArray[0]);
          }
        });
        this.branding.sound = sounds;
      }
    });
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
      this.showAlert(
        this.translate.instant("invalid_file_format"),
        this.translate.instant("valid_img_format_msg")
      );
      return;
    }

    const fr = new FileReader();
    fr.onload = () => {
      // when file has loaded
      const img = new Image();
      img.onload = () => {
        const imageSize = event.target.files[0].size / 1024 / 1024;
        if (imageSize <= 2) {
          this.selectedItem["url"] = img.src;
          this.uploadImage(event.target.files[0]);
        } else {
          this.showAlert(
            this.translate.instant("background_img_msg_title"),
            this.translate.instant("background_img_msg")
          );
        }
      };
      img.src = fr.result as string; // This is the data URL
    };
    fr.readAsDataURL(file);
  }

  showAlert(title, message, isMultiOption = false) {
    return new Promise((resolve, reject) => {
      const dialogReference = this.dialog.open(ConfirmActionComponent, {
        data: event,
      });
      dialogReference.componentInstance.title = title;
      dialogReference.componentInstance.message = message;
      dialogReference.componentInstance.isMultiOption = isMultiOption;
      if (isMultiOption) {
        dialogReference.componentInstance.positiveButtonText =
          this.translate.instant("no_uppercase");
        dialogReference.componentInstance.negativeButtonText =
          this.translate.instant("yes_uppercase");
      } else {
        dialogReference.componentInstance.positiveButtonText =
          this.translate.instant("ok_uppercase");
      }
      dialogReference.componentInstance.onPositiveAction.subscribe(() => {
        return;
      });
      dialogReference.componentInstance.onNegativeAction.subscribe(() => {
        resolve(true);
      });
    });
  }

  openCropper(event) {
    // Pass picked image file to Crop Component
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event,
    });
    dialogRef.componentInstance.aspectRatio = 4 / 3;
    dialogRef.componentInstance.isFixedWidth = true;
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Apply cropped image changes
        this.selectedItem["url"] = result.base64;
        this.uploadImage(result.blobedData);
      }
    });
    dialogRef.componentInstance.title = this.translate.instant("edit_bg_img");
  }

  audioPicked(event: any): void {
    const pathComponents = event.target.value.split(".");
    let type = pathComponents[pathComponents.length - 1];
    type = type.toLowerCase();
    const audioSize = event.target.files[0].size / 1024 / 1024;
    if (type.indexOf("mp3") === -1) {
      this.showAlertMessage(
        this.translate.instant("invalid_file_format"),
        this.translate.instant("select_mp3"),
        false,
        this.translate.instant("ok_uppercase")
      );
      return;
    }

    if (audioSize && audioSize > 10) {
      // 10 MB
      this.showAlertMessage(
        this.translate.instant("file_too_large"),
        this.translate.instant("audio_max_10mb"),
        false,
        this.translate.instant("ok_uppercase")
      );
      return;
    }

    if (event.target.files && event.target.files[0]) {
      const company_name = this.company["company_name"];
      const company_identifier = company_name.replace(/\s/g, "");
      const path =
        environment.env_name +
        "/" +
        company_identifier +
        "/company/assets/" +
        this.selectedItem["list_id"] +
        ".mp3";
      const keyName = `Branding_By_${this.selectedItem["name"]}_edit`;
      this.globalService.addAdminGoogleEvent(keyName);
      this.uploadAsset(event.target.files[0], path, false, this.selectedItem);
    }
  }

  openImage() {
    const dialogRef = this.dialog.open(ImagePreviewComponent, {
      data: null,
    });
    dialogRef.componentInstance.image = this.selectedItem["url"];
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {}
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
  uploadImage(fileBlob) {
    const company_name = this.company["company_name"];
    const company_identifier = company_name.replace(/\s/g, "");
    const path = environment.env_name + "/" + company_identifier + "/company/assets/asset_1.jpg";
    this.uploadAsset(fileBlob, path, true, this.selectedItem);
  }

  uploadAsset(file, path, isImage, item) {
    const that = this;
    if (isImage === false) {
      this.selectedItem["is_loading"] = true;
      if (item["name"] === this.currentPlaying) {
        this.audio.pause();
        this.currentPlaying = "";
      }
    }
    
    if (isImage) { // used for image upload 
      this.uploaderService.upload(
        path,
        file,
        function (err, data) {
          if (err) {
            item["is_loading"] = false;
            that.showAlert(
              this.translate.instant("error"),
              this.translate.instant("problem_uploading")
            );
            return;
          }
          let payload = {};
          let location;
          if (data) {
            location = data.Location;
          }

          payload = {
            company_id: that.company["company_id"],
            image: [
              {
                name: item["name"],
                url: location,
                list_id: item["list_id"],
              },
            ],
          };

          that.companyService.updateBranding(payload).subscribe((res) => {            
              that.globalService.addAdminGoogleEvent(
                "Branding_By_Background_Image"
              );            
            item.url = location + "?=" + Math.floor(Date.now() / 1000);
            item["is_loading"] = false;
          });
        },
        true,
        "Uploading...",
        "",
        true
      );
    } else {  // used for sound upload 
      this.uploaderService.upload(path,file,function (err, data) {
          if (err) {
            item["is_loading"] = false;
            that.showAlert(that.translate.instant('error'), that.translate.instant('problem_uploading'));
            return;
          }
          let payload = {};
          let location;
          if (data) {
            location = data.Location;
          }
          payload = {
            company_id: that.company["company_id"],
            sound: [
              {
                name: item["name"],
                url: location,
                list_id: item["list_id"],
              },
            ],
          };

          that.companyService.updateBranding(payload).subscribe((res) => {           
            item.url = location + "?=" + Math.floor(Date.now() / 1000);
            item["is_loading"] = false;
          });
        }        
      );
    }
  }

  openThemeEditor(mode) {
    const dialogRef = this.dialog.open(BrandingPreviewComponent, {
      data: null,
    });
    dialogRef.componentInstance.backgroundColor =
      this.branding.theme["background_color"];
    dialogRef.componentInstance.textColor = this.branding.theme["text_color"];
    this.brandingTheme = this.branding.theme;
    dialogRef.componentInstance.brandingUpdated.subscribe((result) => {
      this.branding.theme = result;
      this.updateTheme();
    });
  }

  updateTheme() {
    const payload = {
      company_id: this.company["company_id"],
      theme: this.branding.theme,
    };
    this.companyService.updateBranding(payload).subscribe((res) => {
      // console.log(res);
    });
    if (
      this.brandingTheme["background_color"] !==
      this.branding.theme["background_color"]
    ) {
      this.globalService.addAdminGoogleEvent("Branding_By_Mobile_Background");
    }
    if (
      this.brandingTheme["text_color"] !== this.branding.theme["text_color"]
    ) {
      this.globalService.addAdminGoogleEvent("Branding_By_Mobile_Text");
    }
  }
  
  deleteAsset(asset) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event,
    });
    dialogReference.componentInstance.title =
      this.translate.instant("confirm_action");
    dialogReference.componentInstance.message = this.translate.instant(
      "confirm_delete_asset"
    );
    dialogReference.componentInstance.negativeButtonText =
      this.translate.instant("yes_uppercase");
    dialogReference.componentInstance.positiveButtonText =
      this.translate.instant("no_uppercase");
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      asset["is_loading"] = true;
      if (asset["name"] === this.currentPlaying) {
        this.audio.pause();
        this.currentPlaying = "";
      }
      this.companyService
        .deleteAsset(asset["list_id"], this.company["company_id"])
        .subscribe((res) => {
          asset["is_loading"] = false;
          asset.url = "";
        });
      if (!asset) {
        return;
      }
      const keyName = `Branding_By_${asset.name}_Delete`;
      this.globalService.addAdminGoogleEvent(keyName);
    });
  }

  getSignedURLAndPlay(audio){  // code used to play sounds 
    console.log(audio)
    const ignoreCache = true;
    const relativePath = this.getImageURLService.trimmedURLValue(audio.url,ignoreCache)
    console.log(relativePath)
    
    const that = this;
    this.getImageURLService.getURL(relativePath, function (err, data) {        
      audio.url = data; 
      that.playAudio(audio);
    }); 
  }
  playAudio(audio) {
    console.log(audio)
    if (
      this.audio &&
      this.audio.paused &&
      this.currentPlaying === audio["name"]
    ) {
      this.audio.play();
    } else {
      if (
        this.audio &&
        !this.audio.paused &&
        this.currentPlaying !== audio["name"]
      ) {
        this.audio.pause();
      }
      this.audio = new Audio();
      this.audio.onended = () => {
        this.currentPlaying = null;
      };
      this.audio.src = audio.url;
      this.audio.load();
      this.audio.play();
      this.currentPlaying = audio["name"];
    }
    if (!audio) {
      return;
    }
    const keyName = `Branding_By_${audio.name}`;
    this.globalService.addAdminGoogleEvent(keyName);
  }

  // @HostListener allows us to guard against browser refresh, close, etc.
  @HostListener("window:beforeunload", ["$event"])
  canDeactivate(event: any) {
    let uploadingAssets = false;
    const images: any = this.branding.image;
    uploadingAssets = this.isUploadingIsInProgress(images);

    // Uploading Bg image is in progress ignore uploading sound check
    if (!uploadingAssets) {
      const sounds: any = this.branding.sound;
      uploadingAssets = this.isUploadingIsInProgress(sounds);
    }

    if (uploadingAssets && !event) {
      const message = this.translate.instant("upload_in_progress");
      return this.showAlert(
        this.translate.instant("confirm_action"),
        message,
        true
      ).then((reason) => {
        if (reason) {
          return true;
        }
        return false;
      });
    }
    return true;
  }

  isUploadingIsInProgress(items) {
    if (!items) {
      return;
    }
    const assetsToBeUploaded = items.filter((item) => {
      return item.is_loading;
    }).length;
    return assetsToBeUploaded && assetsToBeUploaded > 0 ? true : false;
  }

  confirmMessage(message) {
    this.showAlert(this.translate.instant("confirm_action"), message);
  }

  audioPause() {
    if (this.audio) {
      this.audio.pause();
      return;
    }
  }

  ngOnDestroy() {
    this.resetAudioPlayer();
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
