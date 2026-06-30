import { HttpClientTestingModule} from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { imports } from 'src/app/app-testing.imports';
import { providers } from 'src/app/app-testing.providers';
import { GamesService } from 'src/app/services/games/games.service';
import { LoginService } from 'src/app/services/login/login.service';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';

import { AddGameHeaderComponent } from './add-game-header.component';

describe('AddGameHeaderComponent', () => {
  let component: AddGameHeaderComponent;
  let fixture: ComponentFixture<AddGameHeaderComponent>;
  let requestSpy: any;
  let translate: TranslateService;

  
  const gamesServicestub = jasmine.createSpyObj('GamesService', ['updatePinGame', 'getGameCategories', 'getStaticIcons']);
  const loginServicestub = jasmine.createSpyObj('LoginService', ['getSettings']);

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		setTimeout(function() {
			done();
		}, 500);
		TestBed.configureTestingModule({
			declarations: [ AddGameHeaderComponent ],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
			imports: [ imports ],
			providers: [ { provide: GamesService , useValue: gamesServicestub }, { provide: LoginService , useValue: loginServicestub }, TranslateService, providers ]
		}).compileComponents();
  });

  beforeEach(() => {
    requestSpy = jasmine.createSpyObj('RequestManagerService', ['get', 'put', 'post']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        ApiService,
        { provide: RequestManagerService, useValue: requestSpy },
      ]
    });
    translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture = TestBed.createComponent(AddGameHeaderComponent);
    component = fixture.componentInstance;
    const mockGameService = [];
    const mockLoginService = [];
    gamesServicestub.getGameCategories.and.returnValue(of(mockGameService));
    gamesServicestub.getStaticIcons.and.returnValue(of(mockGameService));
    gamesServicestub.updatePinGame.and.returnValue(of(mockGameService));
    gamesServicestub.textEditorValidation$ = of(true);
    gamesServicestub.textEditorValidationInformation$ = of(true);
    loginServicestub.getSettings.and.returnValue(of(mockLoginService));
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should check game is pinned', waitForAsync(() => {
    let gameObj={
      company_id: 353,
      created_on: "2022-05-26 07:44:58.0",
      game_category: "Uncategorized",
      game_category_id: 10679,
      game_id: 5774,
      game_image_url: "",
      game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
      game_mode: "",
      game_name: "New Game 1682",
      game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=13e7df8cff879db6b7602800a1e4a303&type=1",
      game_state: "DRAFT",
      game_type: "1",
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_pinned: false,
      is_shop_game: false,
      owner_access_type: "A",
      owner_first_name: "1Huddle",
      owner_id: 1,
      owner_last_name: "Team",
      win_rate: 0,
    }
   
    fixture.detectChanges();
    component.pinGame(gameObj);
    fixture.detectChanges();
    expect(component.pinGamePayload.is_pinned).toBeTruthy();
    fixture.detectChanges();
  }));

  it('should check Pin games is removed', waitForAsync(() => {
    let gameObj={
      company_id: 353,
      created_on: "2022-05-26 07:44:58.0",
      game_category: "Uncategorized",
      game_category_id: 10679,
      game_id: 5774,
      game_image_url: "",
      game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
      game_mode: "",
      game_name: "New Game 1682",
      game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=13e7df8cff879db6b7602800a1e4a303&type=1",
      game_state: "DRAFT",
      game_type: "1",
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_pinned: true,
      is_shop_game: false,
      owner_access_type: "A",
      owner_first_name: "1Huddle",
      owner_id: 1,
      owner_last_name: "Team",
      win_rate: 0,
    }
   
    fixture.detectChanges();
    component.pinGame(gameObj);
    fixture.detectChanges();
    expect(component.pinGamePayload.is_pinned).toBeFalsy();
    fixture.detectChanges();
  }));

  it('should check tooltip message when pin games limit reach', waitForAsync(() => {
    let gameObj = {
      company_id: 353,
      created_on: "2022-06-15 14:24:12.24",
      game_category: "Uncategorized",
      game_category_id: 10679,
      game_id: 5839,
      game_image_url: "",
      game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
      game_mode: "",
      game_name: "New Game 1716",
      game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=86205aaaa8682136713e109ea7847cfe&type=1",
      game_state: "DRAFT",
      game_type: 1,
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_pinned: true,
      is_shop_game: false,
      owner_access_type: "A",
      owner_first_name: "1Huddle",
      owner_id: 1,
      owner_last_name: "Team",
      top_players: [],
      win_rate: 0,
    }
    component.pinGameLimitReached = true;
    fixture.detectChanges();
    component.showPinStatus(gameObj);
    fixture.detectChanges();
    expect(component.tooltipMsg).toBe(translate.instant('pin_games_limit_reach'))
  }));

  it('should check tooltip message when pin games limit not reach', waitForAsync(() => {
    let gameObj = {
      company_id: 353,
      created_on: "2022-06-15 14:24:12.24",
      game_category: "Uncategorized",
      game_category_id: 10679,
      game_id: 5839,
      game_image_url: "",
      game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
      game_mode: "",
      game_name: "New Game 1716",
      game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=86205aaaa8682136713e109ea7847cfe&type=1",
      game_state: "DRAFT",
      game_type: 1,
      icon_id: 9,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_pinned: true,
      is_shop_game: false,
      owner_access_type: "A",
      owner_first_name: "1Huddle",
      owner_id: 1,
      owner_last_name: "Team",
      top_players: [],
      win_rate: 0,
    }
    component.pinGameLimitReached = false;
    fixture.detectChanges();
    component.showPinStatus(gameObj);
    fixture.detectChanges();
    expect(component.tooltipMsg).toBe(translate.instant('click_here_to_pin_game'))
  }));
});
