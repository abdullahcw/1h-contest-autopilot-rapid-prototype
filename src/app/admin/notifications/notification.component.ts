import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { StorageService } from '../../services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Constants, PlaceholderText } from '../../services/network/api.service';
import { GlobalService } from '../../services/global/global.service';
import { DepartmentService } from '../../services/department/department.service';
import { LocationService } from '../../services/location/location.service';
import { GroupService } from '../../services/group/group.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { DelegateService } from '../../services/delegate/delegate.service';
import { TranslateService } from '@ngx-translate/core';
import {
  PermissionsService,
  PermissionsKey,
  Role,
} from 'src/app/services/permissions/permissions.service';
import { CompanyService } from 'src/app/services/company/company.service';

enum FilterIndex {
  EVERYONE = 0,
  // LOCATION = 1,
  // DEPARTMENT = 2,
  CUSTOM_FILTER = 1,
  // GROUP = 2
}
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  is_loading = false;
  companyId;
  notificationSettings;
  subtitles = [
    this.translate.instant('new_game_starting_from_today'),
    this.translate.instant('new_game_attempt_available'),
    this.translate.instant('leaderboard_has_been_reset'),
    this.translate.instant('get_back_in_action'),
  ];
  selectedTab = 0;
  emails = [];
  customNotificationSettings;
  menuList = [];
  title;
  messageBody = '';
  isSending = false;

  everyoneFilterOption = {
    filter: Constants.EVERYONE,
    value: this.translate.instant('all'),
    is_static: true,
    is_text_search: true,
    is_list_search: false,
    placeholder: PlaceholderText.PLAYER_NAME,
    is_multi_selection: true,
    is_generic_menu: true,
  };
  // locationFilterOption = {
  //   'filter': Constants.LOCATION_IDS, value: this.translate.instant('location'), 'is_text_search': true, 'is_list_search': true,
  //   'placeholder': PlaceholderText.LOCATION_NAME, 'is_multi_selection': true, 'is_generic_menu': true,
  //   'mutually_exclusive_with': Constants.EVERYONE, 'custom_menu_Item': true
  // };
  // departmentFilterOption = {
  //   'filter': Constants.DEPARTMENT_IDS, value: this.translate.instant('department'), 'is_text_search': true, 'is_list_search': true,
  //   'placeholder': PlaceholderText.DEPARTMENT_NAME, 'is_multi_selection': true, 'is_generic_menu': true,
  //   'mutually_exclusive_with': Constants.EVERYONE, 'dependent_on': Constants.LOCATION_IDS, 'custom_menu_Item': true
  // };
  groupFilterOptions = {
    filter: Constants.GROUP_IDS,
    value: this.translate.instant('group'),
    is_text_search: true,
    is_list_search: true,
    placeholder: PlaceholderText.GROUP_NAME,
    is_multi_selection: true,
    is_generic_menu: true,
    mutually_exclusive_with: Constants.EVERYONE,
    custom_menu_Item: true,
  };

  defaultFilter = {
    filter: Constants.EVERYONE,
    is_static: true,
    searchingIn: 'All',
    value: '',
    id: -1,
  };
  filter_options = [];
  locationsMenuList: any[];
  departmentsMenuList: any[];
  groupsMenuList: any[];
  filters = [];
  context = 'notification';
  departments;
  delegateSubscription: any;
  notificationPermission;
  loginUser: any;
  customFieldFetchSubscription: any;

  constructor(
    private storageService: StorageService,
    private notificationService: NotificationsService,
    private globalService: GlobalService,
    private locationService: LocationService,
    private groupService: GroupService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public permissionService: PermissionsService,
    public translate: TranslateService,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
    private delegateService: DelegateService
  ) {
    this.delegateSubscription =
      this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
        this.companyId = companyID;
        this.refreshData();
        this.addDefaultFilter();
      });
    this.customFieldFetchSubscription =
      this.companyService.onCustomFieldsFetched.subscribe((res) => {
        if (!this.globalService.isCompanyBelongsToCustomField()) {
          console.log('m here');
          this.filter_options = this.globalService.addeditCompanyCustomFilters(
            this.filter_options,
            res,
            0
          );
          // this.setDefaultFiltersForCustomCompany(true);
          this.filter_options.forEach((filterOption) => {
            if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
              filterOption['dependent_on'] = Constants.LOCATION_IDS;
              filterOption['mutually_exclusive_with'] = Constants.EVERYONE;
            }
            if (filterOption.custom_filter_key === Constants.LOCATION_IDS || filterOption.hasOwnProperty('custom_filter_key')) {
              filterOption['custom_menu_Item'] = true;
              filterOption['mutually_exclusive_with'] = Constants.EVERYONE;
            }
          });
        }
      });
  }

  ngOnInit() {
    this.setNotificationPermission();
    this.companyId = +this.storageService.getCompanyId();
    this.addDefaultFilter();
    this.refreshData();

    // for on referesh
    this.globalService.permissionReceived$.subscribe((res) => {
      this.setNotificationPermission();
    });

    const fields = this.companyService.getCustomFields();
    this.filter_options = this.globalService.addeditCompanyCustomFilters(
      this.filter_options,
      fields,
      0
    );

    this.filter_options.forEach((filterOption) => {
      if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
        filterOption['dependent_on'] = Constants.LOCATION_IDS;
        filterOption['mutually_exclusive_with'] = Constants.EVERYONE;
      }
      if (filterOption.custom_filter_key === Constants.LOCATION_IDS || filterOption.hasOwnProperty('custom_filter_key')) {
        filterOption['custom_menu_Item'] = true;
        filterOption['mutually_exclusive_with'] = Constants.EVERYONE;
      }
    });
  }

  setDefaultFiltersForCustomCompany(refreshDashboard) {
    this.refreshListOnFilterChange(this.filters);
  }

  refreshData() {
    this.prepareFilterOptions();
    this.getNotificationSettings();
    // this.getLocations();
    // this.getDepartments();
    this.getGroups();
  }

  addDefaultFilter() {
    this.filters = [];
    this.filters.push(this.defaultFilter);
  }

  setNotificationPermission() {
    this.notificationPermission = this.permissionService.getPermissions(
      PermissionsKey.NOTIFICATION
    );
  }

  prepareFilterOptions() {
    this.filter_options = [];
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.addFilter(this.everyoneFilterOption, FilterIndex.EVERYONE);
    } else {
      const isEveryoneFilterAdded = this.isFilterApplied(Constants.EVERYONE);
      const isGroupFilterAdded = this.isFilterApplied(Constants.GROUP_ID);

      const isCustomFilterAdded = this.isFilterApplied(
        Constants.CUSTOM_FILTER_KEY
      );
      this.loginUser = JSON.parse(this.storageService.getUser());
      console.log(
        'options',
        isEveryoneFilterAdded,
        isCustomFilterAdded,
        isGroupFilterAdded
      );

      if (!isCustomFilterAdded && !isGroupFilterAdded) {
        this.addFilter(this.everyoneFilterOption, FilterIndex.EVERYONE);
      }

      if (!isEveryoneFilterAdded && !isGroupFilterAdded) {
        const fields = this.companyService.getCustomFields();
        this.filter_options = this.globalService.addeditCompanyCustomFilters(
          this.filter_options,
          fields,
          1
        );
        this.filter_options.forEach((filterOption) => {
          // if (
            
          //   (filterOption.custom_filter_key !== Constants.LOCATION_IDS &&
          //     filterOption.custom_filter_key !== Constants.DEPARTMENT_IDS)
          // ) {
          //   filterOption['mutually_exclusive_with'] = Constants.EVERYONE;
          // }

          if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
            filterOption['dependent_on'] = Constants.LOCATION_IDS;
            filterOption['mutually_exclusive_with'] = Constants.EVERYONE;
            filterOption['custom_menu_Item'] = true;
          }

          if (filterOption.custom_filter_key === Constants.LOCATION_IDS || filterOption.hasOwnProperty('custom_filter_key')) {
            filterOption['custom_menu_Item'] = true;
            filterOption['mutually_exclusive_with'] = Constants.EVERYONE;
          }
        });
      }
      if (
        !isEveryoneFilterAdded &&
        !isCustomFilterAdded &&
        this.loginUser.access_type !== Role.MID_MANAGER
      ) {
        this.addFilter(this.groupFilterOptions, this.filter_options.length);
      }
    }
  }


  addFilter(filter, index) {
    if (this.filter_options.indexOf(filter) === -1) {
      this.filter_options.splice(index, 0, filter);
    }
    this.filter_options = this.globalService.removeCustomFilters(
      this.filter_options
    );
  }

  removeFilter(filter) {
    const index = this.filter_options.indexOf(filter);
    if (index !== -1) {
      this.filter_options.splice(index, 1);
    }
  }

  isFilterApplied(key) {
    console.log('filters', this.filters);
    return (
      this.filters &&
      this.filters.filter((item) => {
        return item.filter === key || item.hasOwnProperty(key);
      }).length
    );
  }

  getNotificationSettings() {
    this.is_loading = true;
    this.notificationService
      .getNotificationSettings(this.companyId)
      .subscribe((res) => {
        this.is_loading = false;
        if (res.success) {
          this.notificationSettings = [];
          res.data.notification_list.forEach((notificationSetting) => {
            if (+notificationSetting.notification_id === 5) {
              this.customNotificationSettings = {
                email_notification: 1,
                push_notification: 1,
              };
            } else {
              this.notificationSettings.push(notificationSetting);
            }
          });
          this.updateSubtitles();
        }
      });
  }

  updateSubtitles() {
    for (let index = 0; index < this.notificationSettings.length; index++) {
      const setting = this.notificationSettings[index];
      setting.subtitle = this.subtitles[index];
    }
  }

  updateNotificationSettings(event: MatSlideToggleChange, notification, type) {
    const isSet = event.checked;
    const payload: any = {
      company_id: this.companyId,
      notification_id: notification.notification_id,
      notification_type: type,
    };
    if (type === 'email') {
      payload.email_notification = isSet;
      notification.email_notification = isSet ? 1 : 0;
    } else {
      payload.push_notification = isSet;
      notification.push_notification = isSet ? 1 : 0;
    }
    if (isSet) {
      this.googleEventsAdd(notification);
    }
    this.notificationService
      .updateNotificationSettings(payload)
      .subscribe((res) => {});
  }

  googleEventsAdd(notification) {
    if (notification) {
      if (notification.notification_id === 1) {
        if (notification.email_notification == 1) {
          console.log(notification);
          this.globalService.addAdminGoogleEvent(
            'Notifications_By_New_Game_Alert_Email'
          );
        }
        if (notification.push_notification == 1) {
          this.globalService.addAdminGoogleEvent(
            'Notifications_By_New_Game_Alert_Mobile'
          );
        }
      }

      if (notification.notification_id === 2) {
        if (notification.email_notification == 1) {
          this.globalService.addAdminGoogleEvent(
            'Notifications_By_New_Game_Attempt_Email'
          );
        }
        if (notification.push_notification == 1) {
          this.globalService.addAdminGoogleEvent(
            'Notifications_By_New_Game_Attempt_Mobile'
          );
        }
      }

      if (notification.notification_id === 3) {
        if (notification.email_notification == 1) {
          this.globalService.addAdminGoogleEvent(
            'Notifications_By_Leaderborad_Update_Email'
          );
        }
        if (notification.push_notification == 1) {
          this.globalService.addAdminGoogleEvent(
            'Notifications_Leaderborad_Update_Mobile'
          );
        }
      }

      if (notification.notification_id === 4) {
        if (notification.email_notification == 1) {
          this.globalService.addAdminGoogleEvent(
            'Notifications_By_Reminder_Email'
          );
        }
        if (notification.push_notification == 1) {
          this.globalService.addAdminGoogleEvent(
            'Notifications_By_Reminder_Mobile'
          );
        }
      }
    }
  }
  updateCustomNotificationSettings(event: MatSlideToggleChange, type) {
    const isSet = event.checked;
    if (type === 'email') {
      this.customNotificationSettings.email_notification = isSet ? 1 : 0;
    } else {
      this.customNotificationSettings.push_notification = isSet ? 1 : 0;
    }
  }

  getDataSource(filterObj) {
    // console.log('filter', filterObj, filterObj['filter']);
    const filterName = filterObj['filter'];
    switch (filterName) {
      case Constants.LOCATION_IDS:
        // const locFilterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': this.translate.instant('location') };
        // this.menuList = this.globalService.prepareSelectionList(this.locationsMenuList, locFilterInfo, this.filters);
        // this.cdRef.detectChanges();
        this.getCustomFieldsValues(filterObj);
        break;
      case Constants.DEPARTMENT_IDS:
        // const deptFilterInfo = {
        //   'filter_name': Constants.DEPARTMENT_IDS,
        //   'searching_in': this.translate.instant('department'), 'dependentOn': Constants.LOCATION_IDS
        // };
        // this.menuList = this.globalService.prepareSelectionList(this.departmentsMenuList, deptFilterInfo, this.filters);
        // this.cdRef.detectChanges();
        this.getCustomFieldsValues(filterObj);
        break;
      case Constants.GROUP_IDS:
        const groupFilterInfo = {
          filter_name: Constants.GROUP_IDS,
          searching_in: this.translate.instant('group'),
        };
        this.menuList = this.globalService.prepareSelectionList(
          this.groupsMenuList,
          groupFilterInfo,
          this.filters
        );
        break;
      default:
        // this.getValues(filterObj);
        // if (this.globalService.isCompanyBelongsToCustomField()) {
        //   this.getValues(filterObj);
        // } else {
        if (!this.globalService.isCompanyBelongsToCustomField()) {
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
    const searchFilter = {
      search_text: searchKey ? searchKey : '',
      filter: filterKey,
      value: currentFilter.value,
      is_multi_selection: currentFilter.is_multi_selection,
    };
    if (!this.globalService.isCompanyBelongsToCustomField()) {
      this.getCustomFieldsValues(searchFilter);
    }
  }

  getGroups() {
    this.groupService
      .getGroups(
        this.storageService.getCompanyId(),
        'group_name',
        'asc',
        0,
        0,
        ''
      )
      .subscribe((res) => {
        const response: any = res;
        if (!response.success) {
          return;
        }
        let groups = [];
        this.groupsMenuList = [];
        if (response.data) {
          groups = response.data.group_list;
        }
        groups.forEach((group) => {
          this.groupsMenuList.push({
            id: group.group_id,
            value: group.group_name,
          });
        });
      });
    this.cdRef.detectChanges();
  }

  getCustomFieldsValues(filterDetails) {
    console.log('madnisfbs', filterDetails);
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
    this.companyService
      .getCustomFieldsValues(field, companyId, searchText ? searchText : null)
      .subscribe((res) => {
        const response: any = res;
        if (response.success) {
          if (filterDetails.is_multi_selection) {
            const mList = this.globalService.prepareMenuList(
              response.data.values,
              filterDetails,
              this.context
            );
            const filterInfo = {
              filter_name: field,
              searching_in: searchingIn,
            };
            const clickedFilter = this.filters.filter(
              (appliedFilter) =>
                appliedFilter.searchingIn === filterDetails.value
            )[0];
            const forceSelection =
              clickedFilter && clickedFilter.value === 'All' ? true : false;
            // console.log('mlist', mList, filterInfo, this.appliedFilters, forceSelection);
            this.menuList = this.globalService.prepareSelectionList(
              mList,
              filterInfo,
              this.filters,
              forceSelection
            );
            // console.log('menulist', this.menuList);
          } else {
            this.menuList = this.globalService.prepareMenuList(
              response.data.values,
              filterDetails,
              this.context
            );
          }
        }
      });
    this.cdRef.detectChanges();
  }

  getLocations(refreshDashboard) {
    const managerID = this.globalService.isRoleLimited()
      ? this.storageService.getLoginUserID()
      : null;
    let filters;
    if (managerID) {
      filters = `manager_id=${managerID}`;
    }
    this.locationService
      .getLocations(
        this.storageService.getCompanyId(),
        Constants.LOCATION_NAME,
        'asc',
        0,
        0,
        filters,
        false
      )
      .subscribe((res) => {
        const response: any = res;
        let locations = [];
        this.locationsMenuList = [];
        if (!response.success) {
          return;
        }
        if (response.data) {
          locations = response.data.location_list;
        }
        locations.forEach((location) => {
          this.locationsMenuList.push({
            id: location.location_id,
            value: location.location_name,
          });
        });
        const locFilterInfo = {
          filter_name: Constants.LOCATION_IDS,
          searching_in: this.translate.instant('location'),
        };
        this.menuList = this.globalService.prepareSelectionList(
          this.locationsMenuList,
          locFilterInfo,
          this.filters
        );
        // this.cdRef.detectChanges();
      });
  }

  getDepartmentsByLocations() {
    const locIds = [];
    let isAllLocation = false;
    const locationFilters = this.filters.filter((appliedFilter) => {
      return appliedFilter['filter'] === Constants.LOCATION_IDS;
    });
    if (locationFilters && locationFilters.length > 0) {
      locationFilters.forEach((loc) => {
        if (loc['id'] !== -1) {
          locIds.push(loc['id']);
        } else {
          isAllLocation = true;
        }
      });
    }

    const payload = {
      company_id: this.storageService.getCompanyId(),
      location_ids: isAllLocation ? [] : locIds,
      is_all: isAllLocation,
    };
    this.departmentService
      .getDepartmentsByLocations(payload)
      .subscribe((res) => {
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
        const deptFilterInfo = {
          filter_name: Constants.DEPARTMENT_IDS,
          searching_in: this.translate.instant('department'),
          dependentOn: Constants.LOCATION_IDS,
        };
        this.menuList = this.globalService.prepareSelectionList(
          list,
          deptFilterInfo,
          this.filters
        );
        // this.cdRef.detectChanges();
      });
  }
  // getDepartments() {
  //   const managerID = this.globalService.isRoleLimited() ? this.storageService.getLoginUserID() : null;
  //   let filters;
  //   if (managerID) {
  //     filters = `manager_id=${managerID}`;
  //   }
  //   this.departmentService.getDepartments(this.companyId, 'department_name', 'asc', 0, 0, filters, false).subscribe((res) => {
  //     const response: any = res;
  //     this.departments = [];
  //     if (!response.success) { return; }
  //     if (response.data) {
  //       this.departments = response.data.department_list;
  //     }
  //     this.departmentsMenuList = [];
  //     this.departments.forEach((department) => {
  //       const menuItem = {
  //         id: department.department_id,
  //         value: department.department_name,
  //       };
  //       this.departmentsMenuList.push(menuItem);
  //     });
  //   });
  // }

  refreshListOnFilterChange(filters) {
    this.filters = filters;
    const menuIds = [];
    this.menuList.forEach((menu) => {
      menuIds.push(menu.id);
    });
    filters.forEach((filter) => {
      const index = menuIds.indexOf(filter.id);
      if (index !== -1) {
        this.menuList[index].isSelected = true;
      }
    });
    this.prepareFilterOptions();
    // Filter departments as per selected locations
    // const isLocationFilterAdded = this.isFilterApplied(Constants.LOCATION_IDS);
    // if (isLocationFilterAdded) {
    //   // Remove departments filter if more than 1 location filter is applied. Backend support to be given in future to remove this.
    //   if (isLocationFilterAdded > 1) {
    //     this.filters = this.filters.filter(element => {
    //       return element.filter !== Constants.DEPARTMENT_IDS;
    //     });
    //   }
    //   this.filterDepartments();
    // }
  }

  // filterDepartments() {
  //   const locationIds = [];
  //   const appliedLocationFilters = this.filters.filter(element => {
  //     return element.filter === Constants.LOCATION_IDS;
  //   });
  //   appliedLocationFilters.forEach(element => {
  //     locationIds.push(element.id);
  //   });

  //   const newDepartmentsMenuList = [];
  //   const addedDeptIds = [];
  //   if (this.departments) {
  //     this.departments.forEach(department => {
  //       const locationList = department.location_list;
  //       locationList.forEach(element => {
  //         if (locationIds.length === 0 || locationIds.indexOf(element.location_id) !== -1) {
  //           if (addedDeptIds.indexOf(department.department_id) === -1) {
  //             const menuItem = {
  //               id: department.department_id,
  //               value: department.department_name,
  //             };
  //             newDepartmentsMenuList.push(menuItem);
  //             addedDeptIds.push(department.department_id);
  //           }
  //         }
  //       });
  //     });
  //   }
  //   this.departmentsMenuList = newDepartmentsMenuList;
  // }

  shouldDisableSend() {
    if (
      this.isSending ||
      this.filters.length === 0 ||
      (this.customNotificationSettings &&
        this.customNotificationSettings.push_notification === 0 &&
        this.customNotificationSettings.email_notification === 0) ||
      !this.messageBody ||
      this.messageBody.length === 0
    ) {
      return true;
    }
    return false;
  }

  send() {
    const payload: any = this.preparePayload();
    this.isSending = true;
    this.notificationService
      .sendCustomNotification(payload)
      .subscribe((res) => {
        this.isSending = false;
        if (res.success) {
          if (this.customNotificationSettings.push_notification) {
            this.globalService.addAdminGoogleEvent(
              'Notification_By_Custom_Notification_Mobile'
            );
          }
          if (this.customNotificationSettings.email_notification) {
            this.globalService.addAdminGoogleEvent(
              'Notification_By_Custom_Notification_Email'
            );
          }
          const dialogReference = this.dialog.open(ConfirmActionComponent, {
            data: event,
          });
          dialogReference.componentInstance.title =
            this.translate.instant('notification_sent');
          dialogReference.componentInstance.message = this.translate.instant(
            'notification_sent_successfully'
          );
          dialogReference.componentInstance.isMultiOption = false;
          dialogReference.componentInstance.positiveButtonText =
            this.translate.instant('ok_uppercase');
        }
        this.resetValues();
      });
  }

  resetValues() {
    this.title = '';
    this.messageBody = '';
    this.filters = [];
    this.prepareFilterOptions();
  }

  preparePayload() {
    const payload: any = {
      company_id: this.storageService.getCompanyId(),
      content: this.messageBody,
      push_notification: Boolean(
        parseInt(this.customNotificationSettings.push_notification, 10)
      ),
      email_notification: Boolean(
        parseInt(this.customNotificationSettings.email_notification, 10)
      ),
      is_custom: this.globalService.isCompanyBelongsToCustomField()
        ? true
        : false,
      is_company_with_custom_fields:
        this.globalService.isCompanyWithCustomField() ? true : false,
    };
    // this.preparePayloadFor(Constants.LOCATION_IDS, payload, 'location_ids');
    // this.preparePayloadFor(Constants.DEPARTMENT_IDS, payload, 'department_ids');
    this.preparePayloadFor(Constants.GROUP_IDS, payload, 'group_ids');
    this.filters.forEach((elem) => {
      if (elem.customFilterKey) {
        this.preparePayloadFor(
          Constants.CUSTOM_FILTER_KEY,
          payload,
          elem.customFilterKey
        );
      }
    });

    return payload;
  }

  preparePayloadFor(constant, payload, key) {
    const filters = this.filters.filter((item) => {
      return item.filter === constant || item.hasOwnProperty(constant);
    });
    if (filters.length) {
      payload[key] = [];
      filters.forEach((element) => {
        if (element.customFilterKey == key) {
          payload[key].push(element.id);
        } else if (element.filter == key)  {
          payload[key].push(element.id);
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
