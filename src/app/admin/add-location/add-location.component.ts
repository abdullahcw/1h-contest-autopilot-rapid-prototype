import { Component, OnInit, Inject, EventEmitter, Output, HostListener, ViewChild } from '@angular/core';
import { CompanyService } from '../../services/company/company.service';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { LocationService } from '../../services/location/location.service';
import { StorageService } from '../../services/storage/storage.service';
import { Location } from '../../services/location/location.service';
import { DepartmentService } from '../../services/department/department.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ListItem } from 'src/app/shared/list-selection/list-selection.component';
import { ESCAPE } from '@angular/cdk/keycodes';
import { PermissionsKey, PermissionsService } from 'src/app/services/permissions/permissions.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

declare let $: any;

@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.scss']
})
export class AddLocationComponent implements OnInit {
  countries = [];
  states = [];
  timezones = [];
  departments = [];
  showDepartmentMenu = false;
  prepareDataSourceForDepartments = [];
  is_loading = false;
  loadingCount = 0;
  location = new Location();
  onSuccess = new EventEmitter();
  dataSource;
  timeZoneList = [];
  countryList = [];
  stateList = [];
  selectedLocations = [];
  titleToBeDisplayed = '';
  dropdownList = [];
  selectedItems = [];
  old_list = [];
  searchPlaceHolder = '';
  editableItems = ['all'];
  locationPermission: any;
  isHeadLocation = false;
  selectedTab = 0;
  deptByLocation = [];
  @Output() locationDeleted: EventEmitter<any> = new EventEmitter();
  @ViewChild('addLocationForm', { static: true }) addLocationForm: NgForm;
  readonly separatorKeysCodes: number[] = [ESCAPE];
  loginUser: any;
  constructor(public companyService: CompanyService,
    public authService: StorageService,
    public locationService: LocationService,
    public departmentService: DepartmentService,
    public dialogRef: MatDialogRef<any>,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public translate: TranslateService,
    public globalService: GlobalService,
    public permissionService: PermissionsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
  }
  @HostListener('window:keydown', ['$event']) closeOnEscape(event) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  ngOnInit() {
    console.log('this.data',this.data)
    if(this.data.title == 'Edit Location'){
    this.getDepartmentsByLocation(this.data['locations'][0]['location_id']);
    }else{
      this.loadDataOfNgonit();
    }
  }
  loadDataOfNgonit() {
    this.addLocationForm.form.markAsPristine();
    const { locations } = this.data;

      this.selectedLocations = locations;
      this.searchPlaceHolder = this.translate.instant('search');

      if (this.selectedLocations) {
        this.isHeadLocation = this.selectedLocations[0]['head_location'];

        const [loc] = this.selectedLocations;
        loc.department_list = this.deptByLocation;

        console.log('this.selectedLocations.length', this.selectedLocations.length);
        console.log('loc.department_list', loc.department_list);

        if (this.selectedLocations.length < 2) {
          this.location = {
            name: loc.location_name,
            city: loc.city,
            country_id: loc.country_id,
            country_name: loc.country_name,
            state_id: loc.state_id,
            state_name: loc.state_name,
            location_id: loc.location_id,
            tz_name: loc.tz_name,
            tz_id: loc.tz_id,
            head_location: loc.head_location,
            selectedDepartments: loc.department_list
          };

          if (loc.department_list) {
            this.selectedItems = loc.department_list.map(department => ({
              itemId: department.department_id,
              itemName: department.department_name
            }));

            this.old_list = loc.department_list.map(department => department.department_id);
          }
        } else {
          this.location.name = this.selectedLocations.map(element => element.location_name).join(', ');
        }

        this.setLocationPermission();
      }

    this.getCountries();
    this.getTimezones();
    if (this.location.country_id) {
      this.getStates(this.location.country_id);
    }
    this.getDepartments('');
  }
  setLocationPermission() {
    this.locationPermission = this.permissionService.getPermissions(PermissionsKey.LOCATION);
  }
  canEdit(key) {
    return this.editableItems.indexOf('all') !== -1 || this.editableItems.indexOf(key) !== -1;
  }

