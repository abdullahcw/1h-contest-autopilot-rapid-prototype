import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { PermissionsService, Role } from '../permissions/permissions.service';
import { DepartmentService } from '../department/department.service';
import { UploaderService } from '../uploader/uploader.service';
import { LocationService } from '../location/location.service';
import { GroupService } from '../group/group.service';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
import { ListItem } from 'src/app/shared/list-selection/list-selection.component';
import { Platform } from '@angular/cdk/platform';
import { Router } from '@angular/router';
   
import { ConfirmActionComponent } from 'src/app/admin/confirm-action/confirm-action.component';
import { RequestManagerService } from '../network/request-manager.service';
import { EndPoint } from '../network/api.service';

const moment = _rollupMoment || _moment;

export enum CallerId {
  DASHBOARD = 1,
  GROUP = 2
}

export const Paginations = {
  PAGE_SIZE_OPTIONS: [10, 20, 30, 40, 50, 100],
  DEFAULT_ITEM_PER_PAGE: 20
};

export enum MediaBreakpoint {
  XS = 575, // and DOWN (EXTRA SMALL DEVICES)
  SM = 767, // and DOWN (landscape phones)
  MD = 991, // and DOWN (tablets)
  LG = 1199, // and DOWN (desktops)
}

export enum Range {
  TODAY = 'today',
  THIS_WK = 'thisWeek',
  LAST_WK = 'lastWeek',
  THIS_MONTH = 'thisMonth',
  LAST_MONTH = 'lastMonth',
  THIS_QT = 'thisQuarter',
  LAST_QT = 'lastQuarter',
  ALL_TIME = 'allTime', 
  CUSTOM = 'custom',
}
export const answerOptionsType = {
  RANDOM: "RANDOM",
  SHORT_ANSWER: "SHORT_ANSWER",
  TWO_ANSWER_OPTION: "TWO_ANSWER_OPTION",
  THREE_ANSWER_OPTION: "THREE_ANSWER_OPTION",
  FOUR_ANSWER_OPTION: "FOUR_ANSWER_OPTION",

};

// export const TutorialVideo = {
//   BUILD_GAME: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/3_How+to+Build+Games.mp4`,
//   CREATE_CONTEST: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/6_How+to+Create+Contests.mp4`,
//   GET_STARTED: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/1_Let's+Get+Started+(Managers).mp4`,
//   LOGIN_ADD_USER: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/2_How+to+Login+%26+Add+Users.mp4`,
//   RUN_REPORTS: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/4_How+to+Run+Reports.mp4`,
//   ADD_TROPHIES: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/5_How+to+Add+Trophies.mp4`,
//   EXPLORE_SHOP_GAME: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/Shop+Self+Serve.mp4`,
//   CREATE_GAME_IN_MIN: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/Build+a+game.mp4`,
//   FREE_CREDIT_OFFER: `https://${environment.bucket_config}.${environment.region}.amazonaws.com/public_html/static/${environment.bucket_sub_config}/assets/admin_video/Free+Credit+Game+Build.mp4`,
// }
export enum UsageLimit {
  GAME_EXCEEDED = 'games_limit',
  PLAYER_EXCEEDED = 'players_limit',
  MANAGER_EXCEEDED = 'managers_limit',
  GAME = 'GAME',
  PLAYER = 'PLAYER',
  MANAGER = 'MANAGER',

}
const userStatusList = [{ 'id': 'active', 'status': 'Active' }, { 'id': 'inactive', 'status': 'Inactive' }];

const managerTypes = [
  { 'id': Role.MANAGER, 'value': 'Manager' },
  { 'id': Role.MID_MANAGER, 'value': 'Mid-Manager' },
  { 'id': Role.TEAM_LEAD, 'value': 'Team Lead' }];

@Injectable({
  providedIn: 'root'
})

export class GlobalService {
  public filterMenu = new Subject<any>();
  public locationList = new Subject<any>();
  public depratmentList = new Subject<any>();
  public groupList = new Subject<any>();
  public resetFilters = new Subject<any>();
  public addMoreChips = new Subject<any>();
  public openMenu = new Subject<any>();
  public permissionReceived$ = new Subject<any>();
  public companySettingReceived$ = new Subject<any>();
  public itemList$ = new Subject<any>();

