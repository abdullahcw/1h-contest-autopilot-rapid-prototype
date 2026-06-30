import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GameSeriesService } from 'src/app/services/game-series/game-series.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-games-in-series',
  templateUrl: './games-in-series.component.html',
  styleUrls: ['./games-in-series.component.scss']
})
export class GamesInSeriesComponent implements OnInit {

  gameList = [];
  query = '';
  isLoading = false;
  tootlTipMsg
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  allgames = [];
  seriesDetails: any;
  constructor(@Inject(MAT_DIALOG_DATA) public series: any,
  private storageService: StorageService,
  public translate: TranslateService,
  private globalService: GlobalService,
  private dashboardService: DashboardService,
  private gameSeriesService: GameSeriesService,
  public dialogRef: MatDialogRef<any>,) { }

  ngOnInit(): void {
    this.getGamesList();
    this.getGamesBySeries();
  }
  getGamesList(){
    this.isLoading = true;
    this.gameSeriesService.getGameSlgMlg(this.storageService.getCompanyId(),this.series.series_id).subscribe((res) => {
      const response: any = res;
      console.log(response);
      this.isLoading = false;
      if (response.data) {
        this.allgames = response.data.games;
      }
    });
  }  
  getGamesBySeries() {
    const appliedFilters = this.storageService.getFilterFromStroageArray('series');
    console.log(appliedFilters);
    this.isLoading = true;
    const payload = {
      series_id: this.series.series_id ,
      company_id: this.storageService.getCompanyId(),
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };
    
  if (appliedFilters && appliedFilters.length) {
    appliedFilters.forEach((elem) => {
      if ((payload[elem.customFilterKey] || payload[elem.filter]) && elem.isAll) {
        return;
      }
      if (elem.customFilterKey) {
        if (elem.isAll) {
          payload[elem.customFilterKey] = {
            'ids' : [],
            'is_all': true
          };
        } else {
          this.preparePayloadFor(
            Constants.CUSTOM_FILTER_KEY,
            payload,
            elem.customFilterKey, appliedFilters
          );
        }
      }
    });
  }
    this.gameSeriesService.getGameSeries(payload).subscribe((res) => {
          const response: any = res;
          console.log(response);
          this.isLoading = false;
          if (response.data) {
            this.gameList = response.data.games;
            this.seriesDetails = response.data;
          } 
  });
  }  
  closePopUp(){
    this.dialogRef.close(true);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.gameList, event.previousIndex, event.currentIndex);
  }

  removeGame(game,index){
    this.gameList.splice(index,1);
    this.addGameToGameList(game);
    this.globalService.addAdminGoogleEvent('Remove_Game');   
  }
  addGameToGameList(game){
    this.allgames.push(game);
    this.allgames = this.sortGames(this.allgames);
  }
  sortGames(games) {
    return games.sort((a, b) => a.game_name.localeCompare(b.game_name));
}
  save(){
    console.log(this.gameList);
    const company = this.storageService.getCompany();
    const companyId = company && company['company_id'];
    const game_ids = [];    
    this.gameList.forEach((element, index) => {
      game_ids.push({
        id: element.game_type === 3 ? element.mlg_id : element.game_id,
        game_type: element.game_type,
        position: index + 1
      });
    })  

      let payload = {
        'company_id': companyId,
        "games": game_ids,
        "series_id": this.series.series_id,
        "created_by": this.storageService.getLoginUserID()        
      }      
      this.isLoading = true;
      this.gameSeriesService.saveGameSeries(payload).subscribe((res) => {
        const response: any = res;
        this.isLoading = false;
        if (!response.success) {
          return;
        }       
        this.dialogRef.close(true);
      });      
    } 
  removeGameFromList(game){
    if(game.game_type == 1){
    this.allgames = this.allgames.filter(game1 => game1.game_id !== game.game_id);
    }else{
      this.allgames = this.allgames.filter(game1 => game1.mlg_id !== game.mlg_id);
    }
  }
    addGameToList(game){
      this.removeGameFromList(game);  
      const selectedGame = {
        "game_id": game.game_id,
        "mlg_id": game.mlg_id,
        "position": this.gameList.length,
        "game_logo": game.game_logo,
        "game_name": game.game_name,
        "game_type": game.game_type
      }
      this.gameList.push(selectedGame);  
      this.query = '';
      this.menuTrigger.closeMenu();
      this.globalService.addAdminGoogleEvent('Add_Game');

    }
    preparePayloadFor(constant, payload, key,appliedFilters) {
        const filters = appliedFilters.filter((item) => {
          return item.filter === constant || item.hasOwnProperty(constant);
        });
        if (filters.length) {
          payload[key] = {
            'ids' : [],
            'is_all': false
          };
          filters.forEach((element) => {
            if (element.customFilterKey === key) {
              payload[key]['ids'].push(element.id);
              if (payload.hasOwnProperty(key) && payload[key]['ids'].indexOf(element.id) === -1) {
                payload[key]['ids'].push(element.id);
              }
            } 
          });
        }
    }
    menuClosed(){
      this.query = '';
    }
}
