import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { DashboardService, DashboardTabType } from 'src/app/services/dashboard/dashboard.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { GamePathwayService } from 'src/app/services/game-pathway/game-pathway.service';
import { CallerId, GlobalService, Paginations } from 'src/app/services/global/global.service';
import { EventValuesFormation } from 'src/app/services/google-analytics/google-analytics.service';
import { GroupService } from 'src/app/services/group/group.service';
import { LocationService } from 'src/app/services/location/location.service';
import { Route } from 'src/app/services/login/login.service';
import { ApiService, Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { Role } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
let playerStateList = [];
@Component({
  selector: 'app-pathway-insights',
  templateUrl: './pathway-insights.component.html',
  styleUrls: ['./pathway-insights.component.scss']
})
export class PathwayInsightsComponent implements OnInit {
  pageSizeOptions: number[];
  noOfItemsPerPage: number;
  startLimit = 0;
  sort = {
    'sortBy': 'sp_points',
    'order': 'desc'
  };
  context = 'pathway';
  menuList = [];
  isFiltersLoaded = false;
  isFossilCustomField = true;
  messageToDisplay = this.translate.instant('pls_add_filter');
  @ViewChild('paginator') paginator: MatPaginator;
  displayedColumns: string[];
  is_loading: boolean;
  totalPlayers: any;
  defaultFilters = [
    {
      'filter': Constants.IS_ACTIVE, 'searchingIn': this.translate.instant('status'),
      'value': this.translate.instant('active_players'), 'id': 'ACTIVE'
    },
   
  ];
  fieldFetchSubscription: any;
  filter_options = [
    {
      'filter': Constants.PATHWAY_INSIGHT, value: this.translate.instant('pathway'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.PATHWAY_INSIGHT,'is_generic_menu': true
    },
    {
      'filter': Constants.GROUP_NAME,
      'value': this.translate.instant('group'),
      'is_text_search': true, 
      'is_list_search': true,
      'placeholder': PlaceholderText.GROUP_NAME,
      'mutually_exclusive_with': Constants.LOCATION_IDS,
      'is_multi_selection': true,
      'is_generic_menu': true, 'is_default': false
    },
  ];
  search_options = [
    {
      'filter': Constants.IS_ACTIVE,
      'value': this.translate.instant('status'),
      'is_text_search': true,
      'is_list_search': true,
      'placeholder': '',
      'is_generic_menu': true,
      'is_default': true
    }
   
   ];
  customFieldFetchSubscription: any;
  appliedFilters: any;
  loginUser: any;
  locationList: any[];
  departmentList: any[];
  selectedDashboardTabType: DashboardTabType;
  playerDataSource: any;
  groupListSubscription: any;
  groupList = [];
  pathwayList: any[];
  companyChangeSubscription: any;
  preventDoubleClick: boolean = false;
  openCustomMenu: any;
  selectedId: any;
  selectedType: any;
  ngAfterViewInit() {
  }
  
  constructor(    
    public dashboardService: DashboardService,
    public storageService: StorageService,
    public globalService: GlobalService,
    private datePipe: DatePipe,
    private apiService: ApiService,
    private companyService: CompanyService,
    public translate: TranslateService,
    public locationService: LocationService,
    public departmentService: DepartmentService,
    public gamePathwayService: GamePathwayService,
    public delegateService: DelegateService,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbsService,
    private groupService: GroupService,
    public router: Router) { 
      this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
      this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;


      this.companyChangeSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
        if(companyID){
          setTimeout(() => {
            this.router.navigate([Route.DASHBOARD]);
          }, 500);
        }
      });



      playerStateList = [{ 'id': 'All', 'value': this.translate.instant('all_players') },
      { 'id': 'ACTIVE', 'value': this.translate.instant('active_players') }];
      
      this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.filter_options, res, this.isFossilCustomField);
        console.log('filter_options', this.filter_options);
          this.filter_options.forEach((filterOption: any) => {
            
            if (filterOption.custom_filter_key || filterOption.filter === Constants.GROUP_NAME) {
              filterOption['dependent_on'] = Constants.PATHWAY_INSIGHT;
            }
            if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
              filterOption['dependent_on'] = Constants.LOCATION_IDS;
            }
            if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
              filterOption['mutually_exclusive_with'] = Constants.GROUP_NAME;
            }
          });
          this.isFiltersLoaded = true;
      });

      this.groupListSubscription = this.globalService.groupList.subscribe((res) => {
        this.groupList = res;
        const filterInfo = { 'filter_name': Constants.GROUP_NAME, 'searching_in': this.translate.instant('group'),
        depedenantOn: Constants.PATHWAY_INSIGHT };
        this.menuList = this.globalService.prepareSelectionList(this.groupList, filterInfo, this.appliedFilters);
      });
    }
    ngOnInit(): void {
      this.selectedDashboardTabType = DashboardTabType.PATHWAY_INSIGHTS;
      this.preparePathwayFilter();
      this.addDefaultFilter();
      this.prepareDisplayedColumns();
      this.getInsightsData();

      }
      addDefaultFilter() {
        this.defaultFilters = [];
        const item = {
          'filter': Constants.IS_ACTIVE,
          'searchingIn': this.translate.instant('status'),
          'value': this.translate.instant('active_players'),
          'id': 'ACTIVE',
          'additionalFilter': false,
          'dependentOn': '',
          'isDefault': true
        };
        this.defaultFilters.push(item);
        this.appliedFilters = this.defaultFilters;
        this.storageService.setFilters(this.context, item);
      }
      prepareDisplayedColumns() {
        this.displayedColumns = [
          'rank',
          'profile_image_url',
          'first_name',
          'sp_games',
          'sp_time',
          'sp_points',
          'sp_last_played_on',
          'player_status',
          'department_name',
          'location_name',
          'group_name',
        ]

        if (this.globalService.isCompanyBelongsToCustomField()) {
          this.displayedColumns.splice(this.displayedColumns.indexOf('department_name'), 1);
          this.displayedColumns.splice(this.displayedColumns.indexOf('location_name'), 1);
        }
      }
    preparePathwayFilter(){
      const fields = this.companyService.getCustomFields();
      this.filter_options = this.globalService.addeditCompanyCustomFilters(this.filter_options, fields, this.isFossilCustomField);

      this.filter_options.forEach((filterOption: any) => { // Add type definition for filterOption

        if (filterOption.custom_filter_key || filterOption.filter === Constants.GROUP_NAME) {
          filterOption['dependent_on'] = Constants.PATHWAY_INSIGHT;
        }
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
        if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
          filterOption['mutually_exclusive_with'] = Constants.GROUP_NAME;
        }
      });
      this.addFilter(Constants.IS_ACTIVE, this.translate.instant('status'),
      true, true, '', null, null, false, false, true, true);
      this.addFilter(Constants.PATHWAY_INSIGHT, this.translate.instant('pathway'),
      true, true, PlaceholderText.PATHWAY_INSIGHT, null, null, false, false, true, false);
    }

  getInsightsData() {
 
    this.is_loading = true;
    let payload = {
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      company_id: this.storageService.getCompanyId(),
      limit_perpage: this.noOfItemsPerPage,
      limit_offset: this.startLimit,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };
    if (this.appliedFilters && this.appliedFilters.length) {
      console.log('this.appliedFilters', this.appliedFilters);
      this.appliedFilters.forEach((elem) => {
        if ((payload[elem.customFilterKey] || payload[elem.filter]) && elem.isAll) {
          return;
        }
        if (elem.customFilterKey) {
          if (elem.isAll) {
            payload[elem.customFilterKey] = {
              'ids' : [],
              'is_all': true
            };
          } else {
            this.preparePayloadFor(
              Constants.CUSTOM_FILTER_KEY,
              payload,
              elem.customFilterKey
            );
          }
        }
      });
    }
    payload = this.globalService.filterApplied(payload, Constants.PATHWAY_INSIGHT, this.appliedFilters);
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    console.log('payload', payload);
    this.dashboardService.getpathwayinsight(payload).subscribe(res => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
        this.playerDataSource = new MatTableDataSource(response.data.pathway_insights);
        this.totalPlayers = response.data.total_count;
        const playersData = response.data.pathway_insights;
        if (playersData) {
          this.processValues(playersData);
        }
        this.messageToDisplay = this.translate.instant('no_data_found');
      
      });
  }
  processValues(lastPlayedDate) {
    lastPlayedDate.forEach(lastDate => {
      lastDate.spPlayedOnFormatted = lastDate.sp_last_played_on ?
        this.datePipe.transform(this.globalService.formatDate(lastDate.sp_last_played_on),
          'MM/dd/yyyy hh:mm a') : lastDate.sp_last_played_on;
      lastDate.spTzAbbrevation = this.globalService.getTimeZoneAbbrevation(lastDate.sp_last_played_on_tz_abbreviation);
    });
  }
  formatNumber(number) {
    return number.toLocaleString('en-US');
  }
  secondsToHms(seconds) {
    return this.globalService.secondsToHms(seconds);
  }
  refreshListOnFilterChange(filters) {
    const isPathwayFilter = filters.filter(filter => { return filter.filter === Constants.PATHWAY_INSIGHT });
    if (!isPathwayFilter.length) {
      const departmentIndex = filters.findIndex(filter => filter.filter === Constants.DEPARTMENT_IDS);
      if (departmentIndex !== -1) {
        filters.splice(departmentIndex, 1);
      }
    }
    this.storeFilters(filters);
  }
  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, filters);
    this.getInsightsData();
  }
  getDataSource(filter) {
    console.log('filter', filter);
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filter);
        break;
        case Constants.IS_ACTIVE:        
        this.menuList = playerStateList;              
      break;
      case Constants.GROUP_NAME:
        this.isFilterPresent(Constants.GROUP_NAME, this.groupList);
        this.globalService.getGroups(CallerId.DASHBOARD);
        break;
        case Constants.PATHWAY_INSIGHT:        
       this.getPathwayInsights();        
      break;
      default:
        this.getCustomFieldsValues(filter);
        break;
    }
    this.cdRef.detectChanges();

  }
  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    switch (filterKey) {
    case Constants.PATHWAY_INSIGHT:        
    this.getPathwayInsights();      
      default:
        const searchFilter = {
          'search_text': searchKey ? searchKey : '',
          'filter': filterKey,
          'value': currentFilter.value,
          'is_multi_selection': currentFilter.is_multi_selection,
          'custom_filter_key': currentFilter.custom_filter_key
        };
        if (searchKey) {
          this.getCustomFieldsValues(searchFilter);
        }
        break;
    }
    this.cdRef.detectChanges();
  }
  getCustomFieldsValues(filterDetails) {
    if (filterDetails.custom_filter_key === Constants.LOCATION_IDS) {
      this.getLocations();
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
          const filterInfo = { 'filter_name': field, 'searching_in': searchingIn ,'dependentOn': Constants.PATHWAY_INSIGHT};
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
  getLocations() {
    const filters = null;
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
        const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': 'Location', 'dependentOn': Constants.PATHWAY_INSIGHT };
        this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters);
        this.menuList = this.locationList;
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
  getPathwayInsights(){
    this.is_loading = true;
      const company_id = this.storageService.getCompanyId();
      this.gamePathwayService.getGamePathway(company_id,null,null,0,500).subscribe((res) => { 
        const response: any = res;
        this.is_loading = false; 
        if (!response.success) {
          return;
        }  
        let pathwayList = [];
        pathwayList =  response.data.pathways;
        this.menuList = [];
        this.pathwayList = [];
        pathwayList.forEach(item => {
          this.pathwayList.push({ 'id': item.pathway_id, 'value': item.pathway_name });
        });
        this.menuList = this.pathwayList;
      });
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const logEventInfo = new EventValuesFormation();
    logEventInfo.key = String(filter.searchingIn).split('-').join('');
    logEventInfo.value = String(filter.value).split('-').join('') || '';
    this.logEvent(logEventInfo);
  }
  logEvent(logEventInfo) {
    if(logEventInfo.key === 'Status' || logEventInfo.key === 'Pathway'){
    const selectedTabLabel = 'Dashboard Report';
    const eventName = `Pathway_${logEventInfo.key}`;
    this.globalService.addGoogleEvent(eventName,selectedTabLabel,logEventInfo.value,"")
    }
  }
  removeModeFilter() {
    this.defaultFilters = [];
    this.appliedFilters = [];
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
        } 
      });
    }
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
  ngOnDestroy(): void {
    
    if (this.customFieldFetchSubscription) {
      this.customFieldFetchSubscription.unsubscribe();
    }

    if (this.fieldFetchSubscription) {
      this.fieldFetchSubscription.unsubscribe();
    }
  }
  downloadReport() {
    this.preventDoubleClick = true;
    let payload = {
      company_id: this.storageService.getCompanyId(),
      limit_perpage: this.noOfItemsPerPage,
      limit_offset: this.startLimit,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };
    if (this.appliedFilters && this.appliedFilters.length) {
      console.log('this.appliedFilters', this.appliedFilters);
      this.appliedFilters.forEach((elem) => {
        if ((payload[elem.customFilterKey] || payload[elem.filter]) && elem.isAll) {
          return;
        }
        if (elem.customFilterKey) {
          if (elem.isAll) {
            payload[elem.customFilterKey] = {
              'ids' : [],
              'is_all': true
            };
          } else {
            this.preparePayloadFor(
              Constants.CUSTOM_FILTER_KEY,
              payload,
              elem.customFilterKey
            );
          }
        }
      });
    }
    payload = this.globalService.filterApplied(payload, Constants.PATHWAY_INSIGHT, this.appliedFilters);
    payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    this.dashboardService.downoladPathway(payload).subscribe((res) => {
      const response: any = res;
      this.preventDoubleClick = false;
      if (!response.success) { return; }
      // Download file
      if (response.data && response.data.url) {
        window.location.assign(response.data.url);
        this.globalService.showMessage(this.translate.instant('downloading_reports'));
      }
    });
    
  }
  getPlayersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getInsightsData();
  }
  toggleMenu(event, id, type) {
    console.log('hiiiii')
    this.openCustomMenu = event;
    this.selectedId = id;
    this.selectedType = type;
  }
  sortData(sort: Sort) {
    this.sort.sortBy = sort.active
    this.sort.order = sort.direction;
    this.getInsightsData();
  }
}
