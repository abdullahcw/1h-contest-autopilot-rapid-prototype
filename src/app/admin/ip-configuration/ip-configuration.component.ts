import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { IpConfigurationService, IpList } from 'src/app/services/ip-configuration/ip-configuration.service';
import { ApiService, Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AddIpComponent } from './add-ip/add-ip.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { AddLocDeptCustomFieldsComponent } from './add-loc-dept-custom-fields/add-loc-dept-custom-fields.component';
import { CompanyService } from 'src/app/services/company/company.service';
import { HeaderService } from 'src/app/services/header/header.service';

@Component({
  selector: 'app-ip-configuration',
  templateUrl: './ip-configuration.component.html',
  styleUrls: ['./ip-configuration.component.scss']
})
export class IpConfigurationComponent implements OnInit {
  // showDelay = new FormControl(500);
  is_loading: boolean;
  displayedColumns: string[] = ['ip_address','ip_desc','Action'];
  sort = {
    'sortBy': Constants.GROUP_NAME,
    'order': 'asc'
  };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  noOfItemsPerPage: number;
  startLimit = 0;
  dataSource: any;
  totalGroups = 0;
  ipDetails: any = 0;
  groupPermission: any;
  pageSizeOptions: number[];
  context = 'ipConfiguration';
  allowMultiSelect = true;
  selection = new SelectionModel<IpList>(this.allowMultiSelect, []);
  totalIps: number;
  delegateSubscription: any;
  appliedFilters = [];
  menuList: any[];
  filter_options = [];
  search_filters = [
    {
      'filter': Constants.AUDIENCE_IDS, value: this.translate.instant('custom_audience'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.AUDIENCE_NAME, 'is_multi_selection': true, 'is_generic_menu': true
    },
  ];
  ipAllDetails: any;

  constructor(
    public ipConfigurationService: IpConfigurationService, 
    public authService: StorageService, 
    public companyService: CompanyService, 
    public dialog: MatDialog,
    public delegateService: DelegateService, 
    public snackBar: MatSnackBar, 
    public translate: TranslateService,
    public router: Router, 
    public storageService: StorageService, 
    public globalService: GlobalService,
    public apiService: ApiService,
    public headerService: HeaderService,
    public permissionService: PermissionsService) { 
    // this.pageSizeOptions = [...Paginations.PAGE_SIZE_OPTIONS];
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
      // if (this.pageSizeOptions.indexOf(500) === -1) {
      //   this.pageSizeOptions.push(500);
      // }
      // this.noOfItemsPerPage = 20;
  
      // this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      //   if (this.router.url.indexOf('ips') !== -1) {
      //     this.getIpConfiguration(0);
      //   }
      // });
    }

  ngOnInit(): void {
    this.headerService.showCompanyFilter(false);
    this.getIpConfiguration(0);
    this.filter_options = this.globalService.addeditCustomFilters(this.search_filters, this.companyService.getFields(), 2);
    
   

  }
  getIpConfiguration(startLimit) {
    this.is_loading = true;
    this.ipConfigurationService.getIpList(this.authService.getCompanyId(),
      this.sort.sortBy, this.sort.order, startLimit, this.noOfItemsPerPage, this.appliedFilters).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (response.data) {
          this.selection.clear();
          this.totalIps = response.data.total_ip;
          this.ipDetails = response.data.ip;
          this.ipAllDetails = response.data;
          this.dataSource = new MatTableDataSource(this.ipDetails);
          this.getIpExclusion();
        }
      });
  }
    addNewipDetails(){
      this.globalService.addAdminGoogleEvent('Add_IP_Configration');
      // presentGroupPopup(group = null, title = '', editableItems = ['all']) {
        if (this.groupPermission && !this.groupPermission.edit) { return; }
        const dialogRef = this.dialog.open(AddIpComponent, {
          data: { ip_address: '', ip_id: null, ip_desc:'', edit_mode: false},
          panelClass: 'add-group'
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log('result',result);
          if (result) {
            this.getIpConfiguration(0);
          }
        });
  }
  uodateIpDetails(ipDetails){
    console.log('ipDetails',ipDetails);
    const dialogRef = this.dialog.open(AddIpComponent, {
      data: { ip_address: ipDetails.ip_address, ip_id: ipDetails.ip_id, ip_desc:ipDetails.ip_desc, edit_mode: true},
      panelClass: 'add-group'});
    dialogRef.afterClosed().subscribe(result => {
      console.log('result',result);
      if (result) {
        this.getIpConfiguration(0);    
        }
    });
  }
    getipDetailssOverPagination(pageEvent) {
      this.noOfItemsPerPage = pageEvent.pageSize;
      const nextLimit = pageEvent.pageIndex * pageEvent.pageSize;
      this.getIpConfiguration(nextLimit);
    }
    confirmDeletion(event) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        data: event
      });
      const message = this.selection.selected.length === 1 ?
        this.translate.instant('confirm_delete_ip') : this.translate.instant('confirm_delete_ip');
      dialogRef.componentInstance.message = message;
      dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
      dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
      dialogRef.componentInstance.onNegativeAction.subscribe(() => {
        this.deleteIps(event);
      });
    }
  deleteIps(ips) {
    console.log('ips',ips);
    this.is_loading = true;
    this.ipConfigurationService.deleteIps(ips.ip_id,this.authService.getCompanyId()).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.getIpConfiguration(0);
        this.globalService.addAdminGoogleEvent('Delete_IP_Configration');

      }
    });
  }

  editAssignment(assignment) {
    const dialogRef = this.dialog.open(AddLocDeptCustomFieldsComponent, {
    });
    dialogRef.componentInstance.appliedFilters = this.appliedFilters;
    dialogRef.componentInstance.filters = this.appliedFilters;  
    dialogRef.afterClosed().subscribe(result => {
      if (result.is_changed) {
        this.appliedFilters = result.applied_filters;
      //  const payloadEmpty = this.appliedFilters.length ? true : false;
      
        this.addIpExclusion(); 
      }
    });
  }

  
  addIpExclusion() {
    const payload = this.preparePayload();
    this.is_loading = true;
    this.ipConfigurationService.updateIpExclusion(payload).subscribe(res => {
      const response = res;
      this.is_loading = false;
      if (response.success) {
        this.getIpExclusion();
      }
    });
  }
  preparePayload() {
    const payload = {
      'company_id': this.authService.getCompanyId(),
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
      'recipients': [{
       'players' :this.prepareRecipients(),
        'created_by': this.storageService.getLoginUserID(),
      }],
    };
      payload['recipients'][0]['recipient_type'] = this.ipAllDetails['recipients'][0].recipients_type ? this.ipAllDetails['recipients'][0].recipients_type : 'FIELDS_BASED';
      // payloadEmpty ? payload['recipients'][0]['players'] = [] : payload['recipients'][0]['players'] = this.prepareRecipients();
    return payload;
  }
  prepareRecipients() {
    const uniqueFilters = this.globalService.findUniqueFilters(this.appliedFilters);
    if (uniqueFilters.length === 0) {
      return [];
    }
    console.log('uniqueFilters',uniqueFilters);
    const recipients = [];
    uniqueFilters.forEach(filter => {
      const filterId = filter.filter;
      const assignment = {
        'key_id': filter.filter,
        'filter_key': filter.filter === Constants.CUSTOM_AUDIENCE ? 'custom_audience' : filter.customFilterKey,
        'is_all': filter.isAll ? filter.isAll : false,
      };
      // console.log('assignment', assignment, filterId, limit);
      const ids = this.globalService.filtersAppliedCustom(assignment, filterId, this.appliedFilters, 'values');
      if (ids.values[0].id === -1) {
        assignment['values'] = [];
      }
      recipients.push(assignment);
    });
    console.log('recipients',recipients[0].key_id);
    console.log('this.ipAllDetails',this.ipAllDetails['recipients']);

    this.ipAllDetails['recipients'][0].recipients_type = recipients[0].key_id === 'custom_audience' ?
    'AUDIENCE_BASED' : 'FIELDS_BASED';
    // console.log('recipients', recipients);
    return recipients;
  }
  getIpExclusion() {
    this.is_loading
    const is_custom = this.globalService.isCompanyBelongsToCustomField() ? true : false;
    const is_company_with_custom_fields = this.globalService.isCompanyWithCustomField() ? true : false;
    this.ipConfigurationService.getIpExclusion(this.authService.getCompanyId(),is_custom,is_company_with_custom_fields).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.ipAllDetails['recipients'] = res.data.recipients;
        const IpAssignment = this.ipAllDetails['recipients'][0].players;
        if (IpAssignment) {
          const appliedFilters = [];
          IpAssignment.forEach(recipient => {
            if (recipient.is_all) {
              appliedFilters.push({
                'id': -1,
                'value': 'All',
                'isAll': true,
                'searchingIn': recipient.text,
                'filter': recipient.key_id,
                'customFilterKey': recipient.filter_key
              });
            } else {
              console.log('reci values', recipient.values);
              if (recipient.values) {
                recipient.values.forEach(value => {
                  appliedFilters.push({
                    'id': value.id,
                    'value': value.text,
                    'isAll': false,
                    'additionalFilter': true,
                    'searchingIn': recipient.text,
                    'filter': recipient.key_id,
                    'customFilterKey': recipient.filter_key
                  });
                });
              }
            }
          });
          this.appliedFilters = appliedFilters;
        }
      }
    });
  }
  ngOnDestroy() {
    // Reset Company selection filter
    this.headerService.showCompanyFilter(true);
  }
}
