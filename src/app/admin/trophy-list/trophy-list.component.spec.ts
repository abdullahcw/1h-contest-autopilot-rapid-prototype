import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrophyListComponent } from './trophy-list.component';
import { providers } from '../../app-testing.providers';
import { imports } from '../../app-testing.imports';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
   
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { TrophyService } from 'src/app/services/trophy/trophy.service';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('TrophyListComponent', () => {
  let component: TrophyListComponent;
  let fixture: ComponentFixture<TrophyListComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  const trophyServiceStub = jasmine.createSpyObj('TrophyService', ['getTrophiesBy']);

  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;
  let permissionService: PermissionsService;
  let trophyService: TrophyService;


  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      setTimeout(() => {
        done();
      }, 500);
    TestBed.configureTestingModule({
      declarations: [ TrophyListComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        TranslateService,
        { provide: TrophyService, useValue: trophyServiceStub },
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
    trophyService = TestBed.inject(TrophyService);
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(TrophyListComponent);
    component = fixture.componentInstance;
    const mockTrophyResponse = [];
    trophyServiceStub.getTrophiesBy.and.returnValue(of(mockTrophyResponse));
    component.trophiesData = [
      {
        attempts: '',
        created_by: 1,
        game_category_id: 10679,
        game_id: 268,
        game_logo_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        game_name: 'New Game 48',
        game_points: '',
        high_score: 75,
        is_archived: false,
        is_deleted: true,
        is_editable: true,
        is_trophy: true,
        trophy_desc_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/share_268.png',
        trophy_description: 'check again checkfgh',
        trophy_id: 1,
        trophy_logo_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/268_logo.png',
        trophy_share_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/share_268.png',
      },
      {
        attempts: 45,
        created_by: 1,
        game_category_id: 10679,
        game_id: 2681,
        game_logo_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2681.jpg',
        game_name: '1huddlympics',
        game_points: 7825,
        high_score: 53,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_trophy: true,
        trophy_desc_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/share_2681.png',
        trophy_description: 'GG ppl.',
        trophy_id: 6,
        trophy_logo_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/2681_logo.png',
        trophy_share_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/share_2681.png',
      },
      {
        attempts: 12,
        created_by: 1,
        game_category_id: 10679,
        game_id: 848,
        game_logo_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/production/1HUDDLE/cust_game_icon/848.jpg',
        game_name: 'game trophies',
        game_points: 100054,
        high_score: 100,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_trophy: true,
        trophy_desc_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/share_848.png',
        trophy_description: 'check it before',
        trophy_id: 18,
        trophy_logo_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/848_logo.png',
        trophy_share_url: 'https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/trophies/gameTrophies/share_848.png',
      }
    ];
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
    component.getTrophies();
    expect(component.trophiesData).toBeTruthy();
  }));

  it ('should show deleted mlg in the trophy list', waitForAsync(() => {
    const mlgList = [
      {
        company_id: 353,
        created_on: '2021-11-23 08:37:05',
        game_type: 3,
        is_deleted: true,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        mlg_game_icon: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_id: 96,
        mlg_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_name: 'mlg 9',
        mlg_state: 'LIVE',
        number_of_levels: 20,
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team',
      },
      {
        company_id: 353,
        created_on: '2021-12-10 04:43:39',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2717.jpg',
        level2_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2716.jpg',
        mlg_game_icon: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_id: 132,
        mlg_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_name: 'MLG add level trophy testing',
        mlg_state: 'LIVE',
        number_of_levels: 3,
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team',
      },
      {
        company_id: 353,
        created_on: '2022-01-13 06:15:20',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png',
        mlg_game_icon: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_id: 194,
        mlg_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_name: 'MLG disabled test',
        mlg_state: 'LIVE',
        number_of_levels: 11,
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team',
      }
    ];
    component.is_loading = false;

    component.displayedColumns = ['mlg_photo', 'mlg_name', 'levels'];
    component.trophyType = 'mlg';
    component.totalTrophies = mlgList.length;

    component.trophyDataSource = new MatTableDataSource(mlgList);

    fixture.detectChanges();

    const tableElem = fixture.debugElement.queryAll(By.css('table'));

    const tdElem = tableElem[0].nativeElement.querySelectorAll('td');

    const mlgName = tdElem[1].innerText;

    if (mlgName.includes('(Deleted)')) {
      const index = mlgName.indexOf('(Deleted)');

      const deletedText = mlgName.slice(index);

      expect(deletedText).toBe('(Deleted)');
    }

  }));

  it ('should show non deleted mlg in the trophy list', waitForAsync(() => {
    const mlgList = [
      {
        company_id: 353,
        created_on: '2021-11-23 08:37:05',
        game_type: 3,
        is_deleted: true,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        mlg_game_icon: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_id: 96,
        mlg_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_name: 'mlg 9',
        mlg_state: 'LIVE',
        number_of_levels: 20,
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team',
      },
      {
        company_id: 353,
        created_on: '2021-12-10 04:43:39',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2717.jpg',
        level2_logo: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/cust_game_icon/2716.jpg',
        mlg_game_icon: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_id: 132,
        mlg_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_name: 'MLG add level trophy testing',
        mlg_state: 'LIVE',
        number_of_levels: 3,
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team',
      },
      {
        company_id: 353,
        created_on: '2022-01-13 06:15:20',
        game_type: 3,
        is_deleted: false,
        is_editable: false,
        level1_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png',
        level2_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png',
        mlg_game_icon: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_id: 194,
        mlg_logo: 'https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/profilePic.png',
        mlg_name: 'MLG disabled test',
        mlg_state: 'LIVE',
        number_of_levels: 11,
        owner_firstname: '1Huddle',
        owner_id: 1,
        owner_lastname: 'Team',
      }
    ];
    component.is_loading = false;

    component.displayedColumns = ['mlg_photo', 'mlg_name', 'levels'];
    component.trophyType = 'mlg';
    component.totalTrophies = mlgList.length;

    component.trophyDataSource = new MatTableDataSource(mlgList);

    fixture.detectChanges();

    const tableElem = fixture.debugElement.queryAll(By.css('table'));

    const tdElem = tableElem[0].nativeElement.querySelectorAll('td');


    const mlgName = tdElem[4].innerText;

    expect(mlgName.includes('(Deleted)')).toBeFalsy();

  }));

});