  companyRoles: any = [];
  companySetting: any = {
    games: { has_manager_pinned: true, has_manager_set_limits: true },
    multi_level_game: { has_manager_set_limits: true },
    account_setting: { show_accounts: false },
    vip_code: { show_vip_codes: true },
    shop_games: { has_manager_shopped: true },
    shop_settings: { show_shop: true },
  };
  listOfFilterMenu: any = [];
  tutorialVideo: { BUILD_GAME: string; CREATE_CONTEST: string; LOGIN_ADD_USER: string; RUN_REPORTS: string; ADD_TROPHIES: string; EXPLORE_SHOP_GAME: string; CREATE_GAME_IN_MIN: string; FREE_CREDIT_OFFER: string; GET_STARTED: string; NEW_GAME_FORMAT: string; };

  constructor(public snackBar: MatSnackBar, public translate: TranslateService, public platform: Platform,
    public router: Router, public dialog: MatDialog,
    public storageService: StorageService, public groupService: GroupService,
    public requestManager: RequestManagerService,
    public departmentService: DepartmentService, public uploaderService: UploaderService,
    public locationService: LocationService) { }

  
  removeEmptyFields(obj) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

  addGoogleEvent(_event: any, _cat: any, _label: any, _method: any = null): void {}

  addAdminGoogleEvent(_key: any, _method: any = null): void {}

  analyticsPageview() {
    // this.gtag.pageview();
  }

  isEmpty(obj, key) {
    if (obj.hasOwnProperty(key)) { return false; }
    return true;
  }

  showMessage(message, horizontalPosition = null, verticalPosition = null) {
    if (horizontalPosition == 'right' && verticalPosition == 'bottom') {
      this.snackBar.open(message, '', {
        duration: 3000,
        horizontalPosition: horizontalPosition || 'left',
        verticalPosition: verticalPosition || 'top',
        panelClass: 'bottom-snackbar',
      });
    } else {
      this.snackBar.open(message, '', {
        duration: 3000,
        horizontalPosition: horizontalPosition || 'left',
        verticalPosition: verticalPosition || 'top',
      });
    }
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent);
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  listOfItems(items) {
    this.itemList$.next(items);
  }

  receivedPermissions() {
    this.permissionReceived$.next();
  }
  companySettingReceived() {
    this.companySettingReceived$.next();
  }

  getDepartments(callerId = 0) {
    const listofDepartment = [];
    this.departmentService.getDepartments(this.storageService.getCompanyId(), 'department_name', 'asc', 0, 0, null, false).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        const departments = response.data.department_list;
        departments.forEach((department) => {
          listofDepartment.push({
            department_id: department.department_id,
            department_name: department.department_name,
            id: department.department_id,
            value: department.department_name,
          });
        });
      }

