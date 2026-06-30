import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
   
import { GamesService } from 'src/app/services/games/games.service';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { By } from '@angular/platform-browser';
import { imports } from '../../../app-testing.imports';
import { providers } from '../../../app-testing.providers';


import { CreateMultilevelGameHeaderComponent } from './create-multilevel-game-header.component';

describe('CreateMultilevelGameHeaderComponent', () => {
  let component: CreateMultilevelGameHeaderComponent;
  let fixture: ComponentFixture<CreateMultilevelGameHeaderComponent>;
  let requestSpy: any, httpTestController: HttpTestingController;

  let httpClient: HttpClient;
  let translate: TranslateService;
  let multilevelGameService: MultilevelGamesService;

  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    setTimeout(() => {
      done();
    }, 500);
    TestBed.configureTestingModule({
      declarations: [ CreateMultilevelGameHeaderComponent ],
      imports: [
        imports
      ],
      providers: [
        GamesService,
        TranslateService,
        MultilevelGamesService,
        providers
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    requestSpy = jasmine.createSpyObj('RequestManagerService', ['get', 'put', 'post']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        {provide: RequestManagerService, useValue: requestSpy},
      ]
    });

    translate = TestBed.inject(TranslateService);
    translate.use('en');
    httpClient = TestBed.inject(HttpClient);
    httpTestController = TestBed.inject(HttpTestingController);
    multilevelGameService = TestBed.inject(MultilevelGamesService);
    fixture = TestBed.createComponent(CreateMultilevelGameHeaderComponent);
    component = fixture.componentInstance;


    component.multilevelGameData = {
      disableSave : false,
      mlg_type: 3,
      mlg_state: 'LIVE',
      mlg_logo: '',
      mlg_name: 'Unit testing',
      mlg_id: 123,
    };
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should show save disable for live MLG', waitForAsync(() => {
    const debugElem = fixture.debugElement.queryAll(By.css('button'));
    const btnElem = debugElem[1].nativeElement;
    expect(btnElem.classList).toContain('disabled-save');
  }));

  it('should show save enable for live MLG', waitForAsync(() => {
    const debugElem = fixture.debugElement.queryAll(By.css('button'));
    const btnElem = debugElem[1].nativeElement;
    component.disableSave = true;
    fixture.detectChanges();
    expect(btnElem.classList).not.toContain('disabled-save');
  }));
});
