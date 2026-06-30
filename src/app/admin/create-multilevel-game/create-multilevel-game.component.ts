import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/app/services/network/api.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { GamesService } from 'src/app/services/games/games.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { AddItemsComponent } from 'src/app/admin/add-items/add-items.component';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { AlertComponent } from '../alert/alert.component';
import { ChangeGamePositionComponent } from '../change-game-position/change-game-position.component';
import { LoginService, Route } from 'src/app/services/login/login.service';
import { ConfirmActionMultilevelGameComponent } from '../confirm-action-multilevel-game/confirm-action-multilevel-game.component';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-create-multilevel-game',
  templateUrl: './create-multilevel-game.component.html',
  styleUrls: ['./create-multilevel-game.component.scss']
})
export class CreateMultilevelGameComponent implements OnInit {
  @ViewChild(MatMenuTrigger) mlgMenuBtns: MatMenuTrigger;
  disableSave = false;
  multilevelGameData: any = {
    mlg_type: 3,
    mlg_state: this.translate.instant('draft_uppercase'),
    mlg_logo: '',
    mlg_name: '',
    mlg_id: 0
  };
  isMultilevelGamesEditable = false;
  is_loading = false;
  displayedColumns: string[] = ['level', 'game_logo', 'game_name', 'completion_critera', 'game_limit', 'action'];
  multilevelGameDataSource = new MatTableDataSource();
  itemList;
  companyId: any;
  searchGame = '';
  games: any[];
  gamesToAdd = [];
  selectedGameCriteria = [];
  tabIndex = 0;
  noOfItemsPerPage = 20;
  pageSizeOptions: number[];
  mlgCriteria: any = [
    { 'id': 1, 'title': this.translate.instant('total_points'), 'isSelected': false, 'value': 100, 'key': 'total_points' },
    { 'id': 2, 'title': this.translate.instant('minimum_attempts'), 'isSelected': false, 'value': 1, 'key': 'attempt_count' },
    { 'id': 3, 'title': this.translate.instant('high_score'), 'isSelected': false, 'value': 100, 'key': 'high_score' }
  ];
  width = 64;
  higScoreValue = [];
  selectedValue;
  @ViewChild('invisibleText') invTextER: ElementRef;
  @ViewChild('total_points') total_points: ElementRef;
  preparedslectedGamesList: any = [];
  preparedupdatedGamesList: any = [];
  addNewLevelPayload;
  updateLimitPayload;
  gamesWithLevel = [];
  disableGameIds = [];
  disable_level = false;
  limit_changed = true;
  hasManagerSetLimit = false;

