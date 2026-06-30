import { Component, OnInit } from '@angular/core';
import { Constants } from 'src/app/services/network/api.service';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GamesService } from 'src/app/services/games/games.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { GameReorderService } from 'src/app/services/reorder/game-reorder.service';
import { GlobalService } from 'src/app/services/global/global.service';
@Component({
  selector: 'app-reorder-games',
  templateUrl: './reorder-games.component.html',
  styleUrls: ['./reorder-games.component.scss']
})
export class ReorderGamesComponent implements OnInit {
  openMsg: boolean = false;
  check: boolean = false;
  multilevelGameDataSource = new MatTableDataSource();
  singlelevelGameDataSource = new MatTableDataSource();

  appliedFilters;
  dataSource: any;
  totalGames = 0;
  multilevelGames;
  is_loading: boolean;
  delegateSubscription: any;
  games;
  totalGamesMLG: any;
  totalGamesSLG: any;

  constructor(
    public multilevelgamesService: MultilevelGamesService,
    public authService: StorageService,
    public gameReorderService: GameReorderService,
    public dialog: MatDialog,
    public storageService: StorageService,
    private globalService: GlobalService,
    public gamesService: GamesService,
    public delegateService: DelegateService
  ) {
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      this.getGamesList();
    });
  }

  ngOnInit() {
    this.getGamesList();
  }

  openTag() {
    this.openMsg = !this.openMsg;
    this.check = !this.check;
    if (this.openMsg) {
      this.globalService.addAdminGoogleEvent('Game_reordering_Layout_info_viewed');
    }
  }

  closeTag() {
    this.openMsg = false;
    this.check = false;
  }

  getGamesList() {
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    this.gameReorderService.getGamesList(companyId).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.multilevelGames = response.data.mlg_list;
        this.games = response.data.slg_list;
        this.totalGamesMLG = response.data.mlg_count;
        this.totalGamesSLG = response.data.slg_count;
      }
    });

  }

  positionChanged(change) {
    console.log(change);
    if (change.positionChanged) {
      this.addPositionEvent(change.gameType);
      this.getGamesList();
    }
  }

  addPositionEvent(gameType) {
    if (gameType === 1) {
      this.globalService.addAdminGoogleEvent('Game_reordering_SLG_postion_saved');
    } else {
      this.globalService.addAdminGoogleEvent('Game_reordering_MLG_postion_saved');
    }
  }
}
