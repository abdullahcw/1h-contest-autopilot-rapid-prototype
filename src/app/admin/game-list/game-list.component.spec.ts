import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { imports } from 'src/app/app-testing.imports';
import { providers } from 'src/app/app-testing.providers';
import { CompanyService } from 'src/app/services/company/company.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { GamesService } from 'src/app/services/games/games.service';
import { LocationService } from 'src/app/services/location/location.service';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { RequestManagerService } from 'src/app/services/network/request-manager.service';
import { StorageService } from 'src/app/services/storage/storage.service';

import { GameListComponent } from './game-list.component';

describe('GameListComponent', () => {
  let component: GameListComponent;
  let fixture: ComponentFixture<GameListComponent>;
  const companyServicestub= jasmine.createSpyObj('CompanyService',['getCompanies', 'getCustomFieldsValues', 'getCustomFields', 'getFields']);
  const gamesServicestub = jasmine.createSpyObj('GamesService', ['getGamesByWinRate','getPinnedGames','updatePinGame']);
  const locationServicestub = jasmine.createSpyObj('LocationService', ['getLocations']);
  const departmentServicestub = jasmine.createSpyObj('DepartmentService', ['getDepartmentsByLocations']);
  let requestSpy: any;

  let translate: TranslateService; 


  beforeEach((done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
      setTimeout(() => {
        done();
      }, 500);
    TestBed.configureTestingModule({
      declarations: [GameListComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        imports
      ],
      providers: [
        
        { provide:GamesService , useValue: gamesServicestub},
        { provide:CompanyService ,useValue: companyServicestub},
        { provide:LocationService ,useValue: locationServicestub},
        { provide:DepartmentService ,useValue: departmentServicestub},
       
        TranslateService,
        DelegateService,
        StorageService,
        ManagerService,
      
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
    fixture = TestBed.createComponent(GameListComponent);
    component = fixture.componentInstance;
    
    const mockGameService = [];
    gamesServicestub.getGamesByWinRate.and.returnValue(of(mockGameService));
    gamesServicestub.getPinnedGames.and.returnValue(of(mockGameService));
    gamesServicestub.updatePinGame.and.returnValue(of(mockGameService));

     
    component.games=
    [{
      company_id: 353,
      created_on: "2019-02-18 06:56:25.0",
      game_category: "Human Resources",
      game_category_id: 16465,
      game_id: 1206,
      game_image_url: "",
      game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png",
      game_mode: "",
      game_name: "1 Practice Bug Game",
      game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=4c9635a75c73cfe1484d685545699277&type=1",
      game_state: "READY",
      game_type: "1",
      icon_id: 4,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: "A",
        owner_first_name: "1Huddle",
        owner_id: 1,
        owner_last_name: "Team",
        win_rate: 20,
      },
      {
        company_id: 353,
        created_on: "2019-02-18 06:56:25.0",
        game_category: "IT",
        game_category_id: 16459,
        game_id: 1200,
        game_image_url: "",
        game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png",
        game_mode: "",
        game_name: "1 Practice Bug Gamej",
        game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=88ab1bda3d8c5e8096f1873bfe2c6f97&type=1",
        game_state: "READY",
        game_type: "1",
        icon_id: 4,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: "A",
        owner_first_name: "1Huddle",
        owner_id: 1,
        owner_last_name: "Team",
        win_rate: 20,
      },
      {
        company_id: 353,
        created_on: "2018-11-29 15:03:53.0",
        game_category: "Uncategorized",
        game_category_id: 10679,
        game_id: 186,
        game_image_url: "",
        game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
        game_mode: "",
        game_name: "1huddle",
        game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=a09ea30e12e02b9ac62ea85f0a07d3b7&type=1",
        game_state: "READY",
        game_type: "1",
        icon_id: 1,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_shop_game: false,
        owner_access_type: "T",
        owner_first_name: "TeamLead",
        owner_id: 77,
        owner_last_name: "TL",
      win_rate: 20,
  }
    ];
  
    const mockCompanyService = [];
    companyServicestub.getCompanies.and.returnValue(of(mockCompanyService));

    const mockLocationService = [];
    locationServicestub.getLocations.and.returnValue(of(mockLocationService));

    const mockDepartmentService = [];
    departmentServicestub.getDepartmentsByLocations.and.returnValue(of(mockDepartmentService));

    fixture.detectChanges();
    });
  
    it('should create component', waitForAsync(() => {
      expect(component).toBeTruthy();
    }));

    it('should check game is pinned', waitForAsync(() => {
      let gameObj={
        company_id: 353,
        created_on: "2022-05-26 07:44:58.0",
        game_category: "Uncategorized",
        game_category_id: 10679,
        game_id: 5774,
        game_image_url: "",
        game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
        game_mode: "",
        game_name: "New Game 1682",
        game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=13e7df8cff879db6b7602800a1e4a303&type=1",
        game_state: "DRAFT",
        game_type: "1",
        icon_id: 9,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_pinned: false,
        is_shop_game: false,
        owner_access_type: "A",
        owner_first_name: "1Huddle",
        owner_id: 1,
        owner_last_name: "Team",
        win_rate: 0,
      }
     
      fixture.detectChanges();
      component.pinGame(gameObj);
      fixture.detectChanges();
      expect(component.pinGamePayload.is_pinned).toBeTruthy();
      fixture.detectChanges();
    }));

    it('should check Pin games is removed', waitForAsync(() => {
      let gameObj={
        company_id: 353,
        created_on: "2022-05-26 07:44:58.0",
        game_category: "Uncategorized",
        game_category_id: 10679,
        game_id: 5774,
        game_image_url: "",
        game_logo: "https://sh-devhuddle.s3-us-west-2.amazonaws.com/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
        game_mode: "",
        game_name: "New Game 1682",
        game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=13e7df8cff879db6b7602800a1e4a303&type=1",
        game_state: "DRAFT",
        game_type: "1",
        icon_id: 9,
        is_archived: false,
        is_deleted: false,
        is_editable: true,
        is_pinned: true,
        is_shop_game: false,
        owner_access_type: "A",
        owner_first_name: "1Huddle",
        owner_id: 1,
        owner_last_name: "Team",
        win_rate: 0,
      }
     
      fixture.detectChanges();
      component.pinGame(gameObj);
      fixture.detectChanges();
      expect(component.pinGamePayload.is_pinned).toBeFalsy();
      fixture.detectChanges();
    }));

    it('should check pin games limit reach', waitForAsync(() => {
      component.pin_games=[
        {
          company_id: 353,
          created_on: "2021-10-20 07:35:01.35",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 5441,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
          game_mode: "",
          game_name: "HUD-8888",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=53c4275782fdb28744843ac5ef62da34&type=1",
          game_state: "READY",
          game_type: 1,
          icon_id: 9,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players: {
            first_name: "Shri",
            games_played: 2,
            last_name: "Talegaonkar",
            player_id: 266998,
            player_rank: 1,
            profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187?t=1618984780469?t=1620724429632?t=1620728648102",
            total_points: 100,
          },
          win_rate: 20,
        },
        {
          company_id: 353,
          created_on: "2019-02-15 09:13:44.13",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 1108,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-3.png",
          game_mode: "CONTEST",
          game_name: "Code1",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=e7ad24a95561df309bf8dd62c08f3a11&type=1",
          game_state: "LIVE",
          game_type: 1,
          icon_id: 2,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players:{
            first_name: "Amar",
            games_played: 3,
            last_name: "Devi",
            player_id: 230653,
            player_rank: 1,
            profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187?t=1618984780469?t=1620724429632?t=1620728648102",
            total_points: 200,
          },
          win_rate: 20,
        },
        {
          company_id: 353,
          created_on: "2022-05-27 11:51:18.51",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 5783,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
          game_mode: "CONTEST",
          game_name: "iOS Text Test",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=094846c440848afa09baed5713fccb48&type=1",
          game_state: "LIVE",
          game_type: 1,
          icon_id: 9,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players: [],
          win_rate: 0,
        },
        {
          company_id: 353,
          created_on: "2022-05-30 07:37:22.37",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 5788,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-1.png",
          game_mode: "",
          game_name: "New Game to Test for notification",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=8ef1b93740efc255287d9cbf7be4a1f9&type=1",
          game_state: "READY",
          game_type: 1,
          icon_id: 1,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players: [],
          win_rate: 0,
        },
        {
          company_id: 353,
          created_on: "2022-06-07 07:08:40.8",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 5822,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
          game_mode: "",
          game_name: "New Game 1699",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=9fc446b1bbc0ee355f3ba60d0ff1d340&type=1",
          game_state: "DRAFT",
          game_type: 1,
          icon_id: 9,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "M",
          owner_first_name: "Shrinath",
          owner_id: 9875,
          owner_last_name: "Malavekar",
          top_players: [],
          win_rate: 0,
        },
        {
          company_id: 353,
          created_on: "2019-02-18 06:56:25.56",
          game_category: "Human Resources",
          game_category_id: 16465,
          game_id: 1206,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-6.png",
          game_mode: "CONTEST",
          game_name: "1 Practice Bug Game",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=4c9635a75c73cfe1484d685545699277&type=1",
          game_state: "LIVE",
          game_type: 1,
          icon_id: 4,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players:{
            first_name: "Amar",
            games_played: 72,
            last_name: "Dhade",
            player_id: 116468,
            player_rank: 1,
            profile_image_url: "",
            total_points: 4900,
          },
          win_rate: 20,
        },
        {
          company_id: 353,
          created_on: "2022-06-07 09:43:50.43",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 5826,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
          game_mode: "",
          game_name: "New Game 1703",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=53389d4bf3eaf082d9fec8390e285c71&type=1",
          game_state: "DRAFT",
          game_type: 1,
          icon_id: 9,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players: [],
          win_rate: 0,
        },
        {
          company_id: 353,
          created_on: "2022-02-15 07:15:47.15",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 5659,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
          game_mode: "",
          game_name: "New Game 1655test noti",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=b5bfcd243bbca41694c98a9de01da954&type=1",
          game_state: "DRAFT",
          game_type: 1,
          icon_id: 9,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players: [],
          win_rate: 0,
        },
        {
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
          top_players: {
            first_name: "Amar",
            games_played: 1,
            last_name: "Devi",
            player_id: 230653,
            player_rank: 1,
            profile_image_url: "https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/1huddle/company/logo/1huddle.png?t=1571395889639?t=1594387975214?t=1594388524493?t=1595326538035?t=1603894589425?t=1603894631187?t=1618984780469?t=1620724429632?t=1620728648102",
            total_points: 1600,
          },
          win_rate: 20,
        },
        {
          company_id: 353,
          created_on: "2022-05-26 07:44:58.44",
          game_category: "Uncategorized",
          game_category_id: 10679,
          game_id: 5774,
          game_image_url: "",
          game_logo: "https://s3-us-west-2.amazonaws.com/sh-devhuddle/public_html/static/adminpanel-dev/assets/img/admin/game_icon/icon-11.png",
          game_mode: "",
          game_name: "New Game 1682",
          game_share_url: "https://1huddle.dev-webapp.1huddle.co/player/gamePreview?game_hash_id=13e7df8cff879db6b7602800a1e4a303&type=1",
          game_state: "DRAFT",
          game_type: 1,
          icon_id: 9,
          is_archived: false,
          is_deleted: false,
          is_editable: true,
          is_pinned: true,
          is_shop_game: false,
          owner_access_type: "A",
          owner_first_name: "1Huddle",
          owner_id: 1,
          owner_last_name: "Team",
          top_players: [],
          win_rate: 0,
        }
      ];
      fixture.detectChanges();
      component.getPinGames();
      fixture.detectChanges();
      expect(component.pinGameLimitReached).toBeTruthy;
      fixture.detectChanges();
    }));

    it('should check if custom fields are dependant on display win rate filter', waitForAsync(() => {
      let filterObj = {
        custom_filter_key: "location_ids",
        filter: "location_ids",
        is_generic_menu: true,
        is_list_search: true,
        is_multi_menu: true,
        is_multi_menu_dependant: "display_winrate_by",
        is_multi_selection: true,
        is_text_search: true,
        placeholder: "Location",
        value: "Location",
      };
      component.getDataSourceWithMultiMenu(filterObj);
      expect(filterObj.is_multi_menu).toBeTruthy();
      expect(filterObj.is_multi_menu_dependant).toBe(Constants.DISPLAY_WIN_RATE_BY);
    }));

    it ('should check if filter option is multi option menu or not', waitForAsync(() => {
      let filterOption = {
        filter: "display_winrate_by",
        is_list_search: true,
        is_multi_option_menu: true,
        is_multi_selection: false,
        is_text_search: false,
        value: "Display Win Rate by",
      };

      component.getDataSource(filterOption);
      expect(filterOption.is_multi_option_menu).toBeTruthy();
    }));

    it('should check if applied filter is dependant on multi menu option', waitForAsync(() => {
      let appliedFilter = [
        {
          additionalFilter: true,
          customFilterKey: "location_ids",
          dependentOn: undefined,
          filter: "location_ids",
          id: 6330,
          isAll: false,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Location",
          value: "Bisha Hotel",
        }
      ];
      component.refreshListOnFilterChange(appliedFilter);
      expect(component.appliedFilters[0].isMultiDependantOn).toBeTruthy();
    }));

    it('should check if archive filter is applied or not', waitForAsync(() => {
      const filters = [{
        additionalFilter: false,
        dependentOn: "",
        filter: "archive",
        isDefault: false,
        isMultiDependantOn: undefined,
        is_static: true,
        searchingIn: "Archive",
        value: "Archive",
      }];
      component.hidePinGamesStatus(filters);
      expect(component.hidePinGamesIfArchive).toBeFalsy();
    }));

    it('should check if multi menu filter is passed in get games payload or not', waitForAsync(() => {
      component.appliedFilters = [
        {
          additionalFilter: true,
          customFilterKey: "location_ids",
          dependentOn: "",
          filter: "location_ids",
          id: 6330,
          isDefault: false,
          isMultiDependantOn: "display_winrate_by",
          is_static: undefined,
          searchingIn: "Location",
          tz_id: undefined,
          tz_name: undefined,
          value: "Bisha Hotel",
        }
      ];

      const gamePayload = {
        company_id: 353,
        display_winrate_by: false,
        include_deleted: false,
        is_archived: true,
        is_company_with_custom_fields: false,
        is_custom: false,
        limit: 20,
        manager_id: 1,
        order: "desc",
        sort_by: "created_on",
        start_index: 0,
        used_in: "game_library",
      }

      component.preparePayloadForAppliedFilters(gamePayload);
      fixture.detectChanges();
      expect(gamePayload.display_winrate_by).toBeTruthy();
    }));

    it('should check if multi menu filter is passed in get pingames payload or not', waitForAsync(() => {
      component.appliedFilters = [
        {
          additionalFilter: true,
          customFilterKey: "location_ids",
          dependentOn: "",
          filter: "location_ids",
          id: 6330,
          isDefault: false,
          isMultiDependantOn: "display_winrate_by",
          is_static: undefined,
          searchingIn: "Location",
          tz_id: undefined,
          tz_name: undefined,
          value: "Bisha Hotel",
        }
      ];

      const pingamePayload = {
        company_id: 353,
        display_winrate_by: false,
        is_company_with_custom_fields: false,
        is_custom: false,
        manager_id: 1,
      }

      component.preparePayloadForAppliedFilters(pingamePayload);
      fixture.detectChanges();
      expect(pingamePayload.display_winrate_by).toBeTruthy();
    }));


    it('should check if all options are selected in one of the applied filter', waitForAsync(()=>{

      component.appliedFilters = [
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 1,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Rooms",
        }, 
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 3,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Commercial",
        }, 
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 4,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Food and Beverage",
        },
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 11,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "social",
        },
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 5,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Legal",
        },
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 6,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Finance/IT",
        },
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 7,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Human Resources",
        },
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 8,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Facilities",
        },
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 9,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Support",
        },
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 10,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "Beverage only",
        }, 
        {
          additionalFilter: true,
          customFilterKey: "job_family_group",
          dependentOn: undefined,
          filter: "18",
          id: 12,
          isAll: true,
          isDefault: undefined,
          isMultiDependantOn: "display_winrate_by",
          searchingIn: "Job Family Group",
          value: "ancient",
        }  
      ];

      const gamePayload = {
        company_id: 353,
        display_winrate_by: false,
        include_deleted: false,
        is_archived: true,
        is_company_with_custom_fields: false,
        is_custom: false,
        limit: 20,
        manager_id: 1,
        order: "desc",
        sort_by: "created_on",
        start_index: 0,
        used_in: "game_library",
      }

      component.preparePayloadForAppliedFilters(gamePayload);
      expect(gamePayload[component.appliedFilters[0].customFilterKey]['is_all']).toBeTruthy();
      fixture.detectChanges();
    }));

});
