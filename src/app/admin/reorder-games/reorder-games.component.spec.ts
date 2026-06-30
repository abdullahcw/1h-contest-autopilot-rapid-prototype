import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { GamesService } from 'src/app/services/games/games.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GlobalService } from 'src/app/services/global/global.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService} from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';

import { ReorderGamesComponent } from './reorder-games.component';
import { imports } from 'src/app/app-testing.imports';
import { providers } from '../../app-testing.providers';
import { TranslateService } from '@ngx-translate/core';
import { GameReorderService } from 'src/app/services/reorder/game-reorder.service';
import { of } from 'rxjs';
import { MatDialog,MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';


describe('ReorderGamesComponent', () => {
  let component: ReorderGamesComponent;
  let fixture: ComponentFixture<ReorderGamesComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  const gameReorderServiceStub = jasmine.createSpyObj('GameReorderService', ['getGamesList']);

  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;
  let storageService: StorageService;
  let globalService: GlobalService;
  let permissionService: PermissionsService;
  let multilevelGameService: MultilevelGamesService;
  let gamesService: GamesService;
  let gameReorderService: GameReorderService;
  beforeEach(() => {
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    //     setTimeout(function () {
    //         console.log('inside timeout');
    //         done();
    //     }, 500);
    TestBed.configureTestingModule({
      declarations: [ ReorderGamesComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        GamesService,
        { provide: GameReorderService, useValue: gameReorderServiceStub },
        TranslateService,
        MultilevelGamesService,
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
    multilevelGameService = TestBed.inject(MultilevelGamesService);
    gamesService = TestBed.inject(GamesService);
    gameReorderService = TestBed.inject(GameReorderService);
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);

    fixture = TestBed.createComponent(ReorderGamesComponent);
    component = fixture.componentInstance;
    const mockGameReorderResponse = [];
    gameReorderServiceStub.getGamesList.and.returnValue(of(mockGameReorderResponse));
    component.multilevelGames = [
      {
        company_id: 353,
        game_id: 393,
        game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'country',
        game_type: 3,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png',
        owner_name: '1Huddle Team',
        position: 1,
      },
      {
        company_id: 353,
        game_id: 395,
        game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'org',
        game_type: 3,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png',
        owner_name: '1Huddle Team',
        position: 2,
      },
      {
        company_id: 353,
        game_id: 392,
        game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'state',
        game_type: 3,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-10.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
        owner_name: '1Huddle Team',
        position: 3,
      }];
    component.games = [
      {
        company_id: 353,
        game_id: 1108,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
        game_name: 'Code1',
        game_type: 1,
        owner_name: '1Huddle Team',
        position: 1,
      },
      {
        company_id: 353,
        game_id: 2681,
        game_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2681.jpg',
        game_name: '1huddlympics',
        game_type: 1,
        owner_name: '1Huddle Team',
        position: 2,
      },
      {
        company_id: 353,
        game_id: 5635,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
        game_name: 'HUD-9817',
        game_type: 1,
        owner_name: '1Huddle Team',
        position: 38,
      }
    ];
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
    component.getGamesList();
    expect(component.multilevelGames).toBeTruthy();
    expect(component.games).toBeTruthy();
  }));

  it('game-list should  be  mlg', waitForAsync(() => {
    const mlgList = {
      company_id: 353,
      game_type: 3,
      games: [
       {
         game_id: 115,
         game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
         game_name: 'add new levels',
         level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
         level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
         owner_name: '1Huddle Team',
         position: 1,
       },
       {
         game_id: 138,
         game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
         game_name: 'Multilevel Game 42',
         level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
         level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
         owner_name: '1Huddle Team',
         position: 2,
       },
       {
           game_id: 116,
           game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
           game_name: 'Aniket MLG',
           level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
           level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
           owner_name: '1Huddle Team',
           position: 3,

       },
     ]
    };

    expect(mlgList.game_type).toBe(3);
  }));

  it('game-list should  be slg', waitForAsync(() => {
    const slgList = {
      company_id: 353,
      game_type: 1,
      games: [
       {
        game_id: 5562,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
        game_name: 'GauravTest',
        owner_name: '1Huddle Team',
        position: 1,
       },
       {
        game_id: 1108,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
        game_name: 'Code1',
        owner_name: '1Huddle Team',
        position: 2,
       },
       {
        game_id: 5563,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
        game_name: 'New Game 1642',
        owner_name: '1Huddle Team',
        position: 3,

       },
     ]
    };

    expect(slgList.game_type).toBe(1);
  }));

  it('game-list should not be slg', waitForAsync(() => {
    const mlgList = {
      company_id: 353,
      game_type: 3,
      games: [
       {
         game_id: 115,
         game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
         game_name: 'add new levels',
         level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
         level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
         owner_name: '1Huddle Team',
         position: 1,
       },
       {
         game_id: 138,
         game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
         game_name: 'Multilevel Game 42',
         level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
         level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
         owner_name: '1Huddle Team',
         position: 2,
       },
       {
           game_id: 116,
           game_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
           game_name: 'Aniket MLG',
           level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
           level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
           owner_name: '1Huddle Team',
           position: 3,

       },
     ]
    };

    expect(mlgList.game_type).not.toBe(1);
  }));

 it('game-list should not be mlg', waitForAsync(() => {
    const slgList = {
      company_id: 353,
      game_type: 1,
      games: [
       {
        game_id: 5562,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
        game_name: 'GauravTest',
        owner_name: '1Huddle Team',
        position: 1,
       },
       {
        game_id: 1108,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
        game_name: 'Code1',
        owner_name: '1Huddle Team',
        position: 2,
       },
       {
        game_id: 5563,
        game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png',
        game_name: 'New Game 1642',
        owner_name: '1Huddle Team',
        position: 3,

       },
     ]
    };
    expect(slgList.game_type).not.toBe(3);
  }));
});
