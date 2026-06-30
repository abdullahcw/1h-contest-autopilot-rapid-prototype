import { Component, OnInit, HostListener, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { Constants, ApiService, PlaceholderText } from 'src/app/services/network/api.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Route } from '../../services/login/login.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { SelectGameTypeComponent } from '../select-game-type/select-game-type.component';
import { GamesService } from 'src/app/services/games/games.service';
import { Role } from 'src/app/services/permissions/permissions.service';

class Owner {
  id: any;
  text: String;
}

@Component({
  selector: 'app-mlg-list',
  templateUrl: './mlg-list.component.html',
  styleUrls: ['./mlg-list.component.scss']
})
export class MlgListComponent implements OnInit {
  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  appliedFilters = [];
  noOfItemsPerPage: number;
  dataSource: any;
  totalGames = 0;
  startLimit = 0;
  pageIndex = 0;
  pageSizeOptions: number[];
  multilevelGames = [];
  breakpoint = 4;
  isMultilevelTab = false;
  is_loading: boolean;
  selectedGameId: any;
  selectedgameState: any;
  gameId: any;
  isEditable: any;
  selectedGame;
  context = 'mlg_list';
  owners: any[];
  menuList: any[];
  role = Role;
  delegateSubscription: any;

  filter_options = [{
    'filter': Constants.MLG_NAME, value: this.translate.instant('game'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.MLG_NAME
  },
  {
    'filter': Constants.MLG_STATE, value: this.translate.instant('state'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.MLG_STATE, 'is_generic_menu': true
  },
  {
    'filter': Constants.OWNER_ID, value: this.translate.instant('owner'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.OWNER_NAME, 'is_generic_menu': true
  }];

  mlgState = [{ 'id': 'live', 'value': this.translate.instant('live') }, { 'id': 'draft', 'value': this.translate.instant('draft') }];
  access_type;
  game: any;
  selectedgameType: any;
  constructor(public multilevelgamesService: MultilevelGamesService,
    public authService: StorageService,
    public mangerService: ManagerService,
    public dialog: MatDialog,
    public delegateService: DelegateService,
    public snackBar: MatSnackBar,
    public apiSerivce: ApiService,
    public globalService: GlobalService,
    public translate: TranslateService,
    public router: Router,
    public storageService: StorageService,
    public gamesService: GamesService,
    private cdRef: ChangeDetectorRef,
    public permissionService: PermissionsService) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.access_type = this.storageService.getAccessType();
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      // isMultilevelTab
      if (this.router.url.indexOf('games') !== -1) {
        this.getMultilevelGames();
      }
    });
  }
  @Output() tabChangefromMlg: EventEmitter<any> = new EventEmitter();
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateBreakpoint();
  }
  ngOnInit() {
    this.calculateBreakpoint();
    this.getMultilevelGames();
    // game_logo, game_name
  }

  allowEdit() {
    return (this.selectedGame && this.selectedGame.owner_id === this.storageService.getLoginUserID() &&
      this.selectedGame && this.selectedGame.mlg_state != 'LIVE') || this.storageService.getAccessType() === Role.ADMIN;
  }

  getMultilevelGames() {

    this.is_loading = true;
    const companyId = this.authService.getCompanyId();
    const appliedFilters = this.storageService.getFilterFromStroage(this.context);
    this.multilevelgamesService.getMultilevelGames(companyId,
      this.sort.sortBy, this.sort.order, this.startLimit, this.noOfItemsPerPage, appliedFilters).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (response.data) {
          this.multilevelGames = response.data.mlg_list;
          this.totalGames = response.data.total_mlg;
        }
      });
  }
  calculateBreakpoint() {
    this.breakpoint = window.innerWidth / 400;
    if (this.breakpoint <= 1.8 && this.breakpoint > 1.2) {
      this.breakpoint = 1.4;
    }
  }

  refreshListOnFilterChange(filters) {
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.storageService.setFilters(this.context, filters);
    this.getMultilevelGames();
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.MLG_STATE:
        this.menuList = this.mlgState;
        this.cdRef.detectChanges();
        break;
      case Constants.OWNER_ID:
        this.getOwner();
        break;
    }
  }

  getOwner() {
    const companyId = this.storageService.getCompanyId();
    this.gamesService.getOwners(companyId, 'first_name', 'asc').subscribe((res) => {
      const response: any = res;
      this.owners = [];
      this.menuList = [];
      if (response.success) {
        const superAdmin: any = {
          'first_name': this.translate.instant('huddle_team'),
          'last_name': '',
          'access_type': 'SA',
          'manager_id': -1
        };
        response.data.owner_list.push(superAdmin);
        response.data.owner_list.forEach(item => {
          const owner = new Owner();
          owner.id = item.manager_id;
          const space: any = ' ';
          owner.text = item.first_name + space + item.last_name;
          this.owners.push(owner);
        });
        this.menuList = this.globalService.prepareMenuList(this.owners);
      }
    });
  }

  menuOpened(index, data) {
    this.selectedGameId = null;
    this.selectedGameId = index;
    this.selectedGame = data;
    this.selectedgameState = data.mlg_state;
    this.gameId = data.game_id;
    this.selectedgameType = data.game_type;
    this.isEditable = data.is_editable;
  }
  menuClosed() {
    this.selectedGame = -1;
  }
  navigateToGamePage() {
    const dialogRef = this.dialog.open(SelectGameTypeComponent, {
    });
  }
  public onValChange(val) {
    const temp = this.isMultilevelTab = val;
    this.tabChangefromMlg.emit(temp);
  }
  addPlayerMultilevelGames(game) {
    this.multilevelgamesService.mlgBeingEdited = game;
    this.storageService.setmultilevelGameObject(this.multilevelgamesService.mlgBeingEdited);
    this.router.navigate([Route.MULTILEVEL_SCHEDULE_GAME]);
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Game_Library_Multilevel_${filter.filter}`;
    console.log('trying', keyName);
    if (filter.filter === Constants.MLG_STATE) {
      this.globalService.addAdminGoogleEvent(`${keyName}_${filter.value.split(' ').join('_')}`);
      return;
    }
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }
  navigateToEditGamePage(game) {
    this.multilevelgamesService.mlgBeingEdited = game;
    this.storageService.setmultilevelGameObject(this.multilevelgamesService.mlgBeingEdited);
    this.router.navigate([Route.MULTILEVEL_GAME]);
  }


  confirmDeletion(game) {
    const mlgId = game.mlg_id;

    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: game
    });
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_this_game');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.multilevelGames.forEach((games, index) => {
        if (games.mlg_id === mlgId) {
          this.multilevelGames.splice(index, 1);
        }
      });
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Profile_Deleted');
      this.deleteGames(mlgId);
    });
  }

  deleteGames(gameid) {
    const companyId = this.authService.getCompanyId();
    this.multilevelgamesService.deleteMlg(companyId, gameid).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiSerivce.getErrorMessage('confirm_delete_mltilevelgame'));
        return;
      }

      this.getMultilevelGames();
    });
  }

  getGamesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getMultilevelGames();
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }
  duplicateGame(game) {
    console.log(game);
    const payload = {
      'mlg_id': game.mlg_id,
      'company_id': this.storageService.getCompanyId(),
    };

    this.multilevelgamesService.copyGame(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'GAME_LIMIT_EXCEEDED') {
          // this.showLimit(response);
          // this.globalService.addAdminGoogleEvent('Contract_Enforcement_Games_Cloning');
          return;
        }
      }
      const data = res.data;
      let cloneGame: any;
      cloneGame = data.mlg_details;
      cloneGame.polling_identifier = data.polling_identifier;
      this.multilevelGames.forEach((games, index) => {
        if (games.mlg_id === game.mlg_id) {
          this.multilevelGames.splice(index + 1, 0, cloneGame);
        }
      });
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_MLG_Cloned');
      this.getCopyGameProgress(data.polling_identifier, data.mlg_details.mlg_id);
    });
  }
  getCopyGameProgress(pollingID, gameId) {
    let response;
    let that;
    that = this;
    const gameInterval = setInterval(function () {
      that.multilevelgamesService.copyMLGProgress(pollingID).subscribe((res) => {
        response = res;
        if (response && response.data && response.data.question_copy_progress === 100) {
          clearInterval(gameInterval);
          that.multilevelGames.forEach(games => {
            if (games.mlg_id === gameId) {
              games['polling_identifier'] = null;
            }
          });
        }
      });
    }, 5000);
    this.globalService.addAdminGoogleEvent('MLG_Cloned');

  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
