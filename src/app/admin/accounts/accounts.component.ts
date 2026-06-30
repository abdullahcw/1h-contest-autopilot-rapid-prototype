import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { ApiService, Constants, ErrorCode } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { EditAccountComponent } from './edit-account/edit-account.component';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit {

  is_loading = false;
  startLimit = 0;
  pageIndex = 0;
  totalAccounts = 0;
  noOfItemsPerPage: number;
  pageSizeOptions: number[];
  displayedColumns: string[] = ['position', 'first_name', 'email', 'status', 'platform', 'action'];
  accountDataSource: any;
  accountList = [];
  selectedSearchKey_platform = '';
  sort = {
    'sortBy': Constants.FIRST_NAME,
    'order': 'asc'
  };

  constructor(public translate: TranslateService,public dialog: MatDialog, public snackBar: MatSnackBar,
    public storageService: StorageService, public headerService: HeaderService, 
    public accounService: AccountsService,
    public apiService: ApiService, public globalService: GlobalService,) { 
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
  }

  ngOnInit(): void {
    this.headerService.showCompanyFilter(false);
    this.getCSMAccounts();
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'first_name':
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getCSMAccounts();
  }
  

  getCSMAccounts() {
    const payload = {
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      'limit_offset': this.startLimit,
      'limit_perpage': this.noOfItemsPerPage
    }
    this.is_loading = true;
    this.accounService.getAccounts(payload).subscribe(res => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
        this.totalAccounts = response.data.total_managers;
        this.accountList = response.data.manager_list;
        this.accountDataSource = new MatTableDataSource(this.accountList);
      });
  }

  getAccountsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getCSMAccounts();
  }
  editAccount(accountId) {
    const dialogRef = this.dialog.open(EditAccountComponent);
    dialogRef.componentInstance.accountId = accountId;
    dialogRef.afterClosed().subscribe(platformsInAccount => {
      if (platformsInAccount) {
        this.updateAccount(platformsInAccount);
      }
    });
  }

  menuOpened() {
    this.selectedSearchKey_platform = '';
  }

  updateAccount(platformsInAccount) {
    const payload = {
      company_list: platformsInAccount.selectedPlatforms.map(platform => platform.company_id),
      manager_id: platformsInAccount.manager_id,
      last_name: platformsInAccount.last_name,
      first_name: platformsInAccount.first_name
    };
    this.accounService.editAccount(payload)
    .subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.showMessage(this.translate.instant('changes_saved'));
      this.getCSMAccounts();
    });
  }

  changeStatus(status, account) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    // tslint:disable-next-line:max-line-length
    const message = status ? this.translate.instant('reactivate_confirm_message') : this.translate.instant('deactivate_confirm_message');
    dialogRef.componentInstance.title = status ? this.translate.instant('reactivate_account') : this.translate.instant('deactivate_account') ;
    dialogRef.componentInstance.message = message + ` ${account.first_name + ' ' + account.last_name}'s `+ this.translate.instant('account_question');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.applyChangedStatus(status, account.manager_id);
    });
  }

  applyChangedStatus(status, accountId) {
    const payload = {
      manager_id: accountId,
      activate: status,
      modified_by: this.storageService.getLoginUserID()
    };
    this.accounService.activateDeactivateAccount(payload)
    .subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      if (response.message_code === ErrorCode['REACTIVATE_CSM_ACCOUNT']) {
        this.showMessage(this.translate.instant('account_reactivated'));
      }
      if (response.message_code === ErrorCode['DEACTIVATE_CSM_ACCOUNT']) {
        this.showMessage(this.translate.instant('account_deactivated'));
      }
      this.getCSMAccounts();
    });
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }

  departmentColoumText(departmentName, linkDepartment, text) {
    return departmentName + text.replace('%d', linkDepartment);
  }

  getCSMAccountsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getCSMAccounts();
  }

  ngOnDestroy() {
    // Reset Company selection filter
    this.headerService.showCompanyFilter(true);
  }

}
