import { Component, OnInit } from '@angular/core';
import { GamesService } from 'src/app/services/games/games.service';
import { StorageService } from '../../services/storage/storage.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Route } from '../../services/login/login.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { GlobalService, UsageLimit } from 'src/app/services/global/global.service';
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
@Component({
  selector: 'app-select-game-type',
  templateUrl: './select-game-type.component.html',
  styleUrls: ['./select-game-type.component.scss']
})
export class SelectGameTypeComponent implements OnInit {
  is_loading = false;
  showSingleCheckMark = false;
  showMultiplayerCheckMark = false;
  showMultilevelCheckMark = false;
  showSingleplayerImg = false;
  showMultiplayerImg = true;
  isShowDialog = false;
  gameRouteURL;
  access_type;
  constructor(public gameService: GamesService,
    public multilevelGameService: MultilevelGamesService,
    public storageService: StorageService,
    public companyService: CompanyService,
    public globalService: GlobalService,
    public dialogRef: MatDialogRef<any>,
    public dialog: MatDialog,
    public router: Router) {

    // console.log(activatedRoute.snapshot.url); // array of states
    // console.log(activatedRoute.snapshot.url[0].path); 

    this.router.events.subscribe((res) => { 
      if(res instanceof NavigationEnd){
        if(this.router.url.includes(Route.GAME)){
          this.gameRouteURL = this.router.url.split('?')[0];
        }

      }
      
  })
  
    this.access_type = this.storageService.getAccessType();
  }

  ngOnInit() {
    this.storageService.setGameLanguage(null);
    this.storageService.setSelectedLanguage(null);
  }

  closePopUp() {
    this.dialogRef.close();
  }
  showOptions() {
    this.showSingleplayerImg = true;
    this.showMultiplayerImg = false;
    this.isShowDialog = true;
    setTimeout(() => {
      this.isShowDialog = false;
    }, 300);
  }


  navigateToGamePage(type) {
    this.is_loading = true;
    if (type === 1) {
      this.showSingleCheckMark = true;
    } else if (type === 2) {
      this.showMultiplayerCheckMark = true;
    } else if (type === 3) {
      this.showMultilevelCheckMark = true;
    }

    if (type === 1 || type === 2 || type === 3) {
      const that = this;
      const companyId = this.storageService.getCompanyId();
      const game = { 'company_id': companyId, 'game_type': type };
      if (type === 3) {
        this.multilevelGameService.addNew(game).subscribe(res => {
          const response: any = res;
          if (!response.success) {
            return;
          }
          this.dialogRef.close();
          this.multilevelGameService.mlgBeingEdited = response.data;
          this.multilevelGameService.mlgBeingEdited.company_id = companyId;
          this.multilevelGameService.mlgBeingEdited.owner_id = this.storageService.getLoginUserID();
          this.storageService.setmultilevelGameObject(this.multilevelGameService.mlgBeingEdited);
          this.globalService.addAdminGoogleEvent('Game_Building_MLG');
          that.router.navigate([Route.MULTILEVEL_GAME], { queryParams: { id: this.multilevelGameService.mlgBeingEdited.mlg_id } });
        });
      } else {
        this.gameService.addNew(game).subscribe(res => {
          const response: any = res;
          if (!response.success) {
            return;
          }
          this.dialogRef.close();
          this.gameService.gameBeingEdited = response.data;
          this.gameService.gameBeingEdited.company_id = companyId;
          this.gameService.gameBeingEdited['is_shop_game'] = false;
          this.gameService.gameBeingEdited['is_default_game_category'] = response.data.is_default_game_category;

          this.gameService.gameBeingEdited.owner_id = this.storageService.getLoginUserID();
          this.storageService.setGameObject(this.gameService.gameBeingEdited);
console.log(this.gameRouteURL)
console.log(Route.GAME)
          if(this.gameRouteURL == ('/'+ Route.GAME)){
              const gameIdwithFlag = {
              'reload': true,
              gameId : response.data.game_id
            }
              this.gameService.localiseGameFromBuilder(gameIdwithFlag);
            }
          
          type === 1 ? this.globalService.addAdminGoogleEvent('Game_Building_SLG') :
            this.globalService.addAdminGoogleEvent('Game_Building_Multiplayer');
          that.router.navigate([Route.GAME], { queryParams: { id: this.gameService.gameBeingEdited.game_id } });
        });
      }
    }
  }


  beforeNavigateCheckUsagesLimit(type) {
    if (type === 1 || type === 2) {
      const companyId = this.storageService.getCompanyId();
      this.companyService.checkUsageLimit(companyId, UsageLimit.GAME).subscribe(res => {
        const response: any = res;
        if (!response.success) {
          if (response.message_code === 'GAME_LIMIT_EXCEEDED') {
            this.closePopUp();
            const displayData = this.globalService.usageLimit(response.data, UsageLimit.GAME_EXCEEDED);
            const dialogRef = this.dialog.open(PaywallActionComponent,
              {
                disableClose: true,
                data: displayData
              });
            dialogRef.componentInstance.title = displayData.title;
            dialogRef.componentInstance.message = displayData.message;
            this.contractEnforcementEvents(type);
            return;
          }
        }
        this.navigateToGamePage(type);
      });
    } else {
      this.navigateToGamePage(type);
    }
  }

  contractEnforcementEvents(type) {
    if (type === 1) {
      this.globalService.addAdminGoogleEvent('Contract_Enforcement_Games_Single_Level');
    }
    if (type === 2) {
      this.globalService.addAdminGoogleEvent('Contract_Enforcement_Games_Multi_Player');
    }
  }
}
