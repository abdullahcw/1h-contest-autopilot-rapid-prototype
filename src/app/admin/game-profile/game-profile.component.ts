import { Component, OnInit, ViewChild, AfterContentInit, HostListener, ChangeDetectorRef, ViewChildren, OnDestroy, SimpleChanges } from '@angular/core';
import { GamesService } from '../../services/games/games.service';
import { StorageService } from '../../services/storage/storage.service';
import { Router } from '@angular/router';
import { UploaderService } from '../../services/uploader/uploader.service';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from 'src/app/services/global/global.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { ApiService } from '../../services/network/api.service';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/services/header/header.service';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { UploadingProgressComponent } from '../uploading-progress/uploading-progress.component';
import { TranslateService } from '@ngx-translate/core';
import { Route } from '../../services/login/login.service';
import { Platform } from '@angular/cdk/platform';
import { PdfPreviewComponent } from '../pdf-preview/pdf-preview.component';
import { PDFDocumentProxy, PDFProgressData } from 'ng2-pdf-viewer';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';


@Component({
  selector: 'app-game-profile',
  templateUrl: './game-profile.component.html',
  styleUrls: ['./game-profile.component.scss']
})
export class GameProfileComponent implements OnInit, AfterContentInit, OnDestroy {
  public Editor;

  notification = new FormControl('', Validators.required);
  game: any = { game_type: 1, game_logo: '', game_name: '', game_category_id: 0, game_category_name: '' };
  searchKey: any;
  profiles = [];
  addQuestion = false;
  is_loading = false;
  showleftPane = true;
  gameModeTitle;
  showRightPane = false;
  profileIDS = [];
  showDelete = false;
  validStatus: boolean;
  updating = false;
  showProfileForm = false;
  hoveredProfile;
  // dirtyStatus: boolean = true;
  // isVideoUploading = false;
  showCheckMark = true;
  videoURL;
  linkedProfiles = [];
  disableNewProfile = false;
  isSmallDevice = false;
  // addBtnCliked = false;
  is_video = false;
  is_profile_added = false;
  selectedLanguage;
  selectedProfile = {
    profile_id: '', is_shop_game: false,
    profile_name: 'About the Game',
    video_url: '', 
    video_files: '', 
    document_url: '', 
    document_name: '', 
    video_name:'',
    pdf_thumbnail_url: '',
    scenario: 'Ready to play?', is_video_uploading: '', information: [{
      title: '',
      description: '',
      name: Math.floor(Math.random() * 1000000000),
      video_url: '',video_name:'', video_files: '', document_url: '', document_name: '', pdf_thumbnail_url: '', is_video_ForInfo: false
    }]
  };
  multiplayerSelectedProfile = {
    profile_id: '',
    profile_name: '', video_url: '', video_files: '', scenario: '', is_video_uploading: '', information: [{
      title: '',
      description: ''
    }]
  };
  videoWidth = 320;
  enableEditor = false;

  // selectedProfile = {
  //   profile_id: '', profile_name: '', video_url: '', scenario: '', information: []
  // };
  company: any;
  // video_is_uploading = false;
  selectSearchFilterKey = 'profile_name';
  hasChanged = false;
  deviceHeight;
  isPdfLoading = true;
  isPdfUpdating = false;
  isPdfUpdatingForInfo = false;
  isInformationValid = true;
  isInformationValidBlur = true;
  shouldUploadThumbnail = false;
  tempDocName;
  tempVideoName;
  pdfProgress = {
    'count': null,
    'openDialog': true
  };
  isLangugeChanged: boolean;
  isReseat = true;

  // Default thumbnail URL pattern to detect generic thumbnails
  private readonly DEFAULT_THUMBNAIL_PATTERN = 'default_pdf_thumbnail.jpeg';

