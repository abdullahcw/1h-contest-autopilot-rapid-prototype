import { Component, OnInit, Inject, EventEmitter, Output, HostListener, ChangeDetectorRef, ViewChild } from '@angular/core';
import { StorageService } from '../../services/storage/storage.service';
import { DepartmentService, Department } from '../../services/department/department.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Constants, ApiService } from '../../services/network/api.service';
import { LocationService } from '../../services/location/location.service';
import { PermissionsKey, PermissionsService } from 'src/app/services/permissions/permissions.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ESCAPE } from '@angular/cdk/keycodes';
import { ListItem } from 'src/app/shared/list-selection/list-selection.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-add-department',
  templateUrl: './add-department.component.html',
  styleUrls: ['./add-department.component.scss']
})

export class AddDepartmentComponent implements OnInit {
  is_loading = false;
  department: Department = new Department();
  onSuccess = new EventEmitter();
  dataSource;
  departmentPermissions: any = {};
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  titleToBeDisplayed = '';
  selectedDepartments = [];
  showLocationMenu = false;
  searchPlaceHolder = '';
  prepareDataSourceForLocations = [];
  old_list = [];
  @ViewChild('departmentForm', { static: true }) departmentForm: NgForm;

  // tslint:disable-next-line:no-output-on-prefix
  @Output() refreshDepartementList: EventEmitter<any> = new EventEmitter();
  @Output() departmentDeleted: EventEmitter<any> = new EventEmitter();
  readonly separatorKeysCodes: number[] = [ESCAPE];
  locByDepatrment=[];
  constructor(public departmentService: DepartmentService,
    public storageService: StorageService,
    public dialogRef: MatDialogRef<any>,
    public snackBar: MatSnackBar,
    public globalService: GlobalService, public permissionService: PermissionsService,
    public locationService: LocationService,
    public dialog: MatDialog, public translate: TranslateService,
    public apiService: ApiService,
    public cdRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    dialogRef.disableClose = true;
  }
  @HostListener('window:keydown', ['$event']) closeOnEscape(event) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  ngOnInit() {
    if(this.data.title == 'Edit Department'){
      this.getLocationsByDepartment(this.data['departments'][0]['department_id']);
      }else{
        this.loadDataOfNgonit();
      }
      
   
  }
  loadDataOfNgonit(){
    this.departmentForm.form.markAsPristine();
    const { departments, title } = this.data;
    this.selectedDepartments = departments;
    this.titleToBeDisplayed = title;
    this.searchPlaceHolder = this.translate.instant('search');
    if (this.selectedDepartments && this.selectedDepartments.length < 2) {
      const [dept] = this.selectedDepartments;
      dept.location_list = this.locByDepatrment;
      this.department = {
        name: dept.department_name,
        department_id: dept.department_id,
        selectedLocations: dept.location_list
      };
      if (dept.location_list) {
        this.selectedItems = dept.location_list.map(location => ({
          itemId: location.location_id,
          itemName: location.location_name
        }));

        this.old_list = dept.location_list.map(location => location.location_id);
      }
    }
    this.getLocations('');
    this.setUserPermissionForDepartement();
    // Fetch permissions on-Refresh
    this.globalService.permissionReceived$.subscribe(res => {
      this.setUserPermissionForDepartement();
    });
  }

  getLocationsByDepartment(department_id) {
    const company_id = this.storageService.getCompanyId();
    const filters = null;
    this.is_loading = true;
    const locationIds = null;
    this.locationService.getLocationsByDepartment(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, filters, department_id, false) .subscribe((res) => {   
      const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          this.loadDataOfNgonit();
          return;
        }
        this.locByDepatrment = response.data.location_list;
        console.log('response',response)
        this.loadDataOfNgonit();
      });
  }
  setUserPermissionForDepartement() {
    // Set permission only if login player is not a Admin.
    this.departmentPermissions = this.permissionService.getPermissions(PermissionsKey.DEPARTMENT);
    console.log('Permission: ' + this.departmentPermissions);
  }

  onItemSelect(item: any) {
    console.log(item);
  }

  onSelectAll(items: any) {
    console.log(items);
  }

  onDropdownClose() {
  }

  removeFromArray(original, remove) {
    return original.filter(value => remove.indexOf(value) === -1);
  }

  getLocations(searchKey) {
    let filter = '';
    if (searchKey !== '') {
      filter = '&location_name=' + searchKey;
    }
    this.is_loading = true;

    this.locationService.getLocations(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, filter, false).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      console.log('Locs:', response);
      if (response.data) {
        const locations: any = response.data.location_list;
        this.prepareLocationList(locations);
      }
    });
  }

  prepareLocationList(locations) {
    locations.forEach(location => {
      const listItem = new ListItem();
      listItem.itemId = location.location_id;
      listItem.itemName = location.location_name;
      if (this.selectedDepartments) { // Edit existing Location
        // Check if Department is already part of Location
        listItem.isSelected = this.department.selectedLocations.filter((selectedLocation) => {
          return selectedLocation.location_id === location.location_id;
        }).length > 0;
      } else { // While adding new Location set all Departments selected by default
        listItem.isSelected = true;
      }
      this.selectedItems.push(listItem);
      this.prepareDataSourceForLocations.push(listItem);
    });
    this.showLocationMenu = true;
    this.cdRef.markForCheck();
  }

  selectedLocations(selectedLocations) {
    this.departmentForm.form.markAsDirty();
    this.selectedItems = selectedLocations ? selectedLocations : this.selectedItems;
  }

  updateLocations(searchKey) {
    this.getLocations(searchKey);
  }

  cancel() {
    this.dialogRef.close();
  }

  addDepartment() {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    const linked_locations = [];
    this.selectedItems.forEach(item => {
      linked_locations.push(item.itemId);
    });
    const addDepatmentPayload = {
      'department_name': this.department.name,
      'company_id': company_id,
      'link_locations': linked_locations
    };

    this.departmentService.addDepartment(addDepatmentPayload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.addAdminGoogleEvent('Departments_By_Add_Department');
      this.refreshDepartementList.emit();
      this.dialogRef.close();
    });

  }

  updateDepartment() {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();

    // Find newly linked locations
    const linked_locations = [];
    this.selectedItems.forEach(item => {
      if (this.old_list.indexOf(item.itemId) === -1) {
        linked_locations.push(item.itemId);
      }
    });

    // Find newly unlined locations
    const unlinked_locations = [];
    this.old_list.forEach(location_id => {
      let didFind = false;
      this.selectedItems.forEach(item => {
        if (item.itemId === location_id) {
          didFind = true;
        }
      });
      if (didFind === false) {
        unlinked_locations.push(location_id);
      }
    });

    const addDepatmentPayload = {
      'company_id': company_id,
      'link_locations': linked_locations,
      'unlink_locations': unlinked_locations
    };

    if (this.selectedDepartments.length < 2) {
      addDepatmentPayload['department_name'] = this.department.name;
    }

    const departmentIds = [];
    this.selectedDepartments.forEach(element => {
      departmentIds.push(element.department_id);
    });

    addDepatmentPayload['department_ids'] = departmentIds;

    this.departmentService.updateDepartment(addDepatmentPayload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.refreshDepartementList.emit();
      this.dialogRef.close();
    });

  }

  deleteDepartment(event) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_this_department');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText =  this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.departmentDeleted.emit(this.department.department_id);
      this.dialogRef.close();
    });
  }
  shouldDisableAction() {
    if (this.selectedItems.length === 0) {
      return true;
    } else {
      return (this.departmentPermissions && !this.departmentPermissions.edit &&
        this.selectedItems.length && !this.department.name);
    }
  }
}
