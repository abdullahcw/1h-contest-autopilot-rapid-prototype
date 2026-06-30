import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardByTypeComponent } from './dashboard-by-type.component';

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
   
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { TranslateService } from '@ngx-translate/core';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService, EndPoint } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { providers } from '../../../app-testing.providers';
import { imports } from '../../../app-testing.imports';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { ContestService } from 'src/app/services/contest/contest.service';


describe('DashboardByTypeComponent', () => {
  let component: DashboardByTypeComponent;
  let fixture: ComponentFixture<DashboardByTypeComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;
  let permissionService: PermissionsService;
  let dashboardService: DashboardService;
  let contestService: ContestService;

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      setTimeout(() => {
        done();
      }, 500);
    TestBed.configureTestingModule({
      declarations: [ DashboardByTypeComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        DashboardService,
        ContestService,
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
    dashboardService = TestBed.inject(DashboardService);
    contestService = TestBed.inject(ContestService);
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(DashboardByTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should check if custom fields are present in payload to calculate win rate', waitForAsync(() =>{
    const payload = {
      company_id: 1587,
      end_date: "2022-07-31",
      game_id: 5626,
      is_company_with_custom_fields: true,
      is_custom: false,
      limit_offset: 0,
      limit_perpage: 10,
      location_ids: [6330],
      player_status: "ACTIVE",
      start_date: "2022-07-01",
      timezone: "America/Los_Angeles",
    };
  }));
});
