import { Component, OnInit, EventEmitter, Inject, Output, HostListener } from '@angular/core';
import { Group, GroupService } from '../../services/group/group.service';
import { StorageService } from '../../services/storage/storage.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/services/login/login.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ESCAPE } from '@angular/cdk/keycodes';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { ApiService, ErrorCode } from 'src/app/services/network/api.service';
@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit {
  is_loading = false;
  groupToBeAssigned = -1;
  editableItems = ['all'];
  loggedInManager: User;
  group: Group = new Group();
  onSuccess = new EventEmitter();
  groups: any = [];
  isUpdating = false;
  titleToBeDisplayed = [];
  @Output() refreshPlayerList: EventEmitter<any> = new EventEmitter();
  @Output() groupDeleted: EventEmitter<any> = new EventEmitter();
  readonly separatorKeysCodes: number[] = [ESCAPE];
  constructor(
    public groupService: GroupService,
    public authService: StorageService, public playerService: PlayerService,
    public dialogRef: MatDialogRef<any>, public globalService: GlobalService,
    public translateService: TranslateService,
    public dialog: MatDialog, public apiService: ApiService,
    public translate: TranslateService, @Inject(MAT_DIALOG_DATA) public selectedPlayerIds: any,
    public snackBar: MatSnackBar, @Inject(MAT_DIALOG_DATA) public groupDetails: any) {
    dialogRef.disableClose = true;
  }
  @HostListener('window:keydown', ['$event']) closeOnEscape(event) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  ngOnInit() {

    if (this.groupDetails) {
      this.group.group_name = this.groupDetails && this.groupDetails['group'] && this.groupDetails['group'].group_name || '';
      this.group.group_id = this.groupDetails && this.groupDetails['group'] && this.groupDetails['group'].group_id;
    }
    this.titleToBeDisplayed = this.groupDetails['title'];
    this.loggedInManager = JSON.parse(this.authService.getUser());

    if (this.editableItems.indexOf('changeGroup')  !== -1) {
      this.getGroups();
    }
  }

  getGroups() {
    this.is_loading = true;
    this.groupService.getGroups(this.authService.getCompanyId(), 'group_name', 'asc', 0, 0, '').subscribe((res) => {
      const response: any = res;
      this.is_loading = false;

      this.groups = response.data.group_list;
    });
  }
  cancel() {
    this.dialogRef.close();
  }

  addGroup() {
    this.is_loading = true;
    const company_id = this.authService.getCompanyId();
    const user = JSON.parse(this.authService.getUser());
    this.groupService.addGroup(company_id, user.manager_id, this.group).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.showMessage(response.message);
        return;
      }
      this.globalService.addAdminGoogleEvent('Groups_By_Add_Groups');
      this.onSuccess.emit();
      this.dialogRef.close();
    });
  }

  updateGroup(group) {
    const company_id = this.authService.getCompanyId();
    const updateGroupPayload = {
      'group_id': group.group_id,
      'group_name': group.group_name,
      'company_id': company_id,
      'created_by': this.loggedInManager.manager_id
    };
    this.is_loading = true;
    this.groupService.updateGroupDetails(updateGroupPayload).subscribe(res => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        this.showMessage(this.translate.instant('unable_to_update_group_details'));
        return;
      }
      this.globalService.addAdminGoogleEvent('Groups_By_Edit_Group_Name');
      this.onSuccess.emit();
      this.refreshPlayerList.emit();
      this.dialogRef.close();
    });
  }
  linkPlayersToGroup() {
    this.isUpdating = true;
    const payload = {
      'company_id': this.authService.getCompanyId(),
      'player_ids': this.selectedPlayerIds.selectedPlayers,
      'group_id': this.groupToBeAssigned
    };
    this.is_loading = true;
    this.playerService.bulkUpdate(payload).subscribe((res) => {
      this.is_loading = false;
      this.isUpdating = false;
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translateService.instant('cant_move_players_to_group'));
        return;
      }
      this.refreshPlayerList.emit();
      this.dialogRef.close();
    });
  }

  confirmDeletion(title, message, positiveButtonText = null, negativeButtonText = null, isMultiOption) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = negativeButtonText;
    dialogRef.componentInstance.positiveButtonText = positiveButtonText;
    dialogRef.componentInstance.isMultiOption = isMultiOption;
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.groupDeleted.emit(this.group.group_id);
      this.dialogRef.close();
    });
  }

  deleteGroup() {
    let message;
    if (this.groupDetails['group'] && this.groupDetails['group']['player_list'].length === 0) {
      message = this.translate.instant('confirm_delete_this_group');
      this.confirmDeletion(this.translate.instant('confirm_action'), message,
        this.translate.instant('no_uppercase'), this.translate.instant('yes_uppercase'), true);
    } else {
      message = this.apiService.getErrorMessage(ErrorCode[305002]);
      this.confirmDeletion(this.translate.instant('cant_delete_group'), message, this.translate.instant('ok_uppercase'), '', false);
    }
  }

  onGroupChange(groupId) {
    this.groupToBeAssigned = groupId;
  }
  canEdit(key) {
    return this.editableItems.indexOf('all') !== -1 || this.editableItems.indexOf(key) !== -1;
  }
  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }
}
