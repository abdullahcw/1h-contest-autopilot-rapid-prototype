import {
  Component, OnInit, HostListener, ViewChild, ViewChildren, ChangeDetectorRef, Input,
  AfterViewInit, OnDestroy, Injector
} from '@angular/core';
import { Constants, ApiService, PlaceholderText } from '../../services/network/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { StorageService } from '../../services/storage/storage.service';
import { GlobalService, UsageLimit } from 'src/app/services/global/global.service';
import { DelegateService } from '../../services/delegate/delegate.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { GamesService, Game } from '../../services/games/games.service';
import { Paginations } from 'src/app/services/global/global.service';
import { LoginService, Route } from '../../services/login/login.service';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { SelectGameTypeComponent } from '../select-game-type/select-game-type.component';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { ValidationDialogComponent } from '../validation-dialog/validation-dialog.component';
import { AddItemsComponent } from '../add-items/add-items.component';
import { CompanyService } from 'src/app/services/company/company.service';
import { AddToMarketplaceComponent } from '../add-to-marketplace/add-to-marketplace.component';
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
import { AlertComponent } from '../alert/alert.component';
import { SsrDialogComponent } from '../../admin/ssr-dialog/ssr-dialog.component';
import { DepartmentService } from 'src/app/services/department/department.service';
import { LocationService } from 'src/app/services/location/location.service';
import { GamePathwayService } from 'src/app/services/game-pathway/game-pathway.service';

const gameType = [{ 'id': '1', 'game_type': 'Single Player' }, { 'id': '2', 'game_type': 'Multiplayer' }];
const gameState = [{ 'id': 'LIVE', 'game_state': 'Live' },
{ 'id': 'READY', 'game_state': 'Ready' },
{ 'id': 'DRAFT', 'game_state': 'Draft' }
];

const winRate = [{ 'id': '0_50', 'win_rate': '0-50' },
{ 'id': '51_75', 'win_rate': '51-75' },
{ 'id': '76_100', 'win_rate': '76-100' },
{ 'id': 'no_gameplay', 'win_rate': 'No Gameplay' }
];

const multiplayerGameState = [{ 'id': 'LIVE', 'game_state': 'Live' },
{ 'id': 'DRAFT', 'game_state': 'Draft' }
];
let gameCatListForFilters: any = [];
let gameOwnerListForFilters: any = [];
class GameCategory {
  'id': any;
  'game_category_id': ''; // Should be same as search key in api
}

