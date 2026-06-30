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
  selector: 'app-reactivate-vipcode',
  templateUrl: './reactivate-vipcode.component.html',
  styleUrls: ['./reactivate-vipcode.component.scss']
})
export class ReactivateVIPcodeComponent implements OnInit {
  loginUser;
  // locations = [];
  // locationList = [];
  // departments = [];
  // preparedDepartmentList = [];
  // fetchLoc = false;
  // fetchDept = false;
  vipcodeobj = {
    new_expiry_date: '',
  };

  tomorrow;
  today;
  is_loading = false;
  isDatePickerOpen = false;
  datePlaceHolder;
  // errorMessage = '';
  vipcodedata
  constructor(public translate: TranslateService,
    private dialogRef: MatDialogRef<any>,
    public vipCodeService: VipCodeService,
    private datePipe: DatePipe,
    private globalService: GlobalService,
    private storageService: StorageService,
  ) {
    this.datePlaceHolder = this.translate.instant('date_format_mmddyyyy');
  }
  


  ngOnInit() {
    console.log(this.vipcodedata)
    this.today = this.globalService.getCurrentDate();
    const todaysDate = new Date();
    todaysDate.setDate(todaysDate.getDate() + 1);
    this.tomorrow = todaysDate;
    this.loginUser = JSON.parse(this.storageService.getUser());
    
  }


  cancel() {
    this.dialogRef.close(false);
  }

  actionConfirmed() {
    // console.log(this.vipcodeobj)
    this.reactivateVIPCode();
  }

  reactivateVIPCode() {
    this.is_loading = true;
    this.vipcodeobj['company_id'] = this.vipcodedata.company_id;
    this.vipcodeobj['modified_by'] = this.loginUser.manager_id;
    this.vipcodeobj['vip_code_id'] = this.vipcodedata.vip_code_id;
    this.vipcodeobj.new_expiry_date = moment(this.vipcodeobj.new_expiry_date).format(DATE_FORMAT);    
    this.vipCodeService.reactivateVipCodes(this.vipcodeobj).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        // if (response.message_code === 'VIP_CODE_EXISTS') {
        //   this.is_loading = false;
        // }
        return;
      }
      // this.globalService.addAdminGoogleEvent('VIP_Code_By_VIP_Code_Created');
      this.is_loading = false;
      // this.globalService.showMessage('VIP Code Reactivated!');
      this.globalService.showMessage(this.translate.instant('reactivate_vip_message'), 'right', 'bottom');      
      this.dialogRef.close(true);
    });
  }

  // getLocations() {
  //   this.is_loading = true;
  //   this.fetchLoc = true;
  //   this.locationService.getLocations(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, null, false).subscribe((res) => {
  //     const response: any = res;

  //     if (!response.success) { return; }
  //     this.is_loading = false;
  //     this.locations = [];
  //     this.locations = response.data.location_list;
  //     this.prepareLocationListForSearchSelectComponent();
  //     this.locations.filter(location => {
  //       if (location.head_location) {
  //         this.onLocationChange(location.location_id);
  //       }
  //     });
  //   });
  // }

  // prepareLocationListForSearchSelectComponent() {
  //   this.locationList = [];
  //   const locLength = this.locations.length;
  //   this.locations.forEach(loc => {
  //     this.locationList.push({ id: loc.location_id, title: loc.location_name });
  //     this.fetchLoc = locLength === this.locationList.length ? false : true;
  //   });
  // }



  // onLocationChange(locationId) {
  //   this.vipcodeobj.location_id = locationId;
  //   this.departments = [];
  //   this.vipcodeobj.department_id = '';
  //   this.getDepartmentsByLocation(locationId);
  // }

  // getDepartmentsByLocation(locationId) {
  //   this.fetchDept = true;
  //   const filters = 'manager_id=' + this.loginUser.manager_id;
  //   this.departmentService.getDepartmentByLocation(this.storageService.getCompanyId(), 'department_name', 'asc',
  //     locationId, null, filters, false)
  //     .subscribe((res) => {
  //       const response: any = res;
  //       this.fetchDept = false;

  //       if (!response.success) {
  //         return;
  //       }
  //       this.departments = [];
  //       this.preparedDepartmentList = [];
  //       this.departments = response.data.department_list;
  //       this.prepareDepartmentListForMultiSelectComponent(this.departments);
  //     });

  // }

  // prepareDepartmentListForMultiSelectComponent(departments, forceSelected = false) {
  //   departments.forEach(dept => {
  //     this.preparedDepartmentList = [...this.preparedDepartmentList,
  //     { id: dept.department_id, title: dept.department_name, isSelected: forceSelected }];
  //   });
  // }


  // onDepartmentChange(departmentId) {
  //   this.vipcodeobj.department_id = departmentId;
  // }



  
  // inputChanged(event) {
  //   if (event) {
  //     this.errorMessage = '';
  //   }
  // }
  // shouldDisable() {
  //   return (!this.vipcodeobj.location_id || !this.vipcodeobj.department_id || !!this.errorMessage);
  // }

}