  profilePayload = {}; // this has been created for spec.ts to test payload keys
  @ViewChild('profileList') profileList;
  @ViewChild('profilesDetails', { static: true }) profilesDetails;
  @ViewChild('scenario', { static: true }) public userFrm: NgForm;
  @ViewChild('pdfViewer') pdfViewer;
  @ViewChild('pdfViewerForInfo') pdfViewerForInfo;
  @ViewChild('editorScenario') myEditor: any;
  pinGameLimitReached: boolean;
  windowWidth = 768;
  // windowWidth = 812;
  // windowWidth = 576;
  @ViewChild('profileVideo', { static: true }) profileVideo: any;
  @ViewChildren('profileVideoForInfo') profileVideoForInfo: any;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.platform.ANDROID) {
      if (window.innerHeight === this.deviceHeight) {
        this.resizeVideo();
        this.hideProfilesList();
        this.showDeleteButton();
      } else {
        this.deviceHeight = window.innerHeight;
      }
    } else {
      this.resizeVideo();
      this.hideProfilesList();
      this.showDeleteButton();
    }
  }
  constructor(public gameService: GamesService,
    public router: Router,
    public dialog: MatDialog,
    public platform: Platform,
    public globalService: GlobalService,
    public apiSerivce: ApiService,
    public translate: TranslateService,
    public headerService: HeaderService,
    public uploaderService: UploaderService,
    public storageService: StorageService,
    public getImageURLService: GetImageURLService,
    public gamesService: GamesService,
    private cdRef: ChangeDetectorRef,
    public breadcrumbService: BreadcrumbsService) {
    setTimeout(() => {
      this.Editor = ClassicEditor;
      this.enableEditor = true;
    }, 1000);
    // this.uploaderService.uploadingProgress.subscribe(progress => {
    //   console.log('progress', progress);
    // });

  }

  resizeVideo() {
    if (window.innerWidth <= this.windowWidth && window.innerWidth > 320) {
      this.videoWidth = 280;
    } else if (window.innerWidth <= 320) {
      this.videoWidth = 240;
    } else {
      this.videoWidth = 320;
      this.showleftPane = true;
      this.showRightPane = false;

    }
  }

  hideProfilesList() {
    if (window.innerWidth <= this.windowWidth) {
      // if (!this.showRightPane) {
      this.showleftPane = false;
      this.showRightPane = false;
      // }
    }
  }

  showDeleteButton() {
    if (window.innerWidth <= this.windowWidth) {
      this.isSmallDevice = true;
    } else {
      this.isSmallDevice = false;
    }
  }
  showProfile() {
    if (window.innerWidth <= this.windowWidth) {
      this.showleftPane = false;
      this.showRightPane = false;
    }
  }

  hideProfilesForSmallDevices() {
    if (window.innerWidth <= this.windowWidth) {
      this.showRightPane = true;
    }
  }

  ngOnInit() {
    this.selectedLanguage = this.storageService.getGameLanguage();
    this.showDeleteButton();
    this.resizeVideo();
    this.deviceHeight = window.innerHeight;
    this.hideProfilesList();
    this.headerService.showCompanyFilter(false);
    this.game = this.storageService.getGameObject('gameObject');
    // this.allSelectedLanaguage = this.storageService.getGameObject('allSelectedLanguage');

    if (this.game) {
      this.gameModeTitle = +this.game.game_type === 2 ? 'PROFILE' : 'PREVIEW';
    }
    this.company = this.storageService.getCompany();
    this.is_loading = true;
    this.getProfiles();

    const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
    // console.log('breadcrumbs', breadcrumbs);
    if (breadcrumbs) {
      breadcrumbs[1].key = this.game.game_name;
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    // if ((changes.refreshGetGamesWinRate && changes.refreshGetGamesWinRate.currentValue)) {
      // this.getProfiles();
    // }
  }
  switchLanguage(value){
    console.log('value',value);
    this.selectedLanguage = value;
    this.isReseat = false;
    this.storageService.setGameLanguage(value);
    if(this.selectedProfile.profile_id){
      this.getProfiles();
    }
    this.getGameDetails(this.game['game_id']);
  }
  ngAfterContentInit() {
    this.validStatus = this.userFrm.valid;
  }
  getProfiles() {
    const companyId = this.storageService.getCompanyId();
    const managerId = this.storageService.getLoginUserID();
    let gameId = 0;
    if (this.game) {
      gameId = this.game['game_id'];
    }
    this.selectedLanguage = this.storageService.getGameLanguage();
    const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    this.gameService.getProfiles(companyId, gameId, 'profile_name', 'asc', 0, 50, managerId, null, selectedLanguage).subscribe(res => {
      this.is_loading = false;
      if (res.data && res.data.profile_list) {
        if (res.data.profile_list.length && this.game && +this.game.game_type === 1) {
          this.profileSelected(res.data.profile_list[0]);
        } else if (res.data.profile_list.length && this.game && +this.game.game_type === 2) {
          // if (res.data.profile_list.length) {
          let profiles = [];
          profiles = res.data.profile_list;
          const profileArray = [];
          profiles.filter((profile) => {
            if (profile.is_linked === false) {
              profileArray.push(profile);
            }
          });
          this.linkedProfiles = res.data.profile_linked_game;
          this.profiles = res.data.profile_linked_game.concat(profileArray);
          if (res.data.profile_linked_game.length) {
            this.profileSelected(this.profiles[0]);
          }
          // if (res.data.profile_linked_game.length === 0) {
          //   this.linkProfile(this.profiles[0], true);
          //   this.profiles[0].is_linked = true;
          //   this.showProfileForm = true;
          //   console.log('dasdasd', this.profiles[0]);
          // }
        } else {
          this.addNewProfile();
        }
      }

      // Update breadcrumb
      const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
      // console.log('selectedProfile', this.selectedProfile);
      if (breadcrumbs) {
        if (this.selectedProfile.profile_id && breadcrumbs[2]) {
          breadcrumbs[2].key = this.game && +this.game.game_type === 2 ? 'Profile' : 'Preview';
        } else {
          breadcrumbs[2].key = this.game && +this.game.game_type === 2 ? 'Add Profile' : 'Add Preview';
        }
      }
      this.checkvalidation(this.selectedProfile);
      this.pinGameLimitReached = res.data.pin_game_limit_reached;
    });

  }
  checkvalidation(selectedProfile) {
    if (selectedProfile.information.length) {
      selectedProfile.information.forEach(element => {
        let isValid: boolean;
        isValid = this.checkValidation(element);
        this.isInformationValidBlur = this.isInformationValidBlur && isValid;
        this.gameService.informationValidation(this.isInformationValidBlur);
      });
    } else if (selectedProfile.profile_name.trim().length && selectedProfile.scenario.trim().length) {
      this.gameService.informationValidation(true);
    }
  }

  profileSelected(profile, profile_changed = false, callFromView = false) {
    this.showProfileForm = true;
    // save the existing profile when we click on anothet profile
    // if (profile_changed && !this.selectedProfile.profile_id && this.selectedProfile.profile_name && this.selectedProfile.scenario) {
    //   this.addGameProfile(this.selectedProfile);
    //   return;
    // }
    // console.log(profile)
    
    if(profile.information.length){
      profile.information.filter(info=>{

        if(info.video_url){
          this.imageUrlUpdatedForVideoInfo(info)
        }
      })
    }
    this.profilesDetails.nativeElement.scrollTop = 0;
    this.selectedProfile = Object.assign({}, profile);
    // Truncate document_name to 70 characters if coming from backend
    if (this.selectedProfile.document_name && this.selectedProfile.document_name.length > 70) {
      this.selectedProfile.document_name = this.selectedProfile.document_name.substring(0, 70);
    }
    // Truncate document_name in information array
    if (this.selectedProfile.information && this.selectedProfile.information.length) {
      this.selectedProfile.information.forEach(info => {
        if (info.document_name && info.document_name.length > 70) {
          info.document_name = info.document_name.substring(0, 70);
        }
      });
    }
    if (this.selectedProfile.video_url) {
      this.is_video = true;
      
      this.imageUrlUpdatedForVideo(this.selectedProfile.video_url);
      // setTimeout(() => {
      //   // this.profileVideo.nativeElement.src = this.selectedProfile.video_url;
        
      // });
      // this.resizeVideo();
    } else {
      if (profile.is_video_uploading) {
        +this.game.game_type === 1 ? this.globalService.addGoogleEvent('Game_Profile_Video', 'Single level games', 'Video', '') :
          this.globalService.addGoogleEvent('Game_Profile_Video', 'MultiPlayer games', 'Video', '');
        return;
      }
      this.is_video = false;
    }

    // if information section have video url then we are setting the flag true
    profile.information.forEach(subprofile => {
      if (subprofile.video_url) {
        subprofile.is_video_ForInfo = true;
      }
    });

    if (!profile.information.length) {
      const scenario = {
        title: '',
        description: '',
        name: Math.floor(Math.random() * 1000000000),
        video_url: '', video_name:'', video_files: '', document_url: '', document_name: '', pdf_thumbnail_url: '', is_video_ForInfo: false
      };
      this.selectedProfile.information.push(scenario);
    } else {
      profile.information.forEach(subprofile => {
        subprofile['name'] = Math.floor(Math.random() * 1000000000);
      });
    }
    if (this.selectedProfile.document_url) {
      this.isPdfLoading = true;
      this.tempDocName = this.selectedProfile.document_name;

      // Get signed URL for the PDF document
      this.imageUrlUpdatedForProfile(this.selectedProfile.document_url, this.selectedProfile);
      
      // Check if the thumbnail is a default thumbnail and needs to be generated
      if (this.isDefaultThumbnail(this.selectedProfile.pdf_thumbnail_url)) {
        this.shouldUploadThumbnail = true;
        // The thumbnail will be generated when PDF renders via pageRendered() event
      }
    }

    if (this.selectedProfile.document_url) {
      // this.isPdfLoading = true;
      this.tempVideoName = this.selectedProfile.video_name;
    }

    // Check information array for default thumbnails and get signed URLs
    if (this.selectedProfile.information && this.selectedProfile.information.length) {
      this.selectedProfile.information.forEach((subprofile, index) => {
        if (subprofile.document_url) {
          // Get signed URL for the PDF document
          this.imageUrlUpdatedForInformation(subprofile.document_url, subprofile);
          
          // Check if thumbnail needs to be generated
          if (this.isDefaultThumbnail(subprofile.pdf_thumbnail_url)) {
            // Mark that we need to upload thumbnail for this subprofile
            // The thumbnail will be generated when PDF renders via pageRenderedSubProfile() event
            this.shouldUploadThumbnail = true;
          }
        }
      });
    }
    
    if (callFromView) {
      setTimeout(() => {
        this.showProfile();
      });
    }
  }

  showDeleteIcon(profileID) {
    this.hoveredProfile = profileID;
  }
  deleteProfile(profile) {
    this.confirmationForDeleteProfile(profile);
  }

  callToDeleteProfile(profile) {
    const profileItem = this.profiles.filter((item) => {
      if (item.profile_id === profile.profile_id) {
        return item;
      }
    });
    // console.log('profileItem', profileItem);
    const index = this.profiles.indexOf(profileItem[0]);
    // console.log('profileIndex', index);
    this.profiles.splice(index, 1);
    if (this.profiles.length) {
      this.profileSelected(this.profiles[0]);
    } else {
      this.addNewProfile();
    }

    this.gameService.deleteGameProfile(profile.profile_id).subscribe(res => {
      if (!res.success) {
        this.globalService.showMessage(this.apiSerivce.getErrorMessage(res.message_code));
        return;
      }
      // console.log('this.profiles', this.profiles);
    });
  }

  selectedProfileArray(profile, event) {
    if (event.checked) {
      profile.is_checkBoxCliked = true;
      this.linkProfile(profile, event.checked);
    } else {
      profile.is_checkBoxCliked = true;
      this.linkProfile(profile, event.checked);
    }
  }


  linkProfile(profile, is_linked) {
    const profileID = [];
    profileID.push(profile.profile_id);
    const payload = {
      'game_id': +this.game['game_id'],
      'company_id': +this.game['company_id'],
      'profile_ids': profileID,
    };
    if (!is_linked) {
      this.gameService.unlinkProfile(payload).subscribe(() => {
        // this.profileIDS = [];
        profile.is_checkBoxCliked = false;
      });
    } else {
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Profile_Selected');
      this.gameService.linkProfile(payload).subscribe(() => {
        // this.profileIDS = [];
        profile.is_checkBoxCliked = false;
      });
    }
  }
  saveProfile(key, value, selectedProfile) {
    console.log('key', key, value);
    console.log('key, value, selectedProfile', key, value, selectedProfile);

    const payload = {
      'profile_id': selectedProfile.profile_id,
      'game_id': this.game && +this.game['game_id'],
      'company_id': this.game && +this.game['company_id'],
    };
    if (key === 'information') {
      // this.addEvent(key);
      // console.log('value', value.title.trim());
      if (value.title || value.description) {
        value.title = value.title.trim();
        value.description = value.description.trim();
      }
      // if (value.description === '<p>&nbsp;</p>') {
      if (value.description && this.checktextEditorEmpty(value.description).length <= 0) {
        value.description = '';
      }
      if (!value.title && !value.description) {
        this.removeEmptyInformation();
      }
      // if (!value.title || !value.description) {
      //   return;
      // }
      let infoArray = [];
      infoArray = this.selectedProfile.information.filter((info) => {
        return info.description !== '' && info.title !== '';
      });
      infoArray = infoArray.map(({ name, video_files, is_video_uploading, is_video_ForInfo, ...rest }) => ({ ...rest }));
      payload[key] = infoArray;
    } else if (key === 'scenario') {
      if (value && this.checktextEditorEmpty(value).length <= 0) {
        value = '';
      }
      payload[key] = value;
    } else {
      payload[key] = value;
      // console.log('value', payload);
    }
    this.profilePayload = Object.assign({}, payload);
    this.updating = true;
    this.selectedLanguage = this.storageService.getGameLanguage();
    const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    payload['lang_id'] = selectedLanguage;
    this.gameService.saveProfile(payload).subscribe(res => {
      this.updating = false;
      if (!res.success) {
        this.globalService.showMessage(this.apiSerivce.getErrorMessage(res.message_code));
        return;
      }
      // console.log('selectedProfile', key, selectedProfile);
      if (key === 'profile_name' || key === 'information') {
        this.addEvent(key);
      }
      this.setUpdatedValue(selectedProfile);
    });
  }

  setUpdatedValue(selectedProfile) {
    const profileItem = this.profiles.filter((item) => {
      return item.profile_id === selectedProfile.profile_id;
    });
    if (profileItem.length) {
      this.profiles.filter((profile) => {
        if (profile.profile_id === selectedProfile.profile_id) {
          const index = this.profiles.indexOf(profile);
          this.profiles[index] = selectedProfile;
        }
      });
    } else {
      // this.profiles.unshift(selectedProfile);
    }
  }
  removeEmptyInformation() {
    const information = [] = this.selectedProfile.information.filter((info) => {
      return info.description !== '' && info.title !== '';
    });

    // console.log('information', information);
    for (let i = 0; i < information.length; i++) {
      if (information[i].title && information[i].description) {
        this.saveProfile('information', information[i], this.selectedProfile);
      }
    }
  }
  addNewProfile() {
    this.selectedProfile = JSON.parse(JSON.stringify(this.multiplayerSelectedProfile));
    this.selectedProfile.profile_name = 'About the Game';
    this.selectedProfile.scenario = 'Ready to play?';
    this.addGameProfile(this.selectedProfile);
    this.showProfileForm = true;
    this.disableNewProfile = true;
    this.is_profile_added = false;
    // this.addBtnCliked = true;
    this.profileVideo.nativeElement.src = '';
    this.is_video = false;
    // this.showleftPane = false;
    this.profiles.unshift(this.selectedProfile);
    this.showCheckMark = true;
    this.profilesDetails.nativeElement.scrollTop = 0;

  }
  toggleBtwProfiles() {
    this.profilesDetails.nativeElement.scrollTop = 0;
    this.showleftPane = !this.showleftPane;
    this.hideProfilesForSmallDevices();
  }
  goToNextStep() {
    if (+this.game.game_type === 2) {
      const profileItems = this.profiles.filter((item) => {
        return !item.profile_id;
      });
      if (profileItems.length && !profileItems[0].profile_id) {
        this.addGameProfile(profileItems[0], true);
      } else {
        this.redirectToGames();
      }
    } else if (+this.game.game_type === 1 && !this.selectedProfile.profile_id && !this.is_profile_added) {
      this.addGameProfile(this.selectedProfile, true);
    } else if (+this.game.game_type === 1 && this.selectedProfile.profile_id && this.game.game_state === 'DRAFT') {
      // this.selectedProfile.doneCliked = true;
      this.checkGameReadiness(this.selectedProfile);
    } else if (this.selectedProfile.profile_id) {
      this.redirectToGames();
    } else {
      this.checkGameReadiness(this.selectedProfile);
    }




    // this.gameService.addProfile
    // if (!this.selectedProfile.video_files) {
    //   this.checkGameReadiness(this.selectedProfile);
    // }

  }

  redirectToGames() {
    this.router.navigate(['/admin/games']);
  }


  checkGameReadiness(profile) {
    if (this.game.game_state === 'DRAFT' && +this.game.game_type === 1) {
      this.gameService.validateGameReadiness(this.storageService.getCompanyId(), this.game.game_id).subscribe(res => {
        // console.log('VALIDATE_GAME_READINESS', res);
        if (res.success) {
          if (res.data.game_is_valid) {
            this.promptForSchedule();
          } else {
            this.redirectToGames();
          }
        }
      });
    } else if (profile && profile.doneCliked) {
      this.redirectToGames();
    }
  }

  promptForSchedule() {
    const dialogRef = this.dialog.open(ConfirmActionComponent);
    dialogRef.componentInstance.message = this.translate.instant('confirm_schedule_game_now');
    dialogRef.componentInstance.positiveButtonText = 'YES';
    dialogRef.componentInstance.negativeButtonText = 'NO';
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.moveToReady();
    });
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.redirectToGames();
    });
  }
  status(value) {
    this.updating = value;
  }
  moveToReady() {
    const payload = { game_id: this.game.game_id, company_id: this.game.company_id, game_state: 'READY' };
    this.gameService.updateGameState(payload).subscribe(() => {
      this.storageService.setObject('scheduling_game', this.game);
      // const url = this.globalService.isCompanyBelongsToCustomField() ? Route.GAME_SCHEDULER : Route.SCHEDULE_GAME;
      const url = Route.SCHEDULE_GAME;
      this.router.navigate([url], { queryParams: { modal: 'add' } });
    });
  }

  addGameProfile(profileToBeAdded, doneCliked = false) {
    // const profileToBeAdded = JSON.parse(JSON.stringify(profile));
    // console.log('doneCliked', doneCliked);
    if (!this.is_profile_added) {

      this.is_profile_added = true;
      if (profileToBeAdded && (!profileToBeAdded.profile_name || !profileToBeAdded.scenario)) {
        return;
      }
      profileToBeAdded.doneCliked = doneCliked;
      this.updating = true;
      this.gameService.addProfile(this.game, profileToBeAdded).subscribe(res => {
        // this.addBtnCliked = false;
        this.updating = false;
        if (!res.success) {
          this.globalService.showMessage(this.apiSerivce.getErrorMessage(res.message_code));
          return;
        }
        this.disableNewProfile = false;
        this.showCheckMark = false;
        const information = [] = this.selectedProfile.information.filter((info) => {
          return info.description !== '' && info.title !== '';
        });
        if (information.length !== 0) {
          this.selectedProfile.information = information;
        }
        // this.globalService.showMessage(this.apiSerivce.getErrorMessage(ErrorCode[res.message_code]));
        this.selectedProfile.profile_id = res.data.profile_id;
        profileToBeAdded.profile_id = res.data.profile_id;
        this.selectedProfile.information[0].video_files = '',
        this.selectedProfile.information[0].video_url = '',
        this.selectedProfile.information[0].document_name = '',
        this.selectedProfile.information[0].video_name = '',
        this.selectedProfile.information[0].document_url = '',
        this.selectedProfile.information[0].pdf_thumbnail_url = '',
        profileToBeAdded.is_linked = true;
        if (profileToBeAdded.video_files) {
          // this.openUploadProgress();
          profileToBeAdded.is_video_uploading = true;
          this.setUpdatedValue(profileToBeAdded);
          // this.selectedProfile.profile_id = res.data.profile_id;
          // this.uploadVideo(this.selectedProfile);
          this.uploadVideo(profileToBeAdded);
        } else if (!profileToBeAdded.video_files && profileToBeAdded.doneCliked) {
          this.checkGameReadiness(this.selectedProfile);
        } else if (!profileToBeAdded.video_files) {
          // this.checkGameReadiness(this.selectedProfile);
        }

      });
    }
  }
  uploadVideo(profile) {
    +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Game_Preview_Video') :
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Game_Profile_Video');
    const company_name = this.company['company_name'];
    const company_identifier = company_name.replace(/\s/g, '');
    // const filename = 'profile-name'; // FIXME, HARDCODED
    const path = environment.env_name + '/' + company_identifier + '/company/game-profiles/' + profile.profile_id + '_' + this.selectedLanguage + '.mp4';
    this.uploadAsset(this.videoURL, path, profile);
  }
  fileChangeEvent(event: any, profileToBeAdded): void {
    const type = event.target.files[0].type;
    // const videoSize = event.target.files[0].size / 1024 / 1024;
    if (type.toLowerCase().indexOf('mp4') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('select_mp4'), false, 'OK');
      return;
    }

    // if (videoSize && videoSize > 10) { //10 MB
    //   this.showAlert('File Too Large', 'Video file size cannot be more than 10 MB.', false, 'OK');
    //   return;
    // }

    if (event.target.files && event.target.files[0]) {
      this.is_video = true;
      this.videoURL = event.target.files[0];
      this.selectedProfile.video_files = event.target.files[0];
      this.profileVideo.nativeElement.src = URL.createObjectURL(event.target.files[0]);
      if (this.selectedProfile.profile_id) {
        // this.video_is_uploading = true;
        profileToBeAdded.is_video_uploading = true;
        this.setUpdatedValue(profileToBeAdded);
        this.uploadVideo(this.selectedProfile);
        // this.openUploadProgress();
      }
    }
  }

  checkPdfFileType(type) {
    if (type.toLowerCase().indexOf('pdf') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('select_pdf'), false,
        this.translate.instant('ok').toUpperCase());
      return false;
    }
    return true;
  }

  checkPdfFileSize(size) {
    if (size > (15 * (Math.pow(10, 6)))) { // file size validation
      this.showAlert(this.translate.instant('file_too_large'), this.translate.instant('invalid_pdf_size'), false,
        this.translate.instant('ok').toUpperCase());
      return false;
    }
    return true;
  }

  uploadPdfEvent(event, selectedProfile) {
    // console.log('ispdf', this.isPdfUpdating)
    +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Game_Preview_PDF') :
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Game_Profile_PDF');
    const that = this;
    const type = event.target.files[0].type;
    const size = event.target.files[0].size;
    if (!this.checkPdfFileType(type)) { return; }
    if (!this.checkPdfFileSize(size)) { return; }
    
    // Clear the old thumbnail immediately when new PDF is selected
    if (that.selectedProfile.pdf_thumbnail_url) {
      // Clear the cached thumbnail before uploading new PDF
      that.getImageURLService.deleteSpecificCache(that.selectedProfile.pdf_thumbnail_url);
    }
    that.selectedProfile.pdf_thumbnail_url = '';
    
    that.isPdfUpdating = true;
    const file = event.target.files[0];
    const company_name = this.company['company_name'];
    const company_identifier = company_name.replace(/\s/g, '');
    const path = environment.env_name + '/' + company_identifier + '/company/game-profiles/'
      + selectedProfile.profile_id + '_' + this.selectedLanguage + '.pdf';
    this.uploaderService.upload(path, file, function (err, data) {
      if (err) {
        that.showAlert(that.translate.instant('error'), that.translate.instant('problem_uploading'), false,
          that.translate.instant('ok').toUpperCase());
        return;
      }
      if (data) {
        const url = data.Location;
        that.imageUrlUpdated(url)
        // that.selectedProfile.document_url = url;
        // const regex = new RegExp('(?!/?.+/)[^/]+(?=\\.pdf)');
        that.saveProfile('document_url', url, selectedProfile);
        that.shouldUploadThumbnail = true;
        if (that.pdfProgress.openDialog && !that.selectedProfile.pdf_thumbnail_url) {
          that.openUploader();
        }
        // if (that.selectedProfile.document_name) { return; }
        that.selectedProfile.document_name = file.name.replace('.pdf', '').substring(0, 70);
        that.saveProfile('document_name', that.selectedProfile.document_name, selectedProfile);
      }
      that.isPdfUpdating = false;
    }, true, this.translate.instant('uploading'), 'application/pdf');
  }
  uploadPdfThumbnail(base64Img) {
    if (!this.shouldUploadThumbnail) { return; }
    const company_name = this.company['company_name'];
    const company_identifier = company_name.replace(/\s/g, '');
    const path = environment.env_name + '/' + company_identifier + '/company/game-profiles/'
      + this.selectedProfile.profile_id + '_' + this.selectedLanguage + '.jpeg';
    const that = this;
    this.uploaderService.upload(path, this.dataURLtoBlob(base64Img), function (err, data) {
      if (err) {
        that.showAlert(that.translate.instant('error'), that.translate.instant('problem_uploading'), false,
          that.translate.instant('ok').toUpperCase());
        return;
      }
      if (data) {
        const url = data.Location;
        that.selectedProfile.pdf_thumbnail_url = url;
        that.saveProfile('pdf_thumbnail_url', url, that.selectedProfile);
        that.pdfProgress.count = 100;
        that.tempDocName = that.selectedProfile.document_name;
        // Reset the flag after successful upload
        that.shouldUploadThumbnail = false;
      }
    }, false, this.translate.instant('uploading'), 'image/jpeg');
  }

  dataURLtoBlob(dataURL) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURL.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURL.split(',')[1]);
    } else {
      byteString = unescape(dataURL.split(',')[1]);
    }

    // separate out the mime component
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  updatePdfName(event, selectedProfile, hasChanged) {
    if (!hasChanged) { return; }
    if (!event.target.value) {
      this.selectedProfile.document_name = this.tempDocName;
      return;
    }
    this.selectedProfile.document_name = event.target.value;
    this.saveProfile('document_name', this.selectedProfile.document_name, selectedProfile);
    this.tempDocName = this.selectedProfile.document_name;

  }

  updateVideoName(event, selectedProfile, hasChanged) {
    if (!hasChanged) { return; }
    if (!event.target.value) {
      this.selectedProfile['video_name'] = this.tempVideoName;
      return;
    }
    this.selectedProfile.video_name = event.target.value;
    this.saveProfile('video_name', this.selectedProfile.video_name, selectedProfile);
    this.tempVideoName = this.selectedProfile.video_name;

  }

  openPdfViewer(selectedProfile) {
    this.dialog.open(PdfPreviewComponent, {
      data: selectedProfile
    });
  }
  openUploader() {
    this.pdfProgress.count = 0;
    const dialogReference = this.dialog.open(UploadingProgressComponent, {
      data: this.pdfProgress,
      disableClose: true
    });
    dialogReference.componentInstance.uploadTitle = this.translate.instant('creating_thumbnail');
    this.pdfProgress.openDialog = false;
    dialogReference.afterClosed().subscribe(() => {
      this.pdfProgress.openDialog = true;
    });

  }

  // callBackFn(pdf: PDFDocumentProxy) {
  //   console.log(' m here');
  //   setTimeout(() => {
  //     const canvas = <HTMLCanvasElement>document.getElementById('page1');
  //     // this.selectedProfile.pdf_thumbnail_url = canvas.toDataURL('image/jpeg');
  //     // this.uploadPdfThumbnail(canvas.toDataURL('image/jpeg'));
  //     console.log(' m here');
  //   }, 1000);
  // }

  pageRendered(e, doc) {
    if (e.pageNumber == 1) {
        // (doc.pageNo = e.pageNumber),
        // (doc.pdf_thumbnail_url = e.source.canvas.toDataURL());
        
        // Check if we need to upload thumbnail (either new upload or default thumbnail replacement)
        if (this.shouldUploadThumbnail || this.isDefaultThumbnail(this.selectedProfile.pdf_thumbnail_url)) {
          this.shouldUploadThumbnail = true;
          this.uploadPdfThumbnail(e.source.canvas.toDataURL());
        }
    }    
  }

  onProgress(progressData: PDFProgressData) {
    if (this.pdfProgress.count < 95) {
      this.pdfProgress.count = Math.round(((progressData.loaded / progressData.total) * 100));
    }
    this.isPdfLoading = (progressData.loaded !== progressData.total);
  }

  removePdf() {
    const dialogRef = this.dialog.open(ConfirmActionComponent);
    dialogRef.componentInstance.title = this.translate.instant('remove_item_from_game');
    dialogRef.componentInstance.message = this.translate.instant('confirm_pdf_removal_msg');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('yes').toUpperCase();
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('no').toUpperCase();
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.selectedProfile.pdf_thumbnail_url = '';
      this.tempDocName = '';
      this.selectedProfile.document_name = '';
      this.selectedProfile.document_url = '';
      this.saveProfile('remove_document', true, this.selectedProfile);
    });
  }
  // openUploadProgress() {
  //   const dialogReference = this.dialog.open(UploadingProgressComponent, {
  //     // data: event
  //     disableClose: true
  //   });
  // }


  showAlert(title, message, isMultiOption, positiveButtonText) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = isMultiOption;
    dialogReference.componentInstance.positiveButtonText = positiveButtonText;
  }
  updateVideo(videoKey, subProfile, selectedProfile) {
    this.showConfirmationPopup(videoKey, subProfile, selectedProfile);
  }

  showConfirmationPopup(videoKey, subProfile, selectedProfile) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_this_video');
    dialogRef.componentInstance.negativeButtonText = 'YES';
    dialogRef.componentInstance.positiveButtonText = 'NO';
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.removeVideo();
      subProfile = '';
      this.saveProfile(videoKey, subProfile, selectedProfile);
      this.saveProfile('video_name', '', selectedProfile);
    });
  }

  confirmationForDeleteProfile(profile) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_this_profile');
    dialogRef.componentInstance.negativeButtonText = 'YES';
    dialogRef.componentInstance.positiveButtonText = 'NO';
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      if (profile.profile_id) {
        this.callToDeleteProfile(profile);
      } else {
        this.disableNewProfile = false;
        this.profiles.splice(0, 1);
        if (this.profiles.length) {
          this.profileSelected(this.profiles[0]);
        } else {
          this.addNewProfile();
        }

      }
    });
  }

  removeVideo() {
    this.selectedProfile.video_url = '';
    this.selectedProfile.video_name = '';
    this.profileVideo.nativeElement.src = '';
    this.is_video = false;
  }
  addScenario() {
    const scenario = {
      title: '',
      description: '',
      name: Math.floor(Math.random() * 1000000000),
      video_url: '', video_name:'', video_files: '', document_url: '', document_name: '', pdf_thumbnail_url: '', is_video_ForInfo: false
    };
    this.selectedProfile.information.push(scenario);
  }
  removeScenario(subProfile) {
    const scenarioID = this.selectedProfile.information.indexOf(subProfile);
    this.selectedProfile.information.splice(scenarioID, 1);
    this.checkvalidation(this.selectedProfile);
    if (subProfile.title && subProfile.description) {
      this.saveProfile('information', subProfile, this.selectedProfile);
    }
  }
  uploadAsset(file, path, profile) {
    const that = this;
    // this.isVideoUploading = true;
    this.uploaderService.upload(path, file, function (err, data) {
      // that.isVideoUploading = false;
      if (err) {
        // that.showAlert('Error', 'There was a problem uploading your file. Please try again.');
        this.showAlert(this.translate.instant('error'), this.translate.instant('problem_uploading'), false, 'OK');
        return;
      }
      if (data) {
        // that.video_is_uploading = false;
        const url = data.Location;
        // that.selectedProfile.video_url = url;
        // if (that.selectedProfile && that.selectedProfile.profile_id) {
        profile.video_url = url;
        profile.video_name = file.name.replace('.mp4', '');
        profile.is_video_uploading = false;
        that.saveProfile('video_url', url, profile);
        that.saveProfile('video_name', profile.video_name, profile);
        if (that.selectedProfile.video_files && profile.doneCliked) {
          // that.router.navigate(['/admin/games']);
          that.checkGameReadiness(profile);
        }
        // this.getProfiles();
        // }
        // this.saveProfile()
      }
    }, true, this.translate.instant('uploading'), 'video/mp4');
  }
  updateChanges(hasChanged, key, value, selectedProfile) {
    if (key === 'scenario') {
      this.addEvent(key);
      value = this.findElements('a', value);
    }
    if (key === 'information') {
      let temp = true;
      this.selectedProfile.information.forEach(element => {
        let isValid: boolean;
        isValid = this.checkValidation(element);
        temp = temp && isValid;
        this.gameService.informationValidation(temp);
        element.description = this.findElements('a', element.description);
      });
    }
    if (hasChanged) {
      if (selectedProfile.profile_id) {
        this.saveProfile(key, value, selectedProfile);
      } else {
        this.addGameProfile(selectedProfile);
      }
    }
  }

  addEvent(key) {
    switch (key) {
      case 'scenario':
        +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Game_Preview_Game_Details') :
          this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Game_Profile_Scenario');
        break;
      case 'profile_name':
        +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Game_Preview_Title') :
          this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Game_Profile_Title');
        break;
      case 'information':
        +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Game_Preview_Information') :
          this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Game_Profile_Information');
        break;
    }
  }
  checkEmpty(scenario = null) {
    //  console.log('checkEmpty');
    if (this.myEditor && this.myEditor.editorInstance) {
      const dataWithoutSpace = this.checktextEditorEmpty(scenario);
      if (dataWithoutSpace && dataWithoutSpace.length > 0 && dataWithoutSpace.length <= 1500) {
        this.gameService.scanerioValidation(true);
        return true;
      } else {
        this.gameService.scanerioValidation(false);
        return false;
      }
    }
  }
  checkValidation(profileData) {
    // console.log('checkValidation');
    const dataWithoutSpace = this.checktextEditorEmpty(profileData.description);
    if (dataWithoutSpace) {
      if (dataWithoutSpace.length > 0 && dataWithoutSpace.length <= 5000 && profileData.title.length > 0) {
        this.gameService.informationValidation(true);
        return true;
      } else {
        this.gameService.informationValidation(false);
        return false;
      }
    } else if (!dataWithoutSpace && profileData.title.trim().length === 0) {
      return true;
    } else {
      this.gameService.informationValidation(false);
      return false;
    }
  }
  checkValidationKey(profileData) {
    const dataWithoutSpace = this.checktextEditorEmpty(profileData.description);
    if (dataWithoutSpace && dataWithoutSpace.length > 0 && dataWithoutSpace.length <= 5000 && profileData.title.length > 0) {
      this.gameService.informationValidation(true);
      return true;
    } else {
      this.gameService.informationValidation(false);
      return false;
    }
  }
  checktextEditorEmpty(value) {
    const data = value;
    const regex = /(<([^>]+)>)/ig;
    if (data) {
      const result = data.replace(regex, '');
      const dataWithoutTag = result.replace(/&nbsp;/gi, '');
      const dataWithoutSpace = dataWithoutTag.trim();
      // console.log(dataWithoutSpace);
      return dataWithoutSpace;
    }
  }
  checktextEditorLength(value) {
    if (value && value.length) {
      const data = value;
      const regex = /(<([^>]+)>)/ig;
      const result = data.replace(regex, '');
      const dataWithoutTag = result.replace(/&nbsp;/gi, '');
      const dataWithoutSpace = dataWithoutTag.trim();
      return dataWithoutSpace.length;
    }
  }
  checkISRequired(title) {
    if (title.length === 0) {
      return true;
    }
  }

  findElements(tag, value) {
    const div = document.createElement('div');
    div.innerHTML = value;
    const elements = div.getElementsByTagName(tag);
    const found = [];
    for (let i = 0; i < elements.length; i++) {
      // console.log(elements[i]);
      // console.log(elements[i].getAttribute('href'));
      elements[i].href = this.addhttp(elements[i].getAttribute('href'));
    }
    // console.log('found', div.innerHTML);
    // console.log('value', value);
    return div.innerHTML;
  }
  addhttp(url) {
    console.log(url);
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
      url = 'http://' + url;
    }
    return url;
  }

  uploadPdfEventForInformation(event, selectedProfile, subProfile, index) {
    this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Game_Preview_PDF');    
    const that = this;
    const type = event.target.files[0].type;
    const size = event.target.files[0].size;
    if (!that.checkPdfFileType(type)) { return; }
    if (!that.checkPdfFileSize(size)) { return; }
    
    // Clear the old thumbnail immediately when new PDF is selected
    that.selectedProfile.information.forEach(profile => {
      if (profile.name === subProfile.name) {
        // Clear the cached thumbnail before uploading new PDF
        if (profile.pdf_thumbnail_url) {
          that.getImageURLService.deleteSpecificCache(profile.pdf_thumbnail_url);
        }
        profile.pdf_thumbnail_url = '';
      }
    });
    
    that.isPdfUpdatingForInfo = true;
    const file = event.target.files[0];
    const company_name = this.company['company_name'];
    const company_identifier = company_name.replace(/\s/g, '');
    const path = environment.env_name + '/' + company_identifier + '/company/game-profiles/'
      + selectedProfile.profile_id + `_pdf_info_${index}` + '_' + this.selectedLanguage + '.pdf';
    this.uploaderService.upload(path, file, function (err, data) {
      if (err) {
        that.showAlert(this.translate.instant('error'), that.translate.instant('problem_uploading'), false,
          that.translate.instant('ok').toUpperCase());
        return;
      }
      if (data) {
        const url = data.Location;
        that.selectedProfile.information.forEach(profile => {
          if (profile.name === subProfile.name) {
            that.imageUrlUpdatedForInformation(url,profile)
            // profile.document_url = url;
          }
        });
        that.saveProfile('information', subProfile, that.selectedProfile);
        that.shouldUploadThumbnail = true;
        // that.openUploader();
        console.log('that.selectedProfile', that.selectedProfile, that.pdfProgress.openDialog)
        if (that.pdfProgress.openDialog && !subProfile.pdf_thumbnail_url) {
          that.openUploader();
        }
        // if (that.selectedProfile.document_name) { return; }
        that.selectedProfile.information.forEach(profile => {
          if (profile.name === subProfile.name) {
            profile.document_name = file.name.replace('.pdf', '').substring(0, 70);
          }
        });
        that.saveProfile('information', subProfile, that.selectedProfile);
        // that.saveProfile('document_name', that.selectedProfile.document_name, selectedProfile);
      }
    }, true, this.translate.instant('uploading'), 'application/pdf');
  }

  updatePdfNameForInformation(event, subProfile, hasChanged) {
    if (!hasChanged) { return; }
    if (!event.target.value) {
      this.selectedProfile.information.forEach(profile => {
        if (profile.name === subProfile.name) {
          profile.document_name = this.tempDocName;
        }
      });
      return;
    }
    this.selectedProfile.information.forEach(profile => {
      if (profile.name === subProfile.name) {
        profile.document_name = event.target.value;
        this.tempDocName = profile.document_name;
      }
    });
    this.saveProfile('information', subProfile, this.selectedProfile);
    // this.saveProfile('document_name', this.selectedProfile.document_name, selectedProfile);
  }

  updateVideoNameForInformation(event, subProfile, hasChanged) {
    if (!hasChanged) { return; }
    if (!event.target.value) {
      this.selectedProfile.information.forEach(profile => {
        if (profile.name === subProfile.name) {
          profile.video_name = this.tempVideoName;
        }
      });
      return;
    }
    this.selectedProfile.information.forEach(profile => {
      if (profile.name === subProfile.name) {
        profile.video_name = event.target.value;
        this.tempVideoName = profile.document_name;
      }
    });
    this.saveProfile('information', subProfile, this.selectedProfile);
    // this.saveProfile('document_name', this.selectedProfile.document_name, selectedProfile);
  }

  callBackFnForInformation(pdf: PDFDocumentProxy, index, subProfile) {
    console.log(' m here for info');
    setTimeout(() => {
      const canvas = <HTMLCanvasElement>document.getElementById('page1');
      let pdfthumbnailUrl = '';
      this.selectedProfile.information.forEach(profile => {
        if (profile.name === subProfile.name) {
          // profile.pdf_thumbnail_url = canvas.toDataURL('image/jpeg');
          pdfthumbnailUrl = canvas.toDataURL('image/jpeg');
        }
      });
      console.log('canvas', canvas);
      this.uploadPdfThumbnailForInformation(index, subProfile, pdfthumbnailUrl);
    }, 1000);
  }
  pageRenderedSubProfile(e, subProfile,index) {
    let pdfthumbnailUrl = '';
    if (e.pageNumber == 1) {
      // (subProfile.pageNo = e.pageNumber),
      let shouldUpload = false;
      this.selectedProfile.information.forEach(profile => {
        if (profile.name === subProfile.name) {
          // profile.pdf_thumbnail_url = canvas.toDataURL('image/jpeg');
          pdfthumbnailUrl = e.source.canvas.toDataURL();
          
          // Check if we need to upload thumbnail (either new upload or default thumbnail replacement)
          if (this.shouldUploadThumbnail || this.isDefaultThumbnail(profile.pdf_thumbnail_url)) {
            shouldUpload = true;
          }
        }
      });
        // (doc.pdf_thumbnail_url = e.source.canvas.toDataURL());
        // this.uploadPdfThumbnail(e.source.canvas.toDataURL());
        if (shouldUpload) {
          this.shouldUploadThumbnail = true;
          this.uploadPdfThumbnailForInformation(index, subProfile, pdfthumbnailUrl);
        }
    }    
  }

  uploadPdfThumbnailForInformation(index, subProfile, pdfthumbnailUrl) {
    if (!this.shouldUploadThumbnail) { return; }
    const company_name = this.company['company_name'];
    const company_identifier = company_name.replace(/\s/g, '');
    const path = environment.env_name + '/' + company_identifier + '/company/game-profiles/'
      + this.selectedProfile.profile_id + `_pdf_info_${index}` + '_' + this.selectedLanguage + '.jpeg';
    const that = this;
    this.uploaderService.upload(path, this.dataURLtoBlob(pdfthumbnailUrl), function (err, data) {
      if (err) {
        that.showAlert(that.translate.instant('error'), that.translate.instant('problem_uploading'), false,
          that.translate.instant('ok').toUpperCase());
        return;
      }
      if (data) {
        const url = data.Location;
        that.selectedProfile.information.forEach(profile => {
          if (profile.name === subProfile.name) {
            profile.pdf_thumbnail_url = url;
          }
        });
        that.saveProfile('information', subProfile, that.selectedProfile);
        that.pdfProgress.count = 100;
        that.selectedProfile.information.forEach(profile => {
          if (profile.name === subProfile.name) {
            that.tempDocName = profile.document_name;
          }
        });
        // that.tempDocName = that.selectedProfile.document_name;
      }
      that.isPdfUpdatingForInfo = false;
    }, false, this.translate.instant('uploading'), 'image/jpeg');
  }

  updateVideoForInformation(videoKey, subProfile, selectedProfile) {
    this.showConfirmationPopupForVideoInformation(videoKey, subProfile, selectedProfile);
  }

  uploadVideoForInformation(profile, index, subprofile) {
    this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Game_Preview_Video');    
    if (this.company) {
      const company_name = this.company['company_name'];
      const company_identifier = company_name.replace(/\s/g, '');
      // const filename = 'profile-name'; // FIXME, HARDCODED
      const path = environment.env_name + '/' + company_identifier + '/company/game-profiles/' + profile.profile_id + `_video_info_${index}` + '_' + this.selectedLanguage + '.mp4';
      this.uploadAssetForInformation(this.videoURL, path, profile, subprofile);
    }
  }

  fileChangeEventForInformation(event: any, profileToBeAdded): void {
    const type = event.target.files[0].type;
    // const videoSize = event.target.files[0].size / 1024 / 1024;
    if (type.toLowerCase().indexOf('mp4') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('select_mp4'), false, 'OK');
      return;
    }

    // if (videoSize && videoSize > 10) { //10 MB
    //   this.showAlert('File Too Large', 'Video file size cannot be more than 10 MB.', false, 'OK');
    //   return;
    // }

    if (event.target.files && event.target.files[0]) {
      this.videoURL = event.target.files[0];
      this.selectedProfile.information.forEach(profile => {
        if (profile.name === profileToBeAdded.name) {
          profile.video_files = event.target.files[0];
          profile.is_video_ForInfo = true;
        }
      });
      // this.profileVideoForInfo.nativeElement.src = URL.createObjectURL(event.target.files[0]);
      const video_id = 'video' + profileToBeAdded.name;
      this.profileVideoForInfo._results.forEach(element => {
        if (element.nativeElement.id === video_id) {
          element.nativeElement.src = URL.createObjectURL(event.target.files[0]);
        }
      });
      if (this.selectedProfile.profile_id) {
        // this.video_is_uploading = true;
        profileToBeAdded.is_video_uploading = true;
        // this.setUpdatedValueForInformation(this.selectedProfile);
        const index = this.selectedProfile.information.indexOf(profileToBeAdded);
        this.uploadVideoForInformation(this.selectedProfile, index, profileToBeAdded);
        // this.openUploadProgress();
      }
    }
  }

  uploadAssetForInformation(file, path, profile, subProfile) {
    const that = this;
    this.uploaderService.upload(path, file, function (err, data) {
      if (err) {
        this.showAlert(this.translate.instant('error'), this.translate.instant('problem_uploading'), false, 'OK');
        return;
      }
      if (data) {
        const url = data.Location;
        let videoFiles = '';
        profile.information.forEach(subprofile => {
          if (subProfile.name === subprofile.name) {
            subprofile.video_url = url;
            subprofile.video_name = file.name.replace('.mp4', '');
            videoFiles = subprofile.video_files;
          }
        });
        profile.is_video_uploading = false;
        that.saveProfile('information', subProfile, profile);
        if (videoFiles && profile.doneCliked) {
          that.checkGameReadiness(profile);
        }
        // that.checkInformationValidation(profile);
      }
    }, true, this.translate.instant('uploading'), 'video/mp4');
  }

  removeVideoForInformation(subProfile) {
    this.selectedProfile.information.forEach(profile => {
      if (profile.name === subProfile.name) {
        profile.video_url = '';
        profile.video_name = '';
        profile.is_video_ForInfo = false;
        profile['is_video_uploading'] = false;
        profile.video_files = '';
      }
    });
    const video_id = 'video' + subProfile.name;
    this.profileVideoForInfo._results.forEach(element => {
      if (element.nativeElement.id === video_id) {
        element.nativeElement.src = '';
        element.is_video_ForInfo = false;
        element['is_video_uploading'] = false;
        element.video_files = '';
      }
    });
    // this.profileVideoForInfo.nativeElement.src = '';
    this.saveProfile('information', subProfile, this.selectedProfile);
  }

  showConfirmationPopupForPdfInformation(subProfile) {
    const dialogRef = this.dialog.open(ConfirmActionComponent);
    dialogRef.componentInstance.title = this.translate.instant('remove_item_from_game');
    dialogRef.componentInstance.message = this.translate.instant('confirm_pdf_removal_msg');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('yes').toUpperCase();
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('no').toUpperCase();
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.removePdfForInformation(subProfile);
      this.saveProfile('information', subProfile, this.selectedProfile);
    });
  }

  showConfirmationPopupForVideoInformation(videoKey, subProfile, selectedProfile) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_this_video');
    dialogRef.componentInstance.negativeButtonText = 'YES';
    dialogRef.componentInstance.positiveButtonText = 'NO';
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.removeVideoForInformation(subProfile);
      subProfile = '';
      this.saveProfile(videoKey, subProfile, selectedProfile);
    });
  }

  removePdfForInformation(subProfile) {
    this.selectedProfile.information.forEach(subprofile => {
      if (subProfile.name === subprofile.name) {
        subprofile.pdf_thumbnail_url = '';
        this.tempDocName = '';
        subprofile.document_name = '';
        subprofile.document_url = '';
      }
    });
  }

  noSpace(event = null, value = null) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 32 && !value.trim().length) {
      return false;
    }
  }
  // setUpdatedValueForInformation(selectedProfile) {
  //   const profileItem = this.profiles.filter((item) => {
  //     return item.profile_id === selectedProfile.profile_id;
  //   });
  //   if (profileItem.length) {
  //     this.profiles.filter((profile) => {
  //       if (profile.profile_id === selectedProfile.profile_id) {
  //         const index = this.profiles.indexOf(profile);
  //         this.profiles[index] = selectedProfile;
  //       }
  //     });
  //   } else {
  //     // this.profiles.unshift(selectedProfile);
  //   }
  //   console.log('profiles', this.profiles);

  // }
  // checkProtocol(value) {
  //   console.log(value);
  //   retun this.findElements('a', value);
  // }
  // isAnchor(str) {
  //   return /^\<a.*\>.*\<\/a\>/i.test(str);
  // }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset Company selectinn filter
    this.headerService.showCompanyFilter(true);
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const ignoreCache = true;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl,ignoreCache);
    this.getImageURLService.getURL(relativePath, function (err, data) {
      console.log(data)        
      that.selectedProfile.document_url = data;
    });  
  }
  imageUrlUpdatedForInformation(url, profile){
    const that = this;
    const ignoreCache = true;
    const relativePath = this.getImageURLService.trimmedURLValue(url,ignoreCache);
    this.getImageURLService.getURL(relativePath, function (err, data) {
      console.log(data)        
      profile.document_url  = data;
    });  
  }
  imageUrlUpdatedForProfile(url, profile){
    const that = this;
    const ignoreCache = true;
    const relativePath = this.getImageURLService.trimmedURLValue(url,ignoreCache);
    this.getImageURLService.getURL(relativePath, function (err, data) {
      profile.document_url  = data;
    });  
  }
  imageUrlUpdatedForVideo(url){
    if(url.includes('jwplatform')){
      this.profileVideo.nativeElement.src = url;
      return;
    }
    const that = this;
    const ignoreCache = true;
    const relativePath = this.getImageURLService.trimmedURLValue(url,ignoreCache);
    console.log(relativePath)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      console.log('time',data)        
      // profile.document_url  = data;
      // that.selectedProfile.video_url = data;
      that.profileVideo.nativeElement.src = data;

    });  
  }
  imageUrlUpdatedForVideoInfo(info){
    if(info.video_url.includes('jwplatform')){
      info.video_url = info.video_url;
      return;
    }
    const that = this;
    const ignoreCache = true;
    const relativePath = this.getImageURLService.trimmedURLValue(info.video_url,ignoreCache);
    console.log(relativePath)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      console.log(data)        
      // profile.document_url  = data;
      // that.selectedProfile.video_url = data;
      info.video_url = data;

    });  
  }
  getGameDetails(gameid) {
    const managerId = this.storageService.getLoginUserID();
    this.selectedLanguage = this.storageService.getGameLanguage();
    const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    this.gamesService.getGameDetails(gameid, this.storageService.getCompanyId(), managerId, selectedLanguage).subscribe(res => {
      if (res.success) {
       this.game.game_name = res.data.game_name
        this.game['default_lang_id'] = res.data.default_lang_id
        this.game['game_logo'] = res.data.game_image_url
          // this.imageUrlUpdated(res.data.game_image_url);
        this.isLangugeChanged = false;
        // this.breadcrumbService.updateBreadcrumbLabel(this.game.game_name);
        const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
        breadcrumbs[1].key = this.game.game_name;
        // breadcrumbs[2].key = this.shopGame.game_name;
      }
    });
  }

  /**
   * Check if the thumbnail URL is a default/generic thumbnail
   * @param thumbnailUrl - The thumbnail URL to check
   * @returns true if it's a default thumbnail, false otherwise
   */
  isDefaultThumbnail(thumbnailUrl: string): boolean {
    if (!thumbnailUrl) {
      return false;
    }
    return thumbnailUrl.includes(this.DEFAULT_THUMBNAIL_PATTERN);
  }

}
