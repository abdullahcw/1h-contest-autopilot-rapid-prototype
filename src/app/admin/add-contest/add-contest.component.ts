import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { ApiService } from 'src/app/services/network/api.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { GamesService } from 'src/app/services/games/games.service';
import { Options, ChangeContext, LabelType, PointerType } from '@angular-slider/ngx-slider';
import { HeaderService } from 'src/app/services/header/header.service';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { ContestService } from 'src/app/services/contest/contest.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { DatepickerRangeComponent } from '../datepicker-range/datepicker-range.component';
import { MasterOverlayComponent } from '../master-overlay/master-overlay.component';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-add-contest',
  templateUrl: './add-contest.component.html',
  styleUrls: ['./add-contest.component.scss']
})
export class AddContestComponent implements OnInit, OnChanges {


  @ViewChild('contestHeader', { static: true }) contestHeader;
  today = new Date();
  dateObj = new Date();
  contestDateRange: any = {
    contest_start_date: this.dateObj,
    contest_end_date: this.dateObj
  };
  displayedColumns: string[] = ['game_logo', 'game_name', 'attempts', 'contest_date'];
  contestDataSource = new MatTableDataSource();
  noOfItemsPerPage: number;
  pageSizeOptions: number[];
  sort = {
    'sortBy': 'contest_name',
    'order': 'asc'
  };
  is_addGame: any;
  showOverlay = false;
  sliderChanged = false;
  animationToBeApplied: string;
  games: any[];
  companyId: any;
  gamesToAdd = [];
  dateFormat = { day: 'numeric', month: 'short' };
  dateRange: Date[] = this.createDateRange();
  value: number = this.dateRange[0].getTime();
  contestRange: Options = {
    hideLimitLabels: true,
    hidePointerLabels: false,
    stepsArray: this.dateRange.map((date: Date) => {
      return { value: date.getTime() };
    }),

    translate: (value: number, label: LabelType): string => {
      return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  };

  logText = '';
  navOpen = '';
  contest;
  is_editable = false;
  is_loading = false;
  newContest = false;
  contestPermissions: any;
  searchGame = '';
  itemList;
  selectedValue: any;
  refreshGetGamesWinRate = false;

  constructor(public translate: TranslateService,
    public apiService: ApiService,
    private datePipe: DatePipe, // DO NOT REMOVE, used in html file
    public permissionService: PermissionsService,
    public dialog: MatDialog,
    public storageService: StorageService,
    private globalService: GlobalService,
    public contestService: ContestService,
    private headerService: HeaderService,
    private cdRef: ChangeDetectorRef,
    private gamesService: GamesService,
    private breadcrumbService: BreadcrumbsService,
    private activatedRoute: ActivatedRoute) {
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.id) {
        this.newContest = true;
        this.contestDataSource.data = [];
      } else {
        this.newContest = false;
      }
    });
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setContestPermission();
    });
    this.setContestPermission();
  }

  ngOnInit() {
    this.is_addGame = this.storageService.getShowGameScreen();
    this.is_loading = true;
    this.animationToBeApplied = 'easeIn';
    this.contestDateRange.contest_end_date = new Date(this.dateObj.setDate(this.contestService.validStartDate.getDate() + 30));
    this.contest = this.contestService.getContestDetails();
    this.headerService.showCompanyFilter(false);
    this.companyId = this.storageService.getCompanyId();
  }

  setContestPermission() {
    this.contestPermissions = this.permissionService.getPermissions(PermissionsKey.CONTEST);
  }

  prepareDisplayedColumns() {
    if (this.is_editable) {
      this.displayedColumns = ['game_logo', 'game_name', 'attempts', 'contest_date', 'action'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
  }
  createDateRange(): Date[] {
    const totalDays = this.contestDateRange.contest_start_date.getDate() +
      this.daysBetween(this.contestDateRange.contest_start_date, this.contestDateRange.contest_end_date);
    const updatedDates: Date[] = [];
    // Number of times value needs to be checked
    for (let i = this.contestDateRange.contest_start_date.getDate(); i <= totalDays; i++) {
      updatedDates.push(new Date(this.contestDateRange.contest_start_date.getFullYear(),
        this.contestDateRange.contest_start_date.getMonth(), i));
    }
    // update stepsArray using respective (Options) class
    const newContestRange: Options = {
      hideLimitLabels: true,
      hidePointerLabels: false,
      stepsArray: updatedDates.map((date: Date) => {
        return { value: date.getTime() };
      }),
      translate: (value: number, label: LabelType): string => {
        return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
    };
    this.contestRange = newContestRange; // re-assign to initial slider option variable
    return updatedDates;
  }

  // Calculate difference between contest start and date
  daysBetween(StartDate, EndDate) {
    const ONE_DAY = 1000 * 60 * 60 * 24;
    const start = Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate());
    const end = Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate());
    return (start - end) / ONE_DAY;
  }

  getContestGames() {
    this.is_loading = true;
    this.contestService.getContestGames(this.companyId, this.contest.contest_id, 0, 1000).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (response.success) {
        response.data.contest_games_list.forEach(game => {
          game['game_start_date'] = new Date(game['game_start_date']).getTime();
          game['game_end_date'] = new Date(game['game_end_date']).getTime();
        });
        this.contestDataSource.data = response.data.contest_games_list;
        this.contestDataSource._updateChangeSubscription();
        this.contest.game_details = this.contestDataSource.data;
        this.contestService.setContestDetails(this.contest);
      }
    });
  }

  getFilterForGames() {
    // tslint:disable-next-line:max-line-length
    let filters = `game_state=READY,LIVE&game_type=1&game_mode=CONTEST&only_som=true&contest_id=${this.contest.contest_id}&game_name=${this.searchGame}`;
    if (this.contest.owner_access_type === (Role.MID_MANAGER || Role.TEAM_LEAD)) {
      filters += `&owner_id=${this.contest.owner_id}`;
    }
    return filters;
  }

  openSidenav(item) {
    this.showOverlay = true;
    const dialogRef = this.dialog.open(MasterOverlayComponent, {
      data: item
    });
    this.animationToBeApplied = this.showOverlay ? 'easeIn' : 'easeOut';
    this.navOpen = item;
  }

  closeSidenav() {
    this.showOverlay = false;
    this.animationToBeApplied = this.showOverlay ? 'easeIn' : 'easeOut';
    this.contestHeader.property = '';
  }

  updateContest(contest) {
    this.contest = contest;
    this.contestDateRange.contest_start_date = contest.contest_start_date;
    this.contestDateRange.contest_end_date = contest.contest_end_date;
    this.is_editable = this.contest.is_editable;
    this.prepareDisplayedColumns();
    this.createDateRange();
    if (contest.game_details && contest.game_details.length) {
      this.validateGameRange(this.contest.game_details);
      this.contestDataSource.data = contest.game_details;
    }
    this.is_loading = false;
  }

  validateGameRange(games, dateType = null) {
    if (!this.contestService.validateContestDateRange) { return; }
    games.forEach(game => {
      if (this.contestDateRange.contest_start_date.getTime() > game.game_start_date) {
        game.game_start_date = this.contestDateRange.contest_start_date.getTime();
        const game_start_date = `${this.globalService.formatDateForPayload(new Date(game.game_start_date))} 00:00:00`;
        this.callToupdatGamesInContest('game_start_date', game_start_date, game);
      }
      if (this.contestDateRange.contest_end_date.getTime() < game.game_end_date) {
        game.game_end_date = this.contestDateRange.contest_end_date.getTime();
        const game_end_date = `${this.globalService.formatDateForPayload(new Date(game.game_end_date))} 23:59:59`;
        this.callToupdatGamesInContest('game_end_date', game_end_date, game);
      }
    });
  }

  updateGames() {
    if (!this.contestService.validateContestDateRange) { return; }
    this.contest.game_details.forEach(game => {
      game.game_start_date = this.contestDateRange.contest_start_date.getTime();
      const game_start_date = `${this.globalService.formatDateForPayload(new Date(game.game_start_date))} 00:00:00`;
      this.callToupdatGamesInContest('game_start_date', game_start_date, game);
      game.game_end_date = this.contestDateRange.contest_end_date.getTime();
      const game_end_date = `${this.globalService.formatDateForPayload(new Date(game.game_end_date))} 23:59:59`;
      this.callToupdatGamesInContest('game_end_date', game_end_date, game);
    });
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

  isDateRangeValid() {
    if (!this.contestService.validateContestDateRange()) {
      const startDate = JSON.parse(JSON.stringify(this.contest.contest_start_date));
      const contestMaxDate = new Date(new Date(startDate).setDate(this.contest.contest_start_date.getDate() + 89));
      const message = this.contest.contest_start_date.getTime() < this.contestService.validStartDate.getTime() ?
        this.translate.instant('correct_contest_start_date') :
        this.contest.contest_end_date.getTime() > contestMaxDate.getTime() ? this.translate.instant('correct_date_range') :
          this.translate.instant('correct_contest_end_date');
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        data: event
      });
      dialogRef.componentInstance.title = this.translate.instant('invalid_date_range');
      dialogRef.componentInstance.message = message;
      dialogRef.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
      dialogRef.componentInstance.isMultiOption = false;
      return false;
    }
    return true;
  }

  presentAddGamePopUp() {
    this.storageService.setShowGameScreen(true);
    this.is_addGame = this.storageService.getShowGameScreen();
  }

  openDatePicker(game) {
    if (this.sliderChanged || !this.isDateRangeValid()) { return; }
    const dialogRef = this.dialog.open(DatepickerRangeComponent, {
      data: {
        startDate: new Date(game.game_start_date) || '', // when no payload is available
        endDate: new Date(game.game_end_date) || '', // when no payload is available
        minDate: this.contestDateRange.contest_start_date, // for validation
        maxDate: this.contestDateRange.contest_end_date, // for validation
        title: this.translate.instant('game_date'),
        isRequired: true
      }
    });
    dialogRef.componentInstance.dateRangePicked.subscribe((data) => {
      const game_start_date = `${this.globalService.formatDateForPayload(data.startDate)} 00:00:00`;
      const game_end_date = `${this.globalService.formatDateForPayload(data.endDate)} 23:59:59`;
      this.callToupdatGamesInContest('game_start_date', game_start_date, game);
      this.callToupdatGamesInContest('game_end_date', game_end_date, game);
      if (data.startDate) {
        this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Duration_Selected_Start_Date');
      }
      if (data.endDate) {
        this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Duration_Selected_End_Date');

      }
      this.contestDataSource.data.filter(item => {
        if (game.game_id === item['game_id']) {
          item['game_start_date'] = data.startDate.getTime();
          item['game_end_date'] = data.endDate.getTime();
        }
      });
    });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  updateSelectedInputValue(value) {
    this.selectedValue = value;
  }

  chackValue(key, value, game) {
    // tslint:disable-next-line:triple-equals
    if (this.selectedValue != 0 && value == 0) {
      value = this.selectedValue;
      game.attempt_count = this.selectedValue;
      this.showAlert(this.translate.instant('invalid_value'), this.translate.instant('value_cannot_be_empty_or_zero'));
    } else {
      this.callToupdatGamesInContest(key, value, game);
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

  addGamesToContest(gameId) {
    this.contest = this.contestService.getContestDetails();
    const company_id = this.storageService.getCompanyId();
    const payload = {
      'company_id': company_id,
      'contest_id': this.contest.contest_id,
      'game_ids': gameId,
      'game_start_date': `${this.globalService.formatDateForPayload(this.contest.contest_start_date)} 00:00:00`,
      'game_end_date': `${this.globalService.formatDateForPayload(this.contest.contest_end_date)} 23:59:59`
    };
    this.contestService.addGamesToContest(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'RESTRICT_GAME_DELETE_ON_CONTEST_MLG') {
          this.checkIsGameLive();
          return;
        }
        this.getValidStartDate();
      }
      this.searchGame = '';
      this.getContestGames();
    });
  }
  isGamesScreen() {
    this.storageService.setShowGameScreen(false);
    this.is_addGame = false;
    this.getContestGames();
  }
  checkIsGameLive() {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('remove_delete_games');
    dialogRef.componentInstance.title = this.translate.instant('game_not_available_title');
    dialogRef.componentInstance.showOKbtn = true;
  }

  getValidStartDate() {
    const company_id = this.storageService.getCompanyId();
    this.contestService.getValidContestDate(company_id).subscribe((res) => {
      const response = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      this.contestService.validStartDate = new Date(response.data.valid_start_date);
    });
  }

  deleteGame(game) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });

    dialogRef.componentInstance.message = this.translate.instant('confirm_remove_game');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.is_loading = true;
      const payload = {
        'company_id': this.contest.company_id,
        'contest_id': this.contest.contest_id,
        'game_ids': [game.game_id]
      };
      this.contestService.deleteGames(payload).subscribe((res) => {
        const response = res;
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
          return;
        }
        this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Deleted');
        this.gamesToAdd = this.contestDataSource.data;
        const index = this.gamesToAdd.findIndex(gameToBeDeleted => gameToBeDeleted.game_id === game.game_id);
        this.gamesToAdd.splice(index, 1);
        this.contestDataSource = new MatTableDataSource(this.gamesToAdd);
        this.gamesToAdd = [];
        this.is_loading = false;
      });
    });

  }
  onUserChange(changeContext: ChangeContext, game): void {
    if (!this.isDateRangeValid()) { return; }
    const game_start_date = `${this.globalService.formatDateForPayload(new Date(this.getChangeContextString(changeContext).value))} 00:00:00`;
    const game_end_date = `${this.globalService.formatDateForPayload(new Date(this.getChangeContextString(changeContext).highValue))} 23:59:59`;
    this.callToupdatGamesInContest('game_start_date', game_start_date, game);
    this.callToupdatGamesInContest('game_end_date', game_end_date, game);
  }

  callToupdatGamesInContest(key, value, game) {
    if (!this.contestService.validateContestDateRange()) { return; }
    const gameIDs = [];
    gameIDs.push(game.game_id);
    this.updatGamesInContest(key, value, gameIDs);
  }
  updatGamesInContest(key, value, gameIDs) {
    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'contest_id': this.contest.contest_id,
      'game_ids': gameIDs

    };
    payload[key] = value;
    this.contestService.updateGamesToContest(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        this.getValidStartDate();
      }
      if (response.success) {
        if (value === 'DAILY') {
          this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Attempts_Added_Daily');
        } else if (value === 'WEEKLY') {
          this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Attempts_Added_Weekly');
        } else if (value === 'TOTAL') {
          this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Attempts_Added_Total');
        }
      }
    });
  }

  getChangeContextString(changeContext: ChangeContext) {
    const temp = { 'value': changeContext.value, 'highValue': changeContext.highValue };
    return temp;
  }

  refreshGamesList() {
    if (this.is_addGame) {
      this.refreshGetGamesWinRate = true;
    }
  }
  hasToRefresh() {
    this.refreshGetGamesWinRate = false;
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset Company selection filter
    this.headerService.showCompanyFilter(true);
  }

}
