import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, NgModel } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ContestService, Games, Range } from 'src/app/services/contest/contest.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { GameCategoryService } from 'src/app/services/game-category/game-category.service';
import { DatePipe } from '@angular/common';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import moment from 'moment-timezone';
import { Role } from 'src/app/services/permissions/permissions.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-add-games-in-contest',
  templateUrl: './add-games-in-contest.component.html',
  styleUrls: ['./add-games-in-contest.component.scss']
})
export class AddGamesInContestComponent implements OnInit, OnChanges {

  show = false;
  contest;
  is_loading = false;
  sort: any = {
    sortBy: Constants.GAME_NAME,
    order: 'asc'
  };
  filterGames = new FormControl();
  gameCategory;
  ratingItems = [
    { id: 1, value: '0-25', checked: false },
    { id: 2, value: '25-50', checked: false },
    { id: 3, value: '50-75', checked: false },
    { id: 4, value: '75-100', checked: false },
  ];
  lastPlayedItems = [
    { id: 1, label: 'This Month', value: this.getLastPlayedDateValue(Range.THIS_MONTH), checked: false },
    { id: 2, label: 'Last Month', value: this.getLastPlayedDateValue(Range.LAST_MONTH), checked: false },
    { id: 3, label: 'Last 6 Months', value: this.getLastPlayedDateValue(Range.LAST_6_MONTH), checked: false },
    { id: 4, label: 'Last 12 Months', value: this.getLastPlayedDateValue(Range.LAST_12_MONTH), checked: false },
  ];
  lastPlayedItemRadio = null;
  selectedCategory = [];
  selectedRating = [];
  selectedLastPlayedStartDate = [];
  selectedLastPlayedEndDate = [];
  companyId: any;
  notEmpty = true;
  notScrolly = true;
  pageSizeOptions: number[];
  noOfItemsPerPage: number;
  Games: any = {
    game_id: '',
    game_name: '',
    game_image_url: '',
  };
  displayedColumns: string[] = ['select', 'game_logo', 'game_name', 'game_category', 'last_played', 'winrate'];
  selectedGame: Games;
  totalGamesSelected = false;
  allowMultiSelect = true;
  selection = new SelectionModel<Games>(this.allowMultiSelect, []);
  @ViewChild('filterInput') filterInput: NgModel;
  @Output() hasToRefresh: EventEmitter<any> = new EventEmitter(); 
  @Output() isGamesScreen: EventEmitter<any> = new EventEmitter();
  games: any[];
  gameDatsSource: any;
  timeZone: string = null;
  searchText: string = null;
  isToggled = false;
  openFilterMenu = false;
  startDate;
  endDate;
  isSelected: boolean;
  copySelection;
  isMobile = false;
  @Input() refreshGetGamesWinRate: boolean;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
      this.openFilterMenu = false;
    }
  }
  constructor(
    public translate: TranslateService,
    public gameCategoryService: GameCategoryService,
    public contestService: ContestService,
    public apiService: ApiService,
    private datePipe: DatePipe,
    private globalService: GlobalService,
    private cdRef: ChangeDetectorRef,
    public storageService: StorageService) {
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
  }
  ngOnInit() {
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
    this.contest = this.contestService.getContestDetails();
    this.companyId = this.storageService.getCompanyId();
    this.selectedGame = new Games();
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    this.getCategory();
    this.getGames();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.filterGames.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {
        this.searchText = res;
        this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
        this.scrollTop();
        this.getGames();
      });
    this.cdRef.detectChanges();

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.refreshGetGamesWinRate && changes.refreshGetGamesWinRate.currentValue)) {
      this.getGames();
    }
  }

  getDate(date) {
    if (date) {
      return this.datePipe.transform(date.replace(/ /g, 'T'), 'MM/dd/yyyy');
    }
  }
  closeSidenav() {
    this.isToggled = false;
  }
  getCategory() {
    this.is_loading = true;
    const contest = JSON.parse(this.storageService.getContest());
    const contestId = contest.contest_id;
    // tslint:disable-next-line:max-line-length
    this.gameCategoryService.getGameCategory(this.storageService.getCompanyId(), this.sort.sortBy, this.sort.order, 0, 500, null, contestId).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.gameCategory = response.data.category_list;
      }
    });
  }
  gameCategoryLengthCheck() {
    return this.gameCategory && this.gameCategory.length > 5 ? true : false;
  }

  getGames() {
    this.is_loading = true;
    const payload = this.createPayload();
    this.contestService.getGameList(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      this.notScrolly = true;
      if (response.data) {
        this.hasToRefresh.emit();
        this.games = res.data.games;
        const mregeGameList = this.selectedItemDiffGames(this.selection.selected, this.games);
        this.gameDatsSource = new MatTableDataSource(mregeGameList);
      }
      if (this.games && this.games.length === 0) {
        this.notEmpty = false;
      }
    });
  }
  selectedItemDiffGames(existingSelectedGames, gamesList) {
    if (existingSelectedGames.length > 0) {
      existingSelectedGames.filter(game => {
        gamesList.filter(ngame => {
          if (game.game_id === ngame.game_id) {
            const index = gamesList.indexOf(ngame);
            gamesList.splice(index, 1);
          }
        });
        gamesList.unshift(game);
      });
    }
    return gamesList;
  }
  createPayload() {
    const company_id = this.storageService.getCompanyId();
    const contest = JSON.parse(this.storageService.getContest());
    let payload = {
      'company_id': company_id,
      'contest_id': contest.contest_id,
      'limit': this.noOfItemsPerPage,
      'start_index': 0,
      'time_zone': this.timeZone,
      'only_som': true,
      'game_name': this.searchText,
      'ratings': this.filterIdsFromArrayOfObjects(this.selectedRating, 'value'),
      'game_category_ids': this.filterIdsFromArrayOfObjects(this.selectedCategory, 'game_cat_id'),
      'start_date': this.selectedLastPlayedStartDate,
      'end_date': this.selectedLastPlayedEndDate,
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };
    if (this.contest && this.contest.owner_access_type === (Role.MID_MANAGER || Role.TEAM_LEAD)) {
      payload['owner_id'] = this.contest.owner_id;
      payload['access_type'] = this.contest.owner_access_type;
    }
    return payload = this.removeEmptyFields(payload);
  }

  onScroll() {
    if (this.notScrolly && this.notEmpty) {
      this.notScrolly = false;
      this.getNextSessions();
    }
    this.cdRef.detectChanges();
  }

  getNextSessions() {
    this.noOfItemsPerPage = this.noOfItemsPerPage + Paginations.DEFAULT_ITEM_PER_PAGE;
    if (this.isMobile) {
      this.scrollTop();
    }
    this.getGames();
  }

  onItemClick(item, event) {
    if (event.checked) {
      this.selectedCategory.push(item);
      this.globalService.addAdminGoogleEvent('Contests_Game_filtered_by_category');
    } else {
      const index = this.selectedCategory.findIndex(x => item.game_cat_id === x.game_cat_id);
      if (index > -1) {
        this.selectedCategory.splice(index, 1);
      }
    }
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.scrollTop();
    this.getGames();
  }
  onRatingClick(item, event) {
    if (event.checked) {
      this.globalService.addAdminGoogleEvent('Contests_Game_filtered_by_rating');
      this.selectedRating.push(item);
    } else {
      const index = this.selectedRating.findIndex(x => x.value === item.value);
      if (index > -1) {
        this.selectedRating.splice(index, 1);
      }
    }
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.scrollTop();
    this.getGames();
  }
  onLastedPlayedClick(item) {
    this.selectedLastPlayedStartDate = [];
    this.selectedLastPlayedEndDate = [];
    this.selectedLastPlayedStartDate.push(item.value.startDate);
    this.selectedLastPlayedEndDate.push(item.value.endDate);
    this.globalService.addAdminGoogleEvent('Contests_Game_filtered_by_timeplayed');
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.scrollTop();
    this.getGames();

  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.gameDatsSource.data.length;
    return numSelected === numRows && numSelected;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() :
      this.gameDatsSource.data.filter((element) => {
        return true;
      }).forEach(row => this.selection.select(row));
    if (!this.isAllSelected()) {
      this.totalGamesSelected = false;
    }
  }
  sortData(sort: Sort) {
    switch (sort.active) {
      case 'game_name':
        this.sort.sortBy = Constants.GAME_NAME;
        this.globalService.addAdminGoogleEvent('Contests_Game_sorted_by_game');
        break;
      case 'game_category':
        this.sort.sortBy = Constants.GAME_CATEGORY;
        this.globalService.addAdminGoogleEvent('Contests_Game_sorted_by_category');
        break;
      case 'last_played':
        this.sort.sortBy = Constants.LAST_PLAYED;
        this.globalService.addAdminGoogleEvent('Contests_Game_sorted_by_lastplayed');
        break;
      case 'winrate':
        this.sort.sortBy = Constants.WINRATE;
        this.globalService.addAdminGoogleEvent('Contests_Game_sorted_by_rating');
        break;
      default:
        this.sort.sortBy = sort.active ? sort.active : Constants.GAME_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getGames();
  }
  removeEmptyFields(obj) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName].length === 0) {
        delete obj[propName];
      }
    }
    return obj;
  }
  getLastPlayedDateValue(value) {
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    switch (value) {
      case Range.THIS_MONTH:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('month').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('month').format(DATE_FORMAT);
          return {
            startDate: this.startDate,
            endDate: this.endDate,
          };
        }
        break;
      case Range.LAST_MONTH:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).subtract(1, 'months').startOf('month').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).subtract(1, 'months').endOf('month').format(DATE_FORMAT);
          return {
            startDate: this.startDate,
            endDate: this.endDate,
          };
        }
        break;
      case Range.LAST_6_MONTH:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).subtract(6, 'months').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).format(DATE_FORMAT);
          return {
            startDate: this.startDate,
            endDate: this.endDate,
          };
        }
        break;
      case Range.LAST_12_MONTH:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).subtract(12, 'months').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).format(DATE_FORMAT);
          return {
            startDate: this.startDate,
            endDate: this.endDate,
          };
        }
        break;
    }
  }
  filterIdsFromArrayOfObjects(arrayToBeFilter, key) {
    if (!arrayToBeFilter) { return; }
    const arrayToBeFill = [];
    arrayToBeFilter.forEach(item => {
      arrayToBeFill.push(item[key]);
    });
    return arrayToBeFill;
  }
  filterIdsFromArrayOfObjectsDate(arrayToBeFilter, key) {
    if (!arrayToBeFilter) { return; }
    const arrayToBeFill = [];
    arrayToBeFilter.forEach(item => {
      arrayToBeFill.push(item.value[key]);
    });
    return arrayToBeFill;
  }
  clearAll() {
    this.gameCategory.forEach(element => {
      element.checked = false;
    });
    this.ratingItems.forEach(element => {
      element.checked = false;
    });
    this.lastPlayedItemRadio = null;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.selectedCategory = [];
    this.selectedRating = [];
    this.selectedLastPlayedStartDate = [];
    this.selectedLastPlayedEndDate = [];
    this.scrollTop();
    this.getGames();
  }
  goToContestBuilder() {
    this.storageService.setShowGameScreen(false);
    this.selection.clear();
    this.isGamesScreen.emit();
  }

  addGamesToContest() {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    const payload = {
      'company_id': company_id,
      'contest_id': this.contest.contest_id,
      'game_ids': this.filterIdsFromArrayOfObjects(this.selection.selected, 'game_id'),
      'game_start_date': `${this.globalService.formatDateForPayload(this.contest.contest_start_date)} 00:00:00`,
      'game_end_date': `${this.globalService.formatDateForPayload(this.contest.contest_end_date)} 23:59:59`
    };
    this.contestService.addGamesToContest(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'RESTRICT_GAME_DELETE_ON_CONTEST_MLG') {
          return;
        }
      }
      this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Added');
      this.goToContestBuilder();
    });
  }
  filterMenuOpen() {
    this.openFilterMenu = true;
  }
  filterMenuClose() {
    this.openFilterMenu = false;
  }

  scrollTop() {
    if (document.getElementById('container')) {
      document.getElementById('container').scrollTop = 0;
    }
    this.cdRef.detectChanges();
  }
}

