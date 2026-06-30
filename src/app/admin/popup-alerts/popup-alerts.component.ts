import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'src/app/services/company/company.service';
import { Constants } from 'src/app/services/network/api.service';
import { FileHandle } from 'src/app/util/drag-drop/drag-drop.directive';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { MatDialog } from '@angular/material/dialog';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { StorageService } from 'src/app/services/storage/storage.service';
import { environment } from 'src/environments/environment';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
@Component({
  selector: 'app-popup-alerts',
  templateUrl: './popup-alerts.component.html',
  styleUrls: ['./popup-alerts.component.scss']
})
export class PopupAlertsComponent implements OnInit {
  selectedTab = 0;
  dataSource: any;
  is_loading: boolean = false;
  totalAlerts: any;
  noOfItemsPerPage: number;
  pageSizeOptions: number[];
  displayedColumns = ['alerts', 'title', 'type', 'start_date', 'end_date'  ,'action'];
  actionList = [];
  alertData = null;
  isDatePickerOpen = false;  
  delegateSubscription: any;
  constructor(public translate: TranslateService,
    public globalService: GlobalService,
    private dialog: MatDialog,
    private delegateService: DelegateService,    
    private uploaderService: UploaderService,
    public storageService: StorageService,
    private notificationService: NotificationsService,
    private companyService: CompanyService) { 
      this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
     this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

     this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      // isMultilevelTab   
      this.selectedTab = 0;
      this.getAlertsList();   
    });

    }

  ngOnInit(): void {   
    this.getAlertsList();
  }

  getLocationsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    const startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getAlertsList(startLimit);
  }

  sortData(sort) {
    // switch (sort.active) {
    //   case 'location':
    //     this.sort.sortBy = Constants.LOCATION_NAME;
    //     break;
    //   case 'country':
    //     this.sort.sortBy = Constants.COUNTRY_NAME;
    //     break;
    //   case 'state':
    //     this.sort.sortBy = Constants.STATE_NAME;
    //     break;
    //   case 'city':
    //     this.sort.sortBy = Constants.CITY;
    //     break;
    //   case 'timezone':
    //     this.sort.sortBy = Constants.TIME_ZONE_NAME;
    //     break;
    // }
    // this.sort.order = sort.direction;
    // this.getLocations(this.startLimit);
  }

  getAlertsList(startLimit = 0) {  
    this.notificationService.alert_id = null;
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    const loginUser = JSON.parse(this.storageService.getUser());
    console.log(loginUser)
    this.notificationService.getAlerts(company_id,loginUser.manager_id,startLimit,
      this.noOfItemsPerPage).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        console.log(response)
        this.is_loading = false;
        this.dataSource = new MatTableDataSource(response.data.alert_list);
        this.totalAlerts = response.data?.total_count;

      }
    });
  }

  switchTab(index) {
    this.selectedTab = index;    
    if(this.selectedTab == 0){
      this.getAlertsList();
      this.globalService.addAdminGoogleEvent('Scheduled_Alerts_Tab_Clicked');
    }else{
      this.globalService.addAdminGoogleEvent('Add/Edit_Tab_Clicked');
    }

  }

  redirectToAlerts(event){
    this.selectedTab = 0;
  }

  goToEdit(alert){    
    this.globalService.addAdminGoogleEvent('Edit_Clicked');    
    this.alertData = alert;
    this.notificationService.alert_id = alert.alert_id;
    this.selectedTab = 1;

  }

  disable(alert,disable_status){    
    // this.is_loading = true;
    this.globalService.addAdminGoogleEvent('Disable_Clicked');
    this.notificationService.disableAlert(alert.alert_id,disable_status).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        // this.is_loading = false;
        this.getAlertsList();
      }
    });
  }

}
