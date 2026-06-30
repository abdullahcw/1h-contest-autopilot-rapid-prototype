import { Component, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { GameCategoryService } from 'src/app/services/game-category/game-category.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants, ApiService } from 'src/app/services/network/api.service';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { Role } from 'src/app/services/permissions/permissions.service';


@Component({
  selector: 'app-game-category-list',
  templateUrl: './game-category-list.component.html',
  styleUrls: ['./game-category-list.component.scss']
})
export class GameCategoryListComponent implements OnInit, OnDestroy {
  is_loading: boolean;
  sort = {
    'sortBy': Constants.CATEGORY_NAME,
    'order': 'asc'
  };
  displayedColumns: string[];
  dataSource: any;
  totalGameCategories: any;
  category: any = 0;
  categoryPermission: any;
  gameCategories: any;
  allowMultiSelect = true;
  categorypDetails: any;
  editMode: boolean = false;
  gameCount: any;
  delegateSubscription;
  role = Role;
  response: any;
  deleteButtonDisable: boolean = false;
  loginUser: any;
  constructor(
    public gameCategoryService: GameCategoryService,
    public authService: StorageService,
    public dialog: MatDialog,
    public delegateService: DelegateService,
    public snackBar: MatSnackBar,
    public translate: TranslateService,
    public router: Router,
    public storageService: StorageService,
    public globalService: GlobalService,
    public apiService: ApiService,
    public permissionService: PermissionsService) {
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('game-categories') !== -1) {
        this.getCategory();
      }
    });
  }


  ngOnInit() {

    this.setCAtegoryPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setCAtegoryPermission();
    });
    this.getCategory();

  }
  setCAtegoryPermission() {
    this.categoryPermission = this.permissionService.getPermissions(PermissionsKey.GAME_CATEGORY);
    this.loginUser = JSON.parse(this.storageService.getUser());
    if (this.loginUser && this.loginUser.access_type === Role.MID_MANAGER) {
      this.displayedColumns = ['serial', 'categoryName', 'gameCount'];
    } else {
      this.displayedColumns = ['serial', 'categoryName', 'gameCount', 'action'];
    }
  }
  getCategory() {
    this.is_loading = true;
    this.gameCategoryService.getGameCategory(this.authService.getCompanyId(), this.sort.sortBy, this.sort.order).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.gameCategories = response.data.category_list;
        this.totalGameCategories = response.data.total_category_count;
        this.dataSource = new MatTableDataSource(this.gameCategories);
      }
    });
  }

  presentCategoryPopup(category = null, title = '', editableItems = null) {
    if ((this.categoryPermission && !this.categoryPermission.edit) || (category && !category.is_editable)) { return; }
    editableItems === 'editCategory' ? this.editMode = true : this.editMode = false;
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      data: { 'category': category, 'title': title, 'editableItems': this.editMode }
    });
    dialogRef.componentInstance.onSuccess.subscribe(() => {
      this.getCategory();
    });
  }
  categoryDeletionValidation(category) {
    this.gameCategoryService.addGameCount(this.authService.getCompanyId(), category.game_cat_id).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        this.gameCount = response && response.data && response.data.total_game_count;
      }
      this.confirmDeletion(category, this.gameCount);
    });
  }

  confirmDeletion(category, count) {
    if (count === 0) {
      this.deleteCategory(category);
      return;
    }
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: category
    });
    dialogRef.componentInstance.title = this.translate.instant('delete_category');
    const string = '"' + 'Uncategorized' + '"';
    const message = this.translate.instant('delete_category_uncategorized') + string + '.';
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('cancel_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('delete_uppercase');
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.deleteCategory(category);
    });
  }
  deleteCategory(category) {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    this.gameCategoryService.deleteGameCategory(category.game_cat_id, company_id).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.apiService.getErrorMessage(response.message_code);
        return;
      }
      this.getCategory();
      this.globalService.showMessage(this.translate.instant('game_category_delete_successfully'), 'right', 'bottom');
    });
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
