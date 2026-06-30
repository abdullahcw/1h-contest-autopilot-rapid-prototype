import { Component, OnInit, Output, EventEmitter, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/services/global/global.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { ApiService } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { ESCAPE } from '@angular/cdk/keycodes';
@Component({
  selector: 'app-change-department',
  templateUrl: './change-department.component.html',
  styleUrls: ['./change-department.component.scss']
})
export class ChangeDepartmentComponent implements OnInit {


  departments: any = [];
  locations: any = [];
  departmentToBeAssigned = -1;
  locationToBeAssigned = -1;

  department = {
    'isUpdating': false,
    'location_id': '',
    'department_id': '',
    'department_name': ''
  };

  companyId = -1;
  is_loading = false;

  @Output() refreshPlayerList: EventEmitter<any> = new EventEmitter();
  readonly separatorKeysCodes: number[] = [ESCAPE];
  loginUser: any;
  constructor(public globalService: GlobalService, public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public selectedPlayerIds: any, public playerService: PlayerService, public locationService: LocationService,
    public apiService: ApiService, public storageService: StorageService, public departmentService: DepartmentService,
    public translate: TranslateService) {
    dialogRef.disableClose = true;
  }

  @HostListener('window:keydown', ['$event']) closeOnEscape(event) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  ngOnInit() {
    this.companyId = +this.storageService.getCompanyId();
    this.is_loading = true;
    this.getLocations();
  }

  getLocations() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.locationService.getLocations(this.storageService.getCompanyId(), 'location_name', 'asc', 0, 0, filters, false).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) { return; }
      this.locations = [];
      console.log(response.data.location_list);
      this.locations = response.data.location_list;
    });
  }

  onLocationChange(locationId) {
    // Clear department on location change
    console.log('location change: ' + JSON.stringify(location));
    this.department.location_id = locationId;
    this.departments = [];
    this.department.department_id = '';
    this.getDepartmentsByLocation(this.department.location_id);
  }

  onDepartmentChange(departmentId) {
    console.log('Department change: ' + JSON.stringify(departmentId));
    this.department.department_id = departmentId;


  }

  getDepartmentsByLocation(locationId) {
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.is_loading = true;
    this.departmentService.getDepartmentByLocation(this.storageService.getCompanyId(), 'department_name', 'asc',
      locationId, null, filters)
      .subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          return;
        }
        this.departments = [];
        this.departments = response.data.department_list;
        console.log(this.departments);
      });
  }

  updatePlayersDepartment() {
    console.log('update dept');
    const payload = {
      'company_id': this.companyId, 'player_ids': this.selectedPlayerIds, 'department_id': this.department.department_id,
      'location_id': this.department.location_id
    };
    this.department.isUpdating = true;
    this.is_loading = true;
    this.playerService.bulkUpdate(payload).subscribe((res) => {
      this.is_loading = false;
      this.department.isUpdating = false;
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('players_dept_update_error'));
        return;
      }
      this.refreshPlayerList.emit();
      this.dialogRef.close();
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