      switch (callerId) {
        case CallerId.DASHBOARD:
          this.depratmentList.next(listofDepartment);
          break;
        default:
          this.filterMenu.next(listofDepartment);
          break;
      }
    });
  }

  getLocations(callerId = 0) {
    const listOfLocations = [];
    this.locationService.getLocations(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, null, false).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        const locations: any = response.data.location_list;
        locations.forEach(location => {
          listOfLocations.push({
            location_id: location.location_id,
            location_name: location.location_name,
            id: location.location_id,
            value: location.location_name,
            tz: { 'tz_id': location.tz_id, 'tz_name': location.tz_name }
          });
        });

        switch (callerId) {
          case CallerId.DASHBOARD:
            this.locationList.next(listOfLocations);
            break;
          default:
            this.filterMenu.next(listOfLocations);
            break;
        }
      }
    });
  }

  getGroups(callerId = 0) {
    const listOfGroup = [];
    this.groupService.getGroups(this.storageService.getCompanyId(),
      'group_name', 'asc', 0, 0).subscribe((res) => {
        const response: any = res;
        const groups: any = response.data.group_list;
        groups.forEach(group => {
          listOfGroup.push({
            group_id: group.group_id,
            group_name: group.group_name,
            id: group.group_id,
            value: group.group_name
          });
        });
        //
        switch (callerId) {
          case CallerId.DASHBOARD:
          case CallerId.GROUP:
            this.groupList.next(listOfGroup);
            break;
          default:
            this.filterMenu.next(listOfGroup);
            break;
        }
      });
  }

  getUserStatusList() {
    return userStatusList;
  }

  getManagerTypes() {
    return managerTypes;
  }

  getManagerType(type) {
    switch (type) {
      case Role.ADMIN:
        return 'Admin';
      case Role.MANAGER:
        return 'Manager';
      case Role.MID_MANAGER:
        return 'Mid-Manager';
      case Role.TEAM_LEAD:
        return 'Team Lead';
    }
  }

  getCompanyRoles() {
    return this.companyRoles;
  }
  setCompanyRoles(roles) {
    this.companyRoles = [];
    if (roles){
      roles.forEach(userRoles => {
        this.companyRoles.push({ 'id': userRoles.key, 'value': userRoles.value });
      });
      return this.companyRoles;
    }
  }
  setCompanySetting(settingObject) {
    this.companySetting = settingObject;
  }
  getCompanySetting(key) {
    if (this.companySetting) {
      return this.companySetting[key];
    }
  }
  removeAllChips() {
    this.resetFilters.next();
  }

  addFilters(filtersToBeAdded: Array<any>) {
    this.addMoreChips.next(filtersToBeAdded);
  }

  openSearchMenu() {
    this.openMenu.next();
  }

  secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const mDisplay = `${m}`.replace(/^(\d)$/, '0$1');
    const sDisplay = `${s}`.replace(/^(\d)$/, '0$1');
    const hDisplay = `${h}`.replace(/^(\d)$/, '0$1');
    return hDisplay + ':' + mDisplay + ':' + sDisplay;
  }

  filtersApplied(payload, filterName, filters: Array<any>, filterKey = filterName) {
    let items = [];
    items = filters && filters.filter(item => {
      return (item['filter'] === filterName && item['id'] !== 'All');
    });
    if (items.length > 0) {
      let ids = [];
      items.forEach(item => {
        if (Array.isArray(item['id'])) {
          ids = item['id'];
        } else {
          ids.push(item['id']);
        }
      });
      if (ids.length > 0) {
        payload[filterKey] = ids;
      }
    }
    return payload;
  }

  filtersAppliedCustom(payload, filterName, filters: Array<any>, filterKey = filterName) {
    console.log('assignment', payload, filterName, filters, filterKey);

    let items = [];
    items = filters && filters.filter(item => {
      return (item['filter'] === filterName && item['id'] !== 'All');
    });
    if (items.length > 0) {
      let ids = [];
      items.forEach(item => {
        if (Array.isArray(item['id'])) {
          ids = item['id'];
        } else {
          ids.push({ 'id': item['id'], 'text': item['value'] });

        }
      });
      if (ids.length > 0) {
        payload[filterKey] = ids;
      }
    }
    return payload;
  }

  findUniqueFilters(appliedFilters) {
    const uniqueFilterIdentifiers = [];
    const uniqueFilters = appliedFilters.filter(existingFilter => {
      if (uniqueFilterIdentifiers.indexOf(existingFilter.filter) === -1) {
        uniqueFilterIdentifiers.push(existingFilter.filter);
        return true;
      } else {
        return false;
      }
    });
    return uniqueFilters;
  }

  formatDate(dateStr, shouldAddTimezoneOffset = false) {
    if (!dateStr) { return; }
    const d = new Date(dateStr.replace(/ /g, 'T'));
    if (shouldAddTimezoneOffset) {
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    }
    return d;
  }

  getCurrentDate() {
    const d = new Date();
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  }

  formatNumber(number) {
    if (number) {
      return number.toLocaleString('en-US');
    }
    return number;
  }

  isCompanyBelongsToCustomField() {
    const company = this.storageService.getCompany();
    if (company && !company.is_custom) {
      const user = JSON.parse(this.storageService.getUser());
      if (user) {
        return user.is_custom;
      }
    }
    return company && company.is_custom;
  }
  isSSOCompany() {
    const company = this.storageService.getCompany();
    return company.is_sso_company;
  }

  isCompanyWithCustomField() {
    const company = this.storageService.getCompany();
    if (company && !company.is_company_with_custom_fields) {
      const user = JSON.parse(this.storageService.getUser());
      if (user) {
        return user.is_company_with_custom_fields;
      }
    }
    return company && company.is_company_with_custom_fields;
  }

  filterApplied(payload, filterName, filters: Array<any>, filterKey = filterName) {
    const filter = filters && filters.filter(appliedFilter => {
      return appliedFilter['filter'] === filterName;
    });
    if (filter && filter.length > 0) {
      const individualFilter = filter[0];
      // id === 'All' ignore we r not going to send is key in request paylaod
      if (individualFilter.id) {
        if (individualFilter.id !== 'All') {
          if (filterKey === 'is_manager') {
            const is_mangerIds = [];
            is_mangerIds.push(individualFilter.id);
            payload[filterKey] = is_mangerIds;
          } else {
            payload[filterKey] = individualFilter.id;
          }
          return payload;
        }
      } else {
        payload[filterKey] = individualFilter.value;
      }
    }
    return payload;
  }

  prepareMenuList(values, filterOption = null, context = null, appliedFilters = null) {
    const list = [];
    values.forEach(item => {
      list.push({ 'id': item.id, 'value': item.text });
    });
    if (filterOption != null && filterOption.is_multi_selection) {
      const filterName = filterOption.custom_filter_key ? filterOption.custom_filter_key : filterOption.filter;
      if (!appliedFilters) {
        appliedFilters = this.storageService.getFilterArray(context);
      }
      if (!appliedFilters) { return list; }
      // If updating filter exists
      const filtersPresent = appliedFilters.filter(checkIfFilterApplied => {
        const appliedFilterName = checkIfFilterApplied.customFilterKey ? checkIfFilterApplied.customFilterKey : checkIfFilterApplied.filter;
        return appliedFilterName === filterName;
      });
      // Check if updating filter value exists
      if (filtersPresent) {
        filtersPresent.forEach(addIfNotExistInMenuList => {
          const exist = list.filter(listItem => {
            return listItem.id === addIfNotExistInMenuList.id;
          });
          if (!exist.length) {
            list.push({ 'id': addIfNotExistInMenuList.id, 'value': addIfNotExistInMenuList.value });
          }
        });
      }
    }
    return list;
  }


  formatDateForPayload(dateToBeFormatted) {
    // Required date format for payload
    const DATE_FORMAT: any = 'YYYY-MM-DD';
    return moment(dateToBeFormatted).format(DATE_FORMAT);
  }

  convertDateForRangeSlider(sourceDate) {
    const date = sourceDate.split(/-|\s|:/);
    const converted_date = new Date(date[0], date[1] - 1, date[2]);
    return converted_date;
  }

  prepareSelectionList(list, filterInfo, appliedFilters, forceSelection = false) {
    const itemsToBeDisplayed = [];
    if (!list) { return; }
    list.forEach(item => {
      const listItem = new ListItem();
      listItem.itemId = item.id;
      listItem.itemName = item.value;
      listItem.userInfo = filterInfo;

      const filtersToCheck = appliedFilters && appliedFilters.filter(existingFilter => {
        return existingFilter['filter'] === filterInfo['filter_name'];
      });

      let shouldBreak = false;
      filtersToCheck && filtersToCheck.forEach(filterToCheck => {
        if (shouldBreak) { return; }
        const ids = filterToCheck['id'];
        if (ids instanceof Array && ids.indexOf(item['id']) !== -1) {
          listItem.isSelected = true;
          shouldBreak = true;
        } else if (!(ids instanceof Array) && ids === item['id']) {
          listItem.isSelected = true;
          shouldBreak = true;
        } else {
          listItem.isSelected = forceSelection ? forceSelection : false;
        }
      });
      itemsToBeDisplayed.push(listItem);
    });
    return itemsToBeDisplayed;
  }

  isRoleLimited(userRole = null) {
    const role = userRole ? userRole : this.storageService.getAccessType();
    switch (role) {
      case Role.MID_MANAGER:
      case Role.TEAM_LEAD:
        return true;
      default:
        return false;
    }
  }

  getTimeZoneAbbrevation(abbrevation: String): String {
    let preparedAbbrevation = null;
    if (abbrevation) {
      if (abbrevation.includes('+') || abbrevation.includes('-')) {
        preparedAbbrevation = `(GMT ${abbrevation})`;
      } else {
        preparedAbbrevation = `(${abbrevation})`;
      }
    } else {
      preparedAbbrevation = abbrevation;
    }
    return preparedAbbrevation;
  }

  isMobile() {
    if ((this.platform.ANDROID || this.platform.IOS) && window.innerWidth <= MediaBreakpoint.XS) { // avoid tablets
      return true;
    } else {
      return false;
    }
  }

  // function to prepare filter_option for custom fields
  addeditCustomFilters(filter_options, customFields = null, index = null) {
    const options = JSON.parse(JSON.stringify(filter_options));
    let non_mutable = [];
    let newOptions = [];
    if (this.isCompanyBelongsToCustomField()) {
      if (customFields) {
        newOptions = this.getFilterOptions(customFields);
      }
      non_mutable = options.filter(value => {
        return !value.custom_menu_Item;
      });
      const values = [...non_mutable.slice(0, index), ...newOptions, ...non_mutable.slice(index)];
      return values;
    }
    return options;
  }



  // custom fields for companies
  // function to prepare filter_option for custom fields
  addeditCompanyCustomFilters(filter_options, customFields = null, index = null, isFossilScheduleCustomField=false) {
    const options = JSON.parse(JSON.stringify(filter_options));
    let non_mutable = [];
    let newOptions = [];
    if (customFields) {
      newOptions = this.getFilterOptions(customFields, isFossilScheduleCustomField);
    }
    non_mutable = options.filter(value => {
      return !value.custom_menu_Item;
    });
    const values = [...non_mutable.slice(0, index), ...newOptions, ...non_mutable.slice(index)];
    return values;
  }

  // function to remove location/department/group from filter
  removeCustomFilters(filter_options) {
    const options = JSON.parse(JSON.stringify(filter_options));
    let non_mutable = [];
    if (this.isCompanyBelongsToCustomField()) {
      non_mutable = options.filter(value => {
        return !value.custom_menu_Item;
      });
      return non_mutable;
    }
    return options;
  }
  showTextOnSelection(selection, total, context) {
    return this.translate.instant('selected_of').replace('%d', selection).replace('%n', total) + ' ' + context;
  }

  getFilterOptions(fields, isFossilScheduleCustomField = false) {
    // const fields = this.companyService.getFields();
    const filterOptions = [];
    if (fields) {
      fields.forEach(field => {
        const filterOption = {
          'filter': field.key_id,
          'value': field.title,
          'custom_filter_key': field.filter_key,
          'is_text_search': true,
          'is_list_search': true,
          'placeholder': field.title,
          'is_multi_selection': field.allow_multiselection,
          'is_generic_menu': true,
          // 'shouldRequestDataSourceWithSearchKey': true
        };
        // If user search location and selected then previous selected locations are deselected.
        if (this.isCompanyBelongsToCustomField() && !isFossilScheduleCustomField) {
          filterOption['shouldRequestDataSourceWithSearchKey'] = true;
        }
        filterOptions.push(filterOption);
      });
    }
    return filterOptions;
  }

  usageLimit(data, value) {
    let title = '';
    let message = '';
    switch (value) {
      case UsageLimit.GAME_EXCEEDED:
        title = this.translate.instant('game_limit_reached_msg_title');
        if (data.csr.csr_name || data.sdr.sdr_name) {
          message = this.translate.instant('game_limit_reached_popup_msg_admin');
        } else {
          message = this.translate.instant('game_limit_reached_popup_msg');
        }
        break;
      case UsageLimit.PLAYER_EXCEEDED:
        title = this.translate.instant('player_limit_reached_title');
        if (data.csr.csr_name || data.sdr.sdr_name) {
          message = this.translate.instant('player_limit_reached_popup_msg_admin');
        } else {
          message = this.translate.instant('player_limit_reached_popup_msg');
        }
        break;
      case UsageLimit.MANAGER_EXCEEDED:
        title = this.translate.instant('manager_limit_reached_title');
        if (data.csr.csr_name || data.sdr.sdr_name) {
          message = this.translate.instant('manager_limit_reached_popup_msg_admin');
        } else {
          message = this.translate.instant('manager_limit_reached_popup_msg');
        }
        break;
    }
    const displayData = {
      title: title,
      message: message,
      csr: data.csr,
      sdr: data.sdr
    };
    return displayData;
  }
  InitilizeApp(): void {}

  fetchTutorialVideo(): void {
    this.tutorialVideo = {
      BUILD_GAME: '', CREATE_CONTEST: '', LOGIN_ADD_USER: '', RUN_REPORTS: '',
      ADD_TROPHIES: '', EXPLORE_SHOP_GAME: '', CREATE_GAME_IN_MIN: '',
      FREE_CREDIT_OFFER: '', GET_STARTED: '', NEW_GAME_FORMAT: ''
    };
  }

  getConvertedPoints(pointsValue) {
    // Nine Zeroes for Billions
    return Math.abs(Number(pointsValue)) >= 1.0e+6 ? parseFloat((Math.abs(Number(pointsValue)) / 1.0e+6).toFixed(2)) + "M" : null;
    // Three Zeroes for Thousands
  }

  getFormattedPaginationLabel(paginator) {
    if (paginator) {
      paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {

        if (length === 0 || pageSize === 0) {
          return `0 of ${length}`;
        }
        console.log('page12222222', page, pageSize, length);  
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        console.log('page133333',endIndex.toLocaleString('en-US'),length.toLocaleString('en-US'))
        return `${this.formatNumber(startIndex + 1)} - ${endIndex.toLocaleString('en-US')} of ${length.toLocaleString('en-US')}`;
        // return `${startIndex + 1} - ${endIndex} of ${length}`;

        // const start = page * pageSize + 1;
        // const end = (page + 1) * pageSize;
        // return `${this.formatNumber(start)} - ${this.formatNumber(end)} of ${this.formatNumber(length)}`;
      };
    }
  }
}

