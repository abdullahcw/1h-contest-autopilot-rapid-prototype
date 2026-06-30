import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { DatePipe } from '@angular/common';
import { Route } from '../../services/login/login.service';
import { Router } from '@angular/router';
import { ContestService } from 'src/app/services/contest/contest.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { ApiService, Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { CustomAudienceService } from 'src/app/services/custom-audience/custom-audience.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { LocationService } from 'src/app/services/location/location.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { ManagerService } from 'src/app/services/manager/manager.service';

@Component({
  selector: 'app-create-contest',
  templateUrl: './create-contest.component.html',
  styleUrls: ['./create-contest.component.scss']
})
export class CreateContestComponent implements OnInit {

  currentDate = new Date();
  tomorrow;
  isFossilCustomField = true;
  contestMaxDate;
  is_loading = false;
  isDatePickerOpen = false;
  isCustomAudianceFilterApplied = false;
  contest: any = {
    contest_id: '',
    company_id: '',
    contest_name: '',
    contest_start_date: this.currentDate,
    contest_end_date: this.currentDate,
    contest_assignment: []
  };
  tempContestName;
  tempContestStartDate;
  validStartDate = new Date();
  filter_options = [];
  menuList: any[];
  companyId;
  context = 'create_contest';
  filters = [];
  loginUser: any;
  locationList = [];
  selectedLocations = [];
  selectedDepartments = [];
  search_filters = [
    {
      'filter': Constants.CUSTOM_AUDIENCE, value: this.translate.instant('custom_audience'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.AUDIENCE_NAME, 'is_multi_selection': true, 'is_generic_menu': true, 'is_filter_disabled': false,
      'is_static': true
    }
  ];
  departmentList = [];
  appliedFilters = [];
  recipients = [];
  contestAssignedAudienceData;
  customAudience = [];
  audienceList = [];
  totalAudience: any;
  assignmentType = '';
  customFieldFetchSubscription: any;
  companyChangeSubscription: any;
  gameList = [];
  multilevelGames = [];
  contestList = [];
  fetchingAllLocations = false;

  customManagerList = [];
  fieldFetchSubscription: any;
  storedCompany = this.storageService.getCompany();
  disjunction_filter_value = false;
  timeZoneList = [];
  fetchingTimezones = false;
  timezoneId: any;
  constructor(public storageService: StorageService, private datePipe: DatePipe, private dialog: MatDialog,
    private globalService: GlobalService, public router: Router, private delegateService: DelegateService, public managerService: ManagerService, private companyService: CompanyService, public contestService: ContestService, private locationService: LocationService, public customAudienceService: CustomAudienceService, private departmentService: DepartmentService,
    public apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService, private cdRef: ChangeDetectorRef, public dialogRef: MatDialogRef<any>) {
    dialogRef.disableClose = true;
    this.companyChangeSubscription = this.delegateService.selectedHeaderCompany.subscribe((_companyID) => {
      this.appliedFilters = [];
      this.locationList = [];
      this.contestList = [];
      this.departmentList = [];

    });
    this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, res, 0, this.isFossilCustomField);
        this.setDefaultFiltersForCustomCompany();
    });
  }

  ngOnInit() {
    this.getValidStartDate();
    this.getTimeZone();
    this.is_loading = true;
    this.storageService.setFilters(this.context, null);
    this.companyId = this.storageService.getCompanyId();
    this.prepareCustomFilterOptions();
    // If customFields weren't loaded yet (race: dialog opened before header finished), load them now
    if (!this.companyService.getCustomFields()) {
      this.companyService.loadCustomFields(this.companyId || 1);
    }
    if (this.appliedFilters) {
      this.appliedFilters.forEach(filterOption => {
        if (filterOption.customFilterKey === Constants.DEPARTMENT_IDS) {
          filterOption['dependentOn'] = Constants.LOCATION_IDS;
        }
      });
      this.filterPlayersOnSelection(this.appliedFilters);
    }
    this.checkAudienceInCompany();
  }
  setCompanyDetails() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];

  }

  setDefaultFiltersForCustomCompany() {
    this.refreshListOnFilterChange(this.appliedFilters);
  }
  getValidStartDate() {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    this.contestService.getValidContestDate(company_id).subscribe((res) => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        this.closePopUp();
        return;
      }
      this.validStartDate = new Date(response.data.valid_start_date);
      this.timezoneId = response.data.tz_id;
      this.contestService.validStartDate = new Date(response.data.valid_start_date);
      this.setDateRangeValidation();
    });
  }

  setDateRangeValidation() {
    this.tomorrow = this.validStartDate;
    const tommorowStr = this.datePipe.transform(this.tomorrow, 'yyyy/MM/dd');
    this.tomorrow = this.globalService.formatDate(tommorowStr);
    this.contest.contest_start_date = this.globalService.formatDate(tommorowStr);
    const setEndDate = new Date(this.validStartDate.getTime() + (86400000 * 30)); // epoch + milliseconds in a day * no. of days
    this.contest.contest_end_date = this.globalService.formatDate(this.datePipe.transform(setEndDate, 'yyyy/MM/dd'));
    this.contestMaxDate = new Date(this.contest.contest_start_date.getTime() + (86400000 * 89));
  }

  createContest(contest) {
    this.contestService.setContestDetails(contest);
    this.addContest();
    this.globalService.addAdminGoogleEvent('Contests_Create_A_Contest');
    this.is_loading = true;
  }
  contestStartDateValidation(contest) {
    const startDate = new Date(contest.contest_start_date);
    this.contestMaxDate = new Date(startDate.setDate(startDate.getDate() + 89));
  }
  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  radioBtnChanged(value){
    this.disjunction_filter_value = value;
  }

  addContest() {
    const company_id = this.storageService.getCompanyId();
    this.contest.company_id = company_id;
    this.contest.tz_id = this.timezoneId;
    this.contest.contest_start_date = `${this.globalService.formatDateForPayload(new Date(this.contest.contest_start_date))} 00:00:00`;
    this.contest.contest_end_date = `${this.globalService.formatDateForPayload(new Date(this.contest.contest_end_date))} 23:59:59`;

    const contestPayload = Object.assign({}, this.contest);
    if (contestPayload) {
      delete contestPayload.contest_assignment;
    }
    
    this.contestService.createContest(contestPayload).subscribe(res => {

      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      this.dialogRef.close();
      this.is_loading = true;
      this.contest.contest_name = response.data.contest_name;
      this.contest.contest_id = response.data.contest_id;
      const contest_data = {
        contest_id: response.data.contest_id
      };
      this.storageService.setContest(contest_data);
      this.storageService.setShowGameScreen(false);
      this.contestService.setContestDetails(this.contest);
      this.addAssignment();
      this.router.navigate([Route.CREATE_CONTEST], { queryParams: { id: this.contest.contest_id } });
    });
  }

  addAssignment() {
    console.log('this.appliedFilters',this.appliedFilters);
    let payload;
    this.is_loading = true;
    payload = this.getRecipients(this.appliedFilters);
    payload['disjunction_filter'] = this.disjunction_filter_value;
    this.contestService.addAssignment(payload).subscribe(res => {
      this.is_loading = false;
      if (res.success) {
        this.contest.assignment_id = res.data.assignment_id;
      }
    });
  }

  getRecipients(limit) {
    const uniqueFilters = this.globalService.findUniqueFilters(limit);
    const payload = {};
    payload['company_id'] = this.companyId;
    payload['contest_id'] = this.contest.contest_id;
      let recipients = [];
      recipients = this.preparePayloadForCustomFields(uniqueFilters, limit, recipients);
      payload['recipients'] = [{
        'created_by': this.storageService.getLoginUserID(),
        'recipient_type': recipients[0].key_id === 'custom_audience' ? 'AUDIENCE_BASED' : 'FIELDS_BASED',
        'players': recipients,
      }];
    return payload;
  }

  preparePayloadForFossil(uniqueFilters, limit) {
    const recipients = [];
    uniqueFilters.forEach(uniqueFilter => {
      let payload = {};
      const filterId = uniqueFilter.filter;
      payload['key_id'] = filterId;
      payload['text'] = uniqueFilter.searchingIn;
      payload['customFilterKey'] = uniqueFilter.customFilterKey;
      payload['filter_key'] = uniqueFilter.customFilterKey;
      payload['is_all'] = uniqueFilter.isAll ? uniqueFilter.isAll : false;
      payload = this.globalService.filtersAppliedCustom(payload, filterId, limit, 'values');
      recipients.push(payload);
    });
    return recipients;
  }

  preparePayloadForCustomFields(uniqueFilters, limit, recipients) {
    uniqueFilters.forEach(uniqueFilter => {
      const filterId = uniqueFilter.filter;
      const assignment = {
        'key_id': uniqueFilter.filter,
        'filter_key': uniqueFilter.filter === Constants.CUSTOM_AUDIENCE ? 'custom_audience' : uniqueFilter.customFilterKey,
        'is_all': uniqueFilter.isAll ? uniqueFilter.isAll : false,
      };
      const ids = this.globalService.filtersAppliedCustom(assignment, filterId, limit, 'values');
      if (ids.values[0].id === -1) {
        assignment['values'] = [];
      }
      recipients.push(assignment);
    });
    return recipients;
  }

  closePopUp() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
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
        this.prepareList(filterDetails, response, searchingIn, field);
        this.cdRef.detectChanges();
      }
    });
  }
  filterPlayersOnSelection(filter) {
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
            this.filters.forEach((filter) => {
              if (filter.filter === Constants.CUSTOM_AUDIENCE && filter.isAll) {
                forceSelection = true;
              }
            });
            const filterInfo = { 'filter_name': Constants.CUSTOM_AUDIENCE, 'searching_in': this.translate.instant('audience') };
            this.audienceList = this.globalService.prepareSelectionList(audList, filterInfo, this.filters, forceSelection);
            this.menuList = this.audienceList;
          } 
        }
      });
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
        this.filters.forEach((filter) => {
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
      this.filters.forEach((filter) => {
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
  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;

    if (filterKey == Constants.CUSTOM_AUDIENCE) {
      this.getAudience();
    } else {
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
    }
    this.cdRef.detectChanges();
  }
  refreshListOnFilterChange(filters) {
    if (filters.length == 0) {
      this.contest.contest_assignment = [];
    } else {
      this.contest.contest_assignment = filters;
    }
    this.checkFilters(filters);
    this.clubFiltersIfSelectedAll(filters);
    this.storeFilters(this.appliedFilters);
    this.cdRef.detectChanges();
  }

  checkFilters(filters) {
    if (!filters.length) {
      this.locationList = [];
      this.departmentList = [];
      this.selectedLocations = [];
      this.selectedDepartments = [];
        this.prepareCustomFilterOptions();
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
  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.cdRef.detectChanges();
    this.filters = filters;
    this.appliedFilters = filters;
    this.storageService.setFilters(this.context, filters);
    this.filterPlayersOnSelection(this.appliedFilters);
  }

  prepareCustomFilterOptions() {
    this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, this.companyService.getCustomFields(), 0, this.isFossilCustomField);
    this.filter_options.forEach(filterOption => {
      if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
        filterOption['dependent_on'] = Constants.LOCATION_IDS;
      }

    });
  }

  prepareList(filterDetails, response, searchingIn, field) {
    if (filterDetails.is_multi_selection) {
      const mList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
      const filterInfo = { 'filter_name': field, 'searching_in': searchingIn };
      const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
      const forceSelection = clickedFilter && clickedFilter.isAll ? true : false;
      this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
    } else {
      this.menuList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
    }
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
    });
  }
  onTimeZoneSelectionChanged(timezoneId) {
    this.timezoneId = timezoneId;
    this.globalService.addAdminGoogleEvent('Contests_Contests_Timezone_selected');
  }
  getTimeZone() {
    this.fetchingTimezones = true;
    this.locationService.getTimeZone().subscribe((res) => {
      const response: any = res;
      if (response.success) {
        const timezones = response.data.timezone_list;
        this.timeZoneList = [];
        timezones.forEach(timezone => {
          this.timeZoneList.push({ id: timezone.tz_id, title: timezone.tz_name, subtitle: timezone.tz_unit });
        });
      }
      this.fetchingTimezones = false;
    });
  }

  selectionBasedText(text, date){
    return text.replace('%d', this.datePipe.transform(date, 'M/d/yyyy'));
  }
  ngOnDestroy() {
    this.storageService.setFilters(this.context, null);
  }
}
