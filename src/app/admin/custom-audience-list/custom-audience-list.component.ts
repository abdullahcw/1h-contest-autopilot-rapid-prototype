import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { Constants, ApiService } from 'src/app/services/network/api.service';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';

import { Role } from 'src/app/services/permissions/permissions.service';
import { AddAudienceComponent } from '../add-audience/add-audience.component';
import { CustomAudienceService } from 'src/app/services/custom-audience/custom-audience.service';
import { AlertComponent } from '../alert/alert.component';
import { Route } from 'src/app/services/login/login.service';


@Component({
  selector: 'app-custom-audience-list',
  templateUrl: './custom-audience-list.component.html',
  styleUrls: ['./custom-audience-list.component.scss']
})
export class CustomAudienceListComponent implements OnInit, OnDestroy {

  is_loading: boolean;
  sort: any = {
    sortBy: Constants.AUDIENCE_NAME,
    order: 'asc'
  };
  displayedColumns: string[];
  audienceDataSource: any;
  totalAudience = 0;
  audience: any = 0;
  audiencePermission: any;
  customAudience: any;
  allowMultiSelect = true;
  audienceDetails: any;
  editMode: boolean = false;
  gameCount: any;
  delegateSubscription;
  role = Role;
  response: any;
  deleteButtonDisable: boolean = false;
  loginUser: any;
  noOfItemsPerPage: number;
  pageSizeOptions: number[];
  startLimit = 0;

  constructor(
    public authService: StorageService,
    public customAudienceService: CustomAudienceService,
    public dialog: MatDialog,
    public delegateService: DelegateService,
    public snackBar: MatSnackBar,
    public translate: TranslateService,
    public router: Router,
    public storageService: StorageService,
    public globalService: GlobalService,
    public apiService: ApiService,
    public permissionService: PermissionsService) {

    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('custom-audience') !== -1) {
        setTimeout(() => {
          this.getAudience();
        });
      }
    });
    this.storageService.setFilters('players', []);
  }


  ngOnInit() {

    this.setAudiencePermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setAudiencePermission();
    });
    this.getAudience();

  }

  setAudiencePermission() {
    this.audiencePermission = this.permissionService.getPermissions(PermissionsKey.CUSTOM_AUDIENCE);
    this.loginUser = JSON.parse(this.storageService.getUser());
    if (this.loginUser && this.loginUser.access_type === Role.MID_MANAGER) {
      this.displayedColumns = ['serial', 'audience_name', 'player_count', 'game_count', 'contest_count'];
    } else {
      this.displayedColumns = ['serial', 'audience_name', 'player_count', 'game_count', 'contest_count', 'action'];
    }
  }
  getAudience() {
    this.is_loading = true;
    const managerId = this.storageService.getLoginUserID();
    this.customAudienceService.getAudience(this.authService.getCompanyId(), this.sort.sortBy, this.sort.order,
      this.startLimit, this.noOfItemsPerPage, managerId, true).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (response.data) {
          this.customAudience = response.data.audiences;
          this.totalAudience = response.data.total_count;
          this.audienceDataSource = new MatTableDataSource(this.customAudience);
        }
      });
  }

  presentAudiencePopup(audience = null, title = '', editableItems = null) {
    console.log('audience',audience);
    if (this.audiencePermission && !this.audiencePermission.edit) { return; }
    editableItems === 'editAudience' ? this.editMode = true : this.editMode = false;
    if(editableItems !== 'editAudience'){
      const dialogRef = this.dialog.open(AddAudienceComponent, {
        data: { 'audience': audience, 'title': title, 'editableItems': this.editMode }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.globalService.addAdminGoogleEvent('Custom_Audience_Create_custom_audience');
          this.navigateToEditAudience(result, editableItems);
        }
      });
    }else{
       this.navigateToEditAudience(audience, editableItems);
    } 
  }

  confirmDeletion(audience) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: audience
    });
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_audience')
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_deleted');
      this.deleteAudience(audience);
    });
  }

  deleteAudience(audience) {
    this.is_loading = true;
    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'manager_id': this.storageService.getLoginUserID(),
      'audience_id': audience.audience_id
    };
    this.customAudienceService.deleteAudience(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'LIVE_GAME_AUDIENCE_DELETE_RESTRICTION') {
          this.checkIsGameLive();
          this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_cannot_delete');
          return;
        }
      }
      this.getAudience();
      this.globalService.showMessage(this.translate.instant('audience_deleted'), 'right', 'bottom');
    });
  }

  checkIsGameLive() {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('cannot_delete_audience_games');
    dialogRef.componentInstance.title = this.translate.instant('cannot_delete_audience_games_title');
    dialogRef.componentInstance.showOKbtn = true;
  }

  getAudienceOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getAudience();
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'audience_name':
        this.sort.sortBy = Constants.AUDIENCE_NAME;
        break;
      case 'player_count':
        this.sort.sortBy = Constants.PLAYER_COUNT;
        break;
      default:
        this.sort.sortBy = sort.active ? sort.active : Constants.AUDIENCE_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getAudience();
  }

  navigateToEditAudience(audience, editableItems) {
    const audience_details = {
      'audience_name': audience.audience_name,
      'audience_id': audience.audience_id,
      'editableItems': editableItems === 'editAudience' ? this.editMode = true : this.editMode = false
    }
    this.storageService.setAudienceDetails('audience-details', audience_details);
    this.router.navigate([Route.EDIT_AUDIENCE]);
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }

}
