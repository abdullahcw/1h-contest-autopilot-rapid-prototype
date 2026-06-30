import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalService, CallerId } from '../../services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { Constants, PlaceholderText, ApiService } from 'src/app/services/network/api.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import {
  Dashboard, DashboardService, Range,DashboardTabType
} from 'src/app/services/dashboard/dashboard.service';
import { GamesService } from 'src/app/services/games/games.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { CustomDatepickerComponent } from 'src/app/admin/custom-datepicker/custom-datepicker.component';
import { MatDialog } from '@angular/material/dialog';
import { MasterReportComponent } from '../master-report/master-report.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { DatePipe } from '@angular/common';
import moment from 'moment-timezone';
import { LocationService } from 'src/app/services/location/location.service';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { ContestService } from 'src/app/services/contest/contest.service';
import { TutorialVideoComponent } from '../tutorial-video/tutorial-video.component';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { ReportByHirarchyComponent } from '../report-by-hirarchy/report-by-hirarchy.component';
import { Role } from 'src/app/services/permissions/permissions.service';
   
import { EventValuesFormation } from 'src/app/services/google-analytics/google-analytics.service';
import { SearchComponent } from 'src/app/shared/search/search.component';
import { Route } from 'src/app/services/login/login.service';

let playerStateList = [];
let gameModes = [];
let gameStateModes = [];
let contestStates = [];
let hierarchyStates = [];
let mlgCompleteness = [];
let dashboardTypes = [];

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('appSearch') appSearch: SearchComponent;

  @ViewChild('masterReport') masterReportComponent: MasterReportComponent;
  @ViewChild('hierarchyReport') hierarchyReportComponent: ReportByHirarchyComponent;

  teamDefaultFilters = [
    {
      'filter': Constants.DASHBOARD_BY, 'searchingIn': this.translate.instant('by'),
      'value': this.translate.instant('team'), 'id': 1
    },
    {
      'filter': Constants.GAME_MODE, 'searchingIn': this.translate.instant('mode'),
      'value': this.translate.instant('all_games'), 'id': 'ALL'
    },
    {
      'filter': Constants.IS_ACTIVE, 'searchingIn': this.translate.instant('status'),
      'value': this.translate.instant('active_players'), 'id': 'ACTIVE'
    }
  ];

  gameDefaultFilters = [
    {
      'filter': Constants.DASHBOARD_BY, 'searchingIn': this.translate.instant('by'),
      'value': this.translate.instant('game_single_level'), 'id': 3
    },
    {
      'filter': Constants.IS_ACTIVE, 'searchingIn': this.translate.instant('status'),
      'value': this.translate.instant('active_players'), 'id': 'ACTIVE'
    },
    {
      'filter': Constants.GAME_STATE_MODE, 'searchingIn': this.translate.instant('mode'),
      'value': this.translate.instant('active_games'), 'id': 'ACTIVEGAMES'
    }
    
  ];

 

  playerDefaultFilters = [
    {
      'filter': Constants.DASHBOARD_BY, 'searchingIn': this.translate.instant('by'),
      'value': this.translate.instant('player'), 'id': 5
    },
    {
      'filter': Constants.GAME_MODE, 'searchingIn': this.translate.instant('mode'),
      'value': this.translate.instant('all_games'), 'id': 'ALL'
    }
  ];

  contestDefaultFilters = [
    {
      'filter': Constants.DASHBOARD_BY, 'searchingIn': this.translate.instant('by'),
      'value': this.translate.instant('contest'), 'id': 2
    },
    {
      'filter': Constants.CONTEST_STATE, 'searchingIn': this.translate.instant('state'),
      'value': this.translate.instant('all_contests'), 'id': 'All'
    },
    {
      'filter': Constants.IS_ACTIVE, 'searchingIn': this.translate.instant('status'),
      'value': this.translate.instant('active_players'), 'id': 'ACTIVE'
    }
  ];

  mlgDefaultFilters: any = [
    {
      'filter': Constants.DASHBOARD_BY, 'searchingIn': this.translate.instant('by'),
      'value': this.translate.instant('game_multilevel'), 'id': 4
    },
    {
      'filter': Constants.MLG_COMPLETENESS, 'searchingIn': this.translate.instant('progress'),
      'value': this.translate.instant('all'), 'id': 'All'
    },
    {
      'filter': Constants.IS_ACTIVE, 'searchingIn': this.translate.instant('status'),
      'value': this.translate.instant('active_players'), 'id': 'ACTIVE'
    },
    {
      'filter': Constants.GAME_STATE_MODE, 'searchingIn': this.translate.instant('mode'),
      'value': this.translate.instant('active_games'), 'id': 'ACTIVEGAMES'
    }
  ];
  hierarchyDefaultFilters = [
    {
      'filter': Constants.DASHBOARD_BY, 'searchingIn': this.translate.instant('by'),
      'value': this.translate.instant('hierarchy'), 'id': 6
    },
    {
      'filter': Constants.HIERARCHY, 'searchingIn': this.translate.instant('mode'),
      'value': this.translate.instant('all_games'), 'id': 'All'
    },
    {
      'filter': Constants.IS_ACTIVE, 'searchingIn': this.translate.instant('status'),
      'value': this.translate.instant('active_players'), 'id': 'ACTIVE'
    }
  ];
  filter_options = [];
  search_options = [
    {
      'filter': Constants.GROUP_NAME,
      'value': this.translate.instant('group'),
      'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.GROUP_NAME,
      'mutually_exclusive_with': Constants.LOCATION_IDS,
      'is_multi_selection': true,
      'is_generic_menu': true, 'is_default': false
    },
    {
      'filter': Constants.IS_ACTIVE,
      'value': this.translate.instant('status'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': '',
      'is_generic_menu': true,
      'is_default': true
    },
    {
      'filter': Constants.GAME_MODE,
      'value': this.translate.instant('mode'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': PlaceholderText.GAME_MODE,
      'is_generic_menu': true,
      'is_default': true
    },
    {
      'filter': Constants.GAME_STATE_MODE,
      'value': this.translate.instant('mode'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': PlaceholderText.GAME_MODE,
      'is_generic_menu': true,
      'is_default': true
    },
    {
      'filter': Constants.CONTEST_STATE,
      'value': this.translate.instant('mode'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': PlaceholderText.CONTEST_STATE,
      'is_generic_menu': true,
      'is_default': true
    },
    {
      'filter': Constants.MLG_COMPLETENESS,
      'value': this.translate.instant('mode'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': PlaceholderText.MLG_COMPLETENESS,
      'is_generic_menu': true,
      'is_default': true
    },
    {
      'filter': Constants.HIERARCHY,
      'value': this.translate.instant('mode'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': PlaceholderText.HIERARCHY_STATE,
      'is_generic_menu': true,
      'is_default': true
    },
    {
      'filter': Constants.DASHBOARD_BY,
      'value': this.translate.instant('by'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': '',
      'is_generic_menu': true,
      'is_default': true
    }];

  breakpoint = 3;
  range;
  departmentList = [];
  locationList = [];
  linkLocations = [];
  linkDepartments = [];
  groupList = [];
  gameList = [];
  players = [];
  contestList = [];
  multilevelGames = [];
  menuList = [];
  appliedFilters = [];
  defaultFilters: any = [];
  selectedDepartmentIds = [];
  subcribedObjects = [];
  dataSource;
  selectedDashboardType: number;
  selectedRange;
  is_loading = false;
  isTopPlayerLoading = false;
  managerId: number;
  companyId: number;
  timeZone: string = null;
  startDate;
  endDate;
  dashboard;
  payload;
  masterReportPayload;
  hierarchyReportPayload;
  matTiles = [];
  topPlayers = [];
  context = 'dashboard';
  leaderboardBreakpoint = 5;
  tabIndex = 0;
  playerReports = [];
  resetView = false;
  fetchingAllLocations = false;
  allLocationsSubcription: any;
  companyChangeSubscription: any;
  groupListSubscription: any;
  updateReportSubscription: any;
  fieldFetchSubscription: any;
  customFieldFetchSubscription: any;
  delegateSubscription;
  setRowHeight = false;
  selectedContestId;
  customManagerList = [];
  reporteelist = [];
  preventDoubleClick = false;
  showReport = false;
  pinGameId;
  isFiltersLoaded = false;
  contestStateFilter;
  SLGModeFilter;
  MLGModeFilter;
  dashboardTabType: typeof DashboardTabType;
  selectedDashboardTabType: DashboardTabType;
  selectedDashboardTabTypeChanges = false;
  
  // Track user's explicit filter removal choices.
  userRemovedLocationFilter = false;
  userRemovedDepartmentFilter = false;

  constructor(public translate: TranslateService,
    private globalService: GlobalService,
    private storageService: StorageService,
    private delegateService: DelegateService,
    private departmentService: DepartmentService,
    private dashboardService: DashboardService,
    private gamesService: GamesService,
    private playerService: PlayerService,
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private datePipe: DatePipe,
    private companyService: CompanyService,
    private contestService: ContestService,
    private multilevelgamesService: MultilevelGamesService,
    public managerService: ManagerService,
    private breadcrumbService: BreadcrumbsService) {

    playerStateList = [{ 'id': 'All', 'value': this.translate.instant('all_players') },
    { 'id': 'ACTIVE', 'value': this.translate.instant('active_players') }];
    gameModes = [{ 'id': 'ALL', 'value': this.translate.instant('all_games') },
    { 'id': 'COMPANY', 'value': this.translate.instant('company_games') },
    { 'id': 'SHOP', 'value': this.translate.instant('shop_games') }];
    gameStateModes = [{ 'id': 'ALL', 'value': this.translate.instant('all_games') },
    { 'id': 'ACTIVEGAMES', 'value': this.translate.instant('active_games') }];
    contestStates = [{ 'id': 'All', 'value': this.translate.instant('all_contests') },
    { 'id': 'live', 'value': this.translate.instant('live_contests') }];
    hierarchyStates = [{ 'id': 'All', 'value': this.translate.instant('all_games') },
    { 'id': 'CONTEST', 'value': this.translate.instant('live_games') },
    { 'id': 'AllC', 'value': this.translate.instant('all_contests') },
    { 'id': 'live', 'value': this.translate.instant('live_contests') }];
    mlgCompleteness = [{ 'id': 'All', 'value': this.translate.instant('all') },
    { 'id': 'COMPLETE', 'value': this.translate.instant('won') },
    { 'id': 'INCOMPLETE', 'value': this.translate.instant('in_progress') }];
    dashboardTypes = [{ 'id': 1, 'value': this.translate.instant('team') },
    { 'id': 2, 'value': this.translate.instant('contest') },
    { 'id': 3, 'value': this.translate.instant('game_single_level') },
    { 'id': 4, 'value': this.translate.instant('game_multilevel') },
    { 'id': 5, 'value': this.translate.instant('player') }];

    this.removeFilterOptions(this.search_options);
    this.dashboard = Dashboard;
    this.range = Range;
    this.dashboardTabType = DashboardTabType;
    // added for stopping loader on tab change
    setTimeout(() => {
      this.fetchingAllLocations = false;
    }, 200);

    if (this.storageService.isPostLogin() && !this.globalService.isCompanyBelongsToCustomField()) {
      this.fetchingAllLocations = true;
    }

    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.selectedTab) {
        this.tabIndex = +queryParams.selectedTab;
      }
      this.updateBreadcrumbs();
      if (queryParams.showReport) {
        this.showReport = queryParams.showReport;
        this.pinGameId = queryParams.game_id
        this.getGames(queryParams.game_id);
      }
    });

    this.companyChangeSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      this.selectedDashboardTabTypeChanges = true;
      this.isFiltersLoaded = false;
      this.appliedFilters = [];
      this.locationList = [];
      this.gameList = [];
      this.players = [];
      this.contestList = [];
      this.multilevelGames = [];
      this.departmentList = [];
      this.fetchingAllLocations = true;
      this.setCompanyDetails();

      this.resetDashboard();
      this.resetBindPayload();
      this.selectedDashboardType = Dashboard.BY_TEAM;
      this.defaultFilters = [];
      this.applyDefaultFilters();
      this.appliedFilters = this.defaultFilters;
      this.storeFilters();
      this.selectedRange = Range.THIS_QT;
      this.storeDashboardFilter();
      this.setRange(this.selectedRange, true)

      if (!this.storageService.isPostLogin() && !this.globalService.isCompanyBelongsToCustomField()) {
        this.fetchAllLocations(companyID);
      }
      this.removeFilterOptions(this.search_options);
      setTimeout(() => {
        this.selectedDashboardTabTypeChanges = false;
      });
      console.log('this.selectedDashboardTabTypeChanges',this.selectedDashboardTabTypeChanges)
    });
    this.groupListSubscription = this.globalService.groupList.subscribe((res) => {
      this.groupList = res;
      const filterInfo = { 'filter_name': Constants.GROUP_NAME, 'searching_in': this.translate.instant('group') };
      this.menuList = this.globalService.prepareSelectionList(this.groupList, filterInfo, this.appliedFilters);
    });

    this.updateReportSubscription = this.dashboardService.updatedReport.subscribe(players => {
      if (players) { this.playerReports = players; } else { this.playerReports = []; }
    });

    this.fieldFetchSubscription = this.companyService.onFieldsFetched.subscribe(res => {
      if (this.globalService.isCompanyBelongsToCustomField()) {
        const managerFields = res.filter((field) => field.key_id === -1);
        if (!managerFields.length) {
          const manager = {
            allow_multiselection: true,
            is_custom: true,
            key_id: -1,
            filter_key: 'manager_name_ids',
            title: this.translate.instant('manager_name')
          };
          res.push(manager);
        }
        this.filter_options = this.globalService.addeditCustomFilters(this.search_options, res, 0);
      }
      if (this.globalService.isCompanyBelongsToCustomField()) { // to set default location filter in non fossil and non custom fields company
        this.setTeamDefaultFiltersForCustomCompany(true);
        this.fetchingAllLocations = false;
      }
    });
    this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
      if (!this.globalService.isCompanyBelongsToCustomField()) {
        const filtered = this.prepareFilterOnRefresh();
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_options, res, 0);
        if (this.globalService.isCompanyWithCustomField()) {
          this.setTeamDefaultFiltersForCustomCompany(true);
        }
        this.filter_options.forEach(filterOption => {
          if (filtered) {
            if (filterOption.custom_filter_key || filterOption.filter === Constants.GROUP_NAME) {
              filterOption['dependent_on'] = filtered;
            }

            if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
              filterOption['dependent_on'] = Constants.LOCATION_IDS;
            }
  
            if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
              filterOption['mutually_exclusive_with'] = Constants.GROUP_NAME;
            }
          }
        });
        if (filtered === Constants.PLAYER_NAME || filtered === Constants.CONTEST_NAME) {
          this.removeCustomeFilters();
          this.removeFilter(Constants.GROUP_NAME);
        }
        this.fetchingAllLocations = false;
      }
      this.isFiltersLoaded = true;
    });

    if (!this.globalService.isCompanyBelongsToCustomField() && !this.showReport) {
      this.addDefaultLocationFilter();
    }
  }


  addDefaultLocationFilter() {
    this.allLocationsSubcription = this.locationService.locationsFetched.subscribe(locations => {
      this.locationList = [];
      const filterInfo = {
        'filter_name': Constants.LOCATION_IDS,
        'searching_in': this.translate.instant('location')
      };
      const locList = this.prepareListForSelection(locations);
      this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters, true);
      // Get stored dashboard filter
      const storedDashboardFilter = this.getDashboardFilter();
      if (storedDashboardFilter) {
        this.selectedDashboardType = storedDashboardFilter['dashboard_by'] ? storedDashboardFilter['dashboard_by'] : Dashboard.BY_TEAM;
      } else {
        this.selectedDashboardType = Dashboard.BY_TEAM;
      }
      if (this.selectedDashboardType && this.selectedDashboardType === Dashboard.BY_TEAM && !this.isRequiredFilterApplied()) {
        const locIds: any = [];
        locations.forEach(loc => {
          locIds.push(loc.location_id);
        });
        // Filter Head location to get company time zone
        const headLocation = locations.filter(loc => {
          return loc['head_location'];
        })[0];
        if (headLocation) {
          this.timeZone = headLocation['tz_name'];
        }
        if (this.globalService.isRoleLimited()) {
          this.getLocationAndDepartmentAccordingToSOM();
        } else {
          this.applyDefaultFiltersAccordingToRole(true, locIds);
        }
      } else { this.fetchingAllLocations = false;}

      this.storageService.setPostLogin(false);
    });
  }

  fetchAllLocations(companyId) {
    this.fetchingAllLocations = true;
    this.locationService.getAllLocations(companyId, true, false);
  }

  setTeamDefaultFiltersForCustomCompany(refreshDashboard) {
    this.resetDashboard();
    this.appliedFilters = this.teamDefaultFilters;
    this.addDefaultFilter(this.teamDefaultFilters);
    this.refreshListOnFilterChange(this.teamDefaultFilters, refreshDashboard);
    this.fetchingAllLocations = false;
  }

  applyDefaultFiltersAccordingToRole(allLocations, locIds, locName = '', skipRefresh = false) {
    const locationName = allLocations ? 'All' : locName;
    const locFilter = {
      'filter': Constants.LOCATION_IDS, 'searchingIn': allLocations ? this.translate.instant('locations') :
        this.translate.instant('location'),
      'value': locationName, 'id': locIds, 'additionalFilter': true, 'is_default': false
    };
    // Reset default filters
    this.teamDefaultFilters = this.teamDefaultFilters.filter((defaultFilter) => {
      return defaultFilter['filter'] !== Constants.LOCATION_IDS &&
        defaultFilter['filter'] !== Constants.DEPARTMENT_IDS &&
        defaultFilter['filter'] !== Constants.GROUP_IDS;
    });
    if (!this.globalService.isCompanyWithCustomField()) {
      this.teamDefaultFilters.push(locFilter);
    }
    if (this.globalService.isRoleLimited() && this.linkDepartments.length > 0 && !this.globalService.isCompanyWithCustomField()) {
      const searchingIn = this.linkDepartments.length > 1 ? this.translate.instant('departments') : this.translate.instant('department');
      this.linkDepartments.forEach(linkDept => {
        const deptFilter = {
          'filter': Constants.DEPARTMENT_IDS, 'searchingIn': searchingIn, 'dependent_on': Constants.LOCATION_IDS,
          'value': linkDept.department_name, 'id': linkDept.department_id, 'additionalFilter': true, 'is_default': false
        };
        this.teamDefaultFilters.push(deptFilter);
      });
    }
    this.addDefaultFilter(this.teamDefaultFilters);
    this.appliedFilters = this.defaultFilters;
    this.resetDashboard();
    
    // Only call refreshListOnFilterChange if skipRefresh is false
    if (!skipRefresh) {
      this.refreshListOnFilterChange(this.defaultFilters);
    }
  }

  ngOnInit() {
    this.selectedDashboardTabType = DashboardTabType.SKILL_INSIGHTS;
    // added for stopping loader on tab change
    setTimeout(() => {
      this.fetchingAllLocations = false;
    }, 200);
    this.setCompanyDetails();
    this.prepareFilterOptions();
    this.prepareCustomFilterOptions();
    if (!this.showReport) {
      this.setDashboardType(true);
    }
    this.setDateRange(true);
    // Execution Before storing logged in user company to storage this line
    const companyId = this.storageService.getCompanyId() ?
      this.storageService.getCompanyId() : this.storageService.getUser() && JSON.parse(this.storageService.getUser())['company_id'];
    if (!this.globalService.isCompanyBelongsToCustomField() && !this.showReport) {
      this.fetchAllLocations(companyId);
    }
    const appliedContestStateFilter = this.appliedFilters && this.appliedFilters.filter(filter => filter.filter == Constants.CONTEST_STATE);
    if (appliedContestStateFilter) {
      this.contestStateFilter = JSON.parse(JSON.stringify(appliedContestStateFilter));
    }

    const appliedSLGModeFilter = this.appliedFilters && this.appliedFilters.filter(filter => filter.filter == Constants.GAME_STATE_MODE);
    if (appliedSLGModeFilter) {
      this.SLGModeFilter = JSON.parse(JSON.stringify(appliedSLGModeFilter));
    }

    const appliedMLGModeFilter = this.appliedFilters && this.appliedFilters.filter(filter => filter.filter == Constants.GAME_STATE_MODE);
    if (appliedMLGModeFilter) {
      this.MLGModeFilter = JSON.parse(JSON.stringify(appliedMLGModeFilter));
    }
  }

  prepareDynamicMlgFilter() {
    this.mlgDefaultFilters = [];
      this.mlgDefaultFilters.push(
        {
          'filter': Constants.DASHBOARD_BY, 'searchingIn': this.translate.instant('by'),
          'value': this.translate.instant('game_multilevel'), 'id': 4
        },
        {
          'filter': Constants.MLG_COMPLETENESS, 'searchingIn': this.translate.instant('progress'),
          'value': this.translate.instant('all'), 'id': 'All'
        },
        {
          'filter': Constants.IS_ACTIVE, 'searchingIn': this.translate.instant('status'),
          'value': this.translate.instant('active_players'), 'id': 'ACTIVE'
        },
        {
          'filter': Constants.GAME_STATE_MODE, 'searchingIn': this.translate.instant('mode'),
          'value': this.translate.instant('active_games'), 'id': 'ACTIVEGAMES'
        }
      );
  }

  prepareFilterOptions() {
    const fields = this.companyService.getFields(true);
    if (!(fields && fields.length)) { return; }
    const managerFields = fields.filter((field) => field.key_id === -1);
    if (!managerFields.length) {
      const manager = {
        allow_multiselection: true,
        is_custom: true,
        key_id: -1,
        filter_key: 'manager_name_ids',
        title: this.translate.instant('manager_name')
      };
      fields.push(manager);
    }
    this.filter_options = this.globalService.addeditCustomFilters(this.search_options, fields, 0);
    if (this.filter_options.filter(filter => filter.custom_filter_key).length) {
      this.isFiltersLoaded = true;
    }
  }

  prepareCustomFilterOptions() {
    const customFields = this.companyService.getCustomFields();
    if (!(customFields && customFields.length)) { return; }
    // custom fields for companies
    this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_options, customFields, 0);
    if (this.filter_options.filter(filter => filter.custom_filter_key).length) {
      this.isFiltersLoaded = true;
    }
  }

  prepareFilterOnRefresh() {
    if (this.storageService.getFilterFromStorageArrayLength(this.context)) {
      const filterObj = {
        filter: '',
        value: '',
        placeholder: '',
        shouldRequest: false
      }
      this.appliedFilters = this.storageService.getFilterArray(this.context);
      const filterApplied = this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.GAME_NAME || appliedFilter.filter == Constants.MLG_NAME ||
        appliedFilter.filter == Constants.CONTEST_NAME || appliedFilter.filter == Constants.PLAYER_NAME);
      if (filterApplied.length) {
        this.prepareFilterObj(filterApplied[0].filter, filterObj);
        this.prepareFilters(filterObj.filter, filterObj.value, true, true, filterObj.placeholder, null, null, false, false, true, false, filterObj.shouldRequest);
        return filterApplied[0].filter;
      } else {
        if (this.selectedDashboardType !== Dashboard.BY_TEAM) {
          let filterName = '';
          switch(this.selectedDashboardType) {
            case Dashboard.BY_CONTEST:
              filterName = Constants.CONTEST_NAME;
              break;
            case Dashboard.BY_GAME:
              filterName = Constants.GAME_NAME;
              break;
            case Dashboard.BY_MULTILEVEL:
              filterName = Constants.MLG_NAME;
              break;
            case Dashboard.BY_PLAYER:
              filterName = Constants.PLAYER_NAME;
              break;
          }
          this.prepareFilterObj(filterName, filterObj);
          this.prepareFilters(filterObj.filter, filterObj.value, true, true, filterObj.placeholder, null, null, false, false, true, false, filterObj.shouldRequest);
          return filterName;
        }
      }
    }
  }

  prepareFilterObj(filter, filterObj) {
    switch (filter) {
      case Constants.GAME_NAME:
        filterObj.filter = Constants.GAME_NAME;
        filterObj.value = this.translate.instant('game');
        filterObj.placeholder = PlaceholderText.GAME_NAME;
        break;
      case Constants.MLG_NAME:
        filterObj.filter = Constants.MLG_NAME;
        filterObj.value = this.translate.instant('multilevel_game');
        filterObj.placeholder = PlaceholderText.MLG_NAME;
        break;
      case Constants.CONTEST_NAME:
        filterObj.filter = Constants.CONTEST_NAME;
        filterObj.value = this.translate.instant('contest');
        filterObj.placeholder = PlaceholderText.CONTEST_NAME;
        filterObj.shouldRequest = true;
        break;
      case Constants.PLAYER_NAME:
        filterObj.filter = Constants.PLAYER_NAME;
        filterObj.value = this.translate.instant('player');
        filterObj.placeholder = PlaceholderText.PLAYER_NAME;
        filterObj.shouldRequest = true;
        break;
    }
  }

  prepareFilters(filterNameToBeAdded, value, isTextSearch, isListSearch, placeholder,
    dependentOn = null, mutuallyExclusive = null, isMulti, isMultiSelection, isGenericMenu, isDefault,
    shouldRequestDataSourceWithSearchKey = false) {
    const filterOptionsToAdd = {
      'filter': filterNameToBeAdded,
      'value': value,
      'is_text_search': isTextSearch,
      'is_list_search': isListSearch,
      'placeholder': placeholder,
      'dependent_on': dependentOn,
      'mutually_exclusive_with': mutuallyExclusive,
      'is_multi': isMulti,
      'is_multi_selection': isMultiSelection,
      'is_generic_menu': isGenericMenu,
      'is_default': isDefault,
      'shouldRequestDataSourceWithSearchKey': shouldRequestDataSourceWithSearchKey
    };
    this.search_options.push(filterOptionsToAdd);
  }

  getValues(filterDetails) {
    if (filterDetails.custom_filter_key === 'manager_name_ids') {
      this.getCustomManagerList(filterDetails);
      return;
    }
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
        if (filterDetails.is_multi_selection) {
          const mList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
          const filterInfo = { 'filter_name': field, 'searching_in': searchingIn };
          const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
          const forceSelection = clickedFilter && clickedFilter.value === 'All' ? true : false;
          this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
        } else {
          this.menuList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
        }
        this.cdRef.detectChanges();
      }
    });
  }

  getCustomManagerList(filterDetails) {
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.managerService.getCustomManagerList(0, 100, searchText ? searchText : null).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      let managerList = [];
      const tempManagerList = [];
      if (!response.success) { return; }
      if (response.data) {
        managerList = response && response.data && response.data.customManagers;
      }
      managerList.forEach((manager) => {
        tempManagerList.push({
          id: manager.id,
          value: manager.text,
        });
      });
      const mList = this.globalService.prepareMenuList(response.data.customManagers, filterDetails, this.context);
      const filterInfo = { 'filter_name': filterDetails.filter, 'searching_in': this.translate.instant('manager') };
      this.customManagerList = this.globalService.prepareSelectionList(tempManagerList, filterInfo, this.appliedFilters);
      const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
      const forceSelection = clickedFilter && clickedFilter.value === 'All' ? true : false;
      this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
      this.menuList = this.customManagerList;
      this.cdRef.detectChanges();
    });
  }
  getLocationAndDepartmentAccordingToSOM() {
    this.locationService.getLocationAndDepartmentAccordingToSOM().subscribe(res => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      this.linkLocations = response.data.link_locations;
      this.linkDepartments = response.data.link_departments;

      if (!this.linkLocations) {
        return; 
      }

      const locIds: any = [];
      this.linkLocations.forEach(loc => {
        locIds.push(loc.location_id);
      });

      // For BY_TEAM, apply default filters
      if (this.selectedDashboardType === Dashboard.BY_TEAM) {
        this.applyDefaultFiltersAccordingToRole(false, locIds, this.linkLocations[0].location_name);
      }
      
    });
  }

  // Track when user explicitly removes filters
  trackFilterRemoval(filterName: string) {
    if (filterName === Constants.LOCATION_IDS) {
      this.userRemovedLocationFilter = true;
    } else if (filterName === Constants.DEPARTMENT_IDS) {
      this.userRemovedDepartmentFilter = true;
    }
  }

  // Track filter removal by comparing current filters with previous appliedFilters
  /**
   * Tracks filter removal and handles automatic removal of dependent filters
   * @param newFilters - The new filters array after user changes
   */
  trackFilterRemovalFromAppliedFilters(newFilters: any[]) {
    const hadLocationFilter = this.appliedFilters.some(filter => filter.filter === Constants.LOCATION_IDS);
    const hasLocationFilter = newFilters.some(filter => filter.filter === Constants.LOCATION_IDS);
    
    const hadDepartmentFilter = this.appliedFilters.some(filter => filter.filter === Constants.DEPARTMENT_IDS);
    const hasDepartmentFilter = newFilters.some(filter => filter.filter === Constants.DEPARTMENT_IDS);
    
    // Check if game filters were removed
    const hadGameFilter = this.appliedFilters.some(filter => filter.filter === Constants.GAME_NAME);
    const hasGameFilter = newFilters.some(filter => filter.filter === Constants.GAME_NAME);
    
    const hadMlgFilter = this.appliedFilters.some(filter => filter.filter === Constants.MLG_NAME);
    const hasMlgFilter = newFilters.some(filter => filter.filter === Constants.MLG_NAME);
    
    // Check if we're in SLG or MLG dashboard type
    const isSLGOrMLG = this.selectedDashboardType === Dashboard.BY_GAME || this.selectedDashboardType === Dashboard.BY_MULTILEVEL;
    
    // For SLG and MLG games, check if location IDs are empty and remove department filter
    if (isSLGOrMLG && hasLocationFilter) {
      const locationFilter = newFilters.find(filter => filter.filter === Constants.LOCATION_IDS);
      if (locationFilter && (!locationFilter.id || (Array.isArray(locationFilter.id) && locationFilter.id.length === 0))) {
        console.log('Location IDs are empty for SLG/MLG - automatically removing department filter');
        
        // Remove department filter from newFilters
        const filteredNewFilters = newFilters.filter(filter => 
          filter.filter !== Constants.DEPARTMENT_IDS
        );
        
        // Update the newFilters array to reflect the removal
        newFilters.length = 0;
        newFilters.push(...filteredNewFilters);
        
        // Mark that department filter was automatically removed
        this.userRemovedDepartmentFilter = true;
        
        console.log('Department filter automatically removed due to empty location IDs');
      }
    }
    
    // If game filter was removed, automatically remove location and department filters
    if ((hadGameFilter && !hasGameFilter) || (hadMlgFilter && !hasMlgFilter)) {
      // Remove location and department filters from newFilters
      const filteredNewFilters = newFilters.filter(filter => 
        filter.filter !== Constants.LOCATION_IDS && 
        filter.filter !== Constants.DEPARTMENT_IDS
      );
      
      // Update the newFilters array to reflect the removal
      newFilters.length = 0;
      newFilters.push(...filteredNewFilters);
      
      // Reset the removal tracking since we're removing them automatically
      this.userRemovedLocationFilter = false;
      this.userRemovedDepartmentFilter = false;
      
      console.log('Location and department filters automatically removed due to game filter removal');
    }
    
    // If location filter was removed, automatically remove department filter since departments depend on locations
    if (hadLocationFilter && !hasLocationFilter) {
      this.userRemovedLocationFilter = true;
      console.log('User explicitly removed location filter');
      
      // Always remove department filter since it depends on location, regardless of whether it exists in newFilters
      if (hadDepartmentFilter) {
        console.log('Automatically removing department filter since location filter was removed');
        
        // Remove department filter from newFilters
        const filteredNewFilters = newFilters.filter(filter => 
          filter.filter !== Constants.DEPARTMENT_IDS
        );
        
        // Update the newFilters array to reflect the removal
        newFilters.length = 0;
        newFilters.push(...filteredNewFilters);
        
        // Mark that department filter was automatically removed
        this.userRemovedDepartmentFilter = true;
        
        console.log('Department filter automatically removed due to location filter removal');
      }
    }
    
    // If filter was present before but not now, user explicitly removed it
    if (hadDepartmentFilter && !hasDepartmentFilter && hadLocationFilter && hasLocationFilter) {
      this.userRemovedDepartmentFilter = true;
      console.log('User explicitly removed department filter');
    }
  }

  // Reset filter removal tracking when dashboard type changes
  resetFilterRemovalTracking() {
    this.userRemovedLocationFilter = false;
    this.userRemovedDepartmentFilter = false;
  }

  // New method specifically for applying SOM filters without changing dashboard type
  applySOMFiltersForGame() {
    // Check if location filter already exists and user hasn't explicitly removed it
    const existingLocationFilter = this.appliedFilters.find(filter => filter.filter === Constants.LOCATION_IDS);
    if (!existingLocationFilter && !this.userRemovedLocationFilter) {
      // Create separate filter for each location to ensure proper chip display
      this.linkLocations.forEach(linkLoc => {
        const locFilter = {
          'filter': Constants.LOCATION_IDS, 
          'searchingIn': this.translate.instant('location'),
          'value': linkLoc.location_name, 
          'id': linkLoc.location_id, 
          'additionalFilter': true, 
          'is_default': false
        };
        
        // Add location filter to applied filters
        this.appliedFilters.push(locFilter);
      });
    }
    
    // Add department filters if available - create separate filter for each department
    if (this.globalService.isRoleLimited() && this.linkDepartments.length > 0 && !this.globalService.isCompanyWithCustomField()) {
      const existingDeptFilter = this.appliedFilters.find(filter => filter.filter === Constants.DEPARTMENT_IDS);
      if (!existingDeptFilter && !this.userRemovedDepartmentFilter) {
        const searchingIn = this.linkDepartments.length > 1 ? this.translate.instant('departments') : this.translate.instant('department');
        this.linkDepartments.forEach(linkDept => {
          const deptFilter = {
            'filter': Constants.DEPARTMENT_IDS, 
            'searchingIn': searchingIn, 
            'dependent_on': Constants.LOCATION_IDS,
            'value': linkDept.department_name, 
            'id': linkDept.department_id, 
            'additionalFilter': true, 
            'is_default': false
          };
          this.appliedFilters.push(deptFilter);
        });
      }
    }

    this.storeFilters();

    // Mark for change detection to ensure appliedFilters are synchronized
    this.cdRef.markForCheck();
    
    // Force Angular to detect the appliedFilters change by creating a new array reference
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.appliedFilters = [...this.appliedFilters];
      // Now call getDashboard with the updated filters
      this.getDashboard();
    }, 0);
  }

  /**
   * Handles filter changes for both SLG and MLG game types
   * @param filters - The current filters array
   * @param gameFilterConstant - The game filter constant (GAME_NAME or MLG_NAME)
   * @param modeFilterProperty - The mode filter property name ('SLGModeFilter' or 'MLGModeFilter')
   * @param gameType - The game type for logging ('SLG' or 'MLG')
   */
  handleGameTypeFilterChange(filters: any[], gameFilterConstant: string, modeFilterProperty: string, gameType: string) {
    const gameNameFilter = filters.filter(filter => filter.filter == gameFilterConstant);
    
    // Handle mode filter logic
    if (gameNameFilter.length && this[modeFilterProperty].length) {
      const index = filters.indexOf(gameNameFilter[0]);
      filters.forEach(filter => {
        if (filter.filter == Constants.GAME_STATE_MODE && filter.id != this[modeFilterProperty][0].id) {
          filters.splice(index, 1);
        }            
      });
    }
    
    // Update mode filter
    const appliedModeFilter = filters.filter(filter => filter.filter == Constants.GAME_STATE_MODE);
    this[modeFilterProperty] = JSON.parse(JSON.stringify(appliedModeFilter));
    this.appliedFilters = filters;
    
    // Apply SOM filters if user is role-limited and a game is selected
    if (this.globalService.isRoleLimited() && gameNameFilter.length) {
      const hasLocationFilter = this.appliedFilters.some(filter => filter.filter === Constants.LOCATION_IDS);
      const hasDepartmentFilter = this.appliedFilters.some(filter => filter.filter === Constants.DEPARTMENT_IDS);
      
      // Only apply SOM filters if location/department filters are missing AND user hasn't explicitly removed them
      const shouldApplyLocationFilter = !hasLocationFilter && !this.userRemovedLocationFilter;
      const shouldApplyDepartmentFilter = !hasDepartmentFilter && !this.userRemovedDepartmentFilter;
      
      if (shouldApplyLocationFilter || shouldApplyDepartmentFilter) {
        // Use the same method that works for both SLG and MLG
        this.locationService.getLocationAndDepartmentAccordingToSOM().subscribe(res => {
          const response: any = res;
          if (!response.success) {
            return;
          }
          this.linkLocations = response.data.link_locations;
          this.linkDepartments = response.data.link_departments;
          
          if (!this.linkLocations) { return; }
          this.applySOMFiltersForGame();
        });
      } else {
        // If filters already exist or user explicitly removed them, just call getDashboard normally
        this.getDashboard();
      }
    } else {
      // If not role-limited or no game selected, just store filters and continue
      this.storeFilters();
    }
  }

  setCompanyDetails() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
  }

  ngAfterViewInit() {
  }

  setUpFilter(value) {
    switch (value) {
      case Dashboard.BY_TEAM:
        this.prepareTeamFilter();
        break;
      case Dashboard.BY_GAME:
        this.prepareGameFilter();
        break;
      case Dashboard.BY_PLAYER:
        this.preparePlayerFilter();
        break;
      case Dashboard.BY_CONTEST:
        this.prepareContestFilter();
        break;
      case Dashboard.BY_MULTILEVEL:
        this.prepareMlgFilter();
        break;
      case Dashboard.BY_HIERARCHY:
        this.prepareHierarchyFilter();
        break;
    }
  }


  removeFilterOptions(search_filters) {
    this.filter_options = this.globalService.removeCustomFilters(search_filters);
  }
  downloadReport() {
    this.preventDoubleClick = true;
    const payload = this.masterReportComponent.getPayload();
    if (!payload) { return; }
    if (payload.hasOwnProperty('email_ids')) { delete payload['email_ids']; }
    payload['start_date'] = this.startDate;
    payload['end_date'] = this.endDate;
    this.dashboardService.detailedReportByCustomRange(payload).subscribe((res) => {
      const response: any = res;
      this.preventDoubleClick = false;
      if (!response.success) { return; }
      // Download file
      if (response.data && response.data.url) {
        window.location.assign(response.data.url);
        this.globalService.showMessage(this.translate.instant('downloading_reports'));
      }
    });
    const logEventInfo = {
      searchingIn: 'By',
      value: 'CSV_Download'
    };
    this.filterOptionUpdated(logEventInfo);
  }

  isFilterExist(filterName) {

    this.filter_options.filter((obj) => {
      if (obj.filter === filterName) {
        return true;
      }
    });
    return false;
  }

  prepareTeamFilter() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.prepareFilterOptions();
    } else {
      this.prepareCustomFilterOptions();
      this.filter_options.forEach(filterOption => {

        // added for mutually_exclusive_with group
        if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
          filterOption['mutually_exclusive_with'] = Constants.GROUP_NAME;
        }

        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
    }

    this.addFilter(Constants.GROUP_NAME, this.translate.instant('group'), true, true, PlaceholderText.GROUP_NAME, null,
      Constants.LOCATION_IDS, false, true, true, false);
    this.addFilter(Constants.GAME_MODE, this.translate.instant('mode'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.IS_ACTIVE, this.translate.instant('status'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.DASHBOARD_BY, this.translate.instant('by'), true, true, '', null, null, false, false, true, true);
    this.removeFilter(Constants.GAME_NAME);
    this.removeFilter(Constants.PLAYER_NAME);
    this.removeFilter(Constants.CONTEST_NAME);
    this.removeFilter(Constants.MLG_NAME);
  }

  prepareGameFilter() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.prepareFilterOptions();
      this.filter_options.forEach(filterOption => {

        if (filterOption.custom_filter_key) {
          filterOption['dependent_on'] = Constants.GAME_NAME;
        }
      });
    } else {
      this.prepareCustomFilterOptions();
      this.filter_options.forEach(filterOption => {

        // added for mutually_exclusive_with group
        if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
          filterOption['mutually_exclusive_with'] = Constants.GROUP_NAME;
        }

        if (filterOption.custom_filter_key) {
          filterOption['dependent_on'] = Constants.GAME_NAME;
        }
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
    }

    this.addFilter(Constants.GAME_NAME, this.translate.instant('game'),
      true, true, PlaceholderText.GAME_NAME, null, null, false, false, true, false);
    this.addFilter(Constants.GAME_STATE_MODE, this.translate.instant('mode'),
      true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.IS_ACTIVE, this.translate.instant('status'),
      true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.GROUP_NAME, this.translate.instant('group'), true, true, PlaceholderText.GROUP_NAME, Constants.GAME_NAME, Constants.LOCATION_IDS, false, true, true, false);
    this.addFilter(Constants.DASHBOARD_BY, this.translate.instant('by'),
      true, true, '', null, null, false, false, true, true);
    this.removeFilter(Constants.PLAYER_NAME);
    this.removeFilter(Constants.CONTEST_NAME);
    this.removeFilter(Constants.MLG_NAME);
    console.log(this.filter_options);

  }

  preparePlayerFilter() {
    this.addFilter(Constants.PLAYER_NAME, this.translate.instant('player'),
      true, true, PlaceholderText.PLAYER_NAME, null, null, false, false, true, false, true);
    this.addFilter(Constants.DASHBOARD_BY, this.translate.instant('by'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.GAME_MODE, this.translate.instant('all'),
      true, true, '', null, null, false, false, true, true);
    this.removeFilter(Constants.LOCATION_IDS);
    this.removeFilter(Constants.GROUP_NAME);
    this.removeFilter(Constants.GAME_NAME);
    this.removeFilter(Constants.DEPARTMENT_IDS);
    this.removeFilter(Constants.IS_ACTIVE);
    this.removeFilter(Constants.CONTEST_NAME);
    this.removeFilter(Constants.MLG_NAME);
    this.removeCustomeFilters();
  }

  prepareContestFilter() {
    this.addFilter(Constants.CONTEST_NAME, this.translate.instant('contest'), true, true, PlaceholderText.CONTEST_NAME,
      null, null, false, false, true, false, true);
    this.addFilter(Constants.CONTEST_STATE, this.translate.instant('state'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.DASHBOARD_BY, this.translate.instant('by'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.IS_ACTIVE, this.translate.instant('status'), true, true, '', null, null, false, false, true, true);
    this.removeFilter(Constants.LOCATION_IDS);
    this.removeFilter(Constants.GROUP_NAME);
    this.removeFilter(Constants.GAME_NAME);
    this.removeFilter(Constants.DEPARTMENT_IDS);
    this.removeFilter(Constants.PLAYER_NAME);
    this.removeFilter(Constants.MLG_NAME);
    this.removeCustomeFilters();
  }

  prepareMlgFilter() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.prepareFilterOptions();
      this.filter_options.forEach(filterOption => {

        if (filterOption.custom_filter_key) {
          filterOption['dependent_on'] = Constants.MLG_NAME;
        }
      });
    } else {
      this.prepareCustomFilterOptions();
      this.filter_options.forEach(filterOption => {

        if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
          filterOption['mutually_exclusive_with'] = Constants.GROUP_NAME;
        }

        if (filterOption.custom_filter_key) {
          filterOption['dependent_on'] = Constants.MLG_NAME;
        }
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
    }
    this.addFilter(Constants.MLG_NAME, this.translate.instant('multilevel_game'), true, true, PlaceholderText.MLG_NAME,
      null, null, false, false, true, false);
    this.addFilter(Constants.MLG_COMPLETENESS, this.translate.instant('progress'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.IS_ACTIVE, this.translate.instant('status'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.GAME_STATE_MODE, this.translate.instant('mode'),true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.GROUP_NAME, this.translate.instant('group'), true, true, PlaceholderText.GROUP_NAME, Constants.MLG_NAME, Constants.LOCATION_IDS, false, true, true, false);
    this.addFilter(Constants.DASHBOARD_BY, this.translate.instant('by'), true, true, '', null, null, false, false, true, true);
    this.removeFilter(Constants.PLAYER_NAME);
    this.removeFilter(Constants.CONTEST_NAME);
    this.removeFilter(Constants.GAME_NAME);
    console.log(this.filter_options);
  }
  prepareHierarchyFilter() {
    this.addFilter(Constants.HIERARCHY, this.translate.instant('mode'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.DASHBOARD_BY, this.translate.instant('by'), true, true, '', null, null, false, false, true, true);
    this.addFilter(Constants.IS_ACTIVE, this.translate.instant('status'), true, true, '', null, null, false, false, true, true);
    if (!this.appliedFilters.length) {
      const appliedFilters = this.storageService.getObject('allFilters');
      appliedFilters.forEach(filterItem => {
        if (filterItem.key === 'dashboard') {
          this.appliedFilters = filterItem.value;
        }
      });
    }
    const appliedMode = this.appliedFilters.filter((item) => item.filter === 'hierarchy')[0];
    if (appliedMode && (appliedMode.id === 'All' || appliedMode.id === 'CONTEST')) {
      this.removeFilter(Constants.CONTEST_NAME);
      this.addFilter(Constants.GAME_NAME, this.translate.instant('game'),
        true, true, PlaceholderText.GAME_NAME, null, null, false, false, true, false);
      this.addFilter(Constants.GAME_MODE, this.translate.instant('mode'), true, true, '', null, null, false, false, true, true);
      this.appliedFilters.forEach((item) => {
        if (item.filter === Constants.CONTEST_NAME) {
          this.appliedFilters.splice(this.appliedFilters.indexOf(item));
        }
      });
    } else if (appliedMode && (appliedMode.id === 'AllC' || appliedMode.id === 'live')) {
      this.removeFilter(Constants.GAME_NAME);
      this.addFilter(Constants.CONTEST_NAME, this.translate.instant('contest'), true, true, PlaceholderText.CONTEST_NAME,
        null, null, false, false, true, false, true);
      this.addFilter(Constants.CONTEST_STATE, this.translate.instant('state'),
        true, true, '', null, null, false, false, true, true);
      this.appliedFilters.forEach((item) => {
        if (item.filter === Constants.GAME_NAME) {
          this.appliedFilters.splice(this.appliedFilters.indexOf(item));
        }
      });
    }
    this.removeFilter(Constants.LOCATION_IDS);
    this.removeFilter(Constants.GROUP_NAME);
    this.removeFilter(Constants.DEPARTMENT_IDS);
    this.removeFilter(Constants.PLAYER_NAME);
    this.removeCustomeFilters();
  }

  removeCustomeFilters() {
    this.filter_options = this.filter_options.filter(filterOption => {
      return !filterOption['custom_filter_key'];
    });
  }
  updateFilters(data) {
    const reporteeFilterList = this.appliedFilters.filter((reporteeFilter) => reporteeFilter.isHierarchy);
    this.appliedFilters.push({
      filter: 'reportee' + data.id,
      searchingIn: `${data.first_name} ${data.last_name}`,
      value: '',
      isHierarchy: true,
      id: data.id,
      additionalFilter: false,
      dependentOn: reporteeFilterList && reporteeFilterList.length ? reporteeFilterList.slice(-1)[0].filter : '',
      is_static: true,
    });
    this.storeFilters();
  }

  addDefaultManagerFilter(data) {
    const checkDefaultFilter = this.appliedFilters.filter((item) => item.filter === 'default_manager');
    if (checkDefaultFilter && checkDefaultFilter.length >= 1) { return; }
    this.appliedFilters.push({
      filter: 'default_manager',
      searchingIn: `Hierarchy: ${data.first_name} ${data.last_name}`,
      value: '',
      id: data.id,
      additionalFilter: false,
      is_static: true,
      isHierarchy: true,
      dependentOn: '',
      isDefault: true
    });
    this.storeFilters();
    if (this.hierarchyReportComponent.dataSource && this.hierarchyReportComponent.dataSource.data) {
      this.reporteelist = this.hierarchyReportComponent.dataSource.data;
    }
  }

  addFilter(filterNameToBeAdded, value, isTextSearch, isListSearch, placeholder,
    dependentOn = null, mutuallyExclusive = null, isMulti, isMultiSelection, isGenericMenu, isDefault,
    shouldRequestDataSourceWithSearchKey = false) {
    // Check if filter exist
    const filterInexToBeAdded = this.filter_options.findIndex(function (existingFilter, i) {
      return existingFilter['filter'] === filterNameToBeAdded;
    });
    if (filterInexToBeAdded >= 0) {
      const filterToUpdate: any = this.filter_options[filterInexToBeAdded];
      filterToUpdate['filter'] = filterNameToBeAdded;
      filterToUpdate['value'] = value;
      filterToUpdate['is_text_search'] = isTextSearch;
      filterToUpdate['is_list_search'] = isListSearch;
      filterToUpdate['placeholder'] = placeholder;
      filterToUpdate['dependent_on'] = dependentOn;
      filterToUpdate['mutually_exclusive_with'] = mutuallyExclusive;
      filterToUpdate['is_multi'] = isMulti;
      filterToUpdate['is_multi_selection'] = isMultiSelection;
      filterToUpdate['is_generic_menu'] = isGenericMenu;
      filterToUpdate['is_default'] = isDefault;
      filterToUpdate['shouldRequestDataSourceWithSearchKey'] = shouldRequestDataSourceWithSearchKey;
    } else {
      const filterOptionsToAdd = {
        'filter': filterNameToBeAdded,
        'value': value,
        'is_text_search': isTextSearch,
        'is_list_search': isListSearch,
        'placeholder': placeholder,
        'dependent_on': dependentOn,
        'mutually_exclusive_with': mutuallyExclusive,
        'is_multi': isMulti,
        'is_multi_selection': isMultiSelection,
        'is_generic_menu': isGenericMenu,
        'is_default': isDefault,
        'shouldRequestDataSourceWithSearchKey': shouldRequestDataSourceWithSearchKey
      };
      this.filter_options.push(filterOptionsToAdd);
    }
  }

  removeFilter(filterToBeRemoved, fromFilters = this.filter_options) {
    const filterInexToBeRemoved = fromFilters.findIndex(function (existingFilter, i) {
      return existingFilter['filter'] === filterToBeRemoved;
    });
    if (filterInexToBeRemoved !== -1) {
      fromFilters.splice(filterInexToBeRemoved, 1);
    }
  }

  setDateRange(refreshDashboard) {
    const dashboardLocalSetting = this.getDashboardFilter();
    if (dashboardLocalSetting && dashboardLocalSetting['dashboard_by'] === Dashboard.BY_CONTEST) {
      this.appliedFilters = this.storageService.getFilterArray(this.context);
      const contest = this.appliedFilters && this.appliedFilters.filter((checkFilter) => checkFilter.filter === Constants.CONTEST_NAME);
      if (contest && contest.length) {
        this.selectedContestId = contest[0].id;
        this.setContestDateRange(this.selectedContestId);
      }
    } else {
      this.selectedContestId = null;
    }
    this.selectedRange = dashboardLocalSetting && dashboardLocalSetting['range'] ? dashboardLocalSetting['range'] : Range.THIS_QT;
      console.log(this.selectedRange);

    // Set this start and end date of month as default start date
    if (!this.startDate && !this.endDate && this.selectedRange !== Range.ALL_TIME) {
      this.startDate = dashboardLocalSetting && dashboardLocalSetting['start_date'] ?
        dashboardLocalSetting['start_date'] : moment().startOf('quarter').format(DATE_FORMAT);
      this.endDate = dashboardLocalSetting && dashboardLocalSetting['end_date'] ?
        dashboardLocalSetting['end_date'] : moment().endOf('quarter').format(DATE_FORMAT);
    } else {
      this.setRange(this.selectedRange, refreshDashboard);
    }
  }

  getCurrentDate(today: Date = null) {
    if (!this.timeZone) { return; }
    return moment().tz(this.timeZone).format(DATE_FORMAT);
  }

  setRange(value, refreshDashboard) {
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    switch (value) {
      case Range.TODAY:
        this.startDate = moment().tz(this.timeZone).format(DATE_FORMAT);
        this.endDate = moment().tz(this.timeZone).format(DATE_FORMAT);
        break;
      case Range.THIS_WK: // isoWeek - wk starts from Monday, week - Wk start from Sunday
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('isoWeek').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('isoWeek').format(DATE_FORMAT);
        }
        break;
      case Range.LAST_WK:
        this.startDate = moment().tz(this.timeZone).subtract(1, 'weeks').startOf('isoWeek').format(DATE_FORMAT);
        this.endDate = moment().tz(this.timeZone).subtract(1, 'weeks').endOf('isoWeek').format(DATE_FORMAT);
        break;
      case Range.THIS_MONTH:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('month').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('month').format(DATE_FORMAT);
        }
        break;
      case Range.LAST_MONTH:
        this.startDate = moment().tz(this.timeZone).subtract(1, 'months').startOf('month').format(DATE_FORMAT);
        this.endDate = moment().tz(this.timeZone).subtract(1, 'months').endOf('month').format(DATE_FORMAT);
        break;
      case Range.THIS_QT:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('quarter').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('quarter').format(DATE_FORMAT);
        }
        break;
      case Range.LAST_QT:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).subtract(1, 'quarter').startOf('quarter').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).subtract(1, 'quarter').endOf('quarter').format(DATE_FORMAT);
        }
        break;
      case Range.ALL_TIME:
        this.startDate = null;
        this.endDate = null;
        break;
      case Dashboard.BY_CONTEST:
        this.startDate = this.startDate;
        this.endDate = this.endDate;
        break;
    }

    this.storeDashboardFilter(value);
    if (refreshDashboard && this.isRequiredFilterApplied()) {
      this.getDashboard();
    }
    const logEventInfo = {
      searchingIn: 'By',
      value: value || ''
    };
    this.filterOptionUpdated(logEventInfo);
  }

  openCustomDateRangePicker(openBy, eventContext = null) {
    const userEmail = this.storageService.userPersonalData && this.storageService.userPersonalData.email;
    let byContest = false;
    if (this.selectedDashboardType === Dashboard.BY_CONTEST) {
      byContest = true;
    }
    const dialogRef = this.dialog.open(CustomDatepickerComponent, {
      data: {
        startDate: this.payload.start_date || '', // when no payload is available
        endDate: this.payload.end_date || '', // when no payload is available
        emails: [userEmail],
        title: openBy,
        context: byContest
      }
    });

    dialogRef.componentInstance.dateRangePicked.subscribe((data) => {
      const payload: any = this.masterReportComponent.getPayload();
      payload.start_date = moment(data.startDate).format(DATE_FORMAT);
      payload.end_date = moment(data.endDate).format(DATE_FORMAT);
      payload.email_ids = data.emails;
      this.emailReport(payload);
      const logEventInfo = {
        searchingIn: 'By',
        value: eventContext || ''
      };
      this.filterOptionUpdated(logEventInfo);
    });
  }

  emailReport(payload) {
    this.dashboardService.detailedReportByCustomRange(payload).subscribe((res) => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        this.showAlert(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.showAlert(this.translate.instant('report_sent_via_email'));
    });
  }

  showAlert(message) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.isMultiOption = false;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  applyDefaultFilters() {
    switch (this.selectedDashboardType) {
      case Dashboard.BY_TEAM:
        if (!this.storageService.isPostLogin()) {
          this.teamDefaultFilters = this.teamDefaultFilters.filter(teamFilter => {
            return teamFilter['filter'] !== Constants.LOCATION_IDS
              && teamFilter['filter'] !== Constants.DEPARTMENT_IDS && teamFilter['filter'] !== Constants.GROUP_ID;
          });
          this.addDefaultFilter(this.teamDefaultFilters);
        } else if (this.globalService.isCompanyBelongsToCustomField()) {
          this.addDefaultFilter(this.teamDefaultFilters);
        }
        break;
      case Dashboard.BY_GAME:
        this.addDefaultFilter(this.gameDefaultFilters);
        break;
      case Dashboard.BY_PLAYER:
        this.addDefaultFilter(this.playerDefaultFilters);
        break;
      case Dashboard.BY_CONTEST:
        this.addDefaultFilter(this.contestDefaultFilters);
        break;
      case Dashboard.BY_MULTILEVEL:
        this.addDefaultFilter(this.mlgDefaultFilters);
        break;
      case Dashboard.BY_HIERARCHY:
        this.payload = this.preparePayload();
        this.setDateRange(true);
        this.hierarchyReportPayload = this.payload;
        if (this.tabIndex === 1) {
          this.masterReportComponent.masterReportPayload = this.payload;
          setTimeout(() => {
            this.masterReportComponent.getDetailedReport();
          }, 500);
        }
        this.addDefaultFilter(this.hierarchyDefaultFilters);
        break;
    }
  }

  refreshListOnFilterChange(filters, refreshDashboard = false) {
    const dashboardBy = filters && filters.filter((existingFilter) => {
      return existingFilter.filter === Constants.DASHBOARD_BY;
    });
    // Track filter removal - check if location/department filters were removed
    this.trackFilterRemovalFromAppliedFilters(filters);
    
    if (this.showReport) {
      this.showReport = false;
    } else {
      const isGameNameFilter = filters.filter(filter => { return filter.filter === Constants.GAME_NAME });
      if (!isGameNameFilter.length || this.pinGameId != isGameNameFilter.id) {
        this.removeQueryParams();
      }
    }
    // If Dashboard type change
    if (dashboardBy && dashboardBy[0] && this.selectedDashboardType !== dashboardBy[0]['id']) {
      this.selectedDashboardType = dashboardBy && dashboardBy[0] ? dashboardBy[0]['id'] : Dashboard.BY_TEAM;
      this.resetDashboard();
      
      // Reset filter removal tracking when dashboard type changes
      this.resetFilterRemovalTracking();

      // Reset default filters first
      this.defaultFilters = [];

      // If switching by TEAM or PLAYER, select SOM locations/departments ---
      if (this.selectedDashboardType === Dashboard.BY_TEAM || this.selectedDashboardType === Dashboard.BY_PLAYER) {      
        if (!this.globalService.isRoleLimited() && this.selectedDashboardType === Dashboard.BY_TEAM) {
          // Pass skipRefresh = true to prevent recursive call
          this.applyDefaultFiltersAccordingToRole(true, this.locationService.allLocations.map(location => location.location_id), '', true);
        } else {
          this.getLocationAndDepartmentAccordingToSOM();
          // Apply default filters after getting SOM data
          this.applyDefaultFilters();
        }
      } else {
        // For other dashboard types, apply default filters normally
        this.applyDefaultFilters();
      }
      
      this.appliedFilters = this.defaultFilters;
      this.selectedRange = dashboardBy[0]['id'] === Dashboard.BY_PLAYER || dashboardBy[0]['id'] === Dashboard.BY_GAME ? Range.ALL_TIME : Range.THIS_QT;
      this.storeDashboardFilter();
      this.setDashboardType(false);
      if (this.masterReportComponent) {
        this.masterReportComponent.resetMasterReport();
      }
    } else {
      if (!this.isRequiredFilterApplied()) {
        this.resetDashboard();
      }
      if (dashboardBy[0]['id'] === Dashboard.BY_CONTEST) {
        const contestNameFilter = filters.filter(filter => filter.filter == Constants.CONTEST_NAME);
        if ((contestNameFilter && contestNameFilter.length) && (this.contestStateFilter && this.contestStateFilter.length)) {
          const index = filters.indexOf(contestNameFilter[0]);
          filters.forEach(filter => {
            if (filter.filter == Constants.CONTEST_STATE && filter.id != this.contestStateFilter[0].id) {
              filters.splice(index, 1);
            }            
          })
        }
        const appliedContestStateFilter = filters.filter(filter => filter.filter == Constants.CONTEST_STATE);
        this.contestStateFilter = JSON.parse(JSON.stringify(appliedContestStateFilter));
        this.appliedFilters = filters;
        this.storeFilters();
      }
      if (dashboardBy[0]['id'] === Dashboard.BY_GAME) {
        this.handleGameTypeFilterChange(filters, Constants.GAME_NAME, 'SLGModeFilter', 'SLG');
      }

      if (dashboardBy[0]['id'] === Dashboard.BY_MULTILEVEL) {
        this.handleGameTypeFilterChange(filters, Constants.MLG_NAME, 'MLGModeFilter', 'MLG');
      }

      if (dashboardBy[0]['id'] === Dashboard.BY_HIERARCHY) {
        this.hierarchyReportPayload = this.payload = this.preparePayload();
        this.appliedFilters = [];
        this.appliedFilters = filters;
        const appliedMode = this.appliedFilters.filter((item) => item.filter === 'hierarchy')[0];
        if (appliedMode.id === 'All' || appliedMode.id === 'CONTEST') {
          this.removeFilter(Constants.CONTEST_NAME);
          this.addFilter(Constants.GAME_NAME, this.translate.instant('game'),
            true, true, PlaceholderText.GAME_NAME, null, null, false, false, true, false);
          this.addFilter(Constants.GAME_MODE, this.translate.instant('mode'), true, true, '', null, null, false, false, true, true);
          this.appliedFilters.forEach((item) => {
            if (item.filter === Constants.CONTEST_NAME) {
              this.appliedFilters.splice(this.appliedFilters.indexOf(item));
            }
          });
        } else if (appliedMode.id === 'AllC' || appliedMode.id === 'live') {
          this.removeFilter(Constants.GAME_NAME);
          this.addFilter(Constants.CONTEST_NAME, this.translate.instant('contest'), true, true, PlaceholderText.CONTEST_NAME,
            null, null, false, false, true, false, true);
          this.addFilter(Constants.CONTEST_STATE, this.translate.instant('state'), true, true, '', null, null, false, false, true, true);
          this.appliedFilters.forEach((item) => {
            if (item.filter === Constants.GAME_NAME) {
              this.appliedFilters.splice(this.appliedFilters.indexOf(item));
            }
          });
        }
        if (this.tabIndex === 1) {
          this.masterReportComponent.masterReportPayload = this.payload;
          setTimeout(() => {
            this.masterReportComponent.getDetailedReport();
          }, 500);
        }
        this.storeFilters();
        this.getDashboard();
        return;
      }
      this.appliedFilters = filters;
      console.log(this.appliedFilters);
      if (this.isRequiredFilterApplied(null, refreshDashboard) || dashboardBy[0]['id'] === Dashboard.BY_HIERARCHY) {
        this.getDashboard();
      } else { // If required filters are not present avoid all post API response
        this.unsubscribeObjects();
        this.resetSubscribedObjects();
        this.payload = null;
        this.bindPayload(this.tabIndex);
      }
    }
    this.storeFilters();
    this.cdRef.detectChanges();
  }

  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const logEventInfo = new EventValuesFormation();
    logEventInfo.key = String(filter.searchingIn).split('-').join('');
    logEventInfo.value = String(filter.value).split('-').join('') || '';
    this.logEvent(logEventInfo);
  }

  logEvent(logEventInfo) {
    // console.log('value', logEventInfo);
    const selectedTabLabel = this.tabIndex === 0 ? 'Dashboard' : 'Detailed Report';
    const keyName = logEventInfo.value ? `${selectedTabLabel}_Report_${logEventInfo.key}_${logEventInfo.value}` :
      `${selectedTabLabel}_Report_${logEventInfo.key}`;
    this.globalService.addAdminGoogleEvent(keyName.split(' ').join('_'));
  }

  setContestDateRange(contestId) {
    this.contestList.forEach((contest) => {
      if (contest.contest_id === contestId) {
        this.startDate = this.globalService.formatDateForPayload(contest.contest_start_date);
        this.endDate = this.globalService.formatDateForPayload(contest.contest_end_date);
        this.setRange(Dashboard.BY_CONTEST, false);
      }
    });
  }

  setDashboardType(fromInit) {
    const dashboardLocalSetting = this.getDashboardFilter();
    this.selectedDashboardType = dashboardLocalSetting && dashboardLocalSetting['dashboard_by'] ?
      dashboardLocalSetting['dashboard_by'] : Dashboard.BY_TEAM;
    this.setUpFilter(this.selectedDashboardType);
    if (fromInit && !this.storageService.getFilterFromStroage(this.context)) {
      this.applyDefaultFilters();
    }
  }

  getDashboard() {
    this.setDashboardType(false);
    this.setDateRange(false);
    this.fetchingAllLocations = false;
    // Check if required filter is present according to Dashboard type
    if (!this.selectedDashboardType || !this.selectedRange || this.appliedFilters.length === 0) {
      this.resetDashboard();
      return;
    }
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    this.payload = this.preparePayload();
    if (this.tabIndex === 1) {
      this.bindPayload(1);
    }
    if (!this.payload) { return; }
    this.resetView = false;
  }

  isRequiredFilterApplied(filterKey = null, refreshDashboard = true) {
    const requiredFilters = [];
    if (!filterKey) {
      switch (this.selectedDashboardType) {
        case Dashboard.BY_TEAM:
          if (!this.globalService.isCompanyWithCustomField()) {
            requiredFilters.push(Constants.LOCATION_IDS);
          } else if (this.globalService.isCompanyWithCustomField()) {
          }
          requiredFilters.push(Constants.GROUP_NAME);
          this.removeFilter(Constants.GAME_NAME, this.appliedFilters);
          this.removeFilter(Constants.PLAYER_NAME, this.appliedFilters);
          this.removeFilter(Constants.CONTEST_NAME, this.appliedFilters);
          break;
        case Dashboard.BY_GAME:
          requiredFilters.push(Constants.GAME_NAME);
          this.removeFilter(Constants.PLAYER_NAME, this.appliedFilters);
          this.removeFilter(Constants.CONTEST_NAME, this.appliedFilters);
          break;
        case Dashboard.BY_PLAYER:
          requiredFilters.push(Constants.PLAYER_NAME);
          this.removeFilter(Constants.LOCATION_IDS, this.appliedFilters);
          this.removeFilter(Constants.GROUP_NAME, this.appliedFilters);
          this.removeFilter(Constants.GAME_NAME, this.appliedFilters);
          this.removeFilter(Constants.DEPARTMENT_IDS, this.appliedFilters);
          this.removeFilter(Constants.CONTEST_NAME, this.appliedFilters);
          break;
        case Dashboard.BY_CONTEST:
          requiredFilters.push(Constants.CONTEST_NAME);
          this.removeFilter(Constants.LOCATION_IDS, this.appliedFilters);
          this.removeFilter(Constants.GROUP_NAME, this.appliedFilters);
          this.removeFilter(Constants.GAME_NAME, this.appliedFilters);
          this.removeFilter(Constants.DEPARTMENT_IDS, this.appliedFilters);
          this.removeFilter(Constants.PLAYER_NAME, this.appliedFilters);
          break;
        case Dashboard.BY_MULTILEVEL:
          requiredFilters.push(Constants.MLG_NAME);
          this.removeFilter(Constants.GAME_NAME, this.appliedFilters);
          this.removeFilter(Constants.PLAYER_NAME, this.appliedFilters);
          this.removeFilter(Constants.CONTEST_NAME, this.appliedFilters);
          break;
        case Dashboard.BY_HIERARCHY:
          requiredFilters.push('default_manager');
          this.removeFilter(Constants.LOCATION_IDS, this.appliedFilters);
          this.removeFilter(Constants.GROUP_NAME, this.appliedFilters);
          this.removeFilter(Constants.DEPARTMENT_IDS, this.appliedFilters);
          this.removeFilter(Constants.PLAYER_NAME, this.appliedFilters);

          break;
      }
    } else {
      requiredFilters.push(filterKey);
    }
    let isRequired = false;
    for (let i = 0; i < requiredFilters.length; i++) {
      isRequired = this.appliedFilters && this.appliedFilters.filter((appliedFilter) => {
        return appliedFilter['filter'] === requiredFilters[i];
      }).length > 0;
      if (isRequired) { break; }
    }
    // fix for the chip removal for custom field case on single level game and multilevel game
    if (!refreshDashboard && (this.selectedDashboardType === Dashboard.BY_GAME || this.selectedDashboardType === Dashboard.BY_MULTILEVEL) && !isRequired) {
      this.appliedFilters.forEach((appliedFilter, index) => {
        // const index = this.appliedFilters.indexOf(appliedFilter);
        if (appliedFilter.hasOwnProperty('customFilterKey')) {
          this.appliedFilters.splice(index);
        }
      });
    }
    // IF isRequired false then onle go for custom filter bcoz in case of true no need to check for custom filters
    if (!isRequired && (this.globalService.isCompanyBelongsToCustomField() || this.globalService.isCompanyWithCustomField())) {
      const customFilters = this.appliedFilters.filter(appliedFilter => {
        return appliedFilter['customFilterKey'] && appliedFilter['customFilterKey'] !== 'undefined';
      });
      if (customFilters.length > 0) {
        isRequired = true;
      } else { isRequired = false; }
    }
    this.resetView = !isRequired;
    return isRequired;
  }

  addDefaultFilter(filters) {
    this.defaultFilters = [];
    filters.forEach(defaultFilter => {
      const item = {
        'filter': defaultFilter['filter'],
        'searchingIn': defaultFilter['searchingIn'],
        'value': defaultFilter['value'] ? defaultFilter['value'] : 'All',
        'id': defaultFilter['id'] ? defaultFilter['id'] : 'All',
        'additionalFilter': defaultFilter['additionalFilter'] ? defaultFilter['additionalFilter'] : false,
        'dependentOn': defaultFilter['dependent_on'] ? defaultFilter['dependent_on'] : '',
        'isDefault': defaultFilter.hasOwnProperty('is_default') ? defaultFilter['is_default'] : true,
        'is_static': defaultFilter.hasOwnProperty('is_static') ? defaultFilter['is_static'] : false
      };
      this.defaultFilters.push(item);
    });
  }

  addSubscribedObject(obj: any) {
    this.subcribedObjects.push(obj);
  }

  resetSubscribedObjects() {
    this.subcribedObjects = [];
  }

  unsubscribeObjects() {
    this.subcribedObjects.forEach((subscribedObj) => {
      if (subscribedObj) { subscribedObj.unsubscribe(); }
    });

  }

  convertToHHMMSS(seconds) {
    let hours, minutes: any;
    hours = Math.floor(seconds / 3600);
    minutes = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = seconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }
    const time = hours + ':' + minutes + ':' + seconds;
    return time;
  }

  preparePayload() {
    if (this.selectedContestId) {
      this.setContestDateRange(this.selectedContestId);
    }
    this.setCompanyDetails();
    let payload = {
      'company_id': this.companyId,
      'timezone': this.timeZone,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };

    if (this.selectedDashboardType !== Dashboard.BY_MULTILEVEL) {
      payload['start_date'] = this.startDate;
      payload['end_date'] = this.endDate;
    }

    const customFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['customFilterKey'] && appliedFilter['customFilterKey'] !== 'undefined';
    });

    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filterApplied(payload, Constants.GAME_MODE, this.appliedFilters);
    payload = this.globalService.filterApplied(payload, Constants.GAME_NAME, this.appliedFilters, 'game_id');
    payload = this.globalService.filterApplied(payload, Constants.PLAYER_NAME, this.appliedFilters, 'player_id');
    payload = this.globalService.filterApplied(payload, Constants.CONTEST_NAME, this.appliedFilters, 'contest_id');
    payload = this.globalService.filterApplied(payload, Constants.MLG_NAME, this.appliedFilters, 'mlg_id');
    payload = this.globalService.filterApplied(payload, Constants.MLG_COMPLETENESS, this.appliedFilters);
    if (!payload['group_id']) {
      payload = this.globalService.filtersApplied(payload, Constants.LOCATION_IDS, this.appliedFilters);
      payload = this.globalService.filtersApplied(payload, Constants.DEPARTMENT_IDS, this.appliedFilters);
    }
    if (this.selectedDashboardType === Dashboard.BY_HIERARCHY) {
      payload['manager_id'] = this.storageService.getLoginUserID();
      this.appliedFilters.filter((item) => {
        if (item.filter === 'hierarchy' && item.id === 'AllC') {
          payload['all_contests'] = !!payload['contest_id'] ? false : true;
        }
        if (item.filter === 'hierarchy' && item.id === 'live') {
          payload['contest_id'] = payload['contest_id'] ? payload['contest_id'] : '';
        }
      });
      if (!!payload['contest_id']) {
        delete payload['game_id'];
      } else if (!!payload['game_id']) {
        delete payload['contest_id'];
      }
    }
    if (customFilters.length) {
      customFilters.forEach(customFilter => {
        if (customFilter['additionalFilter']) {
          payload = this.globalService.filtersApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        } else {
          payload = this.globalService.filterApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        }
      });
    }
    return payload;
  }

  storeFilters() {
    this.storageService.setFilters(this.context, this.appliedFilters);
  }

  storeDashboardFilter(value = null) {
    if (value && value === Range.CUSTOM) {
      return;
    }
    const dasboardFilter = {
      'dashboard_by': this.selectedDashboardType,
      'range': this.selectedRange,
      'start_date': this.startDate,
      'end_date': this.endDate
    };
    this.storageService.setObject('dashboard-filter', dasboardFilter);
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  resetDashboard() {
    if (this.globalService.isCompanyBelongsToCustomField() && this.storageService.getAccessType() !== Role.ADMIN) {
      dashboardTypes = [
        { 'id': 1, 'value': this.translate.instant('team') },
        { 'id': 2, 'value': this.translate.instant('contest') },
        { 'id': 3, 'value': this.translate.instant('game_single_level') },
        { 'id': 4, 'value': this.translate.instant('game_multilevel') },
        { 'id': 5, 'value': this.translate.instant('player') },
        { 'id': 6, 'value': this.translate.instant('hierarchy') }
      ];
    } else {
      dashboardTypes = [
        { 'id': 1, 'value': this.translate.instant('team') },
        { 'id': 2, 'value': this.translate.instant('contest') },
        { 'id': 3, 'value': this.translate.instant('game_single_level') },
        { 'id': 4, 'value': this.translate.instant('game_multilevel') },
        { 'id': 5, 'value': this.translate.instant('player') }
      ];
    }

    this.resetView = true;
  }

  isFilterPresent(filterName, list) {
    const isFilterExist = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter.filter === filterName;
    }).length;
    // Clear selection if filter not present
    if (!isFilterExist) {
      if (!list) { return; }
      list.forEach(item => {
        item.isSelected = false;
      });
    }
  }

  getDataSource(filterObj) {
    const filterName = filterObj['filter'];
    console.log(filterName)
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.isFilterPresent(Constants.LOCATION_IDS, this.locationList);
        this.getCustomFieldsValues(filterObj);
        break;
      case Constants.DEPARTMENT_IDS:
        this.isFilterPresent(Constants.DEPARTMENT_IDS, this.departmentList);
        this.getDepartmentsByLocations();
        break;
      case Constants.GROUP_NAME:
        this.isFilterPresent(Constants.GROUP_NAME, this.groupList);
        this.globalService.getGroups(CallerId.DASHBOARD);
        break;
      case Constants.IS_ACTIVE:
        this.menuList = playerStateList;
        break;
      case Constants.GAME_STATE_MODE:        
          this.menuList = gameStateModes;        
        break;
      case Constants.GAME_MODE:
        this.menuList = gameModes;
        break;
      case Constants.GAME_NAME:
        this.getGames();
        break;
      case Constants.PLAYER_NAME:
        this.getPlayers();
        break;
      case Constants.DASHBOARD_BY:
        this.menuList = dashboardTypes;
        break;
      case Constants.CONTEST_STATE:
        this.menuList = contestStates;
        break;
      case Constants.HIERARCHY:
        this.menuList = hierarchyStates;
        break;
      case Constants.MLG_COMPLETENESS:
        this.menuList = mlgCompleteness;
        break;
      case Constants.CONTEST_NAME:
        this.getContests();
        break;
      case Constants.MLG_NAME:
        this.getMultilevelGames();
        break;
      default:
        if (this.globalService.isCompanyBelongsToCustomField()) {
          this.getValues(filterObj);
        } else {
          this.getCustomFieldsValues(filterObj);
        }
        break;
    }
    this.cdRef.detectChanges();
  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    switch (filterKey) {
      case Constants.PLAYER_NAME:
        this.getPlayers(searchKey);
        break;
      case Constants.CONTEST_NAME:
          this.getContests(searchKey);
        break;
      case Constants.MLG_NAME:
          this.getMultilevelGames(searchKey);
        break;
      default:
        const searchFilter = {
          'search_text': searchKey ? searchKey : '',
          'filter': filterKey,
          'value': currentFilter.value,
          'is_multi_selection': currentFilter.is_multi_selection,
          'custom_filter_key': currentFilter.custom_filter_key
        };
        // after applying this check the api is not called multiple times does menulist is not repopulated with same key value pairs
        if (searchKey) {
          if (this.globalService.isCompanyBelongsToCustomField()) {
            this.getValues(searchFilter);
          } else {
            this.getCustomFieldsValues(searchFilter);
          }
        }
        break;
    }
    this.cdRef.detectChanges();
  }

  getLocations(refreshDashboard) {
    if (this.storageService.isPostLoginForCustomField() && this.storageService.getAccessType() !== Role.ADMIN
      && this.globalService.isCompanyWithCustomField()) {
      this.locationService.getLocationForCustomFieldPostLogin(this.storageService.getCompanyId(), false).subscribe((res) => {
        const response: any = res;
        if (!response.success) { return; }
        let locList = [];
        locList = this.prepareListForSelection(response && response.data && response.data.location_list);
        const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': this.translate.instant('location') };
        this.locationList = [];
        this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters);
        this.menuList = this.locationList;
        this.storageService.setPostLoginForCustomField(false);
      });
    } else {
      let locList = [];
      let locations = [];
      locations = this.locationService.getAllLocations(this.storageService.getCompanyId(), null, false);
      locList = this.prepareListForSelection(locations);
      const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': this.translate.instant('location') };
      this.locationList = [];
      this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters);
      this.menuList = this.locationList;
    }
    this.cdRef.detectChanges();
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

  getContests(searchKey = null) {
    let contestStateFilter = {};
    contestStateFilter = this.globalService.filterApplied(contestStateFilter, Constants.CONTEST_STATE, this.appliedFilters);
    const contestStateFilterEmpty = this.globalService.isEmpty(contestStateFilter, Constants.CONTEST_STATE);
    console.log('contestStateFilterEmpty', contestStateFilterEmpty, contestStateFilter)
    let queryString = '';
    if (!contestStateFilterEmpty) { // If object not empty convert it to Query string
      queryString = Object.keys(contestStateFilter).map(key => key + '=' + contestStateFilter[key]).join('&');
    }
    if (searchKey) {
      if (queryString.indexOf('contest_state') !== -1) {
        queryString += `&contest_name=${searchKey}`;
      } else {
        queryString += `contest_name=${searchKey}`;
      }
    }
    if (this.selectedDashboardType === Dashboard.BY_HIERARCHY && !queryString) {
      this.appliedFilters.filter((item) => {
        if (item.filter === 'hierarchy' && item.id === 'live') {
          queryString = 'contest_state=live';
        }
      });
    }
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
    this.contestService.getContestsList(this.companyId, 'created_on', 'desc', 0, 100, queryString).subscribe((res) => {
      const response: any = res;
      this.fetchingAllLocations = false;
      if (!response.success) { return; }
      const contestList = response.data.contest_list;
      this.menuList = [];
      this.contestList = [];
      contestList.forEach(item => {
        this.contestList.push({ 'id': item.contest_id, 'value': item.contest_name });
      });
      this.menuList = this.contestList;
    });
  }

  getMultilevelGames(searchKey = null) {
    let mlgCompletenessFilter = {};
    let mlgPlayerStatusFilter = {};
    mlgCompletenessFilter = this.globalService.filterApplied(mlgCompletenessFilter, Constants.MLG_COMPLETENESS, this.appliedFilters);
    mlgPlayerStatusFilter = this.globalService.filterApplied(mlgPlayerStatusFilter, Constants.IS_ACTIVE, this.appliedFilters);
    const mlgCompletenessFilterEmpty = this.globalService.isEmpty(mlgCompletenessFilter, Constants.MLG_COMPLETENESS);
    const mlgPlayerStatusFilterEmpty = this.globalService.isEmpty(mlgPlayerStatusFilter, Constants.IS_ACTIVE);
    let queryString = '';
    if (!mlgCompletenessFilterEmpty) { // If object not empty convert it to Query string
      queryString = Object.keys(mlgCompletenessFilter).map(key => key + '=' + mlgCompletenessFilter[key]).join('&');
    }
    if (!mlgPlayerStatusFilterEmpty) { // If object not empty convert it to Query string
      queryString = Object.keys(mlgPlayerStatusFilter).map(key => key + '=' + mlgPlayerStatusFilter[key]).join('&');
    }
    if (searchKey) {
      queryString += `mlg_name=${searchKey}`;
    }
    queryString += `&mlg_state=live-ready`;
    let gameStateModeFilter = {};
    gameStateModeFilter = this.globalService.filterApplied(gameStateModeFilter, Constants.GAME_STATE_MODE, this.appliedFilters);
    let includeDeleted = false;
    if(gameStateModeFilter && gameStateModeFilter['game_state_mode'] === "ACTIVEGAMES"){
        includeDeleted = false;
      }else if(gameStateModeFilter && gameStateModeFilter['game_state_mode'] === "ALL"){
      includeDeleted = true;
    }
    this.multilevelgamesService.getMultilevelGames(this.companyId, 'created_on', 'desc', 0, 5000, queryString, includeDeleted).subscribe((res) => {
      const response: any = res;
      if (!response.success) { return; }
      const mlgList = response.data.mlg_list;
      this.menuList = [];
      this.multilevelGames = [];
      mlgList.forEach(item => {
        this.multilevelGames.push({ 'id': item.mlg_id, 'value': item.mlg_name, 'is_deleted': item.is_deleted });
      });
      this.menuList = this.multilevelGames;
    });
    this.cdRef.detectChanges();
  }

  getPlayers(searchKey = null) {
    let payload = {
      'company_id': this.storageService.getCompanyId(),
      'manager_id': this.storageService.getLoginUserID(),
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
      'sort_by': Constants.FIRST_NAME,
      'order': 'asc',
      'start_index' : 0,
      'limit' : 100
    };

    // Handle name filter from applied filters
    let playerModeFilter = {};
    playerModeFilter = this.globalService.filterApplied(playerModeFilter, Constants.NAME, this.appliedFilters);
    const playerModeFilterEmpty = this.globalService.isEmpty(playerModeFilter, Constants.CONTEST_STATE);
    
    if (!playerModeFilterEmpty) {
      // Convert filter to payload format
      Object.keys(playerModeFilter).forEach(key => {
        if (key === 'name') {
          payload['name'] = playerModeFilter[key];
        }
      });
    }

    // Handle search key
    if (searchKey) {
      payload['name'] = searchKey;
    }

    // Handle location and department filters based on user's SOM
    if(this.globalService.isRoleLimited() && this.selectedDashboardType === Dashboard.BY_PLAYER && !this.globalService.isCompanyBelongsToCustomField() && !this.globalService.isCompanyWithCustomField()){
      this.prepareLocationAndDepartmentPayload(payload);
    }

    this.playerService.getPlayersForCustomFields(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) { return; }
      const playerList = response.data.player_list;
      this.menuList = [];
      this.players = [];
      playerList.forEach(item => {
        const name = item.first_name + ' ' + item.last_name;
        this.players.push({ 'id': item.player_id, 'value': name });
      });
      this.menuList = this.players;
    });
  }

  prepareLocationAndDepartmentPayload(payload) {
    this.locationService.getLocationAndDepartmentAccordingToSOM().subscribe(res => {
      const response: any = res;
      if (response.success) {
        this.linkLocations = response.data.link_locations;
        this.linkDepartments = response.data.link_departments;

        if (!this.linkLocations || this.linkLocations.length === 0){
          return;
        }
      }
    });

    // Extract location filters from applied filters
    const locationFilters = this.appliedFilters.filter(filter => filter.filter === Constants.LOCATION_IDS);
    if (locationFilters.length > 0) {
      const locationFilter = locationFilters[0];
      if (locationFilter.id && locationFilter.id !== 'All') {
        // If it's an array of IDs, use it directly
        if (Array.isArray(locationFilter.id)) {
          payload['location_ids'] = {
            ids: locationFilter.id,
            is_all: false
          };
        } else {
          // If it's a single ID, convert to array
          payload['location_ids'] = {
            ids: [locationFilter.id],
            is_all: false
          };
        }
      }
    } else {
      // If no location filter is applied, use SOM locations for role-limited users
      if (this.globalService.isRoleLimited() && this.linkLocations && this.linkLocations.length > 0) {
        const somLocationIds = this.linkLocations.map(loc => loc.location_id);
        payload['location_ids'] = {
          ids: somLocationIds,
          is_all: false
        };
      }
      // For non-role-limited users API to return all players
    }

    // Extract department filters from applied filters
    const departmentFilters = this.appliedFilters.filter(filter => filter.filter === Constants.DEPARTMENT_IDS);
    if (departmentFilters.length > 0) {
      const departmentFilter = departmentFilters[0];
      if (departmentFilter.id && departmentFilter.id !== 'All') {
        // If it's an array of IDs, use it directly
        if (Array.isArray(departmentFilter.id)) {
          payload['department_ids'] = {
            ids: departmentFilter.id,
            is_all: false
          };
        } else {
          // If it's a single ID, convert to array
          payload['department_ids'] = {
            ids: [departmentFilter.id],
            is_all: false
          };
        }
      }
    } else {
      // If no department filter is applied, use SOM departments for role-limited users
      if (this.globalService.isRoleLimited() && this.linkDepartments && this.linkDepartments.length > 0) {
        const somDepartmentIds = this.linkDepartments.map(dept => dept.department_id);
        payload['department_ids'] = {
          ids: somDepartmentIds,
          is_all: false
        };
      }
      // For non-role-limited users  API to return all players
    }
  }

  getGames(game_id = null) {
    let gameModeFilter = {};
    gameModeFilter = this.globalService.filterApplied(gameModeFilter, Constants.GAME_MODE, this.appliedFilters);
    let SLGModeFilter = {};
    SLGModeFilter = this.globalService.filterApplied(SLGModeFilter, Constants.GAME_STATE_MODE, this.appliedFilters);
    const gameModeFilterEmpty = this.globalService.isEmpty(gameModeFilter, Constants.GAME_MODE);
    // FIX ME, Hardcoded endlimit
    let queryString = null;
    if (game_id) {
      queryString = `game_id=${game_id}`;
    } else {
      if (!gameModeFilterEmpty) { // If object not empty convert it to Query string
        queryString = Object.keys(gameModeFilter).map(key => key + '=' + gameModeFilter[key]).join('&');
      }
      if (this.selectedDashboardType === Dashboard.BY_HIERARCHY && !queryString) {
        this.appliedFilters.filter((item) => {
          if (item.filter === 'hierarchy' && item.id === 'CONTEST') {
            queryString = 'game_mode=CONTEST';
          }
        });
      }
    }
    
    let includeDeleted = false;
    console.log(SLGModeFilter)
    if(SLGModeFilter && SLGModeFilter['game_state_mode'] === "ACTIVEGAMES"){
        includeDeleted = false;
      }else if(SLGModeFilter && SLGModeFilter['game_state_mode'] === "ALL"){
      includeDeleted = true;
    }    
    this.gamesService.getGames(this.storageService.getCompanyId(), 'game_name', 'asc', 0, 5000, queryString, true, includeDeleted).subscribe((res) => {
      const response: any = res;
      if (response.data && !game_id) {
        const games = response.data.game_list;
        this.menuList = [];
        this.gameList = [];
        games.forEach(item => {
          this.gameList.push({ 'id': item.game_id, 'value': item.game_name, 'is_deleted': item.is_deleted });
        });
        this.menuList = this.gameList;
      } else {
        const gameObj = response.data.game_list[0];
        this.selectedDashboardType = Dashboard.BY_GAME;
        this.selectedRange = Range.ALL_TIME;
        this.addDefaultFilter(this.gameDefaultFilters);
        const item = {
          'additionalFilter': false,
          'dependentOn': '',
          'filter': Constants.GAME_NAME,
          'id': gameObj.game_id,
          'isDefault': false,
          'is_static': false,
          'searchingIn': 'Game',
          'value': gameObj.game_name,
        };
        this.defaultFilters.push(item);
        this.setUpFilter(Dashboard.BY_GAME);
        this.appliedFilters = this.defaultFilters;
        this.storeFilters();
        this.setRange(this.selectedRange, true)
        this.payload = this.preparePayload();
      }
      this.cdRef.detectChanges();
    });
  }

  getDepartmentsByLocations() {
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
    if (this.storageService.getAccessType() === Role.MID_MANAGER) {
      payload['all_department'] = true
    }
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
      this.menuList = [];
      const filterInfo = {
        'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': this.translate.instant('department'),
        'dependentOn': Constants.LOCATION_IDS
      };
      this.departmentList = this.globalService.prepareSelectionList(list, filterInfo, this.appliedFilters);
      this.menuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }

  switchTab(index) {
    this.processSelectedIndex(index);
    this.bindPayload(index);
  }

  bindPayload(index) {
    this.tabIndex = index;
    this.updateBreadcrumbs();
    this.masterReportPayload = null;
    if (this.appliedFilters.length && this.selectedDashboardType === Dashboard.BY_HIERARCHY) {
      this.hierarchyReportPayload = this.payload;
      this.masterReportPayload = this.payload;
    }
    if (this.isRequiredFilterApplied() && index === 0 && this.selectedDashboardType === Dashboard.BY_HIERARCHY) {
      this.hierarchyReportPayload = this.payload;
    }
    if (this.isRequiredFilterApplied() && index === 1) {
      this.masterReportPayload = this.payload;
    } else {
      this.selectedRange = this.getDashboardFilter() ? this.getDashboardFilter()['range'] : Range.THIS_QT;
      if (this.isRequiredFilterApplied()) {
        this.getDashboard();
      }
    }

  }

  resetBindPayload() {
    this.masterReportPayload = null;
  }

  updateBreadcrumbs() {
    if (this.tabIndex === 1) {
      this.breadcrumbService.updateBreadcrumbLabel(this.translate.instant('detailed_report'));
    } else {
      this.breadcrumbService.updateBreadcrumbLabel(this.translate.instant('dashboard'));
    }
  }

  processSelectedIndex(index) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        selectedTab: index,
        showReport: null,
        game_id: null
      },
      queryParamsHandling: 'merge',
      // preserve the existing query params in the route
    });

  }
  showVideo() {
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { name: this.translate.instant('how_to_run_reports'), url: this.globalService.tutorialVideo.RUN_REPORTS }
      });
    this.globalService.addAdminGoogleEvent('Video_Play');
  }
  getCustomFieldsValues(filterDetails) {
    if (filterDetails.custom_filter_key === Constants.LOCATION_IDS) {
      this.getLocations(filterDetails);
      return;
    }
    if (filterDetails.custom_filter_key === Constants.DEPARTMENT_IDS) {
      this.getDepartmentsByLocations();
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
        if (filterDetails.is_multi_selection) {
          const mList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
          const filterInfo = { 'filter_name': field, 'searching_in': searchingIn };
          const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
          const forceSelection = clickedFilter && clickedFilter.value === 'All' ? true : false;
          this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
        } else {
          this.menuList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
        }
        this.cdRef.detectChanges();
      }
    });
  }

  removeQueryParams() {
    const editedUrl = { ...this.activatedRoute.snapshot.queryParams };
    if (editedUrl.game_id && editedUrl.showReport) {
      delete editedUrl.game_id;
      delete editedUrl.showReport;
    }
    this.router.navigate([], { queryParams: editedUrl });
  }

  showRangeOptions(dashboardType) {
    return dashboardType === Dashboard.BY_PLAYER;
  }

  isReportLoaded(isLoaded) {
    this.isFiltersLoaded = !isLoaded;
  }

  ngOnDestroy(): void {
    if (this.allLocationsSubcription) {
      this.allLocationsSubcription.unsubscribe();
    }

    if (this.companyChangeSubscription) {
      this.companyChangeSubscription.unsubscribe();
    }

    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }

    if (this.groupListSubscription) {
      this.groupListSubscription.unsubscribe();
    }

    if (this.updateReportSubscription) {
      this.updateReportSubscription.unsubscribe();
    }

    if (this.fieldFetchSubscription) {
      this.fieldFetchSubscription.unsubscribe();
    }
  }
  dashboardTypeChanged(event){
    console.log('event',event);
switch (event) {
  case DashboardTabType.ENGAGEMENT_INSIGHTS:
    this.router.navigate([Route.PATHWAY_INSIGHT]);
    break;
  case DashboardTabType.PATHWAY_INSIGHTS:
    this.router.navigate([Route.PATHWAY_INSIGHT]);
    break;

  default:
    this.router.navigate([Route.DASHBOARD]);
    break;
}

  }
}