  getCountries() {
    this.loadingCount++;
    this.locationService.getCountries().subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.countries = response.data.countries;
        this.countryList = [];
        this.countries.forEach(element => {
          this.countryList.push({ id: element.country_id, title: element.country_name });
        });
        this.location.country_name = this.countries.filter((country) => {
          return country.country_id === this.location.country_id;
        })[0] || '';
      }
      this.loadingCount--;
    });
  }

  getStates(countryId) {
    this.loadingCount++;
    this.locationService.getStates(countryId).subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.states = response.data.states;
        if (this.states && !this.location.state_id) {
          this.location.state_id = null;
          this.location.state_name = null;
        }

        this.stateList = [];
        this.states.forEach(element => {
          this.stateList.push({ id: element.state_id, title: element.state_name });
        });

        this.location.state_name = this.states.filter((timezone) => {
          return timezone.state_id === this.location.state_id;
        })[0] || '';
      }
      this.loadingCount--;
    });
  }

  onCountrySelectionChanged(countryId) {
    const filteredCountries = this.countries.filter(country => {
      return country.country_id === countryId;
    });
    if (filteredCountries.length) {
      this.location.country_name = filteredCountries[0].country_name;
      this.location.country_id = countryId;
      this.location.state_id = null;
      this.getStates(countryId);
    }
    this.addLocationForm.form.markAsDirty();
  }

  onStateSelectionChanged(stateId) {
    const filteredStates = this.states.filter(state => {
      return state.state_id === stateId;
    });
    if (filteredStates.length) {
      this.location.state_name = filteredStates[0].state_name;
      this.location.state_id = stateId;
    }
    this.addLocationForm.form.markAsDirty();
  }

  getTimezones() {
    this.loadingCount++;
    this.locationService.getTimeZone().subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.timezones = response.data.timezone_list;

        this.timeZoneList = [];
        this.timezones.forEach(timezone => {
          this.timeZoneList.push({ id: timezone.tz_id, title: timezone.tz_name, subtitle: timezone.tz_unit });
        });

        this.location.tz_name = this.timezones.filter((timezone) => {
          return timezone.tz_id === this.location.tz_id;
        })[0] || '';
      }
      this.loadingCount--;
    });
  }

  onTimeZoneSelectionChanged(timezoneId) {
    const filteredTimezone = this.timezones.filter(timezone => {
      return timezone.tz_id === timezoneId;
    });
    if (filteredTimezone.length) {
      this.location.tz_name = filteredTimezone[0].tz_name;
      this.location.tz_id = timezoneId;
    }
    this.addLocationForm.form.markAsDirty();
  }

  updateDepartments(searchKey) {
    this.getDepartments(searchKey);
  }

  getDepartments(searchKey) {
    let filter = '';
    if (searchKey !== '') {
      filter = '&department_name=' + searchKey;
    }
    this.loadingCount++;
    this.departmentService.getDepartments(this.authService.getCompanyId(), 'department_name', 'asc', 0, 0, filter, false).subscribe((res) => {
      const response: any = res;
      if (response.success && response.data) {
        this.departments = response.data.department_list;
        this.prepareDepartmentList();
      }
      this.loadingCount--;
    });
  }

  prepareDepartmentList() {
    this.departments.forEach(department => {
      const listItem = new ListItem();
      listItem.itemId = department.department_id;
      listItem.itemName = department.department_name;
      if (this.selectedLocations) {
        // Check if Department is already part of Location
        listItem.isSelected = this.location.selectedDepartments.filter((selectedDept) => {
          return selectedDept.department_id === department.department_id;
        }).length > 0;
      } else { // While adding new Location set all Departments selected by default
        listItem.isSelected = true;
        this.selectedItems.push(listItem);
      }
      this.prepareDataSourceForDepartments.push(listItem);
    });
    this.showDepartmentMenu = true;
  }

  cancel() {
    this.dialogRef.close();
  }

  selectedDepartments(selectedDept) {
    this.addLocationForm.form.markAsDirty();
    this.selectedItems = selectedDept ? selectedDept : this.selectedItems;
  }

  addLocation() {
    this.is_loading = true;
    const company_id = this.authService.getCompanyId();
    const linked_departments = [];
    this.selectedItems.forEach(item => {
      linked_departments.push(item.itemId);
    });
    let payload = {
      'location_name': this.location.name,
      'company_id': +company_id,
      'tz_id': +this.location.tz_id,
      'city': this.location.city,
      'country_id': +this.location.country_id,
      'state_id': +this.location.state_id,
      'link_departments': linked_departments
    };
    payload = this.globalService.removeEmptyFields(payload);
    this.locationService.addLocation(payload, company_id).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(response.message);
        this.loadingCount = 0;
        this.is_loading = false;
        this.dialogRef.close();
        return;
      }
      this.globalService.addAdminGoogleEvent(`Locations_By_Basic_Details_Added_${this.selectedTab}`);
      this.globalService.addAdminGoogleEvent(`Locations_By_Departments_Details_Added_${this.selectedTab}`);
      this.onSuccess.emit();
      this.dialogRef.close();
      this.loadingCount = 0;
      this.is_loading = false;
    });
  }

  updateLocation() {
    // Find newly linked departments
    const linked_departments = [];
    this.selectedItems.forEach(item => {
      if (this.old_list.indexOf(item.itemId) === -1) {
        linked_departments.push(item.itemId);
      }
    });

    // Find newly unlinked departments
    const unlinked_departments = [];
    this.old_list.forEach(department_id => {
      let didFind = false;
      this.selectedItems.forEach(item => {
        if (item.itemId === department_id) {
          didFind = true;
        }
      });
      if (didFind === false) {
        unlinked_departments.push(department_id);
      }
    });
    this.is_loading = true;
    const company_id = this.authService.getCompanyId();

    const locationIds = [];
    this.selectedLocations.forEach(element => {
      locationIds.push(element.location_id);
    });

    const payload = {
      'location_ids': locationIds,
      'company_id': +company_id,
      'tz_id': +this.location.tz_id,
      'city': this.location.city,
      'country_id': +this.location.country_id,
      'state_id': +this.location.state_id,
      'link_departments': linked_departments,
      'unlink_departments': unlinked_departments
    };

    if (this.selectedLocations.length < 2) {
      payload['location_name'] = this.location.name;
    }

    this.locationService.updateLocation(payload, +company_id).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(response.message);
        this.dialogRef.close();
        return;
      }
      this.globalService.addAdminGoogleEvent(`Locations_By_Basic_Details_Edited_${this.selectedTab}`);
      this.globalService.addAdminGoogleEvent(`Locations_By_Departments_Details_Edited_${this.selectedTab}`);
      this.companyService.notifiyCompanySearchModule();
      this.onSuccess.emit();
      this.dialogRef.close();
      this.loadingCount = 0;
      this.is_loading = false;
    });
  }

  shouldDisableAction() {
    if (this.selectedLocations && this.selectedLocations.length > 1) {
      return !this.selectedItems.length && !this.location.tz_name && !this.location.country_name &&
        !this.location.state_name && !this.location.city;
    } else {
      return (!this.location.tz_name || !this.location.name);
    }
  }
  deleteLocation(event) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_this_location');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.locationDeleted.emit(this.location.location_id);
      this.dialogRef.close();
    });
  }
  getDepartmentsByLocation(locationId) {
    const company_id = this.authService.getCompanyId();
    this.loginUser = JSON.parse(this.authService.getUser());
    const filters = null;
    const locationIds = null;
    this.departmentService.getDepartmentByLocation(company_id, 'department_name', 'asc',
      locationId, locationIds, filters, false)
      .subscribe((res) => {
        const response: any = res;
        if (!response.success) {
          this.loadDataOfNgonit();
          return;
        }
        this.deptByLocation = response.data.department_list;
        this.loadDataOfNgonit();
       
      });
  }
}
