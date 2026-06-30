
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GameReorderService } from 'src/app/services/reorder/game-reorder.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { ApiService } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';


@Component({
  selector: 'app-change-game-position',
  templateUrl: './change-game-position.component.html',
  styleUrls: ['./change-game-position.component.scss']
})
export class ChangeGamePositionComponent implements OnInit {

  constructor(public translate: TranslateService,
    public dialogRef: MatDialogRef<any>,
    public globalService: GlobalService,
    private apiService: ApiService,
    public marketplaceService: MarketplaceService,
    public storageService: StorageService,
    public gameReorderService: GameReorderService,
    private multilevelGameService: MultilevelGamesService,
    @Inject(MAT_DIALOG_DATA) public cardData: any) { }
  is_loading = false;
  total_count = null;
  changed_position;
  errorMessage = false;
  reorderingGames = false;
  gameName = '';

  ngOnInit() {

  }

  close() {
    this.dialogRef.close({
      positionChanged: false,
    });
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  saveChanges() {
    this.errorMessage = false;
    if (+this.changed_position === 0 || +this.changed_position > this.total_count) {
      this.errorMessage = true;
      return;
    }
    if (this.reorderingGames) {
      this.updateGamePosition();
    } else {
      this.cardData.mlg_id ? this.updateMlgLevelPosition() : this.updateShopGamePosition();
    }
  }

  updateShopGamePosition() {
    this.is_loading = true;
    const payload = {
      game_id: this.cardData.game_id,
      shop_current_position: this.cardData.shop_current_position,
      shop_destination_position: +this.changed_position
    };
    this.marketplaceService.updateShopGamePosition(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
      } else {
        this.globalService.showMessage(this.translate.instant('position_changed'), 'right', 'bottom');

        this.dialogRef.close({
          positionChanged: true,
          cardData: this.cardData,
        });
      }
    });
  }

  updateMlgLevelPosition() {
    this.is_loading = true;
    const payload = {
      company_id: this.cardData.company_id,
      mlg_id: this.cardData.mlg_id,
      game_id: this.cardData.game_id,
      level_current_position: this.cardData.level,
      level_destination_position: +this.changed_position
    };
    this.multilevelGameService.updateLevelPositionInMultilevelGame(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('something_went_wrong'));
      } else {
        this.globalService.showMessage(this.translate.instant('position_changed'), 'right', 'bottom');

        this.dialogRef.close({
          positionChanged: true,
          cardData: this.cardData,
        });
      }
    });
  }


  updateGamePosition() {
    this.is_loading = true;
    const payload = {
      company_id: this.cardData.company_id,
      game_id: this.cardData.game_id,
      isMlg: this.cardData.game_type === 3 ? true : false,
      modified_by: this.storageService.getLoginUserID(),
      currentPosition: this.cardData.position,
      newPosition: +this.changed_position,
    };
    this.gameReorderService.updateGamePosition(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.data) {
          this.gameName = response.data.gameName;
          if (this.gameName) {
            this.globalService.showMessage(`${this.gameName} - is no longer Live`, 'right', 'bottom');
          } else {
            this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
          }
          this.dialogRef.close({
            positionChanged: false,
          });
        }
      } else {
        this.globalService.showMessage(this.translate.instant('position_changed'), 'right', 'bottom');
        this.dialogRef.close({
          positionChanged: true,
          cardData: this.cardData,
        });
      }
    });
  }
}

