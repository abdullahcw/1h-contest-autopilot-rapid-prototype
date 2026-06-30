import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-pinned-game-on-dashboard',
  templateUrl: './pinned-game-on-dashboard.component.html',
  styleUrls: ['./pinned-game-on-dashboard.component.scss']
})
export class PinnedGameOnDashboardComponent implements OnInit {
  gameList = [];
  query = '';
  isLoading = false;
  tootlTipMsg
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  constructor(@Inject(MAT_DIALOG_DATA) public pinnedGamesList: any,
  private storageService: StorageService,
  public translate: TranslateService,
  private globalService: GlobalService,
  private dashboardService: DashboardService,
  public dialogRef: MatDialogRef<any>,) { }

  ngOnInit(): void {
    console.log(this.pinnedGamesList)
    this.getGamesByWinRate();
    if(this.pinnedGamesList.length == 10) {
      this.tootlTipMsg = this.translate.instant('game_limit_reached');
    }else{
      this.tootlTipMsg = this.translate.instant('add_new_game');
    }
  }

  closePopUp(){
    this.dialogRef.close();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.pinnedGamesList, event.previousIndex, event.currentIndex);
  }

  removeGame(game,index){
    this.pinnedGamesList.splice(index,1);
    this.addGameToGameList(game);
    this.globalService.addAdminGoogleEvent('Delete_Global_Pinned_Games');   
    if(this.pinnedGamesList.length < 10) {
      this.tootlTipMsg = this.translate.instant('add_new_game');
    }
  }

  save(){
    const company = this.storageService.getCompany();
    const companyId = company && company['company_id'];
    const game_ids = [];    
    this.pinnedGamesList.forEach((element, index) => {
      game_ids.push({
        game_id: element.game_id,
        position: index + 1
      });
    })  

      let payload = {
        'company_id': companyId,
        "game_ids": game_ids,
        "manager_id": this.storageService.getLoginUserID()        
      }      
      this.globalService.addAdminGoogleEvent('Global_Pinned_Games_Save_Clicked');
      this.isLoading = true;
      this.dashboardService.saveGlobalPinnedGames(payload).subscribe((res) => {
        const response: any = res;
        this.isLoading = false;
        if (!response.success) {
          return;
        }       
        this.dialogRef.close(true)
      });      
    }

    getGamesByWinRate() {     
      this.dashboardService.getOnlyGames(this.storageService.getCompanyId(),'winrate').subscribe((res) => {
        const response: any = res;        
        if (response.data) {
          this.gameList = response.data.all_slg_games;
        // compare and remove object in gamelist which is already in pinnedGamesList
        this.gameList = this.gameList.filter(game => {
          return !this.pinnedGamesList.some(pinnedGame => pinnedGame.game_id === game.game_id);
        });
        }
      });
    }
    addGameToGameList(game){
      this.globalService.addAdminGoogleEvent('Pin_Global_Games');      
      this.gameList.push(game);
    }
    removeGameFromList(game){
      this.gameList = this.gameList.filter(game1 => game1.game_id !== game.game_id);
    }
    addGameToList(game){

      
      console.log(game);
      this.removeGameFromList(game);     
      const selectedGame = {
        "game_id": game.game_id,
        "position": this.pinnedGamesList.length,
        "game_logo": game.game_logo,
        "game_name": game.game_name,
        "win_rate": game.win_rate
      }
      this.pinnedGamesList.push(selectedGame);  
      this.query = '';
      this.menuTrigger.closeMenu();
      if(this.pinnedGamesList.length == 10) {
        this.tootlTipMsg = this.translate.instant('game_limit_reached');
      }
    }

    menuClosed(){
      this.query = '';
    }
    
  // }
}
