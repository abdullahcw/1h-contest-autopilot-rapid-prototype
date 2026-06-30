import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { TrophyService } from 'src/app/services/trophy/trophy.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Route } from '../../services/login/login.service';
import { Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';

const trophyTypes = [
  { id: true, value: "General" },
  { id: false, value: Constants.GAME_SINGLE_LEVEL },
  { id: false, value: Constants.GAME_MULTI_LEVEL },
  { id: "contest", value: "Contest" },
];
const status = [
  { id: "ALL", value: "All Games" },
  { id: "ACTIVE", value: "Active Games" },
];
@Component({
  selector: 'app-trophy-list',
  templateUrl: './trophy-list.component.html',
  styleUrls: ['./trophy-list.component.scss']
})
export class TrophyListComponent implements OnInit, OnDestroy {


  pageSizeOptions;
  noOfItemsPerPage;
  is_loading = false;
  appliedFilters: any;
  startLimit = 0;
  totalTrophies;
  trophiesData;
  displayedColumns;
  localSearch = '';
  trophyDataSource;
  context = 'trophy-list';
  menuList = [];
  defaultFilters = [];
  constest_filters;
  sort = {
    'sortBy': Constants.TROPHY_NAME,
    'order': 'asc'
  };

  trophy_name_filter = {
    'filter': Constants.TROPHY_NAME, value: 'Trophy', 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.TROPHY_NAME
  };

  contest_name_filter = {
    'filter': Constants.CONTEST_NAME, value: 'Contest', 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.CONTEST_NAME
  };

  filter_options = [
    {
      'filter': Constants.IS_ACHIEVED, value: 'Trophy', 'is_text_search': true, 'is_list_search': true,
      'placeholder': '',
      'is_generic_menu': true, 'is_default': true
    },
    {
      'filter': Constants.GAME_STATUS, value: 'Status', 'is_text_search': true, 'is_list_search': true,
      'placeholder': '', 'is_generic_menu': true, 'is_default': true
    }
  ];
  trophyType = 'general';
  trophy_info: any = {
    title: '',
    description: '',
    trophy_type: 1
  };
  delegateSubscription: any;
  @ViewChild('paginator') paginator: MatPaginator;
  constructor(
    public cdRef: ChangeDetectorRef,
    public trophyService: TrophyService,
    public delegateService: DelegateService,
    public globalService: GlobalService,
    public router: Router,
    public dialog: MatDialog,
    public permissionService: PermissionsService,
    public storageService: StorageService,
    public translate: TranslateService
  ) {

    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('trophy-list') !== -1) {
        this.trophyType = 'general';
        this.addDefaultFilter();
        if (this.appliedFilters && this.appliedFilters.length) {
          this.getTrophies();
        }
      }
    });
  }

  ngOnInit() {
    this.addDefaultFilter();
    const is_TrophyExist = this.containsObject(this.trophy_name_filter, this.filter_options);
    if (!is_TrophyExist) {
      this.create_filterOptions('Trophy');
    }
  }

  create_filterOptions(filter_key) {
    console.log("hi");
    switch (filter_key) {
      case this.contest_name_filter.value:
        this.removeFilter(this.trophy_name_filter);
        this.prepareContestFilter(this.contest_name_filter);
        break;
      case this.trophy_name_filter.value:
        this.removeFilter(this.contest_name_filter);
        this.prepareTrophyFilter(this.trophy_name_filter);
        break;
    }
  }


  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Trophy_Reports_By_${filter.filter}`;
    console.log(keyName);
    if (filter.filter === Constants.PLAYER_STATUS || filter.filter === Constants.IS_ACHIEVED) {
      this.globalService.addAdminGoogleEvent(`${keyName}_${filter.value}`);
      return;
    }
    this.globalService.addAdminGoogleEvent(keyName);
  }

  removeFilter(filterToBeRemoved, fromFilters = this.filter_options) {
    fromFilters.filter(filter => {
      if (filter.value === filterToBeRemoved.value) {
        const index = fromFilters.indexOf(filterToBeRemoved);
        fromFilters.splice(index, 1);
      }
    });
  }
  containsObject(obj, list) {
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
        return true;
      }
    }
    return false;
  }

  prepareTrophyFilter(trophy_name_filter) {
    const is_TrophyExist = this.containsObject(trophy_name_filter, this.filter_options);
    if (is_TrophyExist) {
      return;
    } else {
      this.filter_options.push(trophy_name_filter);
    }
  }

  prepareContestFilter(contest_name_filter) {
    this.filter_options.push(contest_name_filter);
  }

  getTrophies() {
    this.is_loading = true;
    this.appliedFilters = this.storageService.getFilterFromStroage(this.context);
    const companyId = this.storageService.getCompanyId();
    console.log('appliedFilters', this.appliedFilters);
    this.trophyService.getTrophiesByReport(companyId, true, this.trophyType, this.sort.sortBy, this.sort.order,
      this.appliedFilters, this.startLimit, this.noOfItemsPerPage).subscribe(res => {
        const response: any = res;
        if (!response.success) {
          return;
        }
        this.totalTrophies = response.data.trophies_count;
        this.is_loading = false;
        if (response.data.trophies.length) {
          this.trophiesData = response.data.trophies;
          this.trophyDataSource = new MatTableDataSource(this.trophiesData);
          this.changeColumn();
        } else {
          this.trophiesData = '';
          this.trophyDataSource = '';
        }
      });
  }
  navigateToTrophyReport(trophy) {
    const queryParams = {
      trophyType: this.trophyType,
      id: trophy.trophy_id,
      gameId: trophy.game_id,
      mlgId: trophy.mlg_id,
      trophyName: this.trophy_info.trophy_type === 1 ? trophy.trophies_name :
        this.trophy_info.trophy_type === 2 ? trophy.game_name : trophy.mlg_name
    };
    this.globalService.addAdminGoogleEvent('Trophy_Reports_Trophy_Viewed');
    this.router.navigate([Route.TROPHYREPORT], {
      queryParams: queryParams
    });
  }

  downloadContestTrophyReport() {
    const filters = this.storageService.getFilterArray(this.context);
    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'sort_by': Constants.NAME ? Constants.CONTEST_NAME : this.sort.sortBy,
      'order': this.sort.order
    };
    if (filters && filters[1] && filters[1].value) {
      payload['contest_name'] = filters[1].value;
    }
    this.trophyService.downloadContestTrophyReport(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) { return; }
      window.location.assign(response.data.url);
      this.globalService.showMessage(this.translate.instant('downloading_file'));
    });
  }

  getPlayersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    if (this.trophyType === 'mlg') {
      console.log('mlg');
      this.getMlgTrophies();
    } else if (this.trophyType === 'contest') {
      this.getContestTrophies();
    } else {
      this.getTrophies();
    }
  }
  getContestTrophies() {
    this.is_loading = true;
    const contestTrophyPayload = {
      'company_id': this.storageService.getCompanyId(),
      'sort_by': this.sort.sortBy,
      'order': this.sort.order ? this.sort.order : 'asc',
      'start_index': this.startLimit ? this.startLimit : 0,
      'limit': this.noOfItemsPerPage ? this.noOfItemsPerPage : 100,
      'is_achieved': 'contest',
    };
    if (this.appliedFilters[1] && this.appliedFilters[1].filter == Constants.CONTEST_NAME) {
      contestTrophyPayload['contest_name'] = this.appliedFilters[1].value;
    }
    // console.log('contestTrophyPayload', contestTrophyPayload, this.appliedFilters);
    this.trophyService.getContestTrophiesBy(contestTrophyPayload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      this.displayedColumns = ['contest_logo', 'contest_name', 'player_name', 'winner_score', 'defeated_player'];
      this.is_loading = false;
      this.trophyType = 'contest';
      this.totalTrophies = response.data.total_count;
      if (response.data.contest.length) {
        this.trophyDataSource = new MatTableDataSource(response.data.contest);
      } else {
        this.trophyDataSource = '';
      }
    });
  }

  refreshListOnFilterChange(filters) {
    console.log(' this.storageService.getFilterArray(this.context)', this.storageService.getFilterArray(this.context));
    console.log(' filters local', filters);
    const localFilters = this.storageService.getFilterArray(this.context);
    // const localFilterType = localFilters[0].value;

    if (filters.length === 2) {
      if ((filters[0].value !== 'Contest') && filters[1].searchingIn === 'Contest') {
        filters.splice(1, 1);
      } else if ((filters[0].value === 'Contest') && filters[1].searchingIn === 'Trophy') {
        filters.splice(1, 1);
      }
    }
    if (filters.length && filters[0].id === 'contest') {
      this.constest_filters = filters[0];
      this.appliedFilters = filters;
      this.removeStatusFilter();
      this.removeSearchFilter();
      this.storeFilters();
      this.sort.sortBy = Constants.TROPHY_NAME;
      this.getContestTrophies();
      this.create_filterOptions('Contest');
      // this.removeStatusFilter();
      return;
    }
    if (filters.length && filters[0].value === Constants.GAME_MULTI_LEVEL) {
      this.constest_filters = filters[0];
      this.appliedFilters = filters;
      this.storeFilters();
      // this.getMlgTrophies();
    }
    this.create_filterOptions('Trophy');
    if (!filters.length) {
      const item = {
        'filter': Constants.IS_ACHIEVED,
        'searchingIn': 'Trophy',
        'value': 'General',
        'id': true,
        'additionalFilter': false,
        'dependentOn': '',
        'isDefault': true
      };
      filters.push(item);
    } else {
      this.appliedFilters = filters;
      this.storeFilters();
    }
    let gameTypeMatched;
    if (localFilters.length) {
      if (filters[0].value === localFilters[0].value) {
        gameTypeMatched = true;
      } else {
        gameTypeMatched = false;
      }
    }

    if (filters[0].value === Constants.GAME_SINGLE_LEVEL || filters[0].value === Constants.GAME_MULTI_LEVEL) {
      this.addGameStatusFilter(gameTypeMatched);
      this.storeFilters();
    } else {
      if (filters.length && filters[0].id === 'contest') {
       this.removeFilter(this.trophy_name_filter);
      }
      this.removeStatusFilter(gameTypeMatched);
      this.storeFilters();
    }
    this.trophyTypeChanged(filters);
  }

  trophyTypeChanged(event) {
    let type;
    // console.log('trophyTypeChanged', event[0].value);
    type = event[0].value === Constants.GAME_SINGLE_LEVEL ? 'game' : event[0].value === Constants.GAME_MULTI_LEVEL ? 'mlg' : 'general';
    this.trophy_info.trophy_type = type === 'general' ? 1 : type === 'mlg' ? 3 : 2;
    this.trophyType = type === 'general' ? 'general' : 'game';
    if (event[0].value !== Constants.GAME_MULTI_LEVEL) {
      this.sort.sortBy = type === 'general' ? Constants.TROPHY_NAME : Constants.GAME_NAME;
      this.getTrophies();
    } else if (event[0].value === Constants.GAME_MULTI_LEVEL) {
      this.getMlgTrophies();
    }
    // this.getTrophies();
  }


  sortData(sort: Sort) {
    this.sort.order = sort.direction;
    switch (sort.active) {
      case 'mlg_name':
        this.sort.sortBy = Constants.MLG_NAME;
        this.getMlgTrophies();
        break;
      case 'game_name':
        this.sort.sortBy = Constants.GAME_NAME;
        this.getTrophies();
        break;
      case 'fixed-trophy_name':
        this.sort.sortBy = Constants.TROPHY_NAME;
        this.getTrophies();
        break;
      case 'contest_name':
        this.sort.sortBy = Constants.NAME;
        this.getContestTrophies();
        break;
      case 'player_name':
        this.sort.sortBy = Constants.FIRST_NAME;
        this.getContestTrophies();
        break;
      case 'winner_score':
        this.sort.sortBy = Constants.WINNER_SCORE;
        this.getContestTrophies();
        break;
      case 'defeated_player':
        this.sort.sortBy = Constants.DEFEATED_PLAYER;
        this.getContestTrophies();
        break;
      default:
        this.sort.sortBy = Constants.GAME_NAME;
        this.getTrophies();
        break;
    }
  }

  getDataSource(filterName) {
    switch (filterName) {
      case Constants.IS_ACHIEVED:
        this.menuList = trophyTypes;
        this.cdRef.detectChanges();
        break;
      case Constants.GAME_STATUS: console.log('filterName', filterName);
        this.menuList = status; 
        this.cdRef.detectChanges();
        break;
    }
  }

  storeFilters() {
    this.storageService.setFilters(this.context, this.appliedFilters);
    this.startLimit = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  addDefaultFilter() {
    this.defaultFilters = [];
    const trophyFilters = this.storageService.getFilterArray(this.context);
    if (trophyFilters && trophyFilters.length) { return; }
    const item = {
      'filter': Constants.IS_ACHIEVED,
      'searchingIn': 'Trophy',
      'value': 'General',
      'id': true,
      'additionalFilter': false,
      'dependentOn': '',
      'isDefault': true
    };
    this.defaultFilters.push(item);
    this.appliedFilters = this.defaultFilters;
    this.storageService.setFilters(this.context, item);
    this.getTrophies();
  }

  changeColumn() {
    if (this.trophyType === 'general') {
      this.displayedColumns = ['fixed-photo', 'fixed-trophy_name', 'description'];
    } else if (this.trophyType !== 'general') {
      this.displayedColumns = ['photo', 'game_name', 'points', 'attempts', 'high_score'];
    }
  }

  getMlgTrophies() {
    this.is_loading = true;
    this.appliedFilters = this.storageService.getFilterFromStroage(this.context);
    console.log(this.appliedFilters, this.context);
    const companyId = this.storageService.getCompanyId();
    this.trophyService.getMlgTrophiesBy(companyId, Constants.MLG_NAME, this.sort.order,
      this.appliedFilters, this.startLimit, this.noOfItemsPerPage).subscribe(res => {
        const response: any = res;
        if (!response.success) {
          return;
        }
        this.displayedColumns = ['mlg_photo', 'mlg_name', 'levels'];
        this.is_loading = false;
        this.trophyType = 'mlg';
        this.totalTrophies = response.data.total_mlg;
        if (response.data.mlg_list.length) {
          this.trophyDataSource = new MatTableDataSource(response.data.mlg_list);
        } else {
          this.trophyDataSource = '';
        }
      });
  }

  addGameStatusFilter(gameTypeMatched) {
    const item = {
      'filter': Constants.GAME_STATUS,
      'searchingIn': 'Status',
      'value': 'Active Games',
      'id': 'ACTIVE',
      'additionalFilter': false,
      'dependentOn': '',
      'isDefault': true
    };
    const index = this.appliedFilters.map(function (e) { return e.filter; }).indexOf('game_status');
    const indexActive = this.appliedFilters.map(function (e) { return e.id; }).indexOf('ACTIVE');
    if (!gameTypeMatched && index !== -1) {
      this.appliedFilters.splice(index, 1);
      this.appliedFilters.push(item);
    }
    if ((index === -1 && indexActive === -1)) {
      console.log('if');
      this.appliedFilters.push(item);
    }
  }
  removeStatusFilter({ type = null }: { type?: any; } = {}) {
    const index = this.appliedFilters.map(function (e) { return e.filter; }).indexOf('game_status');
    if (index !== -1) {
      this.appliedFilters.splice(index, 1);
    }
  }
  removeSearchFilter({ type = null }: { type?: any; } = {}) {
      // console.log('this.appliedFilters', this.appliedFilters);
      const index = this.appliedFilters.map(function (e) { return e.filter; }).indexOf('trophy_name');
      if (index !== -1) {
        this.appliedFilters.splice(index, 1);
      }
    } 
  
  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
