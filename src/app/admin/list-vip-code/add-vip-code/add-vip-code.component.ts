import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { DatePipe } from '@angular/common';
import { GlobalService } from 'src/app/services/global/global.service';
import { MatDialogRef } from '@angular/material/dialog';
import { VipCodeService } from 'src/app/services/vip-code/vip-code.service';
import moment from 'moment-timezone';
import { ApiService } from 'src/app/services/network/api.service';
const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-add-vip-code',
  templateUrl: './add-vip-code.component.html',
  styleUrls: ['./add-vip-code.component.scss']
})
export class AddVipCodeComponent implements OnInit {
  loginUser;
  locations = [];
  locationList = [];
  departments = [];
  preparedDepartmentList = [];
  fetchLoc = false;
  fetchDept = false;
  vipcodeobj = {
    location_id: '',
    department_id: '',
    expiry_set_on: '',
    vip_code: ''
  };

  tomorrow;
  today;
  is_loading = false;
  isDatePickerOpen = false;
  datePlaceHolder;
  errorMessage = '';
  constructor(public translate: TranslateService,
    private dialogRef: MatDialogRef<any>,
    private departmentService: DepartmentService,
    public vipCodeService: VipCodeService,
    private datePipe: DatePipe,
    private globalService: GlobalService,
    private storageService: StorageService,
    private apiService: ApiService,
    private locationService: LocationService
  ) {
    this.datePlaceHolder = this.translate.instant('date_format_mmddyyyy');
  }

  ngOnInit() {
    this.today = this.globalService.getCurrentDate();
    const todaysDate = new Date();
    todaysDate.setDate(todaysDate.getDate() + 1);
    this.tomorrow = todaysDate;
    this.loginUser = JSON.parse(this.storageService.getUser());
    this.getLocations();
  }

  getLocations() {
    this.is_loading = true;
    this.fetchLoc = true;
    this.locationService.getLocations(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, null, false).subscribe((res) => {
      const response: any = res;

      if (!response.success) { return; }
      this.is_loading = false;
      this.locations = [];
      this.locations = response.data.location_list;
      this.prepareLocationListForSearchSelectComponent();
      this.locations.filter(location => {
        if (location.head_location) {
          this.onLocationChange(location.location_id);
        }
      });
    });
  }

  prepareLocationListForSearchSelectComponent() {
    this.locationList = [];
    const locLength = this.locations.length;
    this.locations.forEach(loc => {
      this.locationList.push({ id: loc.location_id, title: loc.location_name });
      this.fetchLoc = locLength === this.locationList.length ? false : true;
    });
  }



  onLocationChange(locationId) {
    this.vipcodeobj.location_id = locationId;
    this.departments = [];
    this.vipcodeobj.department_id = '';
    this.getDepartmentsByLocation(locationId);
  }

  getDepartmentsByLocation(locationId) {
    this.fetchDept = true;
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.departmentService.getDepartmentByLocation(this.storageService.getCompanyId(), 'department_name', 'asc',
      locationId, null, filters, false)
      .subscribe((res) => {
        const response: any = res;
        this.fetchDept = false;

        if (!response.success) {
          return;
        }
        this.departments = [];
        this.preparedDepartmentList = [];
        this.departments = response.data.department_list;
        this.prepareDepartmentListForMultiSelectComponent(this.departments);
      });

  }

  prepareDepartmentListForMultiSelectComponent(departments, forceSelected = false) {
    departments.forEach(dept => {
      this.preparedDepartmentList = [...this.preparedDepartmentList,
      { id: dept.department_id, title: dept.department_name, isSelected: forceSelected }];
    });
  }


  onDepartmentChange(departmentId) {
    this.vipcodeobj.department_id = departmentId;
  }


  cancel() {
    this.dialogRef.close(false);
  }

  actionConfirmed() {
    this.createVIPCode();
  }

  createVIPCode() {
    this.is_loading = true;
    this.vipcodeobj['company_id'] = this.storageService.getCompanyId();
    this.vipcodeobj.expiry_set_on = moment(this.vipcodeobj.expiry_set_on).format(DATE_FORMAT);
    this.vipCodeService.createVipCodes(this.vipcodeobj).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'VIP_CODE_EXISTS') {
          this.errorMessage = this.apiService.getErrorMessage(response.message_code);
          this.is_loading = false;
        }
        return;
      }
      this.globalService.addAdminGoogleEvent('VIP_Code_By_VIP_Code_Created');
      this.is_loading = false;
      this.globalService.showMessage(this.translate.instant('added_vip_message'), 'right', 'bottom');
      this.dialogRef.close(true);
    });
  }
  inputChanged(event) {
    if (event) {
      this.errorMessage = '';
    }
  }
  shouldDisable() {
    return (!this.vipcodeobj.location_id || !this.vipcodeobj.department_id || !!this.errorMessage);
  }
}
