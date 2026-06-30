import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Constants, ApiService, PlaceholderText } from '../../services/network/api.service';
import { StorageService } from '../../services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DepartmentService, Department } from '../../services/department/department.service';
import { AddDepartmentComponent } from '../add-department/add-department.component';
import { DelegateService } from '../../services/delegate/delegate.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { PermissionsKey, PermissionsService } from 'src/app/services/permissions/permissions.service';
import { FormControl } from '@angular/forms';
import { LocationService } from 'src/app/services/location/location.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})

export class DepartmentListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  showDelay = new FormControl(500);
  is_loading: boolean;
  displayedColumns: string[];
  filter_options = [{
    'filter': Constants.DEPARTMENT_NAME, value: this.translate.instant('department'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.DEPARTMENT_NAME
  },
  {
    'filter': Constants.LOCATION_ID, value: this.translate.instant('Location'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.LOCATION_NAME, 'is_generic_menu': true ,'custom_menu_Item': true
  }  

];

  sort = {
    'sortBy': Constants.DEPARTMENT_NAME,
    'order': 'asc'
  };
  appliedFilters = '';
  noOfItemsPerPage: number;
  dataSource: any;
  departments: any;
  totalDepartments;
  startLimit = 0;
  context = 'departments';
  pageSizeOptions: number[];
  departmentPermissions: any = {};
  menuList = [];
  delegateSubscription;
  allowMultiSelect = true;
  selection = new SelectionModel<Department>(this.allowMultiSelect, []);
  isHeadDepartment = false;
  companyId;

  constructor(public departmentService: DepartmentService, public storageService: StorageService, public apiService: ApiService,
    public dialog: MatDialog, 
    private locationService: LocationService,
    public delegateService: DelegateService, public snackBar: MatSnackBar,
    public translate: TranslateService, public router: Router,
    public globalService: GlobalService, public permissionService: PermissionsService) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = [...Paginations.PAGE_SIZE_OPTIONS];
    if (this.pageSizeOptions.indexOf(20) === -1) {
      this.pageSizeOptions.push(20);
    }
    this.noOfItemsPerPage = 20;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('departments') !== -1) {
        console.log('retrive location from delegate service');
        this.companyId = companyID;
        this.getDepartments(0);
      }
    });
  }

  ngOnInit() {
    this.setUserPermissionForDepartement();
    // Fetch permissions on-Refresh
    this.globalService.permissionReceived$.subscribe(res => {
      this.setUserPermissionForDepartement();
    });
    this.companyId = this.storageService.getCompanyId();
    this.getDepartments(0);
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  setUserPermissionForDepartement() {
    this.departmentPermissions = this.permissionService.getPermissions(PermissionsKey.DEPARTMENT);
    if (this.departmentPermissions && this.departmentPermissions.edit) {
      this.displayedColumns = ['select', 'department'];
    } else {
      this.displayedColumns = ['department'];
    }
  }

  refreshListOnFilterChange(filters) {
    // Reset start limit and pageIndex on Filter
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, filters);
    this.getDepartments(0);
  }

  getDepartments(startLimit = 0) {
    this.is_loading = true;
    this.appliedFilters = this.storageService.getFilterFromStroage(this.context);
    console.log('applied filters: ' + JSON.stringify(this.appliedFilters));
    this.departmentService.getDepartments(this.companyId,
      this.sort.sortBy, this.sort.order, startLimit, this.noOfItemsPerPage, this.appliedFilters,false).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (response.data) {
          this.selection.clear();
          this.departments = response.data.department_list;
          this.totalDepartments = response.data.total_department;

          // FIXME, FROM BACKEND
          this.departments.forEach(department => {
            department.location_list.forEach(location => {
              if (location.head_location) {
                location.location_name = this.translate.instant('headquarters_uppercase');
              }
            });
          });

          this.dataSource = new MatTableDataSource(this.departments);
        }
      });
  }

  getDataSource(filterName) {
    console.log('filter name: ' + filterName);
    switch (filterName) {
      case Constants.LOCATION_ID:
        this.getLocations();
        break;
    }
  }


  getLocations() {
    const managerID = this.storageService.getUser() ? JSON.parse(this.storageService.getUser()) : '';
    let filters = '';
    if (managerID) {
      filters = `manager_id=${managerID.manager_id}`;
    }
    this.locationService.getLocations(this.storageService.getCompanyId(), Constants.LOCATION_NAME,
      'asc', 0, 0, filters, false).subscribe((res) => {
      const response: any = res;
      let locations;
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
      this.menuList = locList;
    });
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case Constants.DEPARTMENT_NAME:
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getDepartments(this.startLimit);
  }

  presentDepartmentPopup(departments = null, title = '') {
    if (this.departmentPermissions && !this.departmentPermissions.edit && departments && !departments[0].is_editable) { return; }
    const dialogRef = this.dialog.open(AddDepartmentComponent, {
      data: { 'departments': departments, 'title': title }
    });
    dialogRef.componentInstance.refreshDepartementList.subscribe(() => {
      this.selection = new SelectionModel<Department>(true, []);
      this.getDepartments(0);
      this.globalService.addAdminGoogleEvent('Departments_By_Edit_Department');
    });
    dialogRef.componentInstance.departmentDeleted.subscribe((departmentId) => {
      this.deleteDepartments(departmentId);
    });
    this.globalService.addAdminGoogleEvent('Departments_By_View_Department');
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Departments_By_${filter.filter}`;
    console.log(keyName);
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }

  getDepartmentsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    const startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getDepartments(startLimit);
  }

  confirmDeletion(event) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ?
      this.translate.instant('confirm_delete_department') : this.translate.instant('confirm_delete_departments');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteDepartments();
    });
  }
  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.isLinked = true;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }
  deleteDepartments(departmentId = null) {
    this.is_loading = true;
    const departmentsToBeDeleted = [];
    if (departmentId) {
      departmentsToBeDeleted.push(departmentId);
    } else {
      this.selection.selected.forEach(department => {
        departmentsToBeDeleted.push(department.department_id);
      });
    }
    const payload = {
      'department_ids': departmentsToBeDeleted,
      'company_id': this.storageService.getCompanyId()
    };
    this.departmentService.deleteDepartments(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'PLAYER_LINKED_TO_DEPARTMENT') {
          this.showAlert(this.translate.instant('cant_delete_departments'), this.apiService.getErrorMessage(response.message_code));
        } else if (response.message_code === 'MIDMANAGER_TEAMLEAD_LINKED_TO_DEPARTMENT') {
          this.showAlert(this.translate.instant('cant_delete_departments'), this.apiService.getErrorMessage(response.message_code));
        }
        return;
      }
      this.selection = new SelectionModel<Department>(true, []);
      this.getDepartments(0);
    });
  }

  getToolTipData(department) {
    if (department && department.location_list) {
      let toolTip = '';
      department.location_list.forEach(location => {
        toolTip += (`${location.location_name}\n`);
      });
      return toolTip;
    }
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }

  menuOptionsToBeDisplay() {
    if (this.selection.selected.length === 1) {
      this.selection.selected.forEach(department => {
        this.isHeadDepartment = department['head_department'];
      });
    } else {
      this.isHeadDepartment = false;
    }
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