  constructor(
    public translate: TranslateService,
    public apiService: ApiService,
    public permissionService: PermissionsService,
    public dialog: MatDialog,
    public storageService: StorageService,
    public globalService: GlobalService,
    private headerService: HeaderService,
    private gamesService: GamesService,
    private breadcrumbService: BreadcrumbsService,
    private activatedRoute: ActivatedRoute,
    public multilevelGameService: MultilevelGamesService,
    private router: Router,
    public loginService: LoginService,
  ) {
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.companyId = this.storageService.getCompanyId();
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.id) {
        this.reset();
      } else {
        this.resetAll();
      }
    });
  }

  ngOnInit() {
    this.companyId = this.storageService.getCompanyId();
    this.headerService.showCompanyFilter(false);
    this.getGames();
    for (let i = 50; i <= 100; i++) {
      this.higScoreValue.push(i);
    }
  }
  reset() {
    this.is_loading = false;
    this.resetAll();
  }

  restrictAlphabets(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  resetAll() {
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.loadGameData();
  }
  loadGameData() {
    if (this.storageService.getmultilevelGameObject()) {
      this.multilevelGameService.mlgBeingEdited = this.storageService.getmultilevelGameObject();
    }
    this.multilevelGameData = this.multilevelGameService.mlgBeingEdited;
    this.disableSave = false;
    if (this.multilevelGameData && this.multilevelGameData.mlg_name) {
      this.breadcrumbService.updateBreadcrumbLabel(this.multilevelGameData.mlg_name);
    }
    if (this.multilevelGameData && this.multilevelGameData['mlg_id']) {
      this.getGameDetails(this.multilevelGameData['mlg_id']);
    }
  }
  getGameDetails(gameid) {
    this.is_loading = true;
    this.multilevelGameService.getGameDetails(gameid, this.companyId).subscribe(res => {
      const response = res;
      this.is_loading = false;
      if (response.data && response.data.mlg_description) {
        this.multilevelGameData = response.data.mlg_description;
        if (response.data.mlg_description.has_manager_set_limits) {
          this.hasManagerSetLimit = true;
          this.storageService.setKeyForFirstManagerLogin('manager-first-set-limit', true);
          this.getCompanySetting(this.companyId);
        }
      }
      if (this.multilevelGameData && this.multilevelGameData.games) {
        this.multilevelGameData.games.forEach(game => {
          if (game.max_limit == -1) {
            game.max_limit = '';
          }
        });
      }
      this.multilevelGameDataSource = new MatTableDataSource(this.multilevelGameData.games);
      this.prepareListForMultiSelectEdit(this.multilevelGameDataSource.data);
      this.getDisableGameIds(this.multilevelGameDataSource.data);
    });
  }

  disableLevel(game) {
    game['disable_level'] = true;
    let gameData = [];
    const newCriteria = [];
    gameData = this.multilevelGameDataSource.data;
    gameData.map(level => {
      if (level.disable_level) {
        this.disableSave = true;
        this.disable_level = true;
      }
    });
    this.isCriteriaSelected(gameData, newCriteria); // criteria check in disable
    this.globalService.addAdminGoogleEvent('Live_MLG_Level_disabled');
  }

  getDisableGameIds(gameDataSource) {
    gameDataSource.forEach(game => {
      if (game.disable_level) {
        this.disableGameIds.push(game.game_id);
      }
    });
  }

  updateSelectedInputValue(value) {
    this.selectedValue = value;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  commaSeparatedNumbersOnly(event, game) {
    const val = event.replace(/,/g, '');
    if (!(/^\d+$/.test(val))) {
      return false;
    }
    game.criteria.forEach(criterion => {
      if (criterion.id === 1) {
        criterion.value = +val.toLocaleString('en-US');
      }
    });
    return true;
  }

  remove(category, game) {
    const newCriteria = [];
    let gameData = [];
    gameData = this.multilevelGameDataSource.data;
    game.criteria.map(criterion => {
      if (category.id === criterion.id) {
        criterion.isSelected = false;
        if (this.addNewLevelPayload && this.addNewLevelPayload.level_data) {
          this.addNewLevelPayload.level_data.map(level => {
            if (level.game_id === game.game_id) {
              delete level[criterion.key];
            }
          });
        }
      }
      this.disableSave = false;
    });
    console.log('data', gameData, this.addNewLevelPayload);
    this.isCriteriaSelected(gameData, newCriteria);
    if (this.multilevelGameData.mlg_state === 'DRAFT') {
      this.updateGameCriteria(category.key, 0, game);
    }
  }

  presentAddGamePopUp() {
    const dialogRef = this.dialog.open(AddItemsComponent, {
      data: {
        singularWord: this.translate.instant('game'),
        pluralWord: this.translate.instant('games'),
        items: this.itemList,
        uniqueKey: 'game_for_mlg',
        gameCount: this.multilevelGameDataSource.data.length
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('games');
    dialogRef.componentInstance.forMlgObj = true;
    dialogRef.componentInstance.searchItems.subscribe((searchKeyWord) => {
      this.searchGame = searchKeyWord;
      this.getGames();

    });

    dialogRef.componentInstance.updateItems.subscribe((data) => {
      this.selectedGames(data);
    });
    dialogRef.afterClosed().subscribe(() => {
      this.searchGame = '';
      this.getGames();
    });
  }

  getGames() {
    this.is_loading = true;
    this.gamesService.getGames(this.companyId, 'game_name', 'asc', 0, 100, this.getFilterForGames()).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        if (!this.games) {
          this.games = [];
          this.games = response.data.game_list;
        }
        this.prepareGameListForItemComponent(response.data.game_list);
      }
    });
  }
  getFilterForGames() {
    const filters = `game_state=READY,LIVE&game_type=1&game_name=${this.searchGame}`;
    return filters;
  }
  prepareGameListForItemComponent(gameList) {
    let copyOfGames = [];
    if (this.multilevelGameDataSource.data.length) {
      copyOfGames = this.removeExistingGames(this.multilevelGameDataSource.data, gameList);
    } else {
      copyOfGames = gameList;
    }
    copyOfGames.filter(item => {
      item['itemKeyId'] = item.game_id;
      item['itemKeyName'] = item.game_name;
      item['itemKeyLogo'] = item.game_logo;
    });
    this.globalService.listOfItems(copyOfGames);
    this.itemList = copyOfGames;
  }
  removeExistingGames(existingGames, copyOfGames) {
    existingGames.filter(game => {
      copyOfGames.filter(egame => {
        if (game.game_id === egame.game_id) {
          const index = copyOfGames.indexOf(egame);
          copyOfGames.splice(index, 1);
        }
      });
    });
    return copyOfGames;

  }
  selectedGames(result) {
    const gameIds = [];
    const newCriteria = [];
    result.filter(game => {
        console.log('hi', game, this.multilevelGameDataSource.data.length, result.indexOf(game));
          if (this.multilevelGameData.mlg_state === 'LIVE') {
            game['newlyAdded'] = true;
            this.globalService.addAdminGoogleEvent('Live_MLG_New_level_added');
          }
          game['level'] = this.multilevelGameDataSource.data.length + result.indexOf(game) + 1;
          game['game_logo'] = game.itemLogo;
          game['game_name'] = game.itemName;
          game['game_id'] = game.itemId;
          game['max_limit'] = '';
          this.gamesToAdd.push(game);
          gameIds.push(game.itemId);
    });
    if (this.multilevelGameData.mlg_state === 'DRAFT') {
      this.addGamesToMultilevelGame(gameIds);
    }
    if (this.multilevelGameDataSource && this.multilevelGameDataSource.data.length) {
      const source = this.multilevelGameDataSource.data;
      this.multilevelGameDataSource.data = source.concat(this.gamesToAdd);
      this.prepareListForMultiSelectEdit(this.multilevelGameDataSource.data);
      this.isCriteriaSelected(this.multilevelGameDataSource.data, newCriteria);
      this.multilevelGameDataSource._updateChangeSubscription();
    } else {
      this.multilevelGameDataSource.data = this.gamesToAdd;
      this.prepareListForMultiSelectEdit(this.multilevelGameDataSource.data);
      this.multilevelGameDataSource._updateChangeSubscription();
    }
    this.gamesToAdd = [];
    this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Add_Games');

  }

  addGamesToMultilevelGame(gameIds, newGame = null) {
    const company_id = this.storageService.getCompanyId();
    const payload = {
      'company_id': company_id,
      'mlg_id': this.multilevelGameData.mlg_id,
      'level_data': this.getGameLevelData(gameIds, newGame)
    };
    if (this.multilevelGameData.mlg_state === 'LIVE') {
      payload['adding_after_live'] = true;
    }
    this.addNewLevelPayload = payload;
    console.log('after disable payload', this.addNewLevelPayload);
    if (this.multilevelGameData.mlg_state === 'DRAFT') {
      this.save();
    }
  }
  checkIsGameLive() {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('remove_delete_games');
    dialogRef.componentInstance.title = this.translate.instant('game_not_available_title');
    dialogRef.componentInstance.showOKbtn = true;
  }

  getGameLevelData(gameIds, newGame) {
    if (gameIds) {
      gameIds.forEach(gameId => {
        this.gamesWithLevel.push({
          'game_id': gameId,
          'level': this.multilevelGameData.mlg_state === 'LIVE' ? this.getNewGameLevel(gameId)
            : this.multilevelGameDataSource.data.length + gameIds.indexOf(gameId) + 1,
        });
      });
    }
    if (this.multilevelGameData.mlg_state === 'LIVE') {
      return this.addCriteriaToNewLevel(newGame, this.gamesWithLevel);
    } else {
      return this.gamesWithLevel;
    }
  }
  addCriteriaToNewLevel(newGame, gamesWithLevel) {
    const uniqueCriteriaIdentifiers = [];
    gamesWithLevel = gamesWithLevel.filter(gameLevel => {
      if (gameLevel.game_id === newGame.game_id) {
        newGame.criteria.forEach(criterion => {
          if (criterion.isSelected) {
            gameLevel[criterion.key] = criterion.value;
          }
        });
      }
      if (uniqueCriteriaIdentifiers.indexOf(gameLevel.game_id) === -1) {
        uniqueCriteriaIdentifiers.push(gameLevel.game_id);
        return true;
      } else {
        return false;
      }
    });
    return gamesWithLevel;
  }

  getNewGameLevel(gameId) {
    let gameDataSource = [];
    let newGameLevel;
    gameDataSource = this.multilevelGameDataSource.data;
    gameDataSource.map(element => {
      if (element.game_id === gameId) {
        newGameLevel = element.level;
      }
    });
    return newGameLevel;
  }

  // tooltip for disable level in Live MLG
  showToolTip(game) {
    if (game.disable_level) {
      return 'This level is disabled.';
    } else {
      return '';
    }
  }

  cancelGames(level) {
    this.router.navigate([Route.MULTILEVEL_GAMES]);
  }

  removeGame(game) {
    const newCriteria = [];
    let gameData = [];
    gameData = this.multilevelGameDataSource.data;
    let gameIndex;
    let newLevel = false;
    gameData.map((dataSource, index) => {
      if (dataSource.game_id === game.game_id) {
        gameData.splice(index, 1);
        gameIndex = index;
      }
      if (this.disableGameIds.indexOf(dataSource.game_id) === -1 && dataSource.disable_level) {
        this.disableSave = true;
      }
    });
    gameData.map(dataSource => {
      if (dataSource.level > gameIndex) {
        dataSource.level = dataSource.level - 1;
      }
      newLevel = newLevel || dataSource.newlyAdded;
    });
    if (!newLevel) {
      this.disableSave = this.disable_level || this.limit_changed ? true : false;
    }
    this.isCriteriaSelected(gameData, newCriteria);
    this.globalService.addAdminGoogleEvent('Live_MLG_New_level_removed');
    this.multilevelGameDataSource.data = gameData;
  }

  deleteGame(game) {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    const queryParams = `company_id=${company_id}&mlg_id=${this.multilevelGameData.mlg_id}&game_id=${game.game_id}`;
    this.multilevelGameService.deleteGameInMultilevelGame(queryParams).subscribe((res) => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      } else {
        this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_Level_Deleted');
        this.getGameDetails(this.multilevelGameData['mlg_id']);
      }
    });
  }

  prepareListForMultiSelectEdit(slectedGames) {
    slectedGames.forEach(game => {
      game['criteria'] =
        [{
          'id': 1, 'title': this.translate.instant('total_points'), 'isSelected': (game.hasOwnProperty('total_points') &&
            game.total_points !== 0), 'value': game.total_points ? +game.total_points : 100, 'key': 'total_points'
        },
        {
          'id': 2, 'title': this.translate.instant('minimum_attempts'), 'isSelected': (game.hasOwnProperty('attempt_count') &&
            game.attempt_count !== 0), 'value': game.attempt_count ? +game.attempt_count : 1, 'key': 'attempt_count'
        },
        {
          'id': 3, 'title': this.translate.instant('high_score'), 'isSelected': (game.hasOwnProperty('high_score') &&
            game.high_score !== 0), 'value': game.high_score ? +game.high_score : 100, 'key': 'high_score'
        }];
    });

  }

  selectedCriteria(data) {
    const newCriteria = [];
    if (this.multilevelGameData.mlg_state === 'DRAFT') {
      data.criteria.forEach(criterion => {
        if (criterion.isSelected) {
          this.updateGameCriteria(criterion.key, criterion.value, data);
          if (criterion.key === 'total_points') {
            this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Add_Criteria_Total_Points');

          } else if (criterion.key === 'attempt_count') {
            this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Add_Criteria_Minimum_Attempts');

          } else if (criterion.key === 'high_score') {
            this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Add_Criteria_High_Score');
          }
        }
      });
    }
    this.gamesToAdd = this.multilevelGameDataSource.data;
    const temp = this.gamesToAdd.findIndex(gameToFind => gameToFind.game_id === data.game_id);
    this.gamesToAdd[temp] = data;
    if (this.multilevelGameData.mlg_state === 'LIVE') {
      this.isCriteriaSelected(this.gamesToAdd, newCriteria);
        this.gamesToAdd = this.addCriteriaKeysForNewlyAdded(this.gamesToAdd, data);
    }
    this.multilevelGameDataSource = new MatTableDataSource(this.gamesToAdd);
    this.gamesToAdd = [];
    this.multilevelGameDataSource._updateChangeSubscription();
  }

  addCriteriaKeysForNewlyAdded(gamesDatasource, gameData) {
    gamesDatasource.forEach(game => {
      if (game.newlyAdded) {
        game.criteria.forEach(criterion => {
          if (criterion.isSelected && criterion.key) {
            game[criterion.key] = criterion.value;
          } else {
            // this code is added for removing the key from payload if criteria is deselected
            delete game[criterion.key];
          }
        });
      }
    });
    return gamesDatasource;
  }

  isCriteriaSelected(gamesToAdd, newCriteria) {
    gamesToAdd.map(game => {
      if (game.newlyAdded) {
        let criteriaSelected = false;
        game.criteria.forEach(criterion => {
          criteriaSelected = criteriaSelected || criterion.isSelected;
        });
        newCriteria.push(criteriaSelected);
      }
    });
    if (newCriteria.length) {
      const anyOneCriteriaSelected = newCriteria.every(val => val === true);
      this.disableSave = anyOneCriteriaSelected ? true : false;
    }
  }

  chackCriteriaValue(key, value, game) {
    if (key === 'total_points') {
      value = value.replace(/,/g, '');
    }
    // tslint:disable-next-line:triple-equals
    if (this.selectedValue != 0 && value == 0) {
      value = this.selectedValue;
      game.criteria.forEach(criterion => {
        if (criterion.key === key) {
          criterion.value = this.selectedValue;
        }
      });
      this.showAlert(this.translate.instant('criteria_needed'), this.translate.instant('please_add_valid_criteria'));
    } else if (+value < 100 && key === 'total_points') {
      game.criteria.forEach(criterion => {
        if (criterion.key === key) {
          criterion.value = this.selectedValue;
        }
      });
      this.showAlert(this.translate.instant('criteria_needed'), this.translate.instant('please_add_valid_criteria'));
    } else {
      if (this.multilevelGameData.mlg_state === 'DRAFT') {
        this.updateGameCriteria(key, value, game);
      }
      this.selectedValue = '';
    }
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  updateGameCriteria(key, value, game) {
    if (this.multilevelGameData.mlg_state == 'LIVE' && key == 'max_limit') {
      game['limitChanged'] = true;
      this.limit_changed = true;
      return;
    }
    const company_id = this.storageService.getCompanyId();
    this.updateLimitPayload = {
      'company_id': company_id,
      'mlg_id': this.multilevelGameData.mlg_id,
      'game_id': game.game_id
    };
    if (key == 'max_limit') {
      this.updateLimitPayload[key] = value ? +value : -1;
      if ((this.updateLimitPayload[key] == 0 || this.checkEmoji(game.max_limit)) && this.multilevelGameData.mlg_state == 'DRAFT') {
        game.max_limit = '';
        return;
      }
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_Limit_Added');
    } else {
      this.updateLimitPayload[key] = +value;
    }
    this.multilevelGameService.updateGameInMultilevelGame(this.updateLimitPayload).subscribe((res) => {
      const response = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
    });
  }

  resizeInput(inputText) {
    // without setTimeout the width gets updated to the previous length
    setTimeout(() => {
      const minWidth = 64;
      if (this.invTextER.nativeElement.offsetWidth > minWidth) {
        this.width = this.invTextER.nativeElement.offsetWidth + 2;
      } else {
        this.width = minWidth;
      }

    }, 0);
  }

  checkSelecteditems(level) {
    const itemSelected = level['criteria'].filter((item) => {
      return item.isSelected;
    });
    return (itemSelected.length === 3 || !level.newlyAdded && this.multilevelGameData.mlg_state !== 'DRAFT') ? true : false;
  }

  changePosition(item) {
    console.log(item);
    const dialogRef = this.dialog.open(ChangeGamePositionComponent, {
      data: item
    });
    dialogRef.componentInstance.total_count = this.multilevelGameData.total_levels;

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.positionChanged) {
        this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_Level_Position_Changed');
        this.getGameDetails(this.multilevelGameData['mlg_id']);
      }
    });
  }

  save(level = null) {
    if (this.multilevelGameData.mlg_state === 'LIVE') {
      let gameData = [];
      gameData = this.multilevelGameDataSource.data;
      this.preparePayload(gameData);
      gameData.forEach(element => {
        if (element.hasOwnProperty('newlyAdded')) {
          delete element.newlyAdded;
        }
        if (element.hasOwnProperty('limitChanged')) {
          delete element.limitChanged;
        }
      });
      this.globalService.addAdminGoogleEvent('Live_MLG_Live_mlg_updated');
    }
    console.log('save payload', this.addNewLevelPayload);
    this.is_loading = true;
    this.multilevelGameService.addGamesInMultilevelGame(this.addNewLevelPayload).subscribe((res) => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.disableSave = false;
        if (response.message_code === 'RESTRICT_DISABLE_LEVEL_IN_LIVE_MLG') {
          this.checkMultilevelGameLevels(this.addNewLevelPayload);
          return;
        }
        if (response.message_code === 'RESTRICT_GAME_DELETE_ON_CONTEST_MLG') {
          this.gamesToAdd = [];
          this.multilevelGameDataSource.data = [];
          this.multilevelGameDataSource._updateChangeSubscription();
          this.checkIsGameLive();
          return;
        }
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      this.disableSave = false;
      this.getGameDetails(this.multilevelGameData['mlg_id']);
      this.gamesWithLevel = [];
    });
  }

  preparePayload(gameDataSource) {
    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'mlg_id': this.multilevelGameData.mlg_id,
      'adding_after_live': true,
      'level_data': this.prepareLevelData(gameDataSource)
    };
    this.addNewLevelPayload = payload;
  }

  prepareLevelData(gameDataSource) {
    gameDataSource.forEach(game => {
      if (game.newlyAdded || (game.limitChanged && !game.disable_level)) {
        const gameLevel = {
          'game_id': game.game_id,
          'level': game.level,
          'disable_level': false,
          'max_limit': game.max_limit ? +game.max_limit : -1
        };
        if (this.gamesWithLevel.indexOf(game.game_id) === -1) {
          this.gamesWithLevel.push(gameLevel);
        }
      }
      if (game.disable_level) {
        if (this.gamesWithLevel.indexOf(game.game_id) === -1 && this.disableGameIds.indexOf(game.game_id) === -1) {
          const gameLevel = {
            'game_id': game.game_id,
            'level': game.level,
            'disable_level': true,  
            'max_limit': game.max_limit ? +game.max_limit : -1
          };
          this.gamesWithLevel.push(gameLevel);
        }
      }
    });
    this.gamesWithLevel = this.preparePayloadForNewlyAdded(gameDataSource, this.gamesWithLevel);
    return this.gamesWithLevel;
  }

  preparePayloadForNewlyAdded(gameDataSource, newPayload) {
    gameDataSource.forEach(game => {
      const uniqueCriteriaIdentifiers = [];
      newPayload = newPayload.filter(gameLevel => {
        if (gameLevel.game_id === game.game_id) {
          game.criteria.forEach(criterion => {
            if (criterion.isSelected) {
              gameLevel[criterion.key] = criterion.value;
            }
          });
        }
        if (uniqueCriteriaIdentifiers.indexOf(gameLevel.game_id) === -1) {
          uniqueCriteriaIdentifiers.push(gameLevel.game_id);
          return true;
        } else {
          return false;
        }
      });
    });
    return newPayload;
  }


  checkMultilevelGameLevels(payload) {
    const levelDisableCount = this.calculateDisableLevels(payload);
    const dialogReference = this.dialog.open(ConfirmActionMultilevelGameComponent, {
      data: levelDisableCount ? { 'atleast_two_levels': false, 'level_count': true } :
        { 'atleast_two_levels': false, 'level_count': false, 'atleast_one_criteria_in_level': true }
    });
    dialogReference.componentInstance.title = this.translate.instant('game_not_complete');
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('keep_editing');
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.isCheckbox = false;
    dialogReference.componentInstance.onPositiveAction.subscribe(() => {
      let gameDataSource = [];
      gameDataSource = this.multilevelGameDataSource.data;
      gameDataSource.forEach(source => {
        payload.level_data.forEach((element, index) => {
          if (source.game_id === element.game_id) {
            source.disable_level = false;
            payload.level_data.splice(index, 1);
          }
        });
      });
      this.multilevelGameDataSource = new MatTableDataSource(gameDataSource);
      gameDataSource = [];
      this.addNewLevelPayload = [];
      this.multilevelGameDataSource._updateChangeSubscription();
    });
  }

  calculateDisableLevels(payload) {
    let gameDataSource = [];
    gameDataSource = this.multilevelGameDataSource.data;
    const newDataSource = gameDataSource.filter(source => {
      return !source.disable_level;
    });
    console.log(newDataSource);
    return newDataSource.length;
  }

  checkLimit(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (event.target.value.length == 0 && event.which == 48) {
      return false;
    }
    if ((charCode >= 32 && charCode <= 47) || charCode >= 58) {
      return false;
    }
  }

  addLimit(event, game) {
    if (game.max_limit == 0) {
      game.max_limit = '';
    }
    if (this.checkEmoji(event.target.value)) {
      event.target.value = '';
      game.max_limit = '';
    }
    this.disableSave = true;
    let gameData = [];
    gameData = this.multilevelGameDataSource.data;
    this.isCriteriaSelected(gameData, []);
  }


  closeNudge() {
    this.hasManagerSetLimit = true;
  }

  getCompanySetting(companyID) {
    this.loginService.getSettings(companyID).subscribe((res) => {
      const response = res;
      this.globalService.setCompanyRoles(response && response.data && response.data.settings && response.data.settings.role);
      this.globalService.setCompanySetting(response && response.data && response.data.settings && response.data.settings.permission);
      this.globalService.companySettingReceived();
    });
  }

  checkEmoji(gameLimit) {
    const ranges = 
      /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g // U+1F680 to U+1F6FF
    ;
    if (ranges.test(gameLimit)) {
      return true;
    } else {
      return false;
    }
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy() {
    // Reset Company selection filter
    this.headerService.showCompanyFilter(true);
  }
}
