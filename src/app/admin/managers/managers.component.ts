import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { Constants, ApiService, PlaceholderText } from 'src/app/services/network/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Manager, ManagerService } from 'src/app/services/manager/manager.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DepartmentService } from 'src/app/services/department/department.service';
import { TranslateService } from '@ngx-translate/core';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalService, Paginations, UsageLimit } from 'src/app/services/global/global.service';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { LocationService } from 'src/app/services/location/location.service';
import { GroupService } from 'src/app/services/group/group.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { AddUserComponent } from '../add-user/add-user.component';
import { TutorialVideoComponent } from '../tutorial-video/tutorial-video.component';
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
import { CompanyService } from 'src/app/services/company/company.service';

@Component({
  selector: 'app-manager',
  templateUrl: './managers.component.html',
  styleUrls: ['./managers.component.scss']
})
export class ManagersComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  selectedManager: Manager;
  sort = {
    'sortBy': Constants.FIRST_NAME,
    'order': 'asc'
  };
  managerPermission: any = {};
  companyData;
  companyId;
  is_loading = false;
  startLimit = 0;
  pageIndex = 0;
  totalManagers = 0;
  noOfItemsPerPage: number;
  userDataSource: any;
  managerList = [];
  appliedFilters = [];
  locationList = [];
  departmentList = [];
  menuList = [];
  context = 'managers';
  openViewList = true;
  link_departments;
  allowMultiSelect = true;
  selectSearchFilterKey = 'department_name';
  selectSearchFilterKey_loc = 'location_name';
  selectedSearchKey = '';
  selectedSearchKey_loc = '';
  selection = new SelectionModel<Manager>(this.allowMultiSelect, []);
  pageSizeOptions: number[];
  // tslint:disable-next-line:max-line-length
  userStatusList = [{ 'id': 'active', 'value': this.translate.instant('active') }, { 'id': 'inactive', 'value': this.translate.instant('inactive') }];
  displayedColumns: string[];
  filter_options = [];
  search_filters = [
    {
      'filter': Constants.NAME, value: this.translate.instant('name'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.MANAGER_NAME
    },
    {
      'filter': Constants.EMAIL, value: this.translate.instant('email'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.EMAIL
    },
    {
      'filter': Constants.LOCATION_IDS, value: this.translate.instant('location'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.LOCATION_NAME, 'is_generic_menu': true, 'is_multi_selection': true, 'custom_menu_Item': true
    },
    {
      'filter': Constants.DEPARTMENT_IDS, value: this.translate.instant('department'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.DEPARTMENT_NAME, 'is_generic_menu': true, 'is_multi_selection': true, 'custom_menu_Item': true
    },
    {
      'filter': Constants.ROLE_ACCESS_TYPE, value: this.translate.instant('type'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.TYPE, 'is_generic_menu': true, 'custom_menu_Item': true
    },
    {
      'filter': Constants.STATUS, value: this.translate.instant('status'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.STATUS, 'is_generic_menu': true
    }];

  title = this.translate.instant('confirm_action');
  message: string;
  negativeButtonText = this.translate.instant('no_uppercase');
  positiveButtonText = this.translate.instant('yes_uppercase');
  managerType = '';

  completeUserDetails: any = {
    userInfo: '',
    userType: '',
  };
  delegateSubscription: any;
  is_editable: boolean;
  customFieldFetchSubscription: any;
  isFiltersLoaded = false;
  isOpen = false;

  constructor(public managerService: ManagerService, public storageService: StorageService, public dialog: MatDialog,
    public departmentService: DepartmentService, public translate: TranslateService, public companyService: CompanyService,
    public delegateService: DelegateService, public router: Router, public globalService: GlobalService,
    public permissionService: PermissionsService, public activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef,
    public apiService: ApiService, public locationService: LocationService, public groupService: GroupService) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('managers') !== -1) {
        this.locationList = [];
        this.departmentList = [];
        this.getManagers();
        this.prepareDisplayedColumns();
        this.filter_options = this.globalService.removeCustomFilters(this.search_filters);
      }
    });

    // Dynamic Filter menu will arrive here
    this.globalService.filterMenu.subscribe((menuList) => {
      if (menuList) {
        this.menuList = menuList;
      }
    });

    this.activatedRoute.params.subscribe(params => {
      this.pageIndex = params['pageIndex'];
      if (params['pageIndex'] && params['pageLimit']) {
        this.startLimit = params['pageIndex'] * params['pageLimit'];
        this.noOfItemsPerPage = params['pageLimit'];
      } else {
        this.noOfItemsPerPage = 20;
      }
    });

    this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
      if (res) {
        this.isFiltersLoaded = true;
      }
    });
  }
  ngOnInit() {
    this.setManagerPermissions();
    // for on referesh
    this.globalService.permissionReceived$.subscribe(res => {
      this.setManagerPermissions();
    });
    this.getManagers();
    this.selectedManager = new Manager();
    this.prepareDisplayedColumns();
    this.filter_options = this.globalService.removeCustomFilters(this.search_filters);
    const customFields = this.companyService.getCustomFields();
    if (customFields?.length) {
      this.isFiltersLoaded = true;
    }
  }
  prepareDisplayedColumns() {
    this.displayedColumns = ['select',
      'manager_profile_pic',
      'first_name',
      'manager_status',
      'manager_type',
      'location_name',
      'department_name'];
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('location_name'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('department_name'), 1);
    }
  }
  menuOpened() {
    this.selectedSearchKey = '';
    this.selectedSearchKey_loc = '';
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    if (this.pageIndex) {
      this.paginator.pageIndex = this.pageIndex;
    }
    this.globalService.getFormattedPaginationLabel(this.paginator);
    this.cdRef.detectChanges();
  }

  setManagerPermissions() {
    this.managerPermission = this.permissionService.getPermissions(PermissionsKey.MANAGER);
  }

  getManagers() {
    this.is_loading = true;
    const filters = this.storageService.getFilterFromStroage(this.context) || '';
    this.companyId = this.storageService.getCompanyId();
    this.managerService.getManagers(this.companyId, this.sort.sortBy, this.sort.order, this.startLimit,
      this.noOfItemsPerPage, filters)
      .subscribe(res => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }

        // Clear selection
        this.selection.selected.forEach(user => {
          this.selection.deselect(user);
        });

        this.totalManagers = response.data.total_manager;
        this.managerList = response.data.manager_list;
        this.userDataSource = new MatTableDataSource(this.managerList);
      });

  }
  menuOptionsToBeDisplay() {
    if (this.selection.selected.length === 1) {
      this.selection.selected.forEach(manager => {
        this.selectedManager.status = manager['status'];
      });
    } else {
      this.selectedManager.status = 'active';
    }
  }
  menuOptionsToBeDisplaySom() {
    const numRows = this.selection.selected.filter((manager) => {
      return manager['is_editable'] === false;
    });
    if (numRows.length !== 0) {
      return this.is_editable = true;
    } else {
      return this.is_editable = false;
    }
  }
  addNewManager() {
    // for new adding manager
    const newManager = { 'userType': 'Manager', 'isNew': true };
    this.companyService.checkUsageLimit(this.companyId, UsageLimit.MANAGER).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'MANAGER_LIMIT_EXCEEDED') {
          this.showLimit(response);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Managers_Manual_Adding');
          return;
        }
      }
      this.navigateToManagerDetailsPage(newManager);
    });
  }

  navigateToManagerDetailsPage(manager) {
    if (this.managerPermission && !this.managerPermission.edit) {
      return;
    }
    // selectedManager = !selectedManager && this.selection.selected.length === 1 ? this.selection.selected[0] : selectedManager;
    manager['userType'] = manager['userType'] ? manager['userType'] : this.getManagerType(manager['access_type']);
    this.completeUserDetails.userInfo = manager;
    this.completeUserDetails.userType = Constants.MANAGER;
    const dialogRef = this.dialog.open(AddUserComponent, {
      data: this.completeUserDetails
    });
    // Callback on Add/update event
    dialogRef.componentInstance.refreshPlayerList.subscribe(() => {
      this.getManagers();
    });
    // Callback for Delete event
    dialogRef.componentInstance.userDeleted.subscribe((user) => {
      this.deleteManagers(user);
    });

  }

  openMenu(event, dataSource) {
    this.openViewList = event;
    this.link_departments = dataSource;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userDataSource.data.filter((element) => {
      return true;
    }).length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.userDataSource.data.filter((element) => {
        return true;
      }).forEach(row => this.selection.select(row));
  }

  activateDeactivateManagers(statusToBeUpdated) {
    const managerIdsToBeUpdated = []; // List of Player Id's
    let filterManagersToBeUpdated = [];

    // Filter Players which are converted to expected states.
    filterManagersToBeUpdated = this.selection.selected.filter(p => {
      return p['status'] !== statusToBeUpdated;
    });
    if (filterManagersToBeUpdated && filterManagersToBeUpdated.length <= 0) {
      return;
    }
    this.is_loading = true;
    // Get ids of Players which states are going to update
    filterManagersToBeUpdated.forEach(mnger => {
      managerIdsToBeUpdated.push(mnger.manager_id);
    });
    const payload = {
      'manager_ids': managerIdsToBeUpdated,
      'action': statusToBeUpdated === 'active' ? 'activate' : 'deactivate',
      'company_id': this.companyId,
    };
    this.managerService.activateDeactivateManagers(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'MANAGER_LIMIT_EXCEEDED' && statusToBeUpdated === 'active') {
          this.showLimit(response);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Managers_Reactivation');
          return;
        }
        this.globalService.showMessage(this.translate.instant(this.apiService.getErrorMessage(response.message_code)));
        return;
      }
      statusToBeUpdated === 'active' ? this.globalService.addAdminGoogleEvent('Users_Manager_Filter_Active')
        : this.globalService.addAdminGoogleEvent('Users_Manager_Filter_Inactive');
      this.getManagers();
    });

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

  confirmDeletion() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ?
      this.translate.instant('confirm_delete_manager') : this.translate.instant('confirm_delete_managers');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteManagers();
    });
  }

  deleteManagers(deletedManagerId = null) {
    this.is_loading = true;
    const managersToBeDeleted = [];
    if (deletedManagerId) {
      managersToBeDeleted.push(deletedManagerId);
    } else {
      this.selection.selected.forEach(manager => {
        managersToBeDeleted.push(manager.manager_id);
      });
    }
    const payload = {
      'manager_ids': managersToBeDeleted
    };
    this.managerService.deleteManager(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('unable_to_delete_manager'));
        return;
      }
      this.selection = new SelectionModel<Manager>(true, []);
      this.getManagers();
    });
  }

  refreshListOnFilterChange(filters) {
    this.storeFilters(filters);
  }

  filterOptionUpdated(filter) {
    if (!filter) { return; }
    let keyName = `Users_Manager_Filter_${filter.filter}`;
    if (filter && !filter.filter) {
      keyName = `Users_Manager_Filter_${filter.userInfo.searching_in}`;
    }
    if (filter && filter.filter === Constants.ROLE_ACCESS_TYPE || filter.filter === Constants.STATUS) {
      keyName = `Users_Manager_Filter_${filter.value}`;
    }
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }

  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, this.appliedFilters);
    this.getManagers();
  }

  getDataSource(filterName) {
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.getLocations();
        break;
      case Constants.DEPARTMENT_IDS:
        this.getDepartments();
        break;
      case Constants.ROLE_ACCESS_TYPE:
        this.menuList = this.globalService.getCompanyRoles();
        break;
      case Constants.STATUS:
        this.menuList = this.userStatusList;
        break;
    }
  }

  getLocations() {
    this.locationService.getLocations(this.storageService.getCompanyId(), Constants.LOCATION_NAME, 'asc', 0, 0, null, false).subscribe((res) => {
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
      const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': 'Location' };
      this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters);
      this.menuList = this.locationList;
      this.cdRef.detectChanges();
    });
  }

  getDepartments() {
    this.departmentService.getDepartments(this.companyId, 'department_name', 'asc', 0, 0, null, false).subscribe((res) => {
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
      const filterInfo = { 'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': this.translate.instant('department') };
      this.departmentList = this.globalService.prepareSelectionList(deptList, filterInfo, this.appliedFilters);
      this.menuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'first_name':
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
      case 'manager_status':
        this.sort.sortBy = Constants.STATUS;
        break;
      case 'department_name':
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
      case 'location_name':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      case 'manager_type':
        this.sort.sortBy = Constants.ROLE_ACCESS_TYPE;
        break;
      default:
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getManagers();
  }

  downloadManagersCSV() {
    const filters = this.storageService.getFilterFromStroage(this.context) || '';
    this.companyId = this.storageService.getCompanyId();
    this.managerService.getUrlToDowload(this.companyId, filters)
      .subscribe(res => {
        const response: any = res;
        if (!response.success) {
          this.globalService.showMessage(this.translate.instant('error_downloading'));
          return;
        }
        this.globalService.addAdminGoogleEvent('Users_Manager_Report_Download_CSV');
        // Download file
        window.location.assign(response.data.fileURL);
        this.globalService.showMessage(this.translate.instant('downloading_file'));
      });
  }

  getManagersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getManagers();
  }

  showVideo() {
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { name: this.translate.instant('how_to_login_add_users'), url: this.globalService.tutorialVideo.LOGIN_ADD_USER }
      });
  }

  departmentColoumText(departmentName, linkDepartment, text) {
    return departmentName + text.replace('%d', linkDepartment);
  }

  showLimit(response) {
    const displayData = this.globalService.usageLimit(response.data, UsageLimit.MANAGER_EXCEEDED);
    const dialogRef = this.dialog.open(PaywallActionComponent, {
      disableClose: true,
      data: displayData
    });
    dialogRef.componentInstance.title = displayData.title;
    dialogRef.componentInstance.message = displayData.message;
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
