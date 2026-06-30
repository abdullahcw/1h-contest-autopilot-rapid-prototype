import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { imports } from 'src/app/app-testing.imports';
import { providers } from 'src/app/app-testing.providers';
import { GamesService } from 'src/app/services/games/games.service';
import { ApiService } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';

import { PinnedCardComponent } from './pinned-card.component';

describe('PinnedCardComponent', () => {
  let component: PinnedCardComponent;
  let fixture: ComponentFixture<PinnedCardComponent>;
  let requestSpy: any;
  let translate: TranslateService;
  let router: Router;
  
  const gamesServicestub = jasmine.createSpyObj('GamesService', ['updatePinGame']);

  const routes: Routes = [
    {path: 'dashboard', loadChildren: () => import('../../dashboard/dashboard.module').then(m => m.DashboardModule)},
  ];

  beforeEach((done) => {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
		setTimeout(function() {
			console.log('inside timeout');
			done();
		}, 500);
		TestBed.configureTestingModule({
			declarations: [ PinnedCardComponent ],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
			imports: [ imports ],
			providers: [  { provide:GamesService , useValue: gamesServicestub }, TranslateService, providers ]
		}).compileComponents();
	});

  beforeEach(() => {
    requestSpy = jasmine.createSpyObj('RequestManagerService', ['get', 'put', 'post']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
      ],
      providers: [
        ApiService,
        { provide: RequestManagerService, useValue: requestSpy },
      ]
    });
    translate = TestBed.inject(TranslateService);
    translate.use('en');
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(PinnedCardComponent);
    component = fixture.componentInstance;
    spyOn(router, 'navigate'); 
    const mockGameService = [];
    gamesServicestub.updatePinGame.and.returnValue(of(mockGameService));
    component.pinGameData={
      company_id: 353,
      created_on: "2022-02-14 07:04:39.4",
      game_category: "Uncategorized",
      game_category_id: 10679,
      game_id: 5657,
      game_image_url: "",
      game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-10.png",
      game_mode: "CONTEST",
      game_name: "HUD-9874",
      game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=6ea7090859aa103de285bf6179639f69&type=1",
      game_state: "LIVE",
      game_type: 1,
      icon_id: 7,
      is_archived: false,
      is_deleted: false,
      is_editable: true,
      is_pinned: true,
      is_shop_game: false,
      owner_access_type: "A",
      owner_first_name: "1Huddle",
      owner_id: 1,
      owner_last_name: "Team",
      top_players:[
        {
          first_name: "Amar",
          games_played: 1,
          last_name: "Devi",
          player_id: 230653,
          player_rank: 1,
          profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187?t=1618984780469?t=1620724429632?t=1620728648102",
          total_points: 1600,
        },
        {
          first_name: "Amar",
          games_played: 1,
          last_name: "Dev5",
          player_id: 216518,
          player_rank: 2,
          profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187",
          total_points: 600,
        },
      ],
      win_rate: 20,
    }
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('should remove pin games', waitForAsync(() => {
    component.removePinGame(component.pinGameData.game_id);
    fixture.detectChanges();
    expect(component.removePinGamesPayload.is_pinned).toBeFalsy();
  }));
    
  it('should navigate to dashboard', waitForAsync(() => {
    component.navigateToDashboard(component.pinGameData.game_id);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['admin/dashboard'], { queryParams: {showPinGameReport: true, game_id: component.pinGameData.game_id }});
  }));

  it('should emit event for navigation to game builder', waitForAsync(() => {
    spyOn(component.navigateToEditGame, 'emit');
    component.navigateToGameBuilder(component.pinGameData);
    fixture.detectChanges();
    expect(component.navigateToEditGame.emit).toHaveBeenCalledWith(component.pinGameData);
  }));
});
