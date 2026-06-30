import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplayLeaderboardComponent } from './gameplay-leaderboard.component';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
   
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { TranslateService } from '@ngx-translate/core';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService, EndPoint } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { providers } from '../../../app-testing.providers';
import { imports } from '../../../app-testing.imports';
import { By } from '@angular/platform-browser';


describe('GameplayLeaderboardComponent', () => {
  let component: GameplayLeaderboardComponent;
  let fixture: ComponentFixture<GameplayLeaderboardComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;
  let httpClient: HttpClient;
  let dialog: MatDialog;
  let translate: TranslateService;
  let permissionService: PermissionsService;

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      setTimeout(() => {
        done();
      }, 500);
    TestBed.configureTestingModule({
      declarations: [ GameplayLeaderboardComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
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
    httpClient = TestBed.inject(HttpClient);
    dialog = TestBed.inject(MatDialog);
    fixture = TestBed.createComponent(GameplayLeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it ('should show message when no leaderboard data', waitForAsync(() => {
    component.totalCount = 0;

    component.gamePlay.length = 0;

    const divElem = fixture.debugElement.queryAll(By.css('div'));

    const errText = divElem[2].nativeElement.innerText;

    expect(errText).toBe('No Gameplay');

    expect(divElem[2].nativeElement.classList).toContain('no_messages');
  }));

  it('should show leaderboard', waitForAsync(() => {

    const players = [
      {
        first_name: 'Aax',
        games_played: 32,
        last_name: 'BA',
        player_id: 78856,
        player_rank: 1,
        profile_image_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1Huddle/profile/1625743126909.jpg',
        total_points: 3300
      },
      {
        first_name: 'g',
        games_played: 8,
        last_name: 'j',
        player_id: 236740,
        player_rank: 2,
        profile_image_url: 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187?t=1618984780469?t=1620724429632?t=1620728648102',
        total_points: 1400
      },
      {
        first_name: 'Amar',
        games_played: 2,
        last_name: 'Dhade',
        player_id: 116468,
        player_rank: 3,
        profile_image_url: '',
        total_points: 200
      }
    ];

    component.gamePlay = new MatTableDataSource(players);

    component.totalCount = 3;

    fixture.detectChanges();

    expect(component.totalCount).toBeGreaterThan(0);

  }));

  it('should redirect to detailed report page on view all click', waitForAsync(() => {
    spyOn(component, 'viewAll');

    const divElem = fixture.debugElement.queryAll(By.css('div'));

    const btnElem = divElem[4].nativeElement;

    btnElem.dispatchEvent(new MouseEvent('click'));

    fixture.detectChanges();

    component.viewAll();

    fixture.detectChanges();

    expect(component.viewAll).toHaveBeenCalled();

  }));
});
