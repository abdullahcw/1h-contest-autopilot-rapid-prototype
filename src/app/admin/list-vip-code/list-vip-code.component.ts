import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Constants, ApiService, PlaceholderText } from 'src/app/services/network/api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { VipCodeService, VipCode } from 'src/app/services/vip-code/vip-code.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { DatePipe } from '@angular/common';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { ReactivateVIPcodeComponent } from './reactivate-vipcode/reactivate-vipcode.component';
import { AddVipCodeComponent } from './add-vip-code/add-vip-code.component';
import { CompanyQRCodeComponent } from '../company-qrcode/company-qrcode.component';
export enum Status {
  EXPIRED = 'EXPIRED',
  LIVE = 'LIVE'
}
@Component({
  selector: 'app-list-vip-code',
  templateUrl: './list-vip-code.component.html',
  styleUrls: ['./list-vip-code.component.scss']
})


export class ListVipCodeComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  companySettingPermission: any;
  vipCodePermission: any = {};
  startLimit = 0;
  pageIndex = 0;
  totalUsers = 0;
  noOfItemsPerPage: number;
  pageSizeOptions;
  is_loading = false;
  appliedFilters = [];
  vip_code_list: any;
  userDataSource: any;
  displayedColumns: string[] = ['vip_code', 'location_name', 'department_name', 'vip_code_created_on', 'vip_code_expired_on',
    'status','action'];
  vipCodeData: any;
  totalVipCode: any;
  totalVipCodeSelected = false;
  allowMultiSelect = true;
  menuList = [];
  locationList = [];
  departmentList = [];
  context = 'vipCode';
  selectedVipCode: VipCode;
  delegateSubscription: any;
  selection = new SelectionModel<VipCode>(this.allowMultiSelect, []);
  vipCodeStatusList = [{ 'id': 'LIVE', 'value': this.translate.instant('live') },
  { 'id': 'EXPIRED', 'value': this.translate.instant('expired') }];
  filter_options = [
    {
      'filter': Constants.VIP_CODE, value: this.translate.instant('code'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.VIP_CODE
    },
    {
      'filter': Constants.LOCATION_IDS, value: this.translate.instant('locations'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.LOCATION_NAME, 'is_multi_selection': true, 'is_generic_menu': true,
    },
    {
      'filter': Constants.DEPARTMENT_IDS, value: this.translate.instant('department'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.DEPARTMENT_NAME, 'is_multi_selection': true, 'is_generic_menu': true
    },
    {
      'filter': Constants.STATUS, value: this.translate.instant('status'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.STATUS, 'is_generic_menu': true
    }
  ];
  loginUser: any;

  constructor(
    public vipCodeService: VipCodeService,
    public dialog: MatDialog,
    public globalService: GlobalService,
    public locationService: LocationService,
    public departmentService: DepartmentService,
    public activatedRoute: ActivatedRoute,
    public apiService: ApiService,
    private datePipe: DatePipe,
    public permissionService: PermissionsService,
    public translate: TranslateService,
    public storageService: StorageService,
    public delegateService: DelegateService,
    public router: Router,
    private cdRef: ChangeDetectorRef) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('vipcodes') !== -1) {
        this.locationList = [];
        this.departmentList = [];
        this.getVipData();
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
  }

  ngOnInit() {
    this.setVipCodePermission();
    // for on referesh
    this.globalService.permissionReceived$.subscribe(res => {
      this.setVipCodePermission();
    });
    this.getVipData();
    this.selectedVipCode = new VipCode();
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  refreshListOnFilterChange(filters) {

    this.storeFilters(filters);
  }
  setVipCodePermission() {
    this.vipCodePermission = this.permissionService.getPermissions(PermissionsKey.VIP_CODE);
  }
  allowDeactivate() {

    if (this.selection.selected.length === 1) {
      if (this.selection.selected[0] && this.selection.selected[0].status == Status.LIVE) {
        return true;
      }
    }
    return false;
  }
  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, filters);
    this.getVipData();
  }
  addVIPcode() {
    const dialogRef = this.dialog.open(AddVipCodeComponent, {
      data: ''
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getVipData();
      }
    });
  }

  reactivateVipCodeDialog(vipCodeData){
    const dialogReference = this.dialog.open(ReactivateVIPcodeComponent, {
    });
    dialogReference.componentInstance.vipcodedata = vipCodeData;
    dialogReference.afterClosed().subscribe(result => {
      if (result) {
        this.getVipData();
      }
      this.globalService.addAdminGoogleEvent('VIP_Reactivate_Tab_Clicked');
    });

  }
  deactivateVipCodeDialog(vipCodeData) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
    });
    dialogReference.componentInstance.title = this.translate.instant('confirm_action');
    dialogReference.componentInstance.message = this.translate.instant('confirm_expired_vip_code');
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogReference.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.deactiveVipCode(vipCodeData);
    });
  }

  deactiveVipCode(vipCodeData) {
    const vipCodeId = [];
    vipCodeId.push(vipCodeData.vip_code_id);
    const companyId = this.storageService.getCompanyId();
    const payload = {
      'vip_code_ids': vipCodeId,
      'status': Status.EXPIRED,
      'company_id': companyId,
    };
    this.vipCodeService.deactivateVipCode(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      this.globalService.addAdminGoogleEvent('VIP_Expire_Tab_Clicked');
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant(this.apiService.getErrorMessage(response.message_code)));
        return;
      }
      this.globalService.showMessage(this.translate.instant('expired_vip_message'), 'right', 'bottom');      
      this.getVipData();
    });
   
  }

  getVipData() {
    this.is_loading = true;
    const filters = this.storageService.getFilterFromStroage(this.context) || '';
    const companyId = this.storageService.getCompanyId();
    this.vipCodeService.getVipCodes(companyId, this.sort.sortBy, this.sort.order,
      this.startLimit, this.noOfItemsPerPage, filters).subscribe(res => {
        const response: any = res;
        if (!response.success) {
          return;
        }
        this.totalVipCode = response.data.vip_code_list_count;
        this.is_loading = false;
        if (this.totalVipCode) {
          this.vipCodeData = response && response.data && response.data.vip_code_list;
          this.userDataSource = new MatTableDataSource(this.vipCodeData);
        } else {
          this.vipCodeData = '';
          this.userDataSource = '';
        }
      });
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userDataSource.data.length;
    return numSelected === numRows && numSelected;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.userDataSource.data.filter((element) => {
        return true;
      }).forEach(row => this.selection.select(row));
    // reset allPlayerSelection
    if (!this.isAllSelected()) {
      this.totalVipCodeSelected = false;
    }
  }
  getDataSource(filterName) {
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.getLocations();
        break;
      case Constants.DEPARTMENT_IDS:
        this.getDepartments();
        break;
      case Constants.STATUS:
        this.menuList = [];
        this.menuList = this.vipCodeStatusList;
        break;
    }
  }
  getLocations() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    this.locationService.getLocations(this.storageService.getCompanyId(),
      Constants.LOCATION_NAME, 'asc', 0, 0, null, false).subscribe((res) => {
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
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.departmentService.getDepartments(this.storageService.getCompanyId(), 'department_name', 'asc', 0, 0, filters, false).subscribe((res) => {
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
      const filterInfo = { 'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': 'Department' };
      this.departmentList = this.globalService.prepareSelectionList(deptList, filterInfo, this.appliedFilters);
      this.menuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }
  sortData(sort: Sort) {
    switch (sort.active) {
      case 'vip_code':
        this.sort.sortBy = Constants.VIP_CODE;
        break;
      case 'department_name':
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
      case 'location_name':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      case 'status':
        this.sort.sortBy = Constants.STATUS;
        break;
    }
    this.sort.order = sort.direction;
    this.getVipData();
  }


  getUsersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getVipData();
  }
  getDateTime(date) {
    return this.datePipe.transform(date.replace(/ /g, 'T'), 'MM/dd/yyyy');
  }

  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `VIP_By_${filter.filter}`;
    console.log(keyName);
    console.log(filter);
    if (filter.filter === Constants.VIP_CODE || filter.filter === Constants.STATUS) {
      const keyName = `VIP_By_${filter.filter}`;
      console.log(keyName);
      this.globalService.addAdminGoogleEvent(keyName);
      return;
    }
    if (filter.userInfo.filter_name === Constants.LOCATION_IDS ||
      filter.userInfo.filter_name === Constants.DEPARTMENT_IDS) {
      const keyNames = `VIP_By_${filter.userInfo.filter_name}`;
      console.log(keyName);
      this.globalService.addAdminGoogleEvent(keyNames);
      return;
    }

  }


  getURL(web_app_url,vipCode) {
    return `${web_app_url}/launch-app?contains=vip-code&vip-code=${vipCode}`    
  }


  openQRCode(data){
    console.log(data)
    const company = this.storageService.getCompany();
    console.log(company)
    const URL = this.getURL(company.web_app_url,data.vip_code);
    console.log(URL)    
    const dialogRef = this.dialog.open(CompanyQRCodeComponent, {
      data: URL
    });
    dialogRef.componentInstance.qrData = {
      slug: data.vip_code,
      isFromCompany: false,
      companyLogo: company.company_logo
    }
  }


  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
  
}
