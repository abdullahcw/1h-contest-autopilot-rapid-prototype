import { Component, OnInit, EventEmitter, Output, ViewChild, OnDestroy } from '@angular/core';
import { Constants, ApiService, PlaceholderText } from '../../services/network/api.service';
import { StorageService } from '../../services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GroupService, Group } from '../../services/group/group.service';
import { AddGroupComponent } from '../add-group/add-group.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { SelectionModel } from '@angular/cdk/collections';
import { DelegateService } from '../../services/delegate/delegate.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, OnDestroy {
  showDelay = new FormControl(500);
  is_loading: boolean;
  displayedColumns: string[] = ['select', 'group'];
  filter_options = [{
    'filter': Constants.GROUP_NAME, value: this.translate.instant('group'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.GROUP_NAME
  }];
  sort = {
    'sortBy': Constants.GROUP_NAME,
    'order': 'asc'
  };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  appliedFilters = '';
  noOfItemsPerPage: number;
  startLimit = 0;
  dataSource: any;
  totalGroups = 0;
  groups: any = 0;
  groupPermission: any;
  pageSizeOptions: number[];
  context = 'groups';
  allowMultiSelect = true;
  selection = new SelectionModel<Group>(this.allowMultiSelect, []);


  @Output() updateGroup = new EventEmitter();
  loggedInManager: any;
  delegateSubscription: any;

  constructor(public groupService: GroupService, public authService: StorageService, public dialog: MatDialog,
    public delegateService: DelegateService, public snackBar: MatSnackBar, public translate: TranslateService,
    public router: Router, public storageService: StorageService, public globalService: GlobalService,
    public apiService: ApiService,
    public permissionService: PermissionsService) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = [...Paginations.PAGE_SIZE_OPTIONS];
    if (this.pageSizeOptions.indexOf(500) === -1) {
      this.pageSizeOptions.push(500);
    }
    this.noOfItemsPerPage = 500;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('groups') !== -1) {
        this.getGroups(0);
      }
    });
  }

  ngOnInit() {
    this.loggedInManager = JSON.parse(this.authService.getUser());
    this.setGroupPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setGroupPermission();
    });
    this.getGroups(0);
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  setGroupPermission() {
    this.groupPermission = this.permissionService.getPermissions(PermissionsKey.GROUP);
  }

  refreshListOnFilterChange(filters) {
    this.storageService.setFilters(this.context, filters);
    // Reset start limit and pageIndex on Filter
    this.paginator.pageIndex = 0;
    this.startLimit = 0;
    this.getGroups(0);
  }

  getGroups(startLimit) {
    this.is_loading = true;
    this.appliedFilters = this.storageService.getFilterFromStroage(this.context);
    this.groupService.getGroups(this.authService.getCompanyId(),
      this.sort.sortBy, this.sort.order, startLimit, this.noOfItemsPerPage, this.appliedFilters).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (response.data) {
          this.selection.clear();
          this.groups = response.data.group_list;
          this.totalGroups = response.data.total_groups;
          this.dataSource = new MatTableDataSource(this.groups);
        }
      });
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'group':
        this.sort.sortBy = Constants.GROUP_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getGroups(this.startLimit);
  }

  getToolTipData(group) {
    if (group && group.player_list) {
      let toolTip = '';
      group.player_list.forEach(player => {
        const player_name = player.first_name + ' ' + player.last_name + '\n';
        toolTip += (player_name);

      });
      return toolTip;
    }
  }

  presentGroupPopup(group = null, title = '', editableItems = ['all']) {
    if (this.groupPermission && !this.groupPermission.edit) { return; }
    const dialogRef = this.dialog.open(AddGroupComponent, {
      data: { 'group': group, 'title': title },
      panelClass: 'add-group'
    });
    dialogRef.componentInstance.onSuccess.subscribe(() => {
      this.getGroups(0);
    });
    dialogRef.componentInstance.groupDeleted.subscribe((groupId) => {
      this.deleteGroups(groupId);
    });
    dialogRef.componentInstance.editableItems = editableItems;
    this.globalService.addAdminGoogleEvent('Groups_By_View_Groups');
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
    filterOptionUpdated(filter) {
      if (!filter) { return; }
      const keyName = `Groups_By_Add_${filter.filter}`;
      this.globalService.addAdminGoogleEvent(keyName);
      return;
    }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  confirmDeletion(event) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ?
      this.translate.instant('confirm_delete_group') : this.translate.instant('confirm_delete_groups');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteGroups();
    });
  }

  deleteGroups(groupId = null) {
    this.is_loading = true;
    const groupsToBeDeleted = [];
    if (groupId) {
      groupsToBeDeleted.push(groupId);
    } else {
      this.selection.selected.forEach(group => {
        groupsToBeDeleted.push(group.group_id);
      });
    }
    const payload = {
      'company_id': +this.storageService.getCompanyId(),
      'group_ids': groupsToBeDeleted,
      'created_by': this.loggedInManager.manager_id
    };
    this.groupService.deleteGroup(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.showAlert(this.translate.instant('cant_delete_groups'), this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.addAdminGoogleEvent('Groups_By_Delete_Groups');
      this.selection = new SelectionModel<Group>(true, []);
      this.getGroups(0);
    });
  }
  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }
  getGroupsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    const nextLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getGroups(nextLimit);
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
