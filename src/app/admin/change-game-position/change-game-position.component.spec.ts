import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { GamesService } from 'src/app/services/games/games.service';
import { HttpClient } from '@angular/common/http';
import { GameReorderService } from 'src/app/services/reorder/game-reorder.service';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';

import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
   
import {
  PermissionsService,
  PermissionsKey,
} from 'src/app/services/permissions/permissions.service';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { imports } from 'src/app/app-testing.imports';
import { providers } from '../../app-testing.providers';
import { TranslateService } from '@ngx-translate/core';

import { ReorderComponent } from '../../admin/reorder-games/reorder/reorder.component';
import { By } from '@angular/platform-browser';

import { ChangeGamePositionComponent } from './change-game-position.component';
import { of } from 'rxjs';

describe('ChangeGamePositionComponent', () => {
  let component: ChangeGamePositionComponent;
  let fixture: ComponentFixture<ChangeGamePositionComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  const changeGamePositionServiceStub = jasmine.createSpyObj('GameReorderService', ['updateGamePosition']);
  const changeGamePositionForShopServiceStub = jasmine.createSpyObj('MarketplaceService', ['updateShopGamePosition']);



  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;

  let permissionService: PermissionsService;
  let multilevelGameService: MultilevelGamesService;
  let gamesService: GamesService;
  let gameReorderService: GameReorderService;
  let marketplaceService: MarketplaceService;



  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(function () {
      console.log('inside timeout');
      done();
    }, 500);
    TestBed.configureTestingModule({
      declarations: [ ChangeGamePositionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [imports],
      providers: [
        GamesService,
        { provide: GameReorderService, useValue: changeGamePositionServiceStub },
        { provide: MarketplaceService, useValue: changeGamePositionForShopServiceStub },
        TranslateService,
        MultilevelGamesService,
        providers,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    requestSpy = jasmine.createSpyObj('RequestManagerService', [
      'get',
      'put',
      'post',
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: RequestManagerService, useValue: requestSpy },
      ],
    });

    translate = TestBed.inject(TranslateService);
    translate.use('en');
    httpTestController = TestBed.inject(HttpTestingController);
    permissionService = TestBed.inject(PermissionsService);
    multilevelGameService = TestBed.inject(MultilevelGamesService);
    gameReorderService = TestBed.inject(GameReorderService);
    marketplaceService = TestBed.inject( MarketplaceService);
    gamesService = TestBed.inject(GamesService);
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(ChangeGamePositionComponent);
    component = fixture.componentInstance;
    const mockchangeGamePositionResponse = [];
    const mockchangeGamePositionForShopResponse = [];
    changeGamePositionServiceStub.updateGamePosition.and.returnValue(of(mockchangeGamePositionResponse));
    changeGamePositionForShopServiceStub.updateShopGamePosition.and.returnValue(of(mockchangeGamePositionForShopResponse));
    component.gameName = 'Multilevel Game 118';
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
    component.updateGamePosition();
    component.updateShopGamePosition();
    expect(component.gameName).toBeTruthy();
    fixture.detectChanges();
  }));

  it('should check position should not be 0', waitForAsync(() => {
      const testComponent = fixture.debugElement.componentInstance;
      testComponent.layoutPermission = permissionService.getPermissions(
        PermissionsKey.LIVE_GAME_POSITION
      );
      testComponent.cardData = {
        'game_name':  'Multilevel Game 118',
        'position': 1
      };
      testComponent.total_count = 3;
      testComponent.changed_position = 0;
      testComponent.saveChanges();
      fixture.detectChanges();
       expect(testComponent.errorMessage).toBe(true);
    }));

  it('should check position should not be more than total length', waitForAsync(() => {
    const testComponent = fixture.debugElement.componentInstance;
    testComponent.layoutPermission = permissionService.getPermissions(
      PermissionsKey.LIVE_GAME_POSITION
    );
    testComponent.cardData = {
      'game_name':  'Multilevel Game 118',
      'position': 1
    };
    testComponent.total_count = 3;
    testComponent.changed_position = 4;
    testComponent.saveChanges();
      fixture.detectChanges();
       expect(testComponent.errorMessage).toBe(true);
  }));
  it('should check position should be between 0 and total length', waitForAsync(() => {
    const testComponent = fixture.debugElement.componentInstance;
    testComponent.layoutPermission = permissionService.getPermissions(
      PermissionsKey.LIVE_GAME_POSITION
    );
    testComponent.cardData = {
      'game_name':  'Multilevel Game 118',
      'position': 1
    };
    testComponent.total_count = 3;
    testComponent.changed_position = 2;
    testComponent.saveChanges();
      fixture.detectChanges();
       expect(testComponent.errorMessage).not.toBe(true);
  }));
});
