import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { GamesService } from 'src/app/services/games/games.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
   
import {
  PermissionsService,
  PermissionsKey,
} from 'src/app/services/permissions/permissions.service';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';

import { imports } from 'src/app/app-testing.imports';
import { providers } from '../../../app-testing.providers';
import { TranslateService } from '@ngx-translate/core';

import { ReorderComponent } from './reorder.component';
import { By } from '@angular/platform-browser';
import { ChangeGamePositionComponent } from '../../change-game-position/change-game-position.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

fdescribe('ReorderComponent', () => {
  let component: ReorderComponent;
  let fixture: ComponentFixture<ReorderComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;

  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;

  let permissionService: PermissionsService;
  let multilevelGameService: MultilevelGamesService;
  let gamesService: GamesService;

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(function () {
      console.log('inside timeout');
      done();
    }, 500);
    TestBed.configureTestingModule({
      declarations: [ReorderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [imports],
      providers: [
        GamesService,
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

    translate = TestBed.get(TranslateService);
    translate.use('en');
    httpTestController = TestBed.get(HttpTestingController);
    permissionService = TestBed.get(PermissionsService);
    multilevelGameService = TestBed.get(MultilevelGamesService);
    gamesService = TestBed.get(GamesService);
    httpClient = TestBed.get(HttpClient);
    dialog = TestBed.get(MatDialog);

    fixture = TestBed.createComponent(ReorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('game position should not be  0', waitForAsync(() => {
    const mlgList = [
      {
        company_id: 353,
        game_type: 3,
        game_id: 115,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'add new levels',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
        owner_name: '1Huddle Team',
        position: 1,
      },
      {
        company_id: 353,
        game_type: 3,
        game_id: 138,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'Multilevel Game 42',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
        owner_name: '1Huddle Team',
        position: 2,
      },
      {
        company_id: 353,
        game_type: 3,
        game_id: 116,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'Aniket MLG',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        owner_name: '1Huddle Team',
        position: 3,
      },
    ];
    const testComponent = fixture.debugElement.componentInstance;
    testComponent.layoutPermission = permissionService.getPermissions(
      PermissionsKey.LIVE_GAME_POSITION
    );
    testComponent.dataSource = new MatTableDataSource(mlgList);
    fixture.detectChanges();

    const tableElem = fixture.debugElement.queryAll(By.css('table'));
    const tdElem = tableElem[0].nativeElement.querySelectorAll('td');
    const divElem: HTMLElement = tdElem[4].querySelectorAll('div');
    const btnElem: HTMLElement = divElem[0].querySelectorAll('button');

    btnElem[0].dispatchEvent(new MouseEvent('click'));
    const dialogRef = dialog.open(ChangeGamePositionComponent, {
      data: mlgList[0],
    });
    dialogRef.componentInstance.total_count = 3;
    dialogRef.componentInstance.reorderingGames = true;

    const buttonElem = document.getElementsByTagName(
      'button'
    )[5] as HTMLHeadElement;

    buttonElem.dispatchEvent(new MouseEvent('click'));
    dialogRef.componentInstance.errorMessage = true;
    dialogRef.componentInstance.is_loading = false;
    fixture.detectChanges();
    const msgElem = document.querySelectorAll('.error_msg_styling');
    const errorText = msgElem[0].innerHTML;
    dialogRef.componentInstance.changed_position = 0;
    expect(errorText).toBe('Please enter a valid position.');
    dialog.closeAll();
    fixture.detectChanges();
  }));

  it('game position should not be more than total length', waitForAsync(() => {
    const mlgList = [
      {
        company_id: 353,
        game_type: 3,
        game_id: 115,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'add new levels',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
        owner_name: '1Huddle Team',
        position: 1,
      },
      {
        company_id: 353,
        game_type: 3,
        game_id: 138,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'Multilevel Game 42',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
        owner_name: '1Huddle Team',
        position: 2,
      },
      {
        company_id: 353,
        game_type: 3,
        game_id: 116,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'Aniket MLG',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        owner_name: '1Huddle Team',
        position: 3,
      },
    ];
    const testComponent = fixture.debugElement.componentInstance;
    testComponent.layoutPermission = permissionService.getPermissions(
      PermissionsKey.LIVE_GAME_POSITION
    );
    testComponent.dataSource = new MatTableDataSource(mlgList);
    fixture.detectChanges();

    const tableElem = fixture.debugElement.queryAll(By.css('table'));
    const tdElem = tableElem[0].nativeElement.querySelectorAll('td');
    const divElem: HTMLElement = tdElem[4].querySelectorAll('div');
    const btnElem: HTMLElement = divElem[0].querySelectorAll('button');

    btnElem[0].dispatchEvent(new MouseEvent('click'));
    const dialogRef = dialog.open(ChangeGamePositionComponent, {
      data: mlgList[0],
    });
    dialogRef.componentInstance.total_count = 3;
    dialogRef.componentInstance.reorderingGames = true;
    const buttonElem = document.getElementsByTagName(
      'button'
    )[5] as HTMLHeadElement;
    buttonElem.dispatchEvent(new MouseEvent('click'));
    dialogRef.componentInstance.errorMessage = true;
    dialogRef.componentInstance.is_loading = false;
    fixture.detectChanges();
    const msgElem = document.querySelectorAll('.error_msg_styling');
    const errorText = msgElem[0].innerHTML;

    dialogRef.componentInstance.changed_position = 4;
    expect(errorText).toBe('Please enter a valid position.');
    dialog.closeAll();
    fixture.detectChanges();
  }));
  it('game position should be between 0 and total length', waitForAsync(() => {
    const mlgList = [
      {
        company_id: 353,
        game_type: 3,
        game_id: 115,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'add new levels',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-5.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png',
        owner_name: '1Huddle Team',
        position: 1,
      },
      {
        company_id: 353,
        game_type: 3,
        game_id: 138,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'Multilevel Game 42',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-9.png',
        owner_name: '1Huddle Team',
        position: 2,
      },
      {
        company_id: 353,
        game_type: 3,
        game_id: 116,
        game_logo:
          'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        game_name: 'Aniket MLG',
        level1_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo:
          'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        owner_name: '1Huddle Team',
        position: 3,
      },
    ];
    const testComponent = fixture.debugElement.componentInstance;
    testComponent.layoutPermission = permissionService.getPermissions(
      PermissionsKey.LIVE_GAME_POSITION
    );
    testComponent.dataSource = new MatTableDataSource(mlgList);
    fixture.detectChanges();

    const tableElem = fixture.debugElement.queryAll(By.css('table'));
    const tdElem = tableElem[0].nativeElement.querySelectorAll('td');
    const divElem: HTMLElement = tdElem[4].querySelectorAll('div');
    const btnElem: HTMLElement = divElem[0].querySelectorAll('button');

    btnElem[0].dispatchEvent(new MouseEvent('click'));
    const dialogRef = dialog.open(ChangeGamePositionComponent, {
      data: mlgList[0],
    });
    dialogRef.componentInstance.total_count = 3;
    dialogRef.componentInstance.reorderingGames = true;
    const buttonElem = document.getElementsByTagName(
      'button'
    )[5] as HTMLHeadElement;
    buttonElem.dispatchEvent(new MouseEvent('click'));
    dialogRef.componentInstance.errorMessage = false;
    dialogRef.componentInstance.is_loading = false;
    fixture.detectChanges();
    const msgElem = document.querySelectorAll('.error_msg_styling');
    dialogRef.componentInstance.changed_position = 2;
    expect(msgElem.length).toBe(0);
    dialogRef.componentInstance.globalService.showMessage(
      'Position changed successfully.',
      'right',
      'bottom'
    );
  }));
});
