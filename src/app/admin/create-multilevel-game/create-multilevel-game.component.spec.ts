import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CreateMultilevelGameComponent } from './create-multilevel-game.component';
import { AddItemsComponent } from 'src/app/admin/add-items/add-items.component';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { GamesService } from 'src/app/services/games/games.service';
import { By } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource} from '@angular/material/table';
   
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { TranslateService } from '@ngx-translate/core';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService, EndPoint } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { providers } from '../../app-testing.providers';
import { imports } from '../../app-testing.imports';
import { of } from 'rxjs';


describe('CreateMultilevelGameComponent', () => {
  let component: CreateMultilevelGameComponent;
  let fixture: ComponentFixture<CreateMultilevelGameComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  const gamesServiceStub = jasmine.createSpyObj('GamesService', ['getGames']);
  const multilevelGameServiceStub = jasmine.createSpyObj('MultilevelGamesService', ['getGameDetails', 'updateGameInMultilevelGame', 'addGamesInMultilevelGame']);

  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;
  let permissionService: PermissionsService;
  let multilevelGameService: MultilevelGamesService;
  let gamesService: GamesService;

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      setTimeout(() => {
        done();
      }, 500);
    TestBed.configureTestingModule({
      declarations: [ CreateMultilevelGameComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        { provide: GamesService, useValue: gamesServiceStub },
        { provide: MultilevelGamesService, useValue: multilevelGameServiceStub },
        TranslateService,
        providers
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
    permissionService = TestBed.inject(PermissionsService);
    multilevelGameService = TestBed.inject(MultilevelGamesService);
    gamesService = TestBed.inject(GamesService);
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(CreateMultilevelGameComponent);
    component = fixture.componentInstance;
    const mockSinglelevelGameResponse = [];
    gamesServiceStub.getGames.and.returnValue(of(mockSinglelevelGameResponse));
    component.games = [
      {
        company_id: 353,
        created_on: '2019-02-18 06:56:25.0',
        game_category: 'Human Resources',
        game_category_id: 16465,
        game_id: 1206,
        game_image_url: '',
        game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        game_mode: '',
        game_name: '1 Practice Bug Game',
        game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=4c9635a75c73cfe1484d685545699277&type=1',
        game_state: 'READY',
        game_type: '1',
        icon_id: 4,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: 'A',
        owner_first_name: '1Huddle',
        owner_id: 1,
        owner_last_name: 'Team',
        win_rate: 20,
      },
      {
        company_id: 353,
        created_on: '2019-02-18 06:56:25.0',
        game_category: 'IT',
        game_category_id: 16459,
        game_id: 1200,
        game_image_url: '',
        game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        game_mode: '',
        game_name: '1 Practice Bug Gamej',
        game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=88ab1bda3d8c5e8096f1873bfe2c6f97&type=1',
        game_state: 'READY',
        game_type: '1',
        icon_id: 4,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: 'A',
        owner_first_name: '1Huddle',
        owner_id: 1,
        owner_last_name: 'Team',
        win_rate: 20,
      },
      {
        company_id: 353,
        created_on: '2018-11-29 15:03:53.0',
        game_category: 'Uncategorized',
        game_category_id: 10679,
        game_id: 186,
        game_image_url: '',
        game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png',
        game_mode: '',
        game_name: '1huddle',
        game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=a09ea30e12e02b9ac62ea85f0a07d3b7&type=1',
        game_state: 'READY',
        game_type: '1',
        icon_id: 1,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: 'T',
        owner_first_name: 'TeamLead',
        owner_id: 77,
        owner_last_name: 'TL',
        win_rate: 20,
      }
    ];
    const mockMultilevelGameResponse = [];
    multilevelGameServiceStub.getGameDetails.and.returnValue(of(mockMultilevelGameResponse));
    component.multilevelGameData = {
      company_id: 353,
      created_on: '2022-04-19 06:29:37',
      game_type: 3,
      games: [
        {
          attempt_count: 0,
          company_id: 353,
          disable_level: false,
          game_icon_id: 0,
          game_id: 5560,
          game_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2681.jpg',
          game_name: '1huddlympics',
          high_score: 0,
          level: 1,
          mlg_id: 381,
          total_points: 100,
        },
        {
          attempt_count: 1,
          company_id: 353,
          disable_level: false,
          game_icon_id: 4,
          game_id: 1206,
          game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Game',
          high_score: 0,
          level: 2,
          mlg_id: 381,
          total_points: 0,
        },
        {
          attempt_count: 0,
          company_id: 353,
          disable_level: false,
          game_icon_id: 4,
          game_id: 1200,
          game_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Gamej',
          high_score: 0,
          level: 3,
          mlg_id: 381,
          total_points: 0,
        }
      ],
      is_editable: true,
      mlg_id: 381,
      mlg_logo: '',
      mlg_name: 'Multilevel Game 117',
      mlg_rule: '',
      mlg_state: 'DRAFT',
      owner_firstname: '1Huddle',
      owner_id: 1,
      owner_lastname: 'Team',
      total_levels: 3,
      trophy: {
        description: 'Winner',
        img_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/mlgtrophy.png',
        mlg_id: 381,
        name: 'Multilevel Game 117',
      }
    };

    multilevelGameServiceStub.updateGameInMultilevelGame.and.returnValue(of(mockMultilevelGameResponse));
    multilevelGameServiceStub.addGamesInMultilevelGame.and.returnValue(of(mockMultilevelGameResponse));
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
    component.getGames();
    expect(component.games).toBeTruthy();
    component.multilevelGameService.mlgBeingEdited = {
      company_id: 353,
      created_on: '2022-04-19 06:29:37',
      game_type: 3,
      is_editable: true,
      level1_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2681.jpg',
      level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
      mlg_game_icon: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
      mlg_id: 381,
      mlg_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
      mlg_name: 'Multilevel Game 117',
      mlg_state: 'DRAFT',
      owner_firstname: '1Huddle',
      owner_id: 1,
      owner_lastname: 'Team',
    };
    component.multilevelGameData = component.multilevelGameService.mlgBeingEdited;
    fixture.detectChanges();
    expect(component.multilevelGameData).toBeTruthy();
    component.getGameDetails(component.multilevelGameData['mlg_id']);
  }));

  it('should be draft mlg', waitForAsync(() => {

    let multilevelGameData: any = {
      disableSave : false,
      mlg_type: 3,
      mlg_state: 'DRAFT',
      mlg_logo: '',
      mlg_name: '',
      mlg_id: 0
    };

    const mlgDetails = {
      company_id: 353,
      created_on: '2021-12-03 10:15:48',
      game_type: 3,
      games: [
        {
          attempt_count: 1,
          company_id: 353,
          game_icon_id: 4,
          game_id: 1206,
          game_logo: 'img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Game',
          high_score: 0,
          level: 1,
          mlg_id: 112,
          total_points: 100
        },
        {
          attempt_count: 1,
          company_id: 353,
          game_icon_id: 1,
          game_id: 186,
          game_logo: 'img/admin/game_icon/icon-1.png',
          game_name: '1huddle',
          high_score: 0,
          level: 2,
          mlg_id: 112,
          total_points: 100,
        }
      ],
      is_editable: true,
      mlg_id: 112,
      mlg_logo: '',
      mlg_name: 'hi',
      mlg_rule: '',
      mlg_state: 'DRAFT',
      owner_firstname: '1Huddle',
      owner_id: 1,
      owner_lastname: 'Team',
      total_levels: 2,
      trophy: {
        description: 'Winner',
        img_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/mlgtrophy.png',
        mlg_id: 112,
        name: 'hi',
      }
    };

    httpClient.get(`${EndPoint.GET_MULTILEVEL_GAME_DETAILS}?company_id=353&mlg_id=112`)
      .subscribe(res => {
      component.is_loading = false;
      const response = res;
      console.log('response', response);
      multilevelGameData = mlgDetails;
      expect(response).toEqual(mlgDetails, 'expected mlg');
      component.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);
    });

    const testComponent = fixture.debugElement.componentInstance;

    testComponent.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);

    testComponent.is_loading = false;

    testComponent.prepareListForMultiSelectEdit(testComponent.multilevelGameDataSource.data);

    fixture.detectChanges();

    expect(mlgDetails.mlg_state).toBe('DRAFT');
  }));

  it('should be live mlg', waitForAsync(() => {

    let multilevelGameData: any = {
      disableSave : false,
      mlg_type: 3,
      mlg_state: 'DRAFT',
      mlg_logo: '',
      mlg_name: '',
      mlg_id: 0
    };

    const mlgDetails = {
      company_id: 353,
      created_on: '2021-12-10 12:41:44',
      game_type: 3,
      games: [
        {
          attempt_count: 0,
          company_id: 353,
          game_icon_id: 4,
          game_id: 1206,
          game_logo: 'img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Game',
          high_score: 0,
          level: 1,
          mlg_id: 134,
          total_points: 100,
        },
        {
          attempt_count: 0,
          company_id: 353,
          game_icon_id: 4,
          game_id: 1200,
          game_logo: 'img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Gamej',
          high_score: 0,
          level: 2,
          mlg_id: 134,
          total_points: 100,
        }
      ],
      is_editable: false,
      mlg_id: 134,
      mlg_logo: '',
      mlg_name: 'Unit testing Live MLG',
      mlg_rule: '',
      mlg_state: 'LIVE',
      owner_firstname: '1Huddle',
      owner_id: 1,
      owner_lastname: 'Team',
      total_levels: 2,
      trophy: {
        description: 'Winner',
        img_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/mlgtrophy.png',
        mlg_id: 134,
        name: 'Unit testing Live MLG',
      }
    };

    httpClient.get(`${EndPoint.GET_MULTILEVEL_GAME_DETAILS}?company_id=353&mlg_id=134`)
      .subscribe(res => {
      component.is_loading = false;
      const response = res;
      console.log('response', response);
      multilevelGameData = mlgDetails;
      expect(response).toEqual(mlgDetails, 'expected mlg');
      component.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);
    });

    const testComponent = fixture.debugElement.componentInstance;

    testComponent.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);

    testComponent.is_loading = false;

    testComponent.prepareListForMultiSelectEdit(testComponent.multilevelGameDataSource.data);

    fixture.detectChanges();

    expect(mlgDetails.mlg_state).toBe('LIVE');
  }));

  it('should show that new levels are added in Live MLG', waitForAsync(() => {
    let multilevelGameData: any = {
      disableSave : false,
      mlg_type: 3,
      mlg_state: 'DRAFT',
      mlg_logo: '',
      mlg_name: '',
      mlg_id: 0
    };

    const mlgDetails = {
      company_id: 353,
      created_on: '2021-12-10 12:41:44',
      game_type: 3,
      games: [
        {
          attempt_count: 0,
          company_id: 353,
          game_icon_id: 4,
          game_id: 1206,
          game_logo: 'img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Game',
          high_score: 0,
          level: 1,
          mlg_id: 134,
          total_points: 100,
        },
        {
          attempt_count: 0,
          company_id: 353,
          game_icon_id: 4,
          game_id: 1200,
          game_logo: 'img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Gamej',
          high_score: 0,
          level: 2,
          mlg_id: 134,
          total_points: 100,
        }
      ],
      is_editable: false,
      mlg_id: 134,
      mlg_logo: '',
      mlg_name: 'Unit testing Live MLG',
      mlg_rule: '',
      mlg_state: 'LIVE',
      owner_firstname: '1Huddle',
      owner_id: 1,
      owner_lastname: 'Team',
      total_levels: 2,
      trophy: {
        description: 'Winner',
        img_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/mlgtrophy.png',
        mlg_id: 134,
        name: 'Unit testing Live MLG',
      }
    };

    httpClient.get(`${EndPoint.GET_MULTILEVEL_GAME_DETAILS}?company_id=353&mlg_id=134`)
      .subscribe(res => {
      component.is_loading = false;
      const response = res;
      console.log('response', response);
      multilevelGameData = mlgDetails;
      expect(response).toEqual(mlgDetails, 'expected mlg');
      component.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);
    });

    const testComponent = fixture.debugElement.componentInstance;

    testComponent.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);

    testComponent.is_loading = false;

    testComponent.games = [
      {
        company_id: 353,
        created_on: '2019-06-24 13:41:47.0',
        game_category: 'Uncategorized',
        game_category_id: 10679,
        game_id: 2525,
        game_image_url: '',
        game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-8.png',
        game_mode: '',
        game_name: 'About Roger.',
        game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=c632b2d6adf5003d2e5f4b19fb33a480&type=1',
        game_state: 'READY',
        game_type: '1',
        icon_id: 5,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: 'A',
        owner_first_name: '1Huddle',
        owner_id: 1,
        owner_last_name: 'Team',
        win_rate: 20
      },
      {
        company_id: 353,
        created_on: '2019-02-15 08:56:18.0',
        game_category: 'Uncategorized',
        game_category_id: 10679,
        game_id: 1105,
        game_image_url: '',
        game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
        game_mode: '',
        game_name: 'Amar Game 1',
        game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=b621571f0fcbac4fab5d1f16e2c0dfdc&type=1',
        game_state: 'READY',
        game_type: '1',
        icon_id: 2,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: 'A',
        owner_first_name: '1Huddle',
        owner_id: 1,
        owner_last_name: 'Team',
        win_rate: 20,
      },
      {
        company_id: 353,
        created_on: '2021-01-22 10:32:39.0',
        game_category: 'Archive',
        game_category_id: 16454,
        game_id: 4521,
        game_image_url: '',
        game_logo: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
        game_mode: '',
        game_name: 'AniketTestContest',
        game_share_url: 'https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=d40f0eb90f0b5b1c96a1ab27e3fd8663&type=1',
        game_state: 'READY',
        game_type: '1',
        icon_id: 3,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: 'A',
        owner_first_name: '1Huddle',
        owner_id: 1,
        owner_last_name: 'Team',
        win_rate: 20,
      }
    ];

    testComponent.prepareGameListForItemComponent(testComponent.games);

    testComponent.prepareListForMultiSelectEdit(testComponent.multilevelGameDataSource.data);
    fixture.detectChanges();
    const debugElem = fixture.debugElement.queryAll(By.css('button'));
    const buttonElem = debugElem[0].nativeElement;

    buttonElem.dispatchEvent(new MouseEvent('click'));

    const dialogRef = dialog.open(AddItemsComponent, {
      data: {
        singularWord: 'Game',
        pluralWord: 'Games',
        items: testComponent.itemList,
        uniqueKey: 'game_for_mlg',
        gameCount: testComponent.multilevelGameDataSource.data.length
      }
    });
    dialogRef.componentInstance.title = 'Games';

    setTimeout(() => {
      dialogRef.componentInstance.save();

      dialogRef.componentInstance.cancel();

      dialogRef.disableClose = false;

      fixture.detectChanges();

      dialogRef.close();

    });

    fixture.detectChanges();

    const data = [2525, 1105];

    const gameIds = [];

    data.filter(gameId => {
      testComponent.games.filter(game => {
        if (gameId === game.game_id ) {
          if (mlgDetails.mlg_state === 'LIVE') {
            game['newlyAdded'] = true;
          }
          game['level'] = testComponent.multilevelGameDataSource.data.length + data.indexOf(gameId) + 1;
          testComponent.gamesToAdd.push(game);
          gameIds.push(game.game_id);
        }
      });
    });

    const source = testComponent.multilevelGameDataSource.data;

    source.forEach(game => {
      if (game.newlyAdded) {
        expect(game.newlyAdded).toBe(true);
      }
    });

    testComponent.multilevelGameDataSource.data = source.concat(testComponent.gamesToAdd);
    testComponent.prepareListForMultiSelectEdit(testComponent.multilevelGameDataSource.data);

    dialog.closeAll();

    fixture.detectChanges();

  }));

  it('should disable level in live MLG', waitForAsync(() => {

    let multilevelGameData: any = {
      disableSave : false,
      mlg_type: 3,
      mlg_state: 'DRAFT',
      mlg_logo: '',
      mlg_name: '',
      mlg_id: 0
    };

    const mlgDetails = {
      company_id: 353,
      created_on: '2021-12-10 12:41:44',
      game_type: 3,
      games: [
        {
          attempt_count: 0,
          company_id: 353,
          game_icon_id: 4,
          game_id: 1206,
          game_logo: 'img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Game',
          high_score: 0,
          level: 1,
          mlg_id: 134,
          total_points: 100,
        },
        {
          attempt_count: 0,
          company_id: 353,
          game_icon_id: 4,
          game_id: 1200,
          game_logo: 'img/admin/game_icon/icon-6.png',
          game_name: '1 Practice Bug Gamej',
          high_score: 0,
          level: 2,
          mlg_id: 134,
          total_points: 100,
        }
      ],
      is_editable: false,
      mlg_id: 134,
      mlg_logo: '',
      mlg_name: 'Unit testing Live MLG',
      mlg_rule: '',
      mlg_state: 'LIVE',
      owner_firstname: '1Huddle',
      owner_id: 1,
      owner_lastname: 'Team',
      total_levels: 2,
      trophy: {
        description: 'Winner',
        img_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/mlgtrophy.png',
        mlg_id: 134,
        name: 'Unit testing Live MLG',
      }
    };

    httpClient.get(`${EndPoint.GET_MULTILEVEL_GAME_DETAILS}?company_id=353&mlg_id=134`)
      .subscribe(res => {
      component.is_loading = false;
      const response = res;
      console.log('response', response);
      multilevelGameData = mlgDetails;
      expect(response).toEqual(mlgDetails, 'expected mlg');
      component.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);
    });

    const testComponent = fixture.debugElement.componentInstance;

    testComponent.multilevelGameDataSource = new MatTableDataSource(mlgDetails.games);

    testComponent.is_loading = false;

    testComponent.prepareListForMultiSelectEdit(testComponent.multilevelGameDataSource.data);

    fixture.detectChanges();

    const tableElem = fixture.debugElement.queryAll(By.css('table'));

    const tdElem = tableElem[0].nativeElement.querySelectorAll('td');
    
    const divElem: HTMLElement = tdElem[5].querySelectorAll('div');

    const buttonElem: HTMLElement = divElem[0].querySelectorAll('button');
    
    buttonElem[0].dispatchEvent(new MouseEvent('click'));

    fixture.detectChanges();
    
    testComponent.mlgMenuBtns.closeMenu();

    mlgDetails.games[0]['disable_level'] = true;

    fixture.detectChanges();

    expect(divElem[0].classList).toContain('disable-mlg-change');

    const trElem = tableElem[0].nativeElement.querySelectorAll('tr');

    expect(trElem[1].classList).toContain('disableLevel');


  }));

  it('should add limit in draft MLG', waitForAsync(() => {
    const game = {
      attempt_count: 1,
      company_id: 1066,
      criteria: [
        {
          id: 1,
          isSelected: false,
          key: "total_points",
          title: "Total Points",
          value: 100
        },
        {
          id: 2,
          isSelected: true,
          key: "attempt_count",
          title: "Minimum Attempts",
          value: 1
        },
        {
          id: 3,
          isSelected: false,
          key: "high_score",
          title: "High Score",
          value: 100
        }
      ],
      disable_level: false,
      game_icon_id: 6,
      game_id: 2895,
      game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png",
      game_name: "AniketLimitTest",
      high_score: 0,
      level: 2,
      max_limit: "1",
      mlg_id: 512,
      total_points: 0,
    };

    component.updateGameCriteria('max_limit', 1, game);

    expect(component.updateLimitPayload.max_limit).toBe(1);

  }));

  it ('should hide nudge if limit is added', waitForAsync(() => {
    component.multilevelGameData = {
      company_id: 1066,
      created_on: "2021-10-05 06:37:31",
      game_type: 3,
      games: [
        {
          attempt_count: 1,
          company_id: 1066,
          disable_level: false,
          game_icon_id: 6,
          game_id: 2895,
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png",
          game_name: "AniketLimitTest",
          high_score: 100,
          level: 1,
          max_limit: null,
          mlg_id: 4,
          total_points: 100
        }
      ],
      has_manager_set_limits: true,
      is_editable: false,
      mlg_id: 4,
      mlg_logo: "",
      mlg_name: "Multilevel Game 3",
      mlg_rule: "",
      mlg_state: "LIVE",
      owner_firstname: "1Huddle",
      owner_id: 1,
      owner_lastname: "Team",
      total_levels: 6,
      trophy: {
        description: "Winner",
        img_url: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/mlgtrophy.png",
        mlg_id: 4,
        name: "Multilevel Game 3",
      }
    }

    expect(component.multilevelGameData.has_manager_set_limits).toBeTruthy();
  }));

  it ('should hide nudge if close clicked on nudge', waitForAsync(() => {
    component.closeNudge();
    expect(component.storageService.getKeyForFirstManagerLogin('manager-first-set-limit')).toBeTruthy();
  }));

  it('should add limit in existing level of live MLG', waitForAsync(() => {
    component.multilevelGameData = {
      company_id: 1066,
      created_on: "2022-08-24 11:38:46",
      game_type: 3,
      games: [
        {
          attempt_count: 0,
          company_id: 1066,
          disable_level: false,
          game_icon_id: 1,
          game_id: 2468,
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
          game_name: "GameProfileTest😊",
          high_score: 0,
          level: 1,
          max_limit: -1,
          mlg_id: 586,
          total_points: 100
        },
        {
          attempt_count: 0,
          company_id: 1066,
          disable_level: false,
          game_icon_id: 1,
          game_id: 2913,
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
          game_name: "Load Test Game",
          high_score: 0,
          level: 2,
          max_limit: -1,
          mlg_id: 586,
          total_points: 100
        },
      ],
      has_manager_set_limits: true,
      is_editable: false,
      mlg_id: 586,
      mlg_logo: "",
      mlg_name: "Multilevel Game 8",
      mlg_rule: "",
      mlg_state: "LIVE",
      owner_firstname: "Test",
      owner_id: 9897,
      owner_lastname: "Manager2",
      total_levels: 2,
      trophy: {
        description: "Winner",
        img_url: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/mlgtrophy.png",
        mlg_id: 586,
        name: "Multilevel Game 8",
      }
    };

    component.updateGameCriteria('max_limit', 1, component.multilevelGameData.games[0]);

    expect(component.updateLimitPayload.max_limit).toBe(1);
  }));

  it ('should add limit in newly added level of live mlg', waitForAsync(() => {
    component.multilevelGameDataSource.data = [
      {
        attempt_count: 0,
        company_id: 1066,
        criteria: [
          {
            id: 1,
            isSelected: true,
            key: "total_points",
            title: "Total Points",
            value: 100
          }, 
          {
            id: 2,
            isSelected: false,
            key: "attempt_count",
            title: "Minimum Attempts",
            value: 1
          },
          {
            id: 3,
            isSelected: false,
            key: "high_score",
            title: "High Score",
            value: 100
          }
        ],
        disable_level: false,
        game_icon_id: 1,
        game_id: 2468,
        game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
        game_name: "GameProfileTest😊",
        high_score: 0,
        level: 1,
        max_limit: "",
        mlg_id: 586,
        total_points: 100
      },
      {
        attempt_count: 0,
        company_id: 1066,
        criteria: [
          {
            id: 1,
            isSelected: true,
            key: "total_points",
            title: "Total Points",
            value: 100
          },
          {
            id: 2,
            isSelected: false,
            key: "attempt_count",
            title: "Minimum Attempts",
            value: 1
          },
          {
            id: 3,
            isSelected: false,
            key: "high_score",
            title: "High Score",
            value: 100
          }
        ],
        disable_level: false,
        game_icon_id: 1,
        game_id: 2913,
        game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
        game_name: "Load Test Game",
        high_score: 0,
        level: 2,
        max_limit: "",
        mlg_id: 586,
        total_points: 100
      }, 
      {
        criteria: [
          {
            id: 1,
            isSelected: true,
            key: "total_points",
            title: "Total Points",
            value: 100
          },
          {
            id: 2,
            isSelected: false,
            key: "attempt_count",
            title: "Minimum Attempts",
            value: 1
          }, 
          {
            id: 3,
            isSelected: false,
            key: "high_score",
            title: "High Score",
            value: 100
          }
        ],
        game_id: 2904,
        game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
        game_name: "Load Test Game",
        isSelected: true,
        itemId: 2904,
        itemLogo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
        itemName: "Load Test Game",
        level: 3,
        max_limit: "2",
        newlyAdded: true,
        search_key: null,
        total_points: 100,
        userInfo: {
          company_id: 1066,
          created_on: "2020-01-11 09:37:29.0",
          game_category: "Uncategorized",
          game_category_id: 10745,
          game_id: 2904,
          game_image_url: "",
          game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
          game_mode: "",
          game_name: "Load Test Game",
          game_share_url: "https://airmac.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=2233b0504a1b8e2584cbbdaa1b1e8033&type=1",
          game_state: "READY",
          game_type: "1",
          icon_id: 1,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_shop_game: false,
          itemKeyId: 2904,
          itemKeyLogo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
          itemKeyName: "Load Test Game",
          owner_access_type: "M",
          owner_first_name: "Manager",
          owner_id: 584,
          owner_last_name: "Boss",
          win_rate: 20
        }
      }
    ];

    component.multilevelGameData.mlg_state = 'LIVE';

    component.save();

    expect(component.addNewLevelPayload.level_data[0].max_limit).toBe(2);
  }));
});