class Pathway {
  'id': any;
  'pathway_id': ''; // Should be same as search key in api
}
class GameOwner {
  'id': any;
  'owner_id': ''; // Should be same as search key in api
}

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit, AfterViewInit, OnDestroy {
  is_loading: boolean;
  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  selectedGameForFilter = {
    'game_category_id': null,
    'game_category': null
  };

  filterOptionState = {
    'filter': Constants.GAME_STATE, value: this.translate.instant('state'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.GAME_STATE, 'is_filter_disabled': false
  };

  filter_options = [{
    'filter': Constants.GAME_NAME, value: this.translate.instant('game'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.GAME_NAME
  },
  {
    'filter': Constants.WIN_RATE, value: this.translate.instant('win_rate'), 'is_text_search': false, 'is_list_search': true,
    'placeholder': PlaceholderText.WIN_RATE, 'remove_search': true
  },
  {
    'filter': Constants.DISPLAY_WIN_RATE_BY, value: this.translate.instant('display_winrate_by'), 'is_text_search': false, 'is_list_search': true,
    'is_multi_option_menu': true, 'is_multi_selection': false, 'is_filter_disabled': false
  },
  {
    'filter': Constants.GAME_TYPE, value: this.translate.instant('type'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.GAME_TYPE
  },
  {
    'filter': Constants.GAME_STATE, value: this.translate.instant('state'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.GAME_STATE, 'is_filter_disabled': false
  },
  {
    'filter': Constants.GAME_CATEGORY_ID, value: this.translate.instant('category'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.CATEGORY_NAME
  },
  {
    'filter': Constants.PATHWAY_ID, value: this.translate.instant('pathway_filter'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.PATHWAY_NAME
  },
  {
    'filter': Constants.OWNER_ID, value: this.translate.instant('owner'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.OWNER_NAME
  },
  {
    'filter': Constants.ARCHIVE, value: this.translate.instant('archive'), 'is_text_search': true, 'is_list_search': false,
    'is_static': true, 'is_filter_disabled': false, 'is_border': true
  }
  ];
  appliedFilters = [];
  noOfItemsPerPage: number;
  dataSource: any;
  games: any;
  totalGames = 0;
  startLimit = 0;
  pageIndex = 0;
  pageSizeOptions: number[];
  gameCategories = [];
  gamePathways = [];
  gameOwners = [];
  menuList = [];
  breakpoint = 4;
  allowMultiSelect = true;
  isMultilevelTab: boolean;
  gameState;
  selectedgameState;
  selectedgameType;
  selectedGame = -1;
  selectedGameId;
  selection = new SelectionModel<Game>(this.allowMultiSelect, []);
  @ViewChildren('menuTrigger', { read: MatMenuTrigger }) triggerMatMenu: MatMenuTrigger;
  @ViewChild('scrollMenu') scrollMenu;
  gameId: any;
  @Input() context: String = 'games';
  gamePermission: any;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  // @ViewChild(MatPaginator) paginator: MatPaginator;
  delegateSubscription: any;
  isEditable: any;
  isScheduleAvailable: boolean; // isEditable + canMakeMPLive by mid man of same SOM.
  gameShareUrl: any;
  itemList;
  searchCompanyName;
  company_list = [];
  role = Role;
  isNewTrial;
  search_options = [];
  fieldFetchSubscription: any;
  customFieldFetchSubscription: any;
  departmentList = [];
  customManagerList = [];
  locationList = [];
  multiMenuList = [];
  showPinGames = true;
  pin_games = [];
  pinGameLimitReached:boolean;
  is_pingames_loading: boolean;
  hideRightScrollBtn: boolean = false;
  hideLeftScrollBtn: boolean = true;
  pinGamePayload;
  hidePinGamesIfArchive = true;
  isMultiplayerGame = false;

  // services required
  gamesService: GamesService; 
  departmentService: DepartmentService;
  locationService: LocationService;
  managerService: ManagerService;
  activatedRoute: ActivatedRoute;
  loginService: LoginService;
  dialog: MatDialog;
  delegateService: DelegateService; 
  snackBar: MatSnackBar;
  apiService: ApiService;
  globalService: GlobalService;
  router: Router;
  companyService: CompanyService;
  storageService: StorageService;
  permissionService: PermissionsService;
  

  constructor(public injector: Injector, 
    public gamePathwayService : GamePathwayService,
    public cdRef: ChangeDetectorRef, public translate: TranslateService){
    this.gamesService = injector.get<GamesService>(GamesService);
    this.departmentService = injector.get<DepartmentService>(DepartmentService);
    this.locationService = injector.get<LocationService>(LocationService);
    this.managerService = injector.get<ManagerService>(ManagerService);
    this.activatedRoute = injector.get<ActivatedRoute>(ActivatedRoute);
    this.dialog = injector.get<MatDialog>(MatDialog);
    this.loginService = injector.get<LoginService>(LoginService);
    this.delegateService = injector.get<DelegateService>(DelegateService);
    this.snackBar = injector.get<MatSnackBar>(MatSnackBar);
    this.apiService = injector.get<ApiService>(ApiService);
    this.globalService = injector.get<GlobalService>(GlobalService);
    this.router = injector.get<Router>(Router);
    this.companyService = injector.get<CompanyService>(CompanyService);
    this.storageService = injector.get<StorageService>(StorageService);
    this.permissionService = injector.get<PermissionsService>(PermissionsService);
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      // isMultilevelTab
      this.search_options = [];
      this.appliedFilters = [];
      this.hidePinGamesIfArchive = true;
      if (this.router.url.indexOf('games') !== -1) {
        this.refreshGamesList();
      }
      this.addRemoveFilterOption(this.appliedFilters);
    });


    if (this.storageService.getTab() === 'mlg') {
      this.isMultilevelTab = false;
    } else {
      this.isMultilevelTab = true;
    }

  }
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateBreakpoint();
  }

  ngOnInit() {
    this.storageService.setGameLanguage(null);
    this.storageService.setSelectedLanguage(null);
    this.setGamePermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setGamePermission();
    });
    this.calculateBreakpoint();
    this.getCompanies();
    if (this.storageService.getFilterFromStorageArrayLength(this.context)) {
      this.appliedFilters = this.storageService.getFilterArray(this.context);
    }
    this.refreshGamesList();
    this.checkScroll();
    const show_ssr_dialog = localStorage.getItem('show_ssr_dialog');
    if (this.storageService.getAccessType() !== Role.ADMIN && show_ssr_dialog && show_ssr_dialog == 'true') {
      this.ssrDialog();
    }
  }
  ssrDialog() {
    const ssrRef = this.dialog.open(SsrDialogComponent, {
      disableClose: true
    });
  }
  ngAfterViewInit(): void {
    if (this.pageIndex) {
      this.paginator.pageIndex = this.pageIndex;
    }
    setTimeout(() => {
      const gameFilters = this.storageService.getFilterArray(this.context);
      this.addRemoveFilterOption(gameFilters);
    });
    this.globalService.getFormattedPaginationLabel(this.paginator);
    this.cdRef.detectChanges();
  }
  setGamePermission() {
    this.gamePermission = this.permissionService.getPermissions(PermissionsKey.GAME);
  }

  menuOpened(index, data) {
    this.selectedGameId = null;
    this.selectedGame = index;
    this.selectedGameId = data;
    this.selectedgameState = data.game_state;
    this.gameId = data.game_id;
    this.selectedgameType = data.game_type;
    this.isEditable = data.is_editable;
    this.isScheduleAvailable = data.can_make_mp_live;
    this.gameShareUrl = data.game_share_url;
  }
  menuClosed() {
    this.selectedGame = -1;
  }

  calculateBreakpoint() {
    this.breakpoint = window.innerWidth / 400;
    if (this.breakpoint <= 1.8 && this.breakpoint > 1.2) {
      this.breakpoint = 1.4;
    }
  }

  // setDefaultFiltersForCustomCompany() {
  //   this.refreshListOnFilterChange(this.appliedFilters);
  // }

  prepareFilterOptions() {
    const fields = this.companyService.getFields(true);
    if (!(fields && fields.length)) { return; }
    this.search_options = this.globalService.addeditCustomFilters(this.search_options, fields, 0);
    this.search_options.forEach(filterOption => {
      filterOption['is_multi_menu'] = true;
      filterOption['is_multi_menu_dependant'] = Constants.DISPLAY_WIN_RATE_BY;
    });
  }

  prepareCustomFilterOptions() {
    const customFields = this.companyService.getCustomFields();
    if (!(customFields && customFields.length)) { return; }
    // custom fields for companies
    this.search_options = this.globalService.addeditCompanyCustomFilters(this.search_options, customFields, 0);
    this.search_options.forEach(filterOption => {
      filterOption['is_multi_menu'] = true;
      filterOption['is_multi_menu_dependant'] = Constants.DISPLAY_WIN_RATE_BY;
      if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
        filterOption['dependent_on'] = Constants.LOCATION_IDS;
      }
    });
  }

  refreshListOnFilterChange(filters) {
    // pinned games archive scenario
    this.hidePinGamesStatus(filters);
    this.checkDisplayWinRateFilters(filters);
    this.storeFilters(filters);
    this.addRemoveFilterOption(this.appliedFilters);
    this.cdRef.detectChanges();
  }

  hidePinGamesStatus(filters) {
    if (!filters.length) {
      this.hidePinGamesIfArchive = true;
    } else {
      const archiveCount = filters.filter(option => {
        return option.filter === Constants.ARCHIVE;
      });
      if (archiveCount.length) {
        this.hidePinGamesIfArchive = false
      } else {
        this.hidePinGamesIfArchive = true;
      }
    }
  }

  checkDisplayWinRateFilters(filters) {
    if (filters && filters.length) {
      const displayWinRateFilter = filters.filter(filter => filter.isMultiDependantOn == Constants.DISPLAY_WIN_RATE_BY);
      if (displayWinRateFilter.length) {
        const uniqueFilters = this.globalService.findUniqueFilters(displayWinRateFilter);
        if (uniqueFilters.length == this.search_options.length) {
          this.filter_options.forEach(option => {
            if (option.filter === Constants.DISPLAY_WIN_RATE_BY) {
              option.is_filter_disabled = true;
            }
          });
        } else {
          this.filter_options.forEach(option => {
            if (option.filter === Constants.DISPLAY_WIN_RATE_BY) {
              option.is_filter_disabled = false;
            }
          });
        }
      } else {
        this.filter_options.forEach(option => {
          if (option.filter === Constants.DISPLAY_WIN_RATE_BY) {
            option.is_filter_disabled = false;
          }
        });
      }
    }
  }

  addRemoveFilterOption(appliedFilters) {
    if (appliedFilters && appliedFilters.length == 0) {
      this.filter_options.forEach(option => {
        if (option.filter === Constants.GAME_STATE || option.filter === Constants.ARCHIVE || option.filter === Constants.DISPLAY_WIN_RATE_BY) {
          option.is_filter_disabled = false;
        }
      });
    }

    let archiveCount, stateCount;
    if (appliedFilters) {
      archiveCount = appliedFilters.filter(option => {
        return option.filter === Constants.ARCHIVE;
      });
      stateCount = appliedFilters.filter(option => {
        return option.filter === Constants.GAME_STATE;
      });
    }
    if (archiveCount && archiveCount.length > 0) {
      this.filter_options.forEach(option => {
        if (option.filter === Constants.GAME_STATE) {
          option.is_filter_disabled = true;
        }
      });
    } else {
      this.filter_options.forEach(option => {
        if (option.filter === Constants.GAME_STATE) {
          option.is_filter_disabled = false;
        }
      });
    }

    if (stateCount && stateCount.length > 0) {
      this.filter_options.forEach(option => {
        if (option.filter === Constants.ARCHIVE) {
          option.is_filter_disabled = true;
        }
      });
    } else {
      this.filter_options.forEach(option => {
        if (option.filter === Constants.ARCHIVE) {
          option.is_filter_disabled = false;
        }
      });
    }

    this.checkDisplayWinRateFilters(appliedFilters);
  }

  storeFilters(filters) {
    this.appliedFilters = filters;
    if (this.appliedFilters) {
      this.appliedFilters.forEach(filterOption => {
        if (filterOption.customFilterKey === Constants.DEPARTMENT_IDS) {
          filterOption['dependentOn'] = Constants.LOCATION_IDS;
        }
      });
    }
    this.storageService.setFilters(this.context, this.appliedFilters);
    this.startLimit = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.getGamesByWinRate(); 
    const archiveCount = this.appliedFilters.filter(option => {
      return option.filter === Constants.ARCHIVE;
    });
    if (!archiveCount.length) {
      this.getPinGames();
    }
  }

  stateChange(context, gameId, currentState, selectedGameType) {
    if (currentState === 'DRAFT' && +selectedGameType === 2) {
      const payload = {
        'game_id': gameId,
        'company_id': this.storageService.getCompanyId(),
        'game_state': context,
        'game_mode': 'CONTEST'
      };
      this.updateGameState(payload, selectedGameType);
    } else {
      const payload = {
        'game_id': gameId,
        'company_id': this.storageService.getCompanyId(),
        'game_state': context,
      };
      this.updateGameState(payload, selectedGameType);
    }
  }
  updateGameState(payload, gameType) {
    this.gamesService.updateGameState(payload).subscribe((res) => {
      const response = res;
      if (!response.success) {
        if (!response.data.game_is_valid) {
          const obj = response.data;
          const validationRef = this.dialog.open(ValidationDialogComponent, {
            data: obj
          });
        } else {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        }
      } else {
        this.getGamesByWinRate();
        if (+gameType == 1) {
          this.getPinGames();
        }
      }

    });
  }

  getGamesByWinRate() {
    this.is_loading = true;
    const gamePayload = {
      'company_id': this.storageService.getCompanyId(),
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      'start_index': this.startLimit,
      'limit': this.noOfItemsPerPage,
      'manager_id': this.storageService.getLoginUserID(),
      'used_in': 'game_library',
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
      'include_deleted': false,
      'display_winrate_by': false,
      'is_archived': false
    };

    this.preparePayloadFor(Constants.GAME_NAME, gamePayload, 'game_name');
    this.preparePayloadFor(Constants.GAME_TYPE, gamePayload, 'game_type');

    this.preparePayloadForAppliedFilters(gamePayload);

    this.gamesService.getGamesByWinRate(gamePayload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.games = response.data.game_list;
        this.totalGames = response.data.total_game;
        this.pinGameLimitReached = response.data.pin_game_limit_reached;
      }
    });
  }

  preparePayloadFor(constant, payload, key) {
    const filters = this.appliedFilters.filter((item) => {
      return item.filter === constant || item.hasOwnProperty(constant);
    });
    if (filters.length) {
      payload[key] = {
        'ids' : [],
        'is_all': false
      };
      filters.forEach((element) => {
        if (element.customFilterKey === key) {
          payload[key]['ids'].push(element.id);
          if (payload.hasOwnProperty(key) && payload[key]['ids'].indexOf(element.id) === -1) {
            payload[key]['ids'].push(element.id);
          }
        } else if (element.filter == key) {
          payload[key] = element.filter == Constants.GAME_TYPE ? +element.id : element.value
        }
      });
    }
  }

  onValChange(val) {
    this.globalService.addAdminGoogleEvent('Game_Library_Multi_level_Multi_Level_Game_Selected');
    this.isMultilevelTab = val;
  }
  tabChangefromMlg(data) {
    this.globalService.addAdminGoogleEvent('Game_Library_Single_level_Single_Level_Game_Selected');
    this.isMultilevelTab = true;
    this.storageService.setTeb('game');
    this.refreshGamesList();
  }
  getCompanies() {
    const companyFilter = `company_name=${this.searchCompanyName}`;
    // tslint:disable-next-line:max-line-length
    this.companyService.getCompanies(Constants.COMPANY_NAME, 'asc', 0, 100, companyFilter).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        if (!this.company_list) {
          this.company_list = response.data.company_list;
        }
        this.prepareCompanyListForItemComponent(response.data.company_list);
      }
    });

  }
  getDataSource(filter) {
    if (filter.is_multi_menu) return;
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.GAME_TYPE:
        this.menuList = gameType;
        break;
      case Constants.WIN_RATE:
        this.menuList = winRate;
        break;
      case Constants.DISPLAY_WIN_RATE_BY:
        this.search_options = [];
        if (this.globalService.isCompanyBelongsToCustomField()) {
          this.prepareFilterOptions();
        } else {
          this.prepareCustomFilterOptions();
        }
        this.menuList = this.search_options;
        break;
      case Constants.GAME_STATE:
        this.menuList = this.getStateFilters();
        break;
      case Constants.GAME_CATEGORY_ID:
        this.getCategory();
        break;
        case Constants.PATHWAY_ID:
          this.getPathways();
          break;  
      case Constants.OWNER_ID:
        this.getOwner();
        break;
    }
    this.cdRef.detectChanges();
  }

  getDataSourceWithMultiMenu(filterName) {
    console.log('filterName', filterName);
    if (filterName.is_multi_option_menu || !filterName.is_multi_menu) return;
    switch(filterName) {
      case Constants.LOCATION_IDS:
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filterName);
        break;
      default:
        if (this.globalService.isCompanyBelongsToCustomField()) {
          this.getValues(filterName);
        } else {
          this.getCustomFieldsValues(filterName);
        }
      break;
    }
    this.cdRef.detectChanges();
  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    const searchFilter = {
      'search_text': searchKey ? searchKey : '',
      'filter': filterKey,
      'value': currentFilter.value,
      'is_multi_selection': currentFilter.is_multi_selection,
      'custom_filter_key': currentFilter.custom_filter_key,
      'is_multi_menu_dependant': currentFilter.is_multi_menu_dependant
    };
    if (searchKey) {
      if (this.globalService.isCompanyBelongsToCustomField()) {
        this.getValues(searchFilter);
      } else {
        this.getCustomFieldsValues(searchFilter);
      }
    }
    this.cdRef.detectChanges();
  }

  getValues(filterDetails) {
    const companyId = this.storageService.getCompanyId();
    const field = filterDetails.filter;
    const searchingIn = filterDetails.value;
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.companyService.getValues(field, companyId, searchText ? searchText : null).subscribe(res => {
      const response: any = res;
      if (response.success) {
        this.prepareList(filterDetails, response, searchingIn, field);
        this.cdRef.detectChanges();
      }
    });
  }

  getCustomFieldsValues(filterDetails) {
    if (filterDetails.custom_filter_key === Constants.LOCATION_IDS) {
      this.getLocations(filterDetails);
      return;
    }
    if (filterDetails.custom_filter_key === Constants.DEPARTMENT_IDS) {
      this.getDepartmentsByLocations(filterDetails);
      return;
    }

    const companyId = this.storageService.getCompanyId();
    const field = filterDetails.filter;
    const searchingIn = filterDetails.value;
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.companyService.getCustomFieldsValues(field, companyId, searchText ? searchText : null).subscribe(res => {
      const response: any = res;
      if (response.success) {
        this.prepareList(filterDetails, response, searchingIn, field);
        this.cdRef.detectChanges();
      }
    });
  }

  getLocations(filterDetails) {
    const loginUser = JSON.parse(this.storageService.getUser());
    let filters = '';
    if (loginUser) {
      filters = `manager_id=${loginUser.manager_id}`;
    }
    this.locationService.getLocations(this.storageService.getCompanyId(),
    Constants.LOCATION_NAME, 'asc', 0, 0, filters, false).subscribe((res) => {
      const response: any = res;
      let locations = [];
      const locList = [];
      if (!response.success) { return; }
      if (response.data) {
        locations = response.data.location_list;
      }
      locations.forEach((location) => {
        locList.push({
          id: location.location_id,
          value: location.location_name,
        });
      });
      const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': 'Location', 'is_multi_menu_dependant': filterDetails.is_multi_menu_dependant };
      this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters);
      this.multiMenuList = this.locationList;
      this.cdRef.detectChanges();
    });
    this.cdRef.detectChanges();
  }

  getDepartmentsByLocations(filterDetails) {
    const locationFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.LOCATION_IDS;
    });
    let locIds = [];
    if (locationFilters && locationFilters.length > 0) {
      locationFilters.forEach(loc => {
        if (Array.isArray(loc['id'])) {
          locIds = loc['id'];
        } else {
          locIds.push(loc['id']);
        }
      });
    }

    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'location_ids': locIds
    };
    this.departmentService.getDepartmentsByLocations(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      const list = [];
      const deptList = response.data.department_list;
      deptList.forEach((department) => {
        list.push({
          id: department.department_id,
          value: department.department_name,
        });
      });
      this.multiMenuList = [];
      const filterInfo = {
        'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': this.translate.instant('department'),
        'dependentOn': Constants.LOCATION_IDS, 'is_multi_menu_dependant': filterDetails.is_multi_menu_dependant 
      };
      this.departmentList = this.globalService.prepareSelectionList(list, filterInfo, this.appliedFilters);
      this.multiMenuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }

  prepareListForSelection(list) {
    if (!list) { return; }
    const preparedList = [];
    list.forEach((location) => {
      preparedList.push({
        id: location.location_id,
        value: location.location_name
      });
    });
    return preparedList;
  }

  getStateFilters() {
    for (let modifiedFilter of this.appliedFilters) {
      if (modifiedFilter.filter === 'game_type' && +modifiedFilter.id === 2) {
        return multiplayerGameState;
      }
    }
    return gameState;
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'game_name':
        this.sort.sortBy = Constants.GAME_NAME;
        break;
      case 'game_state':
        this.sort.sortBy = Constants.GAME_STATE;
        break;
      case 'game_type':
        this.sort.sortBy = Constants.GAME_TYPE;
        break;
      case Constants.GAME_CATEGORY_ID:
        this.sort.sortBy = Constants.GAME_CATEGORY_ID;
        break;
        case Constants.PATHWAY_ID:
        this.sort.sortBy = Constants.PATHWAY_ID;
        break;
      case Constants.OWNER_ID:
        this.sort.sortBy = Constants.OWNER_ID;
        break;
      case Constants.ARCHIVE:
        this.sort.sortBy = Constants.ARCHIVE;
    }
    this.sort.order = sort.direction;
    this.getGamesByWinRate();
  }

  getPathways() {    
    const company_id = this.storageService.getCompanyId();
    this.gamePathwayService.getGamePathway(company_id,null,null,0,500).subscribe((res) => {            
      const response: any = res;    
      
    this.gamePathways = [];
      if (response.success) {
        let gamePathwaysList = [];
        response.data.pathways.forEach(item => {
          const gamePathway = new Pathway();
          gamePathway['id'] = item.pathway_id;
          gamePathway[Constants.PATHWAY_ID] = item.pathway_name;
          gamePathwaysList.push(gamePathway);
        });
        this.gamePathways = gamePathwaysList;
        this.menuList = this.gamePathways;   
      }      
    });
      
  }

  getCategory() {
    const company_id = this.storageService.getCompanyId();
    this.gamesService.getGameCategories(company_id,true).subscribe((res) => {
      const response: any = res;
      this.gameCategories = [];
      if (response.success) {
        gameCatListForFilters = [];
        response.data.game_category_list.forEach(item => {
          const gameCat = new GameCategory();
          gameCat['id'] = item.game_cat_id;
          gameCat[Constants.GAME_CATEGORY_ID] = item.category_name;
          gameCatListForFilters.push(gameCat);
        });
        this.gameCategories = gameCatListForFilters;
        this.menuList = this.gameCategories;
      }
    });
  }
  getOwner() {
    const companyId = this.storageService.getCompanyId();
    this.gamesService.getOwners(companyId, 'first_name', 'asc').subscribe((res) => {
      const response: any = res;
      this.gameOwners = [];
      if (response.success) {
        gameOwnerListForFilters = [];
        const superAdmin: any = {
          'first_name': this.translate.instant('huddle_team'),
          'last_name': '',
          'access_type': 'SA',
          'manager_id': -1
        };
        response.data.owner_list.push(superAdmin);
        response.data.owner_list.forEach(item => {
          const gameOwner = new GameOwner();
          gameOwner['id'] = item.manager_id;
          const space: any = ' ';
          gameOwner[Constants.OWNER_ID] = item.first_name + space + item.last_name;
          gameOwnerListForFilters.push(gameOwner);
        });
        this.gameOwners = gameOwnerListForFilters;
        this.menuList = this.gameOwners;
      }
    });
  }

  getGamesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getGamesByWinRate();
  }


  confirmDeletion(gameObj) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: gameObj.game_id
    });
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_this_game');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteGames(gameObj);
    });
  }

  checkIsGameLive() {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('cannot_delete_live_games');
    dialogRef.componentInstance.title = this.translate.instant('cannot_delete_live_games_title');
    dialogRef.componentInstance.showOKbtn = true;
  }



  deleteGames(gameObj) {
    const companyId = this.storageService.getCompanyId();
    this.gamesService.deleteGames(companyId, gameObj.game_id).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'LIVE_GAME_DELETE_RESTRICTION') {

          this.globalService.addAdminGoogleEvent('Game_Library_Single_level_By_Deletion_restricted');
          this.checkIsGameLive();
          return;

        }

        this.globalService.showMessage(this.apiService.getErrorMessage('unable_to_delete_game'));
        return;
      }
      this.globalService.addAdminGoogleEvent('Game_Library_Single_level_By_Game_deleted');
      this.games.forEach((games, index) => {
        if (games.game_id === gameObj.game_id) {
          this.games.splice(index, 1);
        }
      });
      this.selection = new SelectionModel<Game>(true, []);
      if (gameObj.is_archived) {
        this.globalService.addAdminGoogleEvent('Game_Archiving_Archived_Game_Deleted');

        this.globalService.showMessage(this.translate.instant('game_deleted'), 'right', 'bottom');

      }
      this.refreshGamesList();
    });
  }

  duplicateGame(game) {
    const payload = {
      'game_id': game.game_id,
      'company_id': this.storageService.getCompanyId(),
    };

    this.gamesService.copyGame(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'GAME_LIMIT_EXCEEDED') {
          this.showLimit(response);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Games_Cloning');
          return;
        }
      }
      const data = res.data;
      let cloneGame: any;
      cloneGame = data.game_details;
      cloneGame.polling_identifier = data.polling_identifier;
      this.games.forEach((games, index) => {
        if (games.game_id === game.game_id) {
          this.games.splice(index + 1, 0, cloneGame);
        }
      });
      this.getCopyGameProgress(data.polling_identifier, data.game_details.game_id);
    });
  }

  openCompanySelectionDialog() {
    const dialogRef = this.dialog.open(AddItemsComponent, {
      data: {
        singularWord: this.translate.instant('company'),
        pluralWord: this.translate.instant('companies'),
        items: this.itemList
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('games');

    dialogRef.componentInstance.searchItems.subscribe((searchKeyWord) => {
      this.searchCompanyName = searchKeyWord;
      this.getCompanies();

    });

    dialogRef.componentInstance.updateItems.subscribe((data) => {
      this.copyGameToCompanies(data);
    });
    dialogRef.afterClosed().subscribe(() => {
      this.searchCompanyName = '';
      this.getCompanies();
    });
  }

  openMarketplaceSelectionDialog() {
    this.dialog.open(AddToMarketplaceComponent, {
      data: { game: this.selectedGameId, name: 'Add to The Shop' }
    });
  }


  prepareCompanyListForItemComponent(companyList) {
    let copyOfCompanyList = [];
    copyOfCompanyList = companyList;
    copyOfCompanyList.filter(item => {
      item['itemKeyId'] = item.company_id;
      item['itemKeyName'] = item.company_name;
    });
    this.globalService.listOfItems(copyOfCompanyList);
    this.itemList = copyOfCompanyList;
  }

  copyGameToCompanies(data) {
    const payload = {
      'game_id': this.selectedGameId.game_id,
      'company_ids': data,
    };
    this.gamesService.copyGameToCompanies(payload).subscribe((res) => {
      const response = res;
      if (!response.success) {
        if (response.message_code === 'GAME_LIMIT_EXCEEDED') {
          const dialogRef = this.dialog.open(PaywallActionComponent,
            {
              disableClose: true,
              data: { sdr: null, csr: null }
            });
          dialogRef.componentInstance.title = this.translate.instant('game_limit_reached_msg_title');
          dialogRef.componentInstance.message = this.translate.instant('game_limit_reached_popup_msg');
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Games_Added_To_Company');
          return;
        }
      }
      this.globalService.showMessage(this.translate.instant('game_created_for_companies'));
    });
  }

  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Game_Library_Single_level_${filter.filter}`;
    if (filter.filter === Constants.GAME_TYPE || filter.filter === Constants.GAME_STATE
      || filter.filter === Constants.GAME_CATEGORY_ID) {
      this.globalService.addAdminGoogleEvent(`${keyName}_${filter.value.split(' ').join('_')}`);
      return;
    }
    if (filter.filter === Constants.ARCHIVE) {
      this.globalService.addAdminGoogleEvent('Game_Archiving_Filtered_by_Archive');
      return;
    }
    if (filter.filter === Constants.WIN_RATE) {
      this.globalService.addAdminGoogleEvent(`Game_Library_Single_level_Winrate_${filter.id}`);
      return;
    }
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }

  getCopyGameProgress(pollingID, gameId) {
    let response;
    let that;
    that = this;
    const gameInterval = setInterval(function () {
      that.gamesService.copyQuestionsProgress(pollingID).subscribe((res) => {
        response = res;
        if (response && response.data && response.data.question_copy_progress === 100) {
          clearInterval(gameInterval);
          that.games.forEach(games => {
            if (games.game_id === gameId) {
              games['polling_identifier'] = null;
            }
          });
        }
      });
    }, 5000);
    this.globalService.addAdminGoogleEvent('SLG_Cloned');

  }

  scheduleGame() {
    this.storageService.setObject('scheduling_game', this.games[this.selectedGame]);
    const url = Route.SCHEDULE_GAME;
    this.router.navigate([url]);
  }

  navigateToGamePage() {
    const dialogRef = this.dialog.open(SelectGameTypeComponent, {
    });
  }

  navigateToEditGamePage(game = null) {
    this.gamesService.gameBeingEdited = game;
    this.storageService.setGameObject(this.gamesService.gameBeingEdited);
    this.router.navigate([Route.GAME]);
  }

  archiveGame(gameObj) {
    this.is_loading = true;
    const payload = {
      'game_id': gameObj.game_id,
      'company_id': this.storageService.getCompanyId(),
    };
    this.gamesService.archiveGame(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
      }
      this.globalService.showMessage(this.translate.instant('game_moved_to_archive'), 'right', 'bottom');
      this.globalService.addAdminGoogleEvent('Game_Archiving_Game_Archived');
      this.refreshGamesList();
    });
  }

  addToGameLibrary(gameObj) {
    this.is_loading = true;
    const payload = {
      'game_id': gameObj.game_id,
      'company_id': this.storageService.getCompanyId(),
    };
    this.gamesService.unarchiveGame(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
      }
      this.globalService.showMessage(this.translate.instant('game_moved_to_library'), 'right', 'bottom');
      this.globalService.addAdminGoogleEvent('Game_Archiving_Game_Unarchived');
      this.getGamesByWinRate();
    });
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }

  copyText(val: string) {
    const selectBox = document.createElement('textarea');
    selectBox.style.position = 'fixed';
    selectBox.style.left = '0';
    selectBox.style.top = '0';
    selectBox.style.opacity = '0';
    selectBox.value = val;
    document.body.appendChild(selectBox);
    selectBox.focus();
    selectBox.select();
    document.execCommand('copy');
    document.body.removeChild(selectBox);
    this.showMessage(this.translate.instant('url_copied'));
  }

  showLimit(response) {
    const displayData = this.globalService.usageLimit(response.data, UsageLimit.GAME_EXCEEDED);
    const dialogRef = this.dialog.open(PaywallActionComponent,
      {
        disableClose: true,
        data: displayData
      });
    dialogRef.componentInstance.title = displayData.title;
    dialogRef.componentInstance.message = displayData.message;
  }

  getPinGames() {
    const pingamePayload = {
      'company_id': this.storageService.getCompanyId(),
      'manager_id': this.storageService.getLoginUserID(),
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
      'display_winrate_by': false,
    };

    this.preparePayloadFor(Constants.GAME_NAME, pingamePayload, 'game_name');
    this.preparePayloadFor(Constants.GAME_TYPE, pingamePayload, 'game_type');

    this.preparePayloadForAppliedFilters(pingamePayload);

    this.is_pingames_loading = true;
    this.gamesService.getPinnedGames(pingamePayload).subscribe((res) => {
      const response: any = res;
      this.is_pingames_loading = false;
      if (response.success) {
        this.pin_games = response.data.pinned_games;
        this.isMultiplayerGame = false;
      } else {
        if (response.message_code === 'UNABLE_TO_PIN_MULTIPLAYER_GAMES') {
          this.isMultiplayerGame = true;
          this.pin_games = [];
        }
      }
    });
  }

  refreshGamesList() {
    this.getGamesByWinRate();
    this.getPinGames();
  }

  pinGame(gameObj){
    
    const updatePinGamePayload = {
      'company_id': this.storageService.getCompanyId(),
      'manager_id':this.storageService.getLoginUserID(),
      'game_id':gameObj.game_id,       
      'is_pinned':!gameObj.is_pinned,
    }; 
   this.pinGamePayload=updatePinGamePayload; //for to test the game is pin or unpin 
    this.is_pingames_loading = true;
    this.gamesService.updatePinGame(updatePinGamePayload).subscribe(res => {
      const response: any = res;
      this.is_pingames_loading = false;
      if (response.success) {
        if (!gameObj.is_pinned) {
          this.globalService.showMessage(this.translate.instant ('pin_added'), 'right', 'bottom');
          this.globalService.addAdminGoogleEvent('Pinned_Games_Pin_Game');
        } else {
          this.globalService.showMessage(this.translate.instant ('pin_remove'), 'right', 'bottom');
          this.globalService.addAdminGoogleEvent('Pinned_Games_Remove_Pin');
        }
        this.refreshGamesList();
        if (!this.storageService.getKeyForFirstManagerLogin('manager-first-pin-game')) {
          this.getCompanySetting(updatePinGamePayload.company_id);
        }
      }
    });
  
  }

  toggleExpansion(shouldExpand) {
    this.showPinGames = !shouldExpand;
    if (!this.showPinGames) {
      this.globalService.addAdminGoogleEvent('Pinned_Games_Expand_My_Top_Games');
    } else {
      this.globalService.addAdminGoogleEvent('Pinned_Games_Collapse_My_Top_Games');
    }
  }

  getCompanySetting(companyID) {
    this.loginService.getSettings(companyID).subscribe((res) => {
      const response = res;
      this.globalService.setCompanyRoles(response && response.data && response.data.settings && response.data.settings.role);
      this.globalService.setCompanySetting(response && response.data && response.data.settings && response.data.settings.permission);
      this.globalService.companySettingReceived();
    });
  }

  checkScroll() {
    if (this.scrollMenu) {
      this.hideLeftScrollBtn = this.scrollMenu.nativeElement.scrollLeft == 0 ? true : false;
      let newScrollLeft = this.scrollMenu.nativeElement.scrollLeft;
      let width = this.scrollMenu.nativeElement.clientWidth;
      let scrollWidth = this.scrollMenu.nativeElement.scrollWidth;
      this.hideRightScrollBtn = scrollWidth - (newScrollLeft+width) == 0 ? true : false;
    }
  }

  onScroll(){
    this.checkScroll();
  }

  scroll(toDirection) {
    switch(toDirection) {
      case 'right':
        this.scrollMenu.nativeElement.scrollLeft += 750;
        break;
      case 'left':
        this.scrollMenu.nativeElement.scrollLeft -= 750;
        break;
    }
    this.checkScroll();
  }

  prepareList(filterDetails, response, searchingIn, field) {
    if (filterDetails.is_multi_selection) {
      const mList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
      const filterInfo = { 'filter_name': field, 'searching_in': searchingIn, 'is_multi_menu_dependant': filterDetails.is_multi_menu_dependant };
      const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
      const forceSelection = clickedFilter && clickedFilter.value === 'All' ? true : false;
      this.multiMenuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
    } else {
      this.multiMenuList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
    }
  }

  preparePayloadForAppliedFilters(payload) {
    this.appliedFilters.forEach(appliedFilter => {
      if (payload[appliedFilter.customFilterKey] && appliedFilter.isAll) {
        return;
      }
      if (appliedFilter.customFilterKey) {
        if (appliedFilter.isAll) {
          payload[appliedFilter.customFilterKey] = {
            'ids' : [],
            'is_all': true
          };
        } else {
          this.preparePayloadFor(
            Constants.CUSTOM_FILTER_KEY,
            payload,
            appliedFilter.customFilterKey
          );
        }
        payload['display_winrate_by'] = true;
      }
      switch(appliedFilter.filter) {
        case Constants.WIN_RATE:
          if (appliedFilter.id == 'no_gameplay') {
            payload['min_win_rate'] = -1;
            payload['max_win_rate'] = -1;
          } else {
            payload['min_win_rate'] = +appliedFilter.id.split('_')[0];
            payload['max_win_rate'] = +appliedFilter.id.split('_')[1];
          }
        break;
        case Constants.GAME_STATE:
          if (appliedFilter.id == 'LIVE') {
            payload['game_state'] = appliedFilter.id;
            payload['game_mode'] = 'CONTEST';
          } else {
            payload['game_state'] = appliedFilter.id;
          }
        break;
        case Constants.GAME_CATEGORY_ID:
          payload['game_category_id'] = appliedFilter.id;
        break;
        case Constants.PATHWAY_ID:
          payload['pathway_id'] = appliedFilter.id;
        break;
        case Constants.OWNER_ID:
          payload['owner_id'] = appliedFilter.id;
        break;
        case Constants.ARCHIVE:
          payload['is_archived'] = true;
        break;
      }
    });
  }
  disableTooltip(index, elementRef) {
    console.log(index);
    console.log(elementRef);
    // const element = elementRef.children[index];
    const element = elementRef;
    console.log(element.offsetWidth, element.scrollWidth);
    return element.offsetWidth >= element.scrollWidth;
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
