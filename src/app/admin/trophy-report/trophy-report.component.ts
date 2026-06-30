import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TrophyService } from 'src/app/services/trophy/trophy.service';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Paginations } from 'src/app/services/global/global.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { DatePipe } from '@angular/common';
import { HeaderService } from 'src/app/services/header/header.service';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'src/app/services/company/company.service';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { MatPaginator } from '@angular/material/paginator';

const trophyMLGTypes = [{ 'id': true, 'value': 'Won' }, { 'id': false, 'value': 'In Progress' }];
const trophyTypes = [{ 'id': true, 'value': 'Achieved' }, { 'id': false, 'value': 'Not Achieved' }];
@Component({
  selector: 'app-trophy-report',
  templateUrl: './trophy-report.component.html',
  styleUrls: ['./trophy-report.component.scss']
})
export class TrophyReportComponent implements OnInit, OnDestroy {
  fieldFetchSubscription: any;
  is_loading = false;
  playerDataSource;
  displayedColumns: string[] = [];
  sort = {
    'sortBy': Constants.FIRST_NAME,
    'order': 'asc'
  };
  totalPlayers;
  noOfItemsPerPage;
  pageSizeOptions;
  startLimit = 0;
  userStatusList = [{ 'id': 'active', 'value': 'Active' },
  { 'id': 'inactive', 'value': 'Inactive' }
  ];
  userMLGStatusList = [{ 'id': 'active', 'value': 'Active' },
  { 'id': 'inactive', 'value': 'Inactive' },
  { 'id': 'unverified', 'value': 'Pending Verification' },
  ];
  appliedFilters = [];
  trophyType;
  menuList = [];
  trophyId;
  gameId;
  mlgId;
  isWinner = true;
  payload;
  showReport = false;
  defaultFilters = [];
  // context: String = 'trophyReport';
  context: String;
  filterForTrophytype;
  filter_options = [];
  search_filters = [
    {
      'filter': Constants.IS_ACHIEVED, value: 'Trophy', 'is_text_search': true, 'is_list_search': true,
      'placeholder': '',
      'is_generic_menu': true, 'is_default': true
    },
    {
      'filter': Constants.TROPHY_PLAYER_NAME, value: 'Name', 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.TROPHY_PLAYER_NAME
    },
    // {
    //   'filter': Constants.LOCATION_IDS, value: 'Location', 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.LOCATION_NAME, 'is_generic_menu': true, 'custom_menu_Item': true
    // },
    // {
    //   'filter': Constants.DEPARTMENT_IDS, value: 'Department', 'is_text_search': true, 'is_list_search': true,
    //   'dependent_on': Constants.LOCATION_IDS,
    //   'placeholder': PlaceholderText.DEPARTMENT_NAME, 'is_multi_selection': false, 'is_generic_menu': true, 'custom_menu_Item': true
    // },
    {
      'filter': Constants.STATUS, value: 'Player Status', 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.STATUS, 'is_generic_menu': true
    },
  ];
  locationList: any[];
  loginUser: any;
  departmentList: any[];
  mlgTrophyPayload: any;
  openCustomMenu: any;
  selectedId: any;
  selectedType: any;
  @ViewChild('paginator') paginator: MatPaginator;
  constructor(
    public storageService: StorageService,
    public globalService: GlobalService,
    public trophyService: TrophyService,
    private datePipe: DatePipe,
    public translate: TranslateService,
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbsService,
    public companyService: CompanyService,
    private router: Router,
    public locationService: LocationService,
    public departmentService: DepartmentService,
    private cdRef: ChangeDetectorRef
  ) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.route.queryParams.subscribe(queryParams => {
      console.log('ininndasdas');
      if (this.parseQueryParams(queryParams)) {
        // this.loadData();
        console.log('ininn');

      } else {
        // this.router.navigate([Route.DASHBOARD]);
      }
    });
    if (this.trophyType === 'mlg') {
      this.context = 'trophyReportMlg';
    } else {
      this.context = 'trophyReport';
    }
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.fieldFetchSubscription = this.companyService.onFieldsFetched.subscribe(res => {
        this.filter_options = this.globalService.addeditCustomFilters(this.search_filters, res, 2);
      });
    } else {
      this.fieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, res, 2);
        this.filter_options.forEach(filterOption => {
          if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
            filterOption['dependent_on'] = Constants.LOCATION_IDS;
          }
        });
      });
    }
    this.addDefaultFilter();
  }

  ngOnInit() {
    this.headerService.showCompanyFilter(false);
    if (this.globalService.isCompanyBelongsToCustomField()) {
      const fields = this.companyService.getFields();
      this.filter_options = this.globalService.addeditCustomFilters(this.search_filters, fields, 2);
    } else {
      const fields = this.companyService.getCustomFields();
      this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, fields, 2);
      this.filter_options.forEach(filterOption => {
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
      // Auto-apply SOM filters for role-limited users
      this.autoApplySOMFiltersIfNeeded();
    }
    this.filter_options.forEach(option => {
      if (option.filter === Constants.STATUS) {
        if (this.trophyType === 'mlg') {
          option.value = 'Player Status';
        } else {
          option.value = 'Status';
        }
      }
    });
  }

  autoApplySOMFiltersIfNeeded() {
    // Check if user is role-limited
    if (!this.globalService.isRoleLimited()) {
      return;
    }

    // Check if location and department filters are already applied
    const existingFilters = this.storageService.getFilterArray(this.context);
    const hasLocationFilter = existingFilters && existingFilters.some(filter => filter.filter === Constants.LOCATION_IDS);
    const hasDepartmentFilter = existingFilters && existingFilters.some(filter => filter.filter === Constants.DEPARTMENT_IDS);

    // If filters are already applied, don't auto-apply
    if (hasLocationFilter && hasDepartmentFilter) {
      return;
    }

    // Auto-apply SOM filters
    this.applySOMFiltersForTrophyReport();
  }

  applySOMFiltersForTrophyReport() {    
    this.locationService.getLocationAndDepartmentAccordingToSOM().subscribe(res => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      
      const linkLocations = response.data.link_locations;
      const linkDepartments = response.data.link_departments;

      if (!linkLocations || linkLocations.length === 0) {
        return;
      }

      // Get existing filters
      let existingFilters = this.storageService.getFilterArray(this.context) || [];
      
      // Ensure the default "Trophy: Achieved" filter is present
      const hasDefaultFilter = existingFilters.some(filter => filter.filter === Constants.IS_ACHIEVED);
      if (!hasDefaultFilter) {
        const defaultFilter = {
          'filter': Constants.IS_ACHIEVED,
          'searchingIn': 'Trophy',
          'value': this.trophyType === 'mlg' ? 'Won' : 'Achieved',
          'id': true,
          'additionalFilter': false,
          'dependentOn': '',
          'isDefault': true
        };
        existingFilters.unshift(defaultFilter); // Add at the beginning
      }
      
      // Apply location filter if not already present
      const hasLocationFilter = existingFilters.some(filter => filter.filter === Constants.LOCATION_IDS);
      if (!hasLocationFilter) {
        // Create separate filter objects for each location (matching the manual structure)
        linkLocations.forEach(location => {
          const locationFilter = {
            'filter': Constants.LOCATION_IDS,
            'searchingIn': 'Location',
            'value': location.location_name,
            'id': location.location_id,
            'additionalFilter': true,
            'isAll': false,
            'customFilterKey': 'location_ids'
          };
          existingFilters.push(locationFilter);
        });
      }

      // Apply department filter if not already present and departments are available
      const hasDepartmentFilter = existingFilters.some(filter => filter.filter === Constants.DEPARTMENT_IDS);
      if (!hasDepartmentFilter && linkDepartments && linkDepartments.length > 0) {
        // Create separate filter objects for each department (matching the manual structure)
        linkDepartments.forEach(department => {
          const departmentFilter = {
            'filter': Constants.DEPARTMENT_IDS,
            'searchingIn': 'Department',
            'value': department.department_name,
            'id': department.department_id,
            'additionalFilter': true,
            'isAll': false,
            'dependentOn': 'location_ids',
            'customFilterKey': 'department_ids'
          };
          existingFilters.push(departmentFilter);
        });
      }

      // Update both appliedFilters and defaultFilters to ensure UI synchronization
      this.appliedFilters = [...existingFilters];
      this.defaultFilters = [...existingFilters];
      
      // Use the same method that's called when filters are manually added
      this.refreshListOnFilterChange(existingFilters);
    });
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  getTrophyReport() {
    const company = this.storageService.getCompany();
    const timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    this.is_loading = true;
    let filters = this.storageService.getFilterFromStroage(this.context);
    if (!filters) {
      filters = 'is_achieved=true';
      if (filters.split('=')[0] === 'is_achieved') {
        this.filterForTrophytype = filters.split('=')[1] === 'true' ? true : false;
      }
    } else {
      if (filters.split('=')[0] === 'is_achieved') {
        this.filterForTrophytype = filters.split('=')[1] === 'true' ? true : false;
      }
    }

    const companyId = this.storageService.getCompanyId();
    // const is_achieved = true;
    const is_custom = this.globalService.isCompanyBelongsToCustomField() ? true : false;
    const is_company_with_custom_fields = this.globalService.isCompanyWithCustomField() ? true : false;
    this.payload = {
      'company_id': companyId,
      'type_of_trophies': this.trophyType,
      'trophy_id': this.trophyId,
      'game_id': this.gameId,
      'sort_by': this.sort.sortBy,
      'is_custom': is_custom,
      'is_company_with_custom_fields': is_company_with_custom_fields,
      'timezone': timeZone,
      'start_index': this.startLimit,
      'limit': this.noOfItemsPerPage ? this.noOfItemsPerPage : 100,
      'order': this.sort.order
    };

    this.payload = Object.assign(this.payload, this.preparedPayload(filters));
    this.trophyService.getTrophyReport(this.payload).subscribe(res => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        return;
      }
      this.totalPlayers = response.data.player_count;
      if (response.data.player_records.length) {
        this.playerDataSource = new MatTableDataSource(response.data.player_records);
        this.processValues(response.data.player_records);
      } else {
        this.playerDataSource = '';
      }

      console.log('this.playerDataSource', this.playerDataSource);
      this.changeColumn();
    });
  }

  preparedPayload(stringURL) {
    const appliedFilters = decodeURI(stringURL);
    const defaultFilter = [Constants.IS_ACHIEVED, Constants.STATUS, Constants.TROPHY_PLAYER_NAME,
      'mlg_id', 'company_id', 'type_of_trophies', 'trophy_id', 'game_id', 'sort_by',
      'is_custom', 'is_company_with_custom_fields', 'timezone', 'start_index', 'limit', 'order'];
    const params = {};
    let queries;
    let temp;

    queries = appliedFilters.split('&');
    for (let i = 0; i < queries.length; i++) {
      temp = queries[i].split('=');
      if (defaultFilter.indexOf(temp[0]) === -1) {
        params[temp[0]] = temp[1].split(',').map(Number);
      } else {
        params[temp[0]] = temp[1];
      }
      // params[temp[0]] = temp[1].indexOf(',') !== -1 ? (temp[1].split(',')).map(Number) : temp[1];
    }
    return params;
  }

  processValues(players) {
    players.forEach(player => {
      player.achived_date = player.achived_date ?
        this.datePipe.transform(player.achived_date.replace(/ /g, 'T'), 'MM/dd/yyyy hh:mm a') : '---';
    });
  }

  filterOptionUpdated(filter) {
    console.log('filter', filter);
    if (!filter) { return; }
    console.log('filter', filter);
    const keyName = `Trophy_Reports_By_${filter.filter}`;
    if (filter.filter === Constants.STATUS || filter.filter === Constants.IS_ACHIEVED) {
      this.globalService.addAdminGoogleEvent(`${keyName}_${filter.value}`);
      return;
    } else if (filter.id === 'unverified') {
      this.globalService.addAdminGoogleEvent('Trophy_Reports_By_status_unverified');
      return;
    }
    this.globalService.addAdminGoogleEvent(keyName);
  }
  downloadPlayersReport() {
    let filters = this.storageService.getFilterFromStroage(this.context);
    const is_custom = this.globalService.isCompanyBelongsToCustomField() ? true : false;
    const is_company_with_custom_fields = this.globalService.isCompanyWithCustomField() ? true : false;
    if (!filters) {
      filters += `is_achieved=${this.showReport}`;
    }
    const company = this.storageService.getCompany();
    if (this.trophyType === 'mlg') {
      this.gameId = this.mlgId;
    } let downloadReportPayload = {
      'company_id': this.storageService.getCompanyId(),
      'timezone': (company && company['location_details']) ? company['location_details']['tz_name'] : '',
      'type_of_trophies': this.trophyType,
      'game_id': this.gameId,
      'is_custom': is_custom,
      'is_company_with_custom_fields': is_company_with_custom_fields,
      'is_achieved': this.showReport
    };
    if (this.trophyId && this.trophyType !== 'mlg') {
      downloadReportPayload['trophy_id'] = this.trophyId;
    }
    downloadReportPayload = Object.assign(downloadReportPayload, this.preparedPayload(filters));
    this.trophyService.getUrlToDowload(downloadReportPayload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('error_downloading'));
        return;
      }
      if (response.success) {
        this.globalService.addAdminGoogleEvent('Trophy_Reports_By_Trophy_Player_Report_Download');
        window.location.assign(response.data.url);
        this.globalService.showMessage(this.translate.instant('downloading_file'));
      }
    });
  }


  sortData(sort: Sort) {
    console.log('Sort type: ' + sort.active);
    switch (sort.active) {
      case 'name':
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
      case 'location':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      case 'department':
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
      case 'total_points':
        this.sort.sortBy = Constants.TOTAL_POINTS;
        break;
      case 'current_level':
        this.sort.sortBy = Constants.CURRENT_LEVEL;
        break;
      default:
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
    }

    this.sort.order = sort.direction;
    if (this.trophyType === 'mlg') {
      this.getMlgTrophyReport();
    } else {
      this.getTrophyReport();
    }
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.IS_ACHIEVED:
        if (this.trophyType === 'mlg') {
          this.menuList = trophyMLGTypes;
        } else {
          this.menuList = trophyTypes;
        }
        this.cdRef.detectChanges();
        break;
      case Constants.LOCATION_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.STATUS:
        if (this.trophyType === 'mlg') {
          this.menuList = [] = this.userMLGStatusList;
        } else {
          this.menuList = [] = this.userStatusList;
        }
        break;
      default:
        if (this.globalService.isCompanyBelongsToCustomField()) {
          this.getValues(filter);
        } else {
          this.getCustomFieldsValues(filter);
        }
        break;
    }
  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    const searchFilter = {
      'search_text': searchKey ? searchKey : '',
      'filter': filterKey,
      'value': currentFilter.value,
      'is_multi_selection': currentFilter.is_multi_selection
    };
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.getValues(searchFilter);
    } else {
      this.getCustomFieldsValues(searchFilter);
    }
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
        console.log('filter menu list', this.menuList);
      }
    });
  }
  getCustomFieldsValues(filterDetails) {
    if (filterDetails.custom_filter_key === Constants.LOCATION_IDS) {
      this.getLocations();
      return;
    }
    if (filterDetails.custom_filter_key === Constants.DEPARTMENT_IDS) {
      this.getDepartments();
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
        console.log('filter menu list', this.menuList);
      }
    });
  }
  addDefaultFilter() {
    const trophyFilters = this.storageService.getFilterArray(this.context);
    console.log(trophyFilters);
    if (trophyFilters && trophyFilters.length) { return; }
    const item = {
      'filter': Constants.IS_ACHIEVED,
      'searchingIn': 'Trophy',
      'value': this.trophyType === 'mlg' ? 'Won' : 'Achieved',
      'id': true,
      'additionalFilter': false,
      'dependentOn': '',
      'isDefault': true
    };
    this.defaultFilters.push(item);
    this.appliedFilters = [...this.defaultFilters]; // Synchronize appliedFilters with defaultFilters
    this.storageService.setFilters(this.context, item);
    if (this.trophyType === 'mlg') {
      console.log('mlg fire');
      this.getMlgTrophyReport();
    } else {
      this.getTrophyReport();
    }
  }


  getPlayersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    if (this.trophyType === 'mlg') {
      console.log('mlg fire');
      this.getMlgTrophyReport();
    } else {
      this.getTrophyReport();
    }
  }

  refreshListOnFilterChange(filters) {
    console.log('filters', filters);
    this.appliedFilters = filters;
    // Ensure defaultFilters is synchronized with appliedFilters for UI consistency
    this.defaultFilters = [...filters];
    if (this.trophyType === 'mlg') {
      this.storeFilters();
      this.getMlgTrophyReport();
    } else {
      this.storeFilters();
      console.log('get trophies from refresh filters');
      this.getTrophyReport();
    }
  }

  storeFilters() {
    this.storageService.setFilters(this.context, this.appliedFilters);
    this.startLimit = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  parseQueryParams(queryParams) {
    this.trophyType = queryParams.trophyType;
    this.trophyId = +queryParams.id;
    this.mlgId = +queryParams.mlgId;
    if (queryParams.trophyName) {
      this.breadcrumbService.updateBreadcrumbLabel(queryParams.trophyName);
    }
    this.changeColumn();
    if (queryParams.gameId) {
      this.gameId = +queryParams.gameId;
    }
    return this.trophyType && this.trophyId;
  }

  changeColumn() {
    let filters = this.storageService.getFilterFromStroage(this.context);
    if (!filters) {
      filters = 'is_achieved=true';
    } else if (filters.indexOf('&')) {
      filters = filters.split('&')[0];
    }
    console.log(filters);
    if (this.trophyType === 'general') {
      if (filters.split('=')[0] === 'is_achieved') {
        if (filters.split('=')[1] === 'true') {
          this.showReport = true;
          this.displayedColumns = ['player_photo', 'name', 'location', 'department', 'date_achieved'];
        } else {
          this.showReport = false;
          this.displayedColumns = ['player_photo', 'name', 'location', 'department'];
        }
        this.columnToBeDisplayed();
      }
    } else if (this.trophyType !== 'general' && this.trophyType !== 'mlg') {
      console.log('hii here');
      if (filters.split('=')[0] === 'is_achieved') {
        console.log('hii here1', filters.split('=')[1]);
        if (filters.split('=')[1] === 'true') {
          console.log('hii here2');
          this.showReport = true;
          this.displayedColumns = ['player_photo', 'name', 'location', 'department', 'points', 'attempts', 'highScore', 'date_achieved'];
        } else {
          console.log('hii here4');
          this.showReport = false;
          this.displayedColumns = ['player_photo', 'name', 'location', 'department'];
        }
        this.columnToBeDisplayed();
      }
    } else {
      //  for trophy type mlg
      // this.changeMlgColumn();
      if (filters.split('=')[0] === 'is_achieved') {
        if (filters.split('=')[1] === 'true') {
          this.showReport = true;
          if (this.globalService.isCompanyBelongsToCustomField()) {
            this.displayedColumns = ['player_photo', 'name', 'total_points', 'date_won'];
          } else {
            this.displayedColumns = ['player_photo', 'name', 'location', 'department', 'total_points', 'current_level', 'date_won'];
          }
        } else {
          this.showReport = false;
          if (this.globalService.isCompanyBelongsToCustomField()) {
            this.displayedColumns = ['player_photo', 'name', 'total_points', 'current_level'];
          } else {
            this.displayedColumns = ['player_photo', 'name', 'location', 'department', 'total_points', 'current_level'];
          }
        }
      }
    }
  }
  columnToBeDisplayed() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('location'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('department'), 1);
    }
    return;
  }

  getMlgTrophyReport() {
    // new api call
    // const companyId = this.storageService.getCompanyId();
    let filters = this.storageService.getFilterFromStroage('trophyReportMlg');
    const is_custom = this.globalService.isCompanyBelongsToCustomField() ? true : false;
    const is_company_with_custom_fields = this.globalService.isCompanyWithCustomField() ? true : false;
    if (!filters) {
      filters = 'is_achieved=true';
    }
    console.log('sort', this.sort.sortBy);
    this.mlgTrophyPayload = {
      'company_id': this.storageService.getCompanyId(),
      'mlg_id': this.mlgId,
      'start_index': this.startLimit ? this.startLimit : 0,
      'limit': this.noOfItemsPerPage ? this.noOfItemsPerPage : 100,
      'sort_by': this.sort.sortBy ? this.sort.sortBy : Constants.FIRST_NAME,
      'is_custom': is_custom,
      'is_company_with_custom_fields': is_company_with_custom_fields,
      'order': this.sort.order ? this.sort.order : 'asc',
    };
    this.mlgTrophyPayload = Object.assign(this.mlgTrophyPayload, this.preparedPayload(filters));
    console.log('filters', filters);
    this.is_loading = true;
    this.trophyService.getTrophyReportMLG(this.mlgTrophyPayload).subscribe(res => {
      this.is_loading = false;
      const response: any = res;
      console.log(response);
      if (!response.success) {
        return;
      }
      this.totalPlayers = response.data.player_count;
      if (response.data.player_records.length) {
        this.playerDataSource = new MatTableDataSource(response.data.player_records);
        this.processMlgValues(response.data.player_records);
      } else {
        this.playerDataSource = '';
      }
      this.changeColumn();
    });
  }

  processMlgValues(players) {
    players.forEach(player => {
      player.achieved_date = player.achieved_date ?
        this.datePipe.transform(player.achieved_date.replace(/ /g, 'T'), 'MM/dd/yyyy hh:mm a') : '---';
    });
  }

  getLocations() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.locationService.getLocations(this.storageService.getCompanyId(),
      Constants.LOCATION_NAME, 'asc', 0, 0, filters, false).subscribe((res) => {
        const response: any = res;
        let locations = [];
        const locList = [];
        if (!response.success) { 
          return; 
        }
        if (response.data) {
          locations = response.data.location_list;
        }
        locations.forEach((location) => {
          locList.push({
            id: location.location_id,
            value: location.location_name,
          });
        });
        const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': 'Location' };
        this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters);
        this.menuList = this.locationList;
        this.cdRef.detectChanges();
      });
  }
  
  getDepartments() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.departmentService.getDepartments(this.storageService.getCompanyId(),
      'department_name', 'asc', 0, 0, filters, false).subscribe((res) => {
        const response: any = res;
        let departments = [];
        const deptList = [];
        if (!response.success) { return; }
        if (response.data) {
          departments = response.data.department_list;
        }
        departments.forEach((department) => {
          deptList.push({
            id: department.department_id,
            value: department.department_name,
          });
        });
        const filterInfo = {
          'filter_name': Constants.DEPARTMENT_IDS,
          'searching_in': 'Department',
          'dependentOn': Constants.LOCATION_IDS
        };
        this.departmentList = this.globalService.prepareSelectionList(deptList, filterInfo, this.appliedFilters);
        this.menuList = this.departmentList;
        this.cdRef.detectChanges();
      });
  }

  toggleMenu(event, id, type) {
    console.log('hiiiii')
    this.openCustomMenu = event;
    this.selectedId = id;
    this.selectedType = type;
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset Company selectinn filter
    this.headerService.showCompanyFilter(true);
  }
}
