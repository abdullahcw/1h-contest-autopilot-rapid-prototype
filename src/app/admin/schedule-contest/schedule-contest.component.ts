import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContestService } from 'src/app/services/contest/contest.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { CustomAudienceService } from 'src/app/services/custom-audience/custom-audience.service';

@Component({
  selector: 'app-schedule-contest',
  templateUrl: './schedule-contest.component.html',
  styleUrls: ['./schedule-contest.component.scss']
})
export class ScheduleContestComponent implements OnInit {
  menuList: any[];
  isFossilCustomField = true;
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
  contest;
  context = 'schedule_contest';
  selectedLocations = [];
  selectedDepartments = [];
  filters = [];
  contestAssignedData;
  storedCompany = this.storageService.getCompany();
  disjunction_filter_value;
  isCustomAudianceFilterApplied = false;
  search_filters = [
    // {
    //   'filter': Constants.LOCATION_IDS, value: this.translate.instant('location'), 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.LOCATION_NAME, 'is_multi_selection': true, 'is_generic_menu': true,
    // },
    // {
    //   'filter': Constants.DEPARTMENT_IDS, value: this.translate.instant('department'), 'is_text_search': true, 'is_list_search': true,
    //   'dependent_on': Constants.LOCATION_IDS,
    //   'placeholder': PlaceholderText.DEPARTMENT_NAME, 'is_multi_selection': true, 'is_generic_menu': true,
    // },
    {
      'filter': Constants.CUSTOM_AUDIENCE, value: this.translate.instant('custom_audience'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.AUDIENCE_NAME, 'is_multi_selection': true, 'is_generic_menu': true
    }
  ];
  recipients = [];
  contestAssignedAudienceData;
  customAudience = [];
  audienceList = [];
  totalAudience: any;
  assignmentType = '';
  customFieldFetchSubscription: any;
  constructor(public dialogRef: MatDialogRef<any>,
    private storageService: StorageService,
    private globalService: GlobalService,
    private locationService: LocationService,
    private departmentService: DepartmentService,
    public contestService: ContestService,
    public permissionService: PermissionsService,
    private companyService: CompanyService,
    private cdRef: ChangeDetectorRef,
    public customAudienceService: CustomAudienceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService
  ) {
    dialogRef.disableClose = true;
    this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
      if (!this.globalService.isCompanyBelongsToCustomField()) {
        console.log('constructor custom fields for companies');
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, res, 0,this.isFossilCustomField);
        // this.setDefaultFiltersForCustomCompany(true);
        this.filter_options.forEach(filterOption => {
          if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
            filterOption['dependent_on'] = Constants.LOCATION_IDS;
          }
        });
      }
    });
  }

  ngOnInit() {
    this.is_loading = true;
    this.storageService.setFilters(this.context, null);
    this.companyId = this.storageService.getCompanyId();
    this.contest = JSON.parse(this.storageService.getContest());
    // const fields = this.companyService.getFields();
    // this.filter_options = this.globalService.addeditCustomFilters(this.search_filters, fields, 2);
    const fields = this.companyService.getCustomFields();
    this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, fields, 0,this.isFossilCustomField);
    this.filter_options.forEach(filterOption => {
      if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
        filterOption['dependent_on'] = Constants.LOCATION_IDS;
      }
    });
    // this.getAudience();
    this.checkAudienceInCompany();
    // this.getLocations();
    this.getAssignment();
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.getCustomFieldsValues(filter);
        this.globalService.addAdminGoogleEvent('Contests_Contests_Players_By_Location');
        break;
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filter);
        this.globalService.addAdminGoogleEvent('Contests_Contests_Players_By_Department');
        break;
      // case Constants.AUDIENCE_IDS:
      case Constants.CUSTOM_AUDIENCE:
        this.getAudience();
        break;
      default:
        console.log('object');
        this.getCustomFieldsValues(filter);
        break;
    }
    this.cdRef.detectChanges();
  }
  getDataSourceWithSearchKey(event) {
    console.log('search key', event);
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
          console.log('getDataSource');
          this.getCustomFieldsValues(searchFilter);
        }
        break;
    }
    this.cdRef.detectChanges();
  }



  refreshListOnFilterChange(filters) {
    console.log('filters', filters);
    this.checkFilters(filters);
    this.clubFiltersIfSelectedAll(filters);
    this.storeFilters(this.appliedFilters);
  }
  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.cdRef.detectChanges();
    this.filters = filters;
    this.appliedFilters = filters;
    if (this.appliedFilters) {
      this.appliedFilters.forEach(filterOption => {
        if (filterOption.customFilterKey === Constants.DEPARTMENT_IDS) {
          filterOption['dependentOn'] = Constants.LOCATION_IDS;
        }
      });
    }
    this.filterPlayersOnSelection(this.appliedFilters);
    // this.storageService.setFilters(this.context, filters);
  }

  checkFilters(filters) {

    if (!filters.length) {
      this.locationList = [];
      this.departmentList = [];
      this.selectedLocations = [];
      this.selectedDepartments = [];
      this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, this.companyService.getCustomFields(), 0,this.isFossilCustomField);
      this.filter_options.forEach(filterOption => {
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
      // this.getAudience();
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
        if (chipToFilter.filter === Constants.DEPARTMENT_IDS) {
          chipsToDisplay.push(chipToFilter);
        } else {
          chipsToDisplay.unshift(chipToFilter);
        }
      }
    });
    this.appliedFilters = chipsToDisplay;
  }

  filterPlayersOnSelection(filter) {
    console.log(filter);
    if (filter.length !== 0) {
      if ((filter[0].filter === Constants.LOCATION_IDS || filter[0].filter === Constants.DEPARTMENT_IDS)
        || filter[0].filter !== Constants.CUSTOM_AUDIENCE) {
          this.isCustomAudianceFilterApplied = false;
        this.filterPlayers(Constants.LOCATION_EXIST);
      } else if (filter[0].filter === Constants.CUSTOM_AUDIENCE) {
        this.isCustomAudianceFilterApplied = true;
        this.filterPlayers(Constants.AUDIENCE_EXIST);
      }
    }else{
      this.isCustomAudianceFilterApplied = false;
    }
    if (this.globalService.isRoleLimited()) {
      this.filterPlayers(Constants.HIDE_AUDIENCE);
    }
  }

  filterPlayers(filterValue) {
    console.log('filterValue', filterValue);
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
        console.log('appliedFilters', this.appliedFilters);
        this.filter_options = this.filter_options.filter(option => {
          return option.filter === Constants.CUSTOM_AUDIENCE;
        });
        break;
    }
    this.cdRef.detectChanges();
  }
  addRemoveFilterOption(appliedFilters) {
    if (appliedFilters && appliedFilters.length === 0) {
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

  getAssignment() {
    this.is_loading = true;
    const contestDetails = this.contestService.getContestDetails();
    const companyId = this.storageService.getCompanyId();
    const contestId = contestDetails.contest_id;
    const is_custom = this.globalService.isCompanyBelongsToCustomField() ? true : false;
    const is_company_with_custom_fields = this.globalService.isCompanyWithCustomField() ? true : false;
    this.contestService.getAssignment(contestId, companyId, is_custom, is_company_with_custom_fields).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) { return; }
      if (response.success) {
        // console.log(response.data.recipients.length)
        if (response.data && response.data.recipients && response.data.recipients.length > 0) {
          this.contestAssignedData = response.data.recipients;
          this.contest.assignment_id = response.data.recipients[0].assignment_id;
          this.assignmentType = response.data.recipients[0].recipients_type;
          this.disjunction_filter_value = response.data.recipients[0].disjunction_filter;
        }
        // console.log('get', this.assignment);
        response.data.recipients.forEach(limit => {
          limit.appliedFilters = [];
          const recipients: any = limit.players;
          if (recipients) {
            const appliedFilters = [];
            recipients.forEach(recipient => {
              if (recipient.is_all) {
                appliedFilters.push({
                  'id': -1,
                  'value': 'All',
                  'isAll': true,
                  'searchingIn': recipient.text.charAt(0).toUpperCase() + recipient.text.slice(1),
                  'filter': recipient.key_id,
                  'customFilterKey': recipient.filter_key
                });
              } else {
                console.log('reci values', recipient.values);
                if (recipient.values) {
                  recipient.values.forEach(value => {
                    appliedFilters.push({
                      'id': value.id,
                      'value': value.text,
                      'isAll': false,
                      'additionalFilter': true,
                      'searchingIn': recipient.text.charAt(0).toUpperCase() + recipient.text.slice(1),
                      'filter': recipient.key_id,
                      'customFilterKey': recipient.filter_key
                    });
                  });
                }
              }
            });
            // limit.appliedFilters = appliedFilters;
            this.filters = appliedFilters;
            this.refreshListOnFilterChange(appliedFilters);
          }
          // this.attemptAddingFilterOptionsToAvailableLimits();
        });
      }
    });
  }
  prepareAudience() {
    this.contestAssignedAudienceData = [];
    console.log(this.filters);
    this.filters.forEach(filter => {
      this.contestAssignedAudienceData.push(filter.id);
    });
    return this.contestAssignedAudienceData;
  }
  checkAllDepartmentSelected() {
    let isAllDeptSelected = false;
    this.filters.forEach(filter => {
      if (filter.filter === Constants.DEPARTMENT_IDS) {
        isAllDeptSelected = filter.isAll;
      }
    });
    return isAllDeptSelected;
  }

  checkAllLocationSelected() {
    let isAllLocSelected = false;
    this.filters.forEach(filter => {
      if (filter.filter === Constants.LOCATION_IDS) {
        isAllLocSelected = filter.isAll;
      }
    });
    return isAllLocSelected;
  }

  checkAllAudienceSelected() {
    let isAllAudienceSelected = false;
    this.filters.forEach(filter => {
      if (filter.filter === Constants.CUSTOM_AUDIENCE) {
        isAllAudienceSelected = filter.isAll;
      }
    });
    return isAllAudienceSelected;
  }

  shouldDisable() {
    return this.filters.filter((filter) => filter.filter === Constants.CUSTOM_AUDIENCE || filter.customFilterKey).length === 0;
  }
  radioBtnChanged(value){
    // console.log(value)
    this.disjunction_filter_value = value;
  }
  save() {
    let payload;
    payload = this.getRecipients(this.appliedFilters);
    payload['disjunction_filter'] = this.disjunction_filter_value;
    if (this.contest && this.contest.assignment_id) {
      this.updateAssignment(payload, this.contest.assignment_id);
    } else {
      this.addAssignment(payload);
    }
    // }
    this.cancel(true);

  }

  addAssignment(payload) {
    this.is_loading = true;
    // this.recipients = this.getRecipients(limits);
    // console.log('payload', this.recipients);
    // this.updatingCount++;
    this.contestService.addAssignment(payload).subscribe(res => {
      console.log('add limits response:', res);
      this.is_loading = false;
      if (res.success) {
        this.contest.assignment_id = res.data.assignment_id;

      }
    });
  }
  updateAssignment(payload, assignmentId) {
    this.is_loading = true;
    console.log('assignment update', payload);
    // this.recipients = this.getRecipients(payload);
    payload['assignment_id'] = assignmentId;
    // this.updatingCount++;
    this.contestService.updateAssignment(payload).subscribe(res => {
      console.log('update limits response:', res);
      this.is_loading = false;
      if (res.success) {
        this.contest.assignment_id = res.data.assignment_id;
        // this.assignmentId = res.data.assignment_id;
        // this.updatingCount--;
        // this.getAssignment();
      }
    });
  }
  cancel(isChanged = null) {
    this.dialogRef.close(isChanged);
  }
  allowViewAssignment() {
    const contest = this.contestService.contest;
    return !(contest.contest_state === 'DRAFT' && !contest.is_authorized && !contest.is_assignment_exist);
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
          // console.log('response', response);
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
          //  else {
          //   this.filterPlayers(Constants.NO_AUDIENCE);
          // }
          // if (this.globalService.isRoleLimited()) {
          //   this.filterPlayers(Constants.HIDE_AUDIENCE);
          // }
        }
        this.cdRef.detectChanges();
      });
  }

  getCustomFieldsValues(filterDetails) {
    console.log('filterDetails', filterDetails);
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
      console.log('filterDetails', filterDetails);
      if (response.success) {
        if (filterDetails.is_multi_selection) {
          const mList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
          const filterInfo = { 'filter_name': field, 'searching_in': searchingIn };
          const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
          console.log('clickedFilter', clickedFilter);
          const forceSelection = clickedFilter && clickedFilter.isAll ? true : false;
          // console.log('mlist', mList, filterInfo, this.appliedFilters, forceSelection);
          this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
          // console.log('menulist', this.menuList);
        } else {
          this.menuList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
        }
        this.cdRef.detectChanges();
      }
    });
  }
  getRecipients(limit) {
    // console.log(limit);
    const uniqueFilters = this.globalService.findUniqueFilters(limit);
    console.log('uniques', uniqueFilters);
    const recipients = [];
    const payload = {};
    payload['company_id'] = this.companyId;
    payload['contest_id'] = this.contest.contest_id;
    uniqueFilters.forEach(uniqueFilter => {
      const filterId = uniqueFilter.filter;
      const assignment = {
        'key_id': uniqueFilter.filter,
        'filter_key': uniqueFilter.filter === Constants.CUSTOM_AUDIENCE ? 'custom_audience' : uniqueFilter.customFilterKey,
        'is_all': uniqueFilter.isAll ? uniqueFilter.isAll : false,
      };
      // console.log('assignment', assignment, filterId, limit);
      const ids = this.globalService.filtersAppliedCustom(assignment, filterId, limit, 'values');
      if (ids.values[0].id === -1) {
        assignment['values'] = [];
      }
      recipients.push(assignment);
    });
    console.log('recipients[0].key_id', recipients[0].key_id);
    payload['recipients'] = [{
      'created_by': this.storageService.getLoginUserID(),
      'recipient_type': recipients[0].key_id === 'custom_audience' ? 'AUDIENCE_BASED' : 'FIELDS_BASED',
      'players': recipients,
    }];
    if (recipients[0].key_id === 'custom_audience') {
      this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_scheduling_Contest');
    }
    return payload;
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

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.storageService.setFilters(this.context, null);
  }
}
