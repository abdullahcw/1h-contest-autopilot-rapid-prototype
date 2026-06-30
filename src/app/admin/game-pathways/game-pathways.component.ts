import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
// import { GameCategoryService } from 'src/app/services/game-category/game-category.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { PermissionsKey, PermissionsService, Role } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { MatTableDataSource } from '@angular/material/table';
import { AddPathwayComponent } from './add-pathway/add-pathway.component';
import { GamePathwayService } from 'src/app/services/game-pathway/game-pathway.service';

@Component({
  selector: 'app-game-pathways',
  templateUrl: './game-pathways.component.html',
  styleUrls: ['./game-pathways.component.scss']
})
export class GamePathwaysComponent implements OnInit {
  is_loading: boolean;
  sort = {
    'sortBy': Constants.CATEGORY_NAME,
    'order': 'asc'
  };
  displayedColumns: string[];
  dataSource: any;
  totalPathwayCategories: any;
  // category: any = 0;
  // @Output() updateCategory = new EventEmitter();
  pathwayPermission: any;
  gamePathways: any;
  allowMultiSelect = true;
  // selection = new SelectionModel<>(this.allowMultiSelect, []);
  // categorypDetails: any;
  editMode: boolean = false;
  gameCount: any;
  delegateSubscription;
  role = Role;
  response: any;
  deleteButtonDisable: boolean = false;
  loginUser: any;
  constructor(    
    public gamePathwayService: GamePathwayService,
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
      if (this.router.url.indexOf('game-pathways') !== -1) {
        this.getPathway();
      }
    });
   }

  ngOnInit(): void {

    this.displayedColumns = ['no', 'pathwayName', 'gameCount', 'action'];
    this.setPathwayPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setPathwayPermission();
    });
    this.getPathway();
  }


  setPathwayPermission() {
    this.pathwayPermission = this.permissionService.getPermissions(PermissionsKey.GAME_PATHWAY);
    this.loginUser = JSON.parse(this.storageService.getUser());
    // if (this.loginUser && this.loginUser.access_type === Role.MID_MANAGER) {
    //   this.displayedColumns = ['serial', 'categoryName', 'gameCount'];
    // } else {
    //   this.displayedColumns = ['serial', 'categoryName', 'gameCount', 'action'];
    // }
  }
  getPathway() {
    this.is_loading = true;
    this.gamePathwayService.getGamePathway(this.authService.getCompanyId(), this.sort.sortBy, this.sort.order).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        console.log('response', response);
        this.gamePathways = response.data.pathways;
        this.totalPathwayCategories = response.data.total_count;
        this.dataSource = new MatTableDataSource(this.gamePathways);
      }
    });
  }
  // getString() {
  //   // let para = 'Uncategorized';
  //   // let para2 = '"' + daadad + '"';
  //   // let para3 = this.translate.instant('delete_category_uncategorized').replace(reasaign);
  //   const srein;
  //   srein = 'Uncategorized';
  //   const concat = '"' + srein + '"';
  // }


  presentPathwayPopup(pathway = null, title = '', editableItems = null) {
    // if ((this.categoryPermission && !this.categoryPermission.edit) || (pathway && !pathway.is_editable)) { return; }
    // this.dialog.open(AddCategoryComponent);
    this.globalService.addAdminGoogleEvent('Add_A_Pathway');    
    editableItems === 'editPathway' ? this.editMode = true : this.editMode = false;
    const dialogRef = this.dialog.open(AddPathwayComponent, {
      data: { 'pathway': pathway, 'title': title, 'editableItems': this.editMode }
    });
    dialogRef.componentInstance.onSuccess.subscribe(() => {
      this.getPathway();
    });
  }
  pathwayDeletion(pathway) {
    // console.log('category', category);
    // addGameCount
    this.is_loading = true;
    this.globalService.addAdminGoogleEvent('Pathway_Deleted');
    this.gamePathwayService.pathwayGameCount(this.authService.getCompanyId(), pathway.pathway_id).subscribe((res) => {
      const response: any = res;
      // this.is_loading = false;
      if (response.data) {
        this.gameCount = response && response.data && response.data.games_count;
      }
      this.confirmDeletion(pathway, this.gameCount);
    });
  }

  confirmDeletion(pathway, count) {    
    if (count === 0) {
      this.deletePathway(pathway);
      return;
    }
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: pathway
    });
    dialogRef.componentInstance.title = this.translate.instant('pathway_category');    
    dialogRef.componentInstance.message = this.translate.instant('delete_pathway_message');;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('cancel_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('delete_uppercase');
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.deletePathway(pathway);
    });
  }
  deletePathway(pathway) {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    this.gamePathwayService.deletePathway(pathway.pathway_id).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.apiService.getErrorMessage(response.message_code);
        return;
      }
      this.getPathway();
      this.globalService.showMessage(this.translate.instant('pathway_delete_successfully'), 'right', 'bottom');
      // console.log('success', response);
    });
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }

}
