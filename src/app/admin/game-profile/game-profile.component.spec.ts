import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
   
import { of } from 'rxjs';
import { imports } from 'src/app/app-testing.imports';
import { providers } from 'src/app/app-testing.providers';
import { GamesService } from 'src/app/services/games/games.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';

import { GameProfileComponent } from './game-profile.component';

describe('GameProfileComponent', () => {
  let component: GameProfileComponent;
  let fixture: ComponentFixture<GameProfileComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  const gamesServiceStub = jasmine.createSpyObj('GamesService', ['getProfiles', 'informationValidation', 'saveProfile']);

  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;
  let storageService: StorageService;
  let globalService: GlobalService;
  let permissionService: PermissionsService;
  let uploaderService: UploaderService;
  let gameService: GamesService;

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(function () {
        console.log('inside timeout');
        done();
    }, 500);
    TestBed.configureTestingModule({
      declarations: [ GameProfileComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        { provide: GamesService, useValue: gamesServiceStub },
        TranslateService,
        UploaderService,
        providers,
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    requestSpy = jasmine.createSpyObj('RequestManagerService', ['get', 'put', 'post']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ApiService,
        { provide: RequestManagerService, useValue: requestSpy },
      ]
    });

    translate = TestBed.inject(TranslateService);
    translate.use('en');
    httpTestController = TestBed.inject(HttpTestingController);
    globalService = TestBed.inject(GlobalService);
    storageService = TestBed.inject(StorageService);
    permissionService = TestBed.inject(PermissionsService);
    uploaderService = TestBed.inject(UploaderService);
    gameService = TestBed.inject(GamesService);
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(GameProfileComponent);
    component = fixture.componentInstance;
    const mockGameProfileResponse = [];
    gamesServiceStub.getProfiles.and.returnValue(of(mockGameProfileResponse));
    component.profiles = [
      {
        information: [],
        is_linked: true,
        is_shop_game: false,
        profile_id: 3579,
        profile_information: '[]',
        profile_name: 'About the Game',
        scenario: 'Ready to play?',
        video_url: ''
      }
    ];
    component.game.game_type = 1;

    const mocksaveGameProfileResponse = [];
    gamesServiceStub.saveProfile.and.returnValue(of(mocksaveGameProfileResponse));

    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
    component.getProfiles();
    component.checkValidation(component.selectedProfile);
    expect(component.profiles).toBeTruthy();
  }));

  it('should show pdf and video fields in information section', waitForAsync(() => {

    component.game = {
      company_id: 353,
      created_on: '2022-05-11 10:43:16.0',
      game_category: 'Uncategorized',
      game_category_id: 10679,
      game_id: 5762,
      game_image_url: '',
      game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
      game_mode: '',
      game_name: 'New Game 1671',
      game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=22f123ffef3cbddccd8b808a3d855b45&type=1',
      game_state: 'DRAFT',
      game_type: '1',
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_shop_game: false,
      owner_access_type: 'A',
      owner_first_name: '1Huddle',
      owner_id: 1,
      owner_last_name: 'Team',
      win_rate: 0,
    };

    const divElem = fixture.debugElement.queryAll(By.css('div'));

    expect(divElem[41].nativeNode.className).toBe('info-content');

    const subinfoDivElem: HTMLElement = divElem[41].nativeElement.querySelectorAll('div');

    expect(subinfoDivElem[4].className).toBe('videoSection');

    expect(subinfoDivElem[10].classList[0]).toBe('pdf-section');

  }));

  it('should show multiple information section on add more', waitForAsync(() => {
    component.game = {
      company_id: 353,
      created_on: '2022-05-11 10:43:16.0',
      game_category: 'Uncategorized',
      game_category_id: 10679,
      game_id: 5762,
      game_image_url: '',
      game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
      game_mode: '',
      game_name: 'New Game 1671',
      game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=22f123ffef3cbddccd8b808a3d855b45&type=1',
      game_state: 'DRAFT',
      game_type: '1',
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_shop_game: false,
      owner_access_type: 'A',
      owner_first_name: '1Huddle',
      owner_id: 1,
      owner_last_name: 'Team',
      win_rate: 0,
    };

    const divElem = fixture.debugElement.queryAll(By.css('div'));

    expect(divElem[41].nativeNode.className).toBe('info-content');

    const subinfoDivElem: HTMLElement = divElem[41].nativeElement.querySelectorAll('div');

    expect(subinfoDivElem[18].classList[1]).toBe('addMore');

    expect(component.selectedProfile.information.length).toBe(1);

    subinfoDivElem[18].dispatchEvent(new MouseEvent('click'));

    fixture.detectChanges();

    expect(component.selectedProfile.information.length).toBe(2);

  }));

  it('should detect file input change and upload pdf function being called', waitForAsync(() => {

    component.game = {
      company_id: 353,
      created_on: '2022-05-11 10:43:16.0',
      game_category: 'Uncategorized',
      game_category_id: 10679,
      game_id: 5762,
      game_image_url: '',
      game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
      game_mode: '',
      game_name: 'New Game 1671',
      game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=22f123ffef3cbddccd8b808a3d855b45&type=1',
      game_state: 'DRAFT',
      game_type: '1',
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_shop_game: false,
      owner_access_type: 'A',
      owner_first_name: '1Huddle',
      owner_id: 1,
      owner_last_name: 'Team',
      win_rate: 0,
    };

    const divElem = fixture.debugElement.queryAll(By.css('div'));

    expect(divElem[41].nativeNode.className).toBe('info-content');

    const subinfoDivElem: HTMLElement = divElem[41].nativeElement.querySelectorAll('div');

    expect(subinfoDivElem[12].classList[0]).toBe('pdfInnerSection');

    const uploadPdfBtnElem: HTMLElement = subinfoDivElem[12].childNodes[0].childNodes[1];

    spyOn(component, 'uploadPdfEventForInformation');

    uploadPdfBtnElem.dispatchEvent(new InputEvent('change'));

    fixture.detectChanges();

    expect(component.uploadPdfEventForInformation).toHaveBeenCalled();

  }));

  it('should detect file input change and upload video function being called', waitForAsync(() => {

    component.game = {
      company_id: 353,
      created_on: '2022-05-11 10:43:16.0',
      game_category: 'Uncategorized',
      game_category_id: 10679,
      game_id: 5762,
      game_image_url: '',
      game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
      game_mode: '',
      game_name: 'New Game 1671',
      game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=22f123ffef3cbddccd8b808a3d855b45&type=1',
      game_state: 'DRAFT',
      game_type: '1',
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_shop_game: false,
      owner_access_type: 'A',
      owner_first_name: '1Huddle',
      owner_id: 1,
      owner_last_name: 'Team',
      win_rate: 0,
    };

    const divElem = fixture.debugElement.queryAll(By.css('div'));

    expect(divElem[41].nativeNode.className).toBe('info-content');

    const subinfoDivElem: HTMLElement = divElem[41].nativeElement.querySelectorAll('div');

    expect(subinfoDivElem[4].className).toBe('videoSection');

    const uploadVideoBtnElem: HTMLElement = subinfoDivElem[4].childNodes[4];

    spyOn(component, 'fileChangeEventForInformation');

    uploadVideoBtnElem.dispatchEvent(new Event('change'));

    fixture.detectChanges();

    expect(component.fileChangeEventForInformation).toHaveBeenCalled();

  }));

  it('should remove pdf and video from the payload', waitForAsync(() => {

    component.selectedProfile = {
      document_name: 'dummy',
      document_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579.pdf',
      information: [
        {
          description: '<p><a href="http://www.google.com">cvc</a> jgjfjfru</p>',
          document_name: 'dummy',
          document_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579_pdf_info_0.pdf',
          is_video_ForInfo: true,
          name: 102045516,
          pdf_thumbnail_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579video_info_0.jpeg',
          title: 'fbvx',
          video_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579_info_0.mp4',
          video_files: '',
        }
      ],
      is_shop_game: false,
      pdf_thumbnail_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579.jpeg',
      profile_id: '3579',
      profile_name: 'About the Game',
      scenario: 'Ready to play?',
      video_url: '',
      is_video_uploading: '',
      video_files: '',
    };

    fixture.detectChanges();

    component.removeVideoForInformation(component.selectedProfile.information[0]);

    fixture.detectChanges();

    expect(component.selectedProfile.information[0].video_url).toBe('');

    component.removePdfForInformation(component.selectedProfile.information[0]);

    fixture.detectChanges();

    expect(component.selectedProfile.information[0].pdf_thumbnail_url).toBe('');
    expect(component.selectedProfile.information[0].document_name).toBe('');
    expect(component.selectedProfile.information[0].document_url).toBe('');

  }));

  it('check payload have video and pdf keys', waitForAsync(() => {

    component.selectedProfile = {
      document_name: 'dummy',
      document_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579.pdf',
      information: [
        {
          description: '<p><a href="http://www.google.com">cvc</a> jgjfjfru</p>',
          document_name: 'dummy',
          document_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579_pdf_info_0.pdf',
          is_video_ForInfo: true,
          name: 102045516,
          pdf_thumbnail_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579video_info_0.jpeg',
          title: 'fbvx',
          video_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579_info_0.mp4',
          video_files: '',
        }
      ],
      is_shop_game: false,
      pdf_thumbnail_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3579.jpeg',
      profile_id: '3579',
      profile_name: 'About the Game',
      scenario: 'Ready to play?',
      video_url: '',
      is_video_uploading: '',
      video_files: '',
    };

    fixture.detectChanges();

    component.saveProfile('information', component.selectedProfile.information[0], component.selectedProfile);

    fixture.detectChanges();

    console.log('first', component.profilePayload);

    expect(component.profilePayload['information'][0].video_url).toBeTruthy();
    expect(component.profilePayload['information'][0].document_name).toBeTruthy();
    expect(component.profilePayload['information'][0].document_url).toBeTruthy();
    expect(component.profilePayload['information'][0].pdf_thumbnail_url).toBeTruthy();

  }));

  it('should check add scenario is called', waitForAsync(() => {
    component.game = {
      company_id: 353,
      created_on: '2022-05-11 10:43:16.0',
      game_category: 'Uncategorized',
      game_category_id: 10679,
      game_id: 5762,
      game_image_url: '',
      game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
      game_mode: '',
      game_name: 'New Game 1671',
      game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=22f123ffef3cbddccd8b808a3d855b45&type=1',
      game_state: 'DRAFT',
      game_type: '1',
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_shop_game: false,
      owner_access_type: 'A',
      owner_first_name: '1Huddle',
      owner_id: 1,
      owner_last_name: 'Team',
      win_rate: 0,
    };

    const divElem = fixture.debugElement.queryAll(By.css('div'));

    expect(divElem[41].nativeNode.className).toBe('info-content');

    const subinfoDivElem: HTMLElement = divElem[41].nativeElement.querySelectorAll('div');

    expect(subinfoDivElem[18].classList[1]).toBe('addMore');

    spyOn(component, 'addScenario');

    subinfoDivElem[18].dispatchEvent(new MouseEvent('click'));

    fixture.detectChanges();

    expect(component.addScenario).toHaveBeenCalled();

  }));

});
