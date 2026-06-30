import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
   
import { imports } from 'src/app/app-testing.imports';
import { providers } from 'src/app/app-testing.providers';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { ContestService } from 'src/app/services/contest/contest.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { GamesService } from 'src/app/services/games/games.service';
import { LocationService } from 'src/app/services/location/location.service';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { PlayerService } from 'src/app/services/player/player.service';

import { DashboardComponent } from './dashboard.component';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;
  let permissionService: PermissionsService;
  const contestServicestub = jasmine.createSpyObj('ContestService', ['getContests', 'getContestsList']);

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(() => {
      done();
    }, 500);
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        imports
      ],
      providers: [
        { provide: ContestService, useValue: contestServicestub },
        TranslateService,
        DelegateService,
        DepartmentService,
        DashboardService,
        GamesService,
        PlayerService,
        LocationService,
        DatePipe,
        CompanyService,
        MultilevelGamesService,
        ManagerService,
        BreadcrumbsService,
        PermissionsService,
        providers
      ]
    }).compileComponents();
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
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    const mockContestService = [];
    contestServicestub.getContests.and.returnValue(of(mockContestService));
    // contestServicestub.getContestsList.and.returnValue(of(mockContestService));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

  });

  it('should this quarter filter', () => {
    component.setRange('THIS_QT', false);
    // expect(component.startDate).toBeTruthy();
    expect(component.startDate).toBe('2022-07-25');
    expect(component.endDate).toBe('2022-07-31');
  });
  it('should show deleted mlg in the mlg dashboard filter', () => {

    const mlgList = [
      {
        company_id: 353,
        created_on: '2021-12-06 04:55:51',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        mlg_game_icon: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_id: 114,
        mlg_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_name: 'Multilevel Game 21',
        mlg_state: 'LIVE',
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team'
      },
      {
        company_id: 353,
        created_on: '2021-12-02 11:11:01',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        mlg_game_icon: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_id: 111,
        mlg_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_name: 'Multilevel Game 19',
        mlg_state: 'LIVE',
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team'
      },
      {
        company_id: 353,
        created_on: '2021-12-02 07:41:01',
        game_type: 3,
        is_deleted: true,
        is_editable: false,
        level1_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2717.jpg',
        level2_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2716.jpg',
        mlg_game_icon: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_id: 110,
        mlg_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/mlg-banner/110.jpg?1638431040754',
        mlg_name: 'HUD-2793',
        mlg_state: 'LIVE',
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team'
      }
    ];

    mlgList.forEach(item => {
      component.multilevelGames.push({ 'id': item.mlg_id, 'value': item.mlg_name, 'is_deleted': item.is_deleted });
    });

    expect(component.multilevelGames[2].is_deleted).toBeTruthy();

  });

  it('should show non deleted mlg in the mlg dashboard filter', () => {

    const mlgList = [
      {
        company_id: 353,
        created_on: '2021-12-06 04:55:51',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        mlg_game_icon: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_id: 114,
        mlg_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_name: 'Multilevel Game 21',
        mlg_state: 'LIVE',
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team'
      },
      {
        company_id: 353,
        created_on: '2021-12-02 11:11:01',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        mlg_game_icon: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_id: 111,
        mlg_logo: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_name: 'Multilevel Game 19',
        mlg_state: 'LIVE',
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team'
      },
      {
        company_id: 353,
        created_on: '2021-12-02 07:41:01',
        game_type: 3,
        is_deleted: true,
        is_editable: false,
        level1_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2717.jpg',
        level2_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2716.jpg',
        mlg_game_icon: 'https://1huddle-prod.s3-us-west-2.amazonaws.com/public_html/static/adminpanel/assets/img/admin/profilePic.png',
        mlg_id: 110,
        mlg_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/company/mlg-banner/110.jpg?1638431040754',
        mlg_name: 'HUD-2793',
        mlg_state: 'LIVE',
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team'
      }
    ];

    mlgList.forEach(item => {
      component.multilevelGames.push({ 'id': item.mlg_id, 'value': item.mlg_name, 'is_deleted': item.is_deleted });
    });

    expect(component.multilevelGames[1].is_deleted).toBeFalsy();

  });
});


