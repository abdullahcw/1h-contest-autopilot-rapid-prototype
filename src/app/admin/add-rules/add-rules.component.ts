import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';
import { Role } from 'src/app/services/permissions/permissions.service';

@Component({
  selector: 'app-add-rules',
  templateUrl: './add-rules.component.html',
  styleUrls: ['./add-rules.component.scss']
})
export class AddRulesComponent implements OnInit {

  constructor(public translate: TranslateService, private storageService: StorageService,
    public dialogRef: MatDialogRef<any>, public multilevelGamesService: MultilevelGamesService,
    public globalService: GlobalService, public apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = false; }
  is_updating = false;
  is_editable = false;
  rules = '';
  ngOnInit() {
    this.rules = this.data.mlg_rule;
    this.is_editable = this.storageService.getAccessType() === Role.ADMIN || this.storageService.getAccessType() === Role.MANAGER;
  }

  saveRules() {
    this.is_updating = true;

    const payload = {
      'company_id': this.data.company_id,
      'mlg_id': this.data.mlg_id,
      'mlg_rule': this.rules
    };
    this.multilevelGamesService.saveGame(payload).subscribe(res => {
      const response = res;
      this.is_updating = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      if (response.success) {
        this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Add_Rules');
      }
      this.cancel();
    });
  }

  cancel() {
    this.dialogRef.close();
  }

}
