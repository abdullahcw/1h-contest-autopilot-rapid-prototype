import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from '../../../services/global/global.service';

@Component({
  selector: 'app-add-limits',
  templateUrl: './add-limits.component.html',
  styleUrls: ['./add-limits.component.scss']
})
export class AddLimitsComponent implements OnInit, OnChanges {
  allLocations: any;
  allDepartments: any;
  dataSourceLocations: any;
  dataSourceDepartments = [];
  selectedLocations = [];
  selectedDepartments = [];
  selectedTab = 0;
  limits = [];
  attempts;
  maxDate;
  limit_type;
  startDate: Date;
  endDate: Date;
  title = this.translate.instant('select_locs');
  nextButtonTitle = this.translate.instant('next_uppercase');
  backButtonTitle = this.translate.instant('cancel_uppercase');
  canGoNext = false;
  isDepartmentSelectionChanged = false;
  isUpdating = false;
  isDatePickerOpen = false;
  isMultipleAttempts = false;
  minDate = this.globalService.getCurrentDate();
  isFormInvalid = false;
  isAnyLocationSelected = true;
  shouldShowDepartmentFooter = false;
  isAnyDepartmentSelected = true;

  @Output() limitsUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() limitsCancel: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService,
    private datePipe: DatePipe,
    private globalService: GlobalService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    if (this.allLocations && this.allLocations.length) {
      this.prepareLocationsDataSource();
    }
    this.attempts =  this.limits.length ? this.limits[0].attempts : 1;
    for (let index = 1; index < this.limits.length; index++) {
      const limit = this.limits[index];
      if (this.attempts !== limit.attempts) {
        this.isMultipleAttempts = true;
        this.attempts = null;
        break;
      }
    }
    this.checkForMultipleProperties();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.allLocations) {
      this.allLocations = changes.allLocations.currentValue;
      if (this.allLocations && this.allLocations.length) {
        this.prepareLocationsDataSource();
      }
    }
  }

  startDateChanged() {
    if (this.endDate) {
      this.isFormInvalid = this.startDate > this.endDate;
    } else {
      this.isFormInvalid = false;
      for (let index = 0; index < this.limits.length; index++) {
        const limit = this.limits[index];
        if (this.startDate > limit.endDate) {
          this.isFormInvalid = true;
          break;
        }
      }
    }
  }

  endDateChanged() {
    if (this.endDate >= this.startDate) {
      this.isFormInvalid = false;
    }
  }

  checkForMultipleProperties() {
    this.checkForMultipleAttempts();
    this.checkForMultipleStartDates();
    this.checkForMultipleEndDates();
    this.checkForMultipleLimitValues();
  }

  prepareLocationsDataSource() {
    this.dataSourceLocations = [];
    this.allLocations.forEach(location => {
        // Check if all locations need to be selected
        const ds = {itemId: location.location_id,
          itemName: location.location_name,
          isSelected: false, userInfo: location};
        this.dataSourceLocations.push(ds);
    });
  }


  // List selection callback - Locations
  locationsSelected(selectedItems) {
    const filteredLocations = [];
    selectedItems.forEach(selectedItem => {
      for (let i = 0; i < this.allLocations.length; i++) {
        const location = this.allLocations[i];
          if (location.location_id === selectedItem.itemId) {
            filteredLocations.push(location);
            break;
          }
        }
    });
    this.selectedLocations = filteredLocations;
    this.canGoNext = this.selectedLocations.length > 0;
  }

   // List selection callback - Departments
   departmentsSelected(selectedDepartments) {
    this.selectedDepartments = selectedDepartments;
    this.isDepartmentSelectionChanged = true;
    this.canGoNext = this.selectedDepartments.length > 0;

    this.checkIfShouldShowDepartmentFooter();
  }

  next() {
    if (this.selectedTab === 0) {
      // Tapped next on location selection screen
      this.prepareLimits();
      this.prepareDepartmentsDataSource();
      this.canGoNext = false;
    } else if (this.selectedTab === 1) {
      // Tapped next on department selection screen
      if (this.isDepartmentSelectionChanged) {
        this.isDepartmentSelectionChanged = false;
        this.updateLimitsAsPerDepartmentSelection();
      }
    } else {
      this.applyScheduleToLimits();
      this.limitsUpdated.emit(this.limits);
      this.dialogRef.close();
    }
    this.selectedTab += 1;
    this.updateView();
  }

  applyScheduleToLimits() {
    this.limits.forEach(limit => {
      if (this.limit_type) {
        limit.limit_type = this.limit_type;
      }
      if (this.attempts) {
        limit.attempts = +this.attempts;
      }
      if (this.startDate) {
        limit.startDate = this.startDate;
        const start_date = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
        limit.start_date = start_date;
      }
      if (this.endDate) {
        const end_date = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
        limit.end_date = end_date;
        limit.endDate = this.endDate;
      }
    });
  }

  updateView() {
    switch (this.selectedTab) {
      case 0:
       this.title = this.translate.instant('select_locs');
       this.nextButtonTitle = this.translate.instant('next_uppercase');
       this.backButtonTitle = this.translate.instant('cancel_uppercase');
       break;
      case 1:
        this.title = this.translate.instant('select_depts');
        this.nextButtonTitle = this.translate.instant('next_uppercase');
        this.backButtonTitle = this.translate.instant('back_uppercase');
        break;
      default:
        this.title = this.translate.instant('schedule_game');
        this.nextButtonTitle = this.translate.instant('apply_uppercase');
        this.backButtonTitle = this.isUpdating ? this.translate.instant('cancel_uppercase') : this.translate.instant('back_uppercase');
        break;
    }
  }

  // Prepare Departments Data Source according to selected locations
  prepareDepartmentsDataSource() {
    const dsDepartments = [];
    const addedDeptIds = [];
    this.selectedLocations.forEach(location => {
      location.department_list.forEach(department => {
        if (addedDeptIds.indexOf(department.department_id) === -1) {
          addedDeptIds.push(department.department_id);
          const dsDepartment = {itemId: department.department_id, itemName: department.department_name};
          dsDepartments.push(dsDepartment);
        }
      });
    });
    this.dataSourceDepartments = dsDepartments;
  }

  // Prepare Limits Array as per location selection
  prepareLimits() {
    const limits = [];
    // Check if all locations are selected
    const startDate = this.globalService.getCurrentDate();
    const endDate = this.globalService.getCurrentDate();
    if (this.selectedLocations.length === this.allLocations.length && this.isAnyLocationSelected) {
      const limit = this.prepareLimit(-1, '[ All ]', startDate, endDate, null);
      limits.push(limit);
    } else {
      this.selectedLocations.forEach(selectedLocation => {
        const limit = this.prepareLimit(selectedLocation.location_id, selectedLocation.location_name, startDate, endDate,
          selectedLocation.tz_name);
        limits.push(limit);
      });
    }
    this.limits = limits;
  }

  prepareLimit(locationId, locationName, startDate, endDate, timezone, departmentId = null, departmentName = null) {
    const start_date = this.datePipe.transform(startDate, 'yyyy-MM-dd');
    const end_date = this.datePipe.transform(endDate, 'yyyy-MM-dd');
    const limit: any = {location_id: locationId, location_name : locationName,
    startDate: startDate, endDate: endDate,
    timezone: timezone,
    attempts: 1, limit_type: 'date_range_with_count',
    start_date: start_date, end_date: end_date};
    if (departmentId) {
      limit.department_id = departmentId;
    }
    if (departmentName) {
      limit.department_name = departmentName;
    }
    return limit;
  }

  updateLimitsAsPerDepartmentSelection() {
    // Check if all departments are selected
    const newLimits = [];
    this.limits.forEach(limit => {
      const location = this.findLocationWithId(limit.location_id);
      const shouldSelectAll = this.isAnyDepartmentSelected && this.checkIfAllDepartmentsAreSelected(location);
      if (shouldSelectAll) {
          limit.department_id = -1;
          limit.department_name = '[ All ]';
          newLimits.push(limit);
      } else {
        this.insertNewLimitsIfRequired(limit, location, newLimits);
      }
    });
    this.limits = newLimits;
  }

  checkIfAllDepartmentsAreSelected(location) {
    if (!location) {
      return this.selectedDepartments.length === this.dataSourceDepartments.length;
    }
    const existingArray = [];
    location.department_list.forEach(department => {
      existingArray.push(department.department_id);
    });

    const selectedDepartmentIds = [];
    this.selectedDepartments.forEach(selectedDepartment => {
      selectedDepartmentIds.push(selectedDepartment.itemId);
    });

    const shouldSelectAll = existingArray.every(function(val) { return selectedDepartmentIds.indexOf(val) >= 0; });
    return shouldSelectAll;
  }

  insertNewLimitsIfRequired(limit, location, newLimits) {
      this.selectedDepartments.forEach(selectedDepartment => {
        const newLimit = this.prepareLimit(limit.location_id, limit.location_name,
          limit.startDate, limit.endDate, limit.timezone, selectedDepartment.itemId, selectedDepartment.itemName);
        // Check if all locations are selected
        if (!location) {
          newLimits.push(newLimit);
        } else {
          if (location) {
            const doesDepartmentExist = this.checkIfDepartmentBelongsToLocation(location, selectedDepartment.itemId);
            if (doesDepartmentExist) {
              newLimits.push(newLimit);
            }
          }
        }
      });
  }

  findLocationWithId(locationId) {
    for (let i = 0; i < this.selectedLocations.length; i++) {
      const selectedLocation = this.selectedLocations[i];
        if (selectedLocation.location_id === locationId) {
          return selectedLocation;
        }
    }
    return null;
  }

  checkIfDepartmentBelongsToLocation(location, departmentId) {
    for (let i = 0; i < location.department_list.length; i++) {
      const department = location.department_list[i];
      if (department.department_id === departmentId) {
        return true;
      }
    }
    return false;
  }

  back() {
    if (this.selectedTab === 0 || (this.selectedTab === 2 && this.isUpdating)) {
      if (this.dataSourceLocations && this.dataSourceLocations.length) {
          this.dataSourceLocations.forEach(element => {
          element.isSelected = false;
        });
      }
      this.limitsCancel.emit();
      this.dialogRef.close();
    } else {
      this.selectedTab -= 1;
      this.canGoNext = true;
      this.updateView();
    }
    this.shouldShowDepartmentFooter = false;
  }

  // Utility methods
  checkForMultipleAttempts() {
    this.attempts =  this.limits.length ? this.limits[0].attempts : 1;
    for (let index = 1; index < this.limits.length; index++) {
      const limit = this.limits[index];
      if (this.attempts !== limit.attempts) {
        if (this.isMultipleAttempts) {
          this.isMultipleAttempts = true;
        }
        this.attempts = null;
        break;
      }
    }
  }

  checkForMultipleLimitValues() {
    this.limit_type =  this.limits.length ? this.limits[0].limit_type : 'date_range_with_count';
    for (let index = 1; index < this.limits.length; index++) {
      const limit = this.limits[index];
      if (this.limit_type !== limit.limit_type) {
        this.limit_type = null;
        break;
      }
    }
  }

  checkForMultipleStartDates() {
    const date =  this.limits.length ? this.limits[0].start_date : this.datePipe.transform(this.globalService.getCurrentDate(),
    'yyyy-MM-dd');
    let didFind = false;
    for (let index = 1; index < this.limits.length; index++) {
      const limit = this.limits[index];
      if (date !== limit.start_date) {
        didFind = true;
        this.startDate = null;
        break;
      }
    }
    if (!didFind) {
      this.startDate = this.globalService.formatDate(date, true);
    }
  }

  checkForMultipleEndDates() {
    const date =  this.limits.length ? this.limits[0].end_date : this.datePipe.transform(this.globalService.getCurrentDate(), 'yyyy-MM-dd');
    let didFind = false;
    for (let index = 1; index < this.limits.length; index++) {
      const limit = this.limits[index];
      if (date !== limit.end_date) {
        didFind = true;
        this.endDate = null;
        break;
      }
    }
    if (!didFind) {
      this.endDate = this.globalService.formatDate(date, true);
    }
  }

  checkIfShouldShowDepartmentFooter() {
    for (let index = 0; index < this.limits.length; index++) {
      const limit = this.limits[index];
      const location = this.findLocationWithId(limit.location_id);
      this.shouldShowDepartmentFooter = this.checkIfAllDepartmentsAreSelected(location);
      if (this.shouldShowDepartmentFooter) {
        break;
      }
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
