import { Component, EventEmitter, Input, Output, } from '@angular/core';
import { Route } from '../../../services/login/login.service';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/storage/storage.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from '../../../services/games/games.service';

@Component({
  selector: 'app-pinned-card',
  templateUrl: './pinned-card.component.html',
  styleUrls: ['./pinned-card.component.scss']
})
export class PinnedCardComponent {
  @Input() pinGameData;
  @Output() refreshGamesList: EventEmitter<any> = new EventEmitter();
  @Output() navigateToEditGame: EventEmitter<any> = new EventEmitter();
  is_loading: boolean;
  removePinGamesPayload;
  showUnpin = false;
  constructor(public router: Router, public globalService: GlobalService, public translate: TranslateService,
    public storageService: StorageService, public gamesService: GamesService) { }

  removePinGame(pinGameId) {
    const updatePinGamePayload = {
      'company_id': this.storageService.getCompanyId(),
      'manager_id': this.storageService.getLoginUserID(),
      'game_id': pinGameId,
      'is_pinned': false,
    };
    this.removePinGamesPayload = updatePinGamePayload;
    this.is_loading = true;
    this.gamesService.updatePinGame(updatePinGamePayload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (response.success) {
        this.globalService.showMessage(this.translate.instant('pin_remove'), 'right', 'bottom');
        this.globalService.addAdminGoogleEvent('Pinned_Games_Remove_Pinned_Game');
        this.refreshGamesList.emit();
      }
    });
  }

  navigateToDashboard(pinGameId) {
    const queryParams = {
      showReport: true,
      game_id: pinGameId,
    };
    this.globalService.addAdminGoogleEvent('Pinned_Games_View_Statistics');
    this.router.navigate([Route.DASHBOARD], {
      queryParams: queryParams
    });
  }

  navigateToGameBuilder(pingame) {
    if (!pingame.is_editable) return;
    this.navigateToEditGame.emit(pingame);
  }

}
