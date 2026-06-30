import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../../services/company/company.service';
import { CustomAudienceService } from '../../../services/custom-audience/custom-audience.service';
import { DepartmentService } from '../../../services/department/department.service';
import { GlobalService } from '../../../services/global/global.service';
import { LocationService } from '../../../services/location/location.service';
import { Constants, PlaceholderText } from '../../../services/network/api.service';
import { PermissionsService } from '../../../services/permissions/permissions.service';
import { StorageService } from '../../../services/storage/storage.service';

@Component({
  selector: 'app-add-players-in-schedule-multilevelgames',
  templateUrl: './add-players-in-schedule-multilevelgames.component.html',
  styleUrls: ['./add-players-in-schedule-multilevelgames.component.scss']
})
export class AddPlayersInScheduleMultilevelgamesComponent implements OnInit, OnDestroy {
  menuList: any[];
  isFossilCustomField= false;
  filter_options = [];
  loginUser: any;
  locationList = [];
  locations = [];
  departments = [];
  departmentList = [];
  appliedFilters = [];
  companyId;
  is_updating = false;
  is_loading = false;
  action = false;
  isMlgPlayable = false;
  contest;
  context = 'schedule_multilevel';
  selectedLocations = [];
  selectedDepartments = [];
  filters = [];
  assignmentData = [];
  customFieldFetchSubscription: any;
  disjunction_filter_value;
  search_filters = [
    {
      'filter': Constants.CUSTOM_AUDIENCE, value: this.translate.instant('custom_audience'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.AUDIENCE_NAME, 'is_multi_selection': true, 'is_generic_menu': true, 'is_filter_disabled': false,
      'is_static': true
    }
  ];
  recipients = [];
  contestAssignedAudienceData;
  customAudience = [];
  audienceList = [];
  totalAudience: any;
  assignmentType = '';
  storedCompany = this.storageService.getCompany();
  isCustomAudianceFilterApplied = false;
  constructor(public dialogRef: MatDialogRef<any>,
    private storageService: StorageService,
    private globalService: GlobalService,
    private locationService: LocationService,
    private departmentService: DepartmentService,
    public permissionService: PermissionsService,
    private companyService: CompanyService,
    private cdRef: ChangeDetectorRef,
    public customAudienceService: CustomAudienceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService) {
    dialogRef.disableClose = true;
    // this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
    this.customFieldFetchSubscription = this.companyService.onFieldsFetched.subscribe(res => {
      if (!this.globalService.isCompanyBelongsToCustomField()) {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, res, 0, this.isFossilCustomField);
        this.setDefaultFiltersForCustomCompany(true);
        this.filter_options.forEach(filterOption => {
          if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
            filterOption['dependent_on'] = Constants.LOCATION_IDS;
          }
        });
      }
    });
  }

  ngOnInit() {
    console.log(this.disjunction_filter_value)
    this.is_loading = true;
    this.storageService.setFilters(this.context, null);
    this.companyId = this.storageService.getCompanyId();
    const fields = this.companyService.getCustomFields();
    this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, fields, 0, this.isFossilCustomField);

    this.filter_options.forEach(filterOption => {
      if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
        filterOption['dependent_on'] = Constants.LOCATION_IDS;
      }
    });
    if (this.appliedFilters) {
      this.appliedFilters.forEach(filterOption => {
        if (filterOption.customFilterKey === Constants.DEPARTMENT_IDS) {
          filterOption['dependentOn'] = Constants.LOCATION_IDS;
        }
      });
      this.filterPlayersOnSelection(this.appliedFilters);
    }
    // this.getAudience();
    this.checkAudienceInCompany();
    console.log(this.storedCompany)
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.CUSTOM_AUDIENCE:
        this.getAudience();
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
      case Constants.CUSTOM_AUDIENCE:
        this.getAudience();
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
          this.getCustomFieldsValues(searchFilter);
        }
        break;
    }
    this.cdRef.detectChanges();
  }

  setDefaultFiltersForCustomCompany(refreshDashboard) {
    // this.appliedFilters = this.teamDefaultFilters;
    this.refreshListOnFilterChange(this.appliedFilters);
  }


  refreshListOnFilterChange(filters) {
    this.checkFilters(filters);
    this.clubFiltersIfSelectedAll(filters);
    this.storeFilters(this.appliedFilters);
    this.cdRef.detectChanges();
  }
  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.cdRef.detectChanges();
    this.filters = filters;
    this.appliedFilters = filters;
    this.filterPlayersOnSelection(this.appliedFilters);
    // this.storageService.setFilters(this.context, filters);
  }

  checkFilters(filters) {
    if (!filters.length) {
      this.locationList = [];
      this.departmentList = [];
      this.selectedLocations = [];
      this.selectedDepartments = [];
      this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, this.companyService.getCustomFields(), 0, this.isFossilCustomField);
      this.filter_options.forEach(filterOption => {
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
      // if (!this.totalAudience) {
      //   this.filterPlayers(Constants.NO_AUDIENCE);
      // }
      this.checkAudienceInCompany();
    } else {
      const checkLocInSearch = filters.filter((filter) => filter.filter === Constants.LOCATION_IDS);
      const checkDeptInSearch = filters.filter((filter) => filter.filter === Constants.DEPARTMENT_IDS);
      if (!checkLocInSearch.length) {
        this.appliedFilters = [];
        this.locationList = [];
        this.selectedLocations = [];
        this.departmentList = [];
        this.selectedDepartments = [];
      }
      if (!checkDeptInSearch.length) {
        this.appliedFilters = [];
        this.departmentList = [];
        this.selectedDepartments = [];
      }
    }
  }

  clubFiltersIfSelectedAll(filters) {
    if (!filters) { return; }
    const chipsToDisplay: any[] = filters.filter(chip => !chip.isAll);
    const chipsToFilter: any[] = filters.filter(chip => chip.isAll);
    const processedFilters = [];
    chipsToFilter.forEach(chipToFilter => {
      if (processedFilters.indexOf(chipToFilter.filter) === -1) {
        chipToFilter.value = 'All';
        chipToFilter.id = -1;
        chipToFilter.isAll = true;
        chipToFilter.dependentOn = chipToFilter.filter === Constants.DEPARTMENT_IDS ? Constants.LOCATION_IDS : null;
        processedFilters.push(chipToFilter.filter);
        chipsToDisplay.push(chipToFilter);
      }
    });
    this.appliedFilters = chipsToDisplay;
  }

  addRemoveFilterOption(appliedFilters) {
    if (appliedFilters && appliedFilters.length == 0) {
      this.filter_options.forEach(option => {
        if (!option.customFilterKey) {
          option.is_filter_disabled = false;
        }
      });
    }

    let customCount;
    if (appliedFilters[0]) {
      customCount = appliedFilters.filter(option => {
        return option.customFilterKey;
      });
    }

    if (customCount && customCount.length > 0) {
      this.filter_options.forEach(option => {
        if (option.filter === Constants.CUSTOM_AUDIENCE) {
          option.is_filter_disabled = true;
        }
      });
    }
  }

  getLocations() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
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
        let forceSelection = false;
        this.filters.filter((filter) => {
          if (filter.filter === Constants.LOCATION_IDS && filter.isAll) {
            forceSelection = true;
          }
        });
        const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': 'Location' };
        this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.filters, forceSelection);
        this.menuList = this.locationList;
        this.cdRef.detectChanges();
      });
  }

  getDepartments() {
    const locIds = [];
    let isAllLocation = false;
    const locationFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.LOCATION_IDS;
    });
    if (locationFilters && locationFilters.length > 0) {
      locationFilters.forEach(loc => {
        if (loc['id'] !== -1) {
          locIds.push(loc['id']);
        } else {
          isAllLocation = true;
        }
      });
    }

    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'location_ids': isAllLocation ? [] : locIds,
      'is_all': isAllLocation
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
      this.menuList = [];
      let forceSelection = false;
      this.filters.filter((filter) => {
        if (filter.filter === Constants.DEPARTMENT_IDS && filter.isAll) {
          forceSelection = true;
        }
      });
      const filterInfo = {
        'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': this.translate.instant('department'),
        'dependentOn': Constants.LOCATION_IDS
      };
      this.departmentList = this.globalService.prepareSelectionList(list, filterInfo, this.appliedFilters, forceSelection);
      this.menuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }

  getAudience() {
    this.is_loading = true;
    const managerId = this.storageService.getLoginUserID();
    this.customAudienceService.getAudience(this.companyId, Constants.AUDIENCE_NAME, 'asc', 0, 0, managerId, false)
      .subscribe((res) => {
        const response: any = res;
        this.audienceList = [];
        const audList = [];
        this.is_loading = false;
        if (response.data) {
          this.customAudience = response.data.audiences;
          this.totalAudience = response.data.total_count;
          if (this.totalAudience) {
            this.customAudience.forEach((audience) => {
              audList.push({
                id: audience.audience_id,
                value: audience.audience_name,
              });
            });
            let forceSelection = false;
            this.filters.filter((filter) => {
              if (filter.filter === Constants.CUSTOM_AUDIENCE && filter.isAll) {
                forceSelection = true;
              }
            });
            const filterInfo = { 'filter_name': Constants.CUSTOM_AUDIENCE, 'searching_in': this.translate.instant('audience') };
            this.audienceList = this.globalService.prepareSelectionList(audList, filterInfo, this.filters, forceSelection);
            this.menuList = this.audienceList;
          } 
          // else {
          //   this.filterPlayers(Constants.NO_AUDIENCE);
          // }
          // if (this.globalService.isRoleLimited()) {
          //   this.filterPlayers(Constants.HIDE_AUDIENCE);
          // }
        }
      });
    this.cdRef.detectChanges();
  }
  
  radioBtnChanged(value){
    // console.log(value)
    this.disjunction_filter_value = value;
  }


  filterPlayersOnSelection(filter) {
    if (filter.length !== 0) {
      if ((filter[0].filter === Constants.LOCATION_IDS || filter[0].filter === Constants.DEPARTMENT_IDS)
        || filter[0].filter !== Constants.CUSTOM_AUDIENCE) {
        this.filterPlayers(Constants.LOCATION_EXIST);
        this.isCustomAudianceFilterApplied = false;
      } else if (filter[0].filter === Constants.CUSTOM_AUDIENCE) {
        this.filterPlayers(Constants.AUDIENCE_EXIST);
        this.isCustomAudianceFilterApplied = true;
      }
    }else{
      this.isCustomAudianceFilterApplied = false;
    }
    if (this.globalService.isRoleLimited()) {
      this.filterPlayers(Constants.HIDE_AUDIENCE);
    }
  }

  filterPlayers(filterValue) {
    switch (filterValue) {
      case Constants.NO_AUDIENCE:
      case Constants.HIDE_AUDIENCE:
        this.filter_options = this.filter_options.filter(option => {
          return option.filter !== Constants.CUSTOM_AUDIENCE;
        });
        break;
      case Constants.LOCATION_EXIST:
        this.addRemoveFilterOption(this.appliedFilters);
        break;
      case Constants.AUDIENCE_EXIST:
        this.filter_options = this.filter_options.filter(option => {
          return option.filter === Constants.CUSTOM_AUDIENCE;
        });
        break;
    }
    this.cdRef.detectChanges();
  }

  shouldDisable() {
    return this.filters.filter((filter) => filter.filter === Constants.CUSTOM_AUDIENCE || filter.customFilterKey).length === 0;
  }

  save() {
    this.cancel(true);
  }

  cancel(isChanged = false) {
    const assignmentPayload = {
      'applied_filters': this.appliedFilters,
      'is_changed': isChanged,
      'disjunction_filter' : this.disjunction_filter_value
    };
    this.dialogRef.close(assignmentPayload);
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
          const forceSelection = clickedFilter && clickedFilter.isAll ? true : false;
          this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
        } else {
          this.menuList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
        }
        this.cdRef.detectChanges();
      }
    });
  }

  checkAudienceInCompany() {
    this.customAudienceService.checkAudienceInCompany(this.companyId).subscribe(res => {
      const response:any = res;
      if (response.success) {
        console.log(response.data.audience_exists);
        if (!response.data.audience_exists) {
          this.filterPlayers(Constants.NO_AUDIENCE);
        }
        if (this.globalService.isRoleLimited()) {
          this.filterPlayers(Constants.HIDE_AUDIENCE);
        }
      }
      this.is_loading = false;
    });
  }

  ngOnDestroy() {
    this.storageService.setFilters(this.context, null);
    if (this.customFieldFetchSubscription) {
      this.customFieldFetchSubscription.unsubscribe();
    }
  }

}
