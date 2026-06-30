import { Component, OnInit, ChangeDetectorRef, ViewChild, OnDestroy } from '@angular/core';
import { StorageService } from '../../services/storage/storage.service';
import { Constants, PlaceholderText } from '../../services/network/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { AttemptsService } from '../../services/attempts/attempts.service';
import { Paginations, GlobalService } from '../../services/global/global.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LocationService } from '../../services/location/location.service';
import { DepartmentService } from '../../services/department/department.service';
import { GamesService } from '../../services/games/games.service';
import { AddAttemptsComponent } from './add-attempts/add-attempts.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { DatePipe } from '@angular/common';
import { DelegateService } from '../../services/delegate/delegate.service';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'src/app/services/company/company.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-player-attempts',
  templateUrl: './player-attempts.component.html',
  styleUrls: ['./player-attempts.component.scss']
})
export class PlayerAttemptsComponent implements OnInit, OnDestroy {
  is_loading: boolean;
  customFieldFetchSubscription: any;
  displayedColumns: string[];
  filter_options = [];
  search_filters = [
    {
      'filter': Constants.NAME, value: this.translate.instant('name'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.PLAYER_NAME
    },
    {
      'filter': Constants.GAME_ID, value: this.translate.instant('game'), 'is_generic_menu': true, 'is_text_search': true,
      'is_list_search': true, 'placeholder': PlaceholderText.GAME_NAME
    },
    // {
    //   'filter': Constants.LOCATION_ID, value: this.translate.instant('location'), 'is_generic_menu': true, 'is_text_search': true,
    //   'is_list_search': true, 'placeholder': PlaceholderText.LOCATION_NAME, 'custom_menu_Item': true
    // },
    // {
    //   'filter': Constants.DEPARTMENT_ID, value: this.translate.instant('department'), 'is_generic_menu': true, 'is_text_search': true,
    //   'is_list_search': true, 'dependent_on': Constants.LOCATION_ID, 'placeholder': PlaceholderText.DEPARTMENT_NAME,
    //   'custom_menu_Item': true
    // }
  ];
  appliedFilters: any = [];
  noOfItemsPerPage: number;
  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  dataSource: any;
  totalAttempts: any;
  startLimit = 0;
  pageSizeOptions: number[];
  locationList = [];
  selection = new SelectionModel<any>(true, []);
  attempts: any;
  context = 'player-attempts';
  companyId: any;
  gameMenuList: any[];
  departmentList = [];
  menuList: any;
  fieldFetchSubscription: any;
  delegateSubscription: any;
  games: any[];
  disabledAppSearch = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  openCustomMenu: any;
  selectedId: any;
  selectedType: any;
  
  constructor(private storageService: StorageService,
    private attemptsService: AttemptsService,
    private cdRef: ChangeDetectorRef,
    public globalService: GlobalService,
    public translate: TranslateService,
    private companyService: CompanyService,
    private gameService: GamesService,
    private locationService: LocationService,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private departmentService: DepartmentService,
    private delegateService: DelegateService) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    // delegate service
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.globalService.isCompanyBelongsToCustomField()) {
        this.filter_options = this.globalService.removeCustomFilters(this.search_filters);
      }
      this.appliedFilters = [];
      this.refreshData(companyID);
      this.prepareDisplayedColumns();
    });
    this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
      if (!this.globalService.isCompanyBelongsToCustomField()) {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, res, 2);
        this.setDefaultFiltersForCustomCompany(true);
        this.filter_options.forEach(filterOption => {
          if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
            filterOption['dependent_on'] = Constants.LOCATION_IDS;
          }
        });
      }
    });
   }

  ngOnInit() {
    const companyId = this.storageService.getCompanyId();
    this.refreshData(companyId);
    this.prepareDisplayedColumns();
    if (!this.globalService.isCompanyBelongsToCustomField()) {
      const fields = this.companyService.getCustomFields();
      this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, fields, 2);
      this.filter_options.forEach(filterOption => {
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
      if (this.appliedFilters) {
        this.appliedFilters.forEach(filterOption => {
          if (filterOption.customFilterKey === Constants.DEPARTMENT_IDS) {
            filterOption['dependentOn'] = Constants.LOCATION_IDS;
          }
        });
      }
    } else {
      this.filter_options = this.globalService.removeCustomFilters(this.search_filters);
    }

  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  prepareDisplayedColumns() {
    this.displayedColumns = ['select', 'name', 'game_name', 'attempts', 'location', 'department', 'created_on'];
    if (this.globalService.isCompanyBelongsToCustomField()) {
      this.displayedColumns.splice(this.displayedColumns.indexOf('location'), 1);
      this.displayedColumns.splice(this.displayedColumns.indexOf('department'), 1);
    }
  }

  refreshData(companyId) {
    this.companyId = companyId;
    this.getAttempts();
    this.getGames();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  setDefaultFiltersForCustomCompany(refreshDashboard) {
    // this.appliedFilters = this.teamDefaultFilters;
    this.refreshListOnFilterChange(this.appliedFilters);
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.GAME_ID:
        this.getGames();
        break;
      // case Constants.LOCATION_ID:
      //   this.getLocations();
      //   break;
      // case Constants.DEPARTMENT_ID:
      //   this.getDepartments();
      //   break;
      case Constants.LOCATION_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filter);
        break;
      default:
        this.getCustomFieldsValues(filter);
        break;
    }
    this.cdRef.detectChanges();

  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    switch (filterKey) {
      default:
        const searchFilter = {
          'search_text': searchKey ? searchKey : '',
          'filter': filterKey,
          'value': currentFilter.value,
          'is_multi_selection': currentFilter.is_multi_selection,
          'custom_filter_key': currentFilter.custom_filter_key
        };
        // after applying this check the api is not called multiple times does menulist is not repopulated with same key value pairs
        if (searchKey) {
          this.getCustomFieldsValues(searchFilter);
        }
        break;
    }
    this.cdRef.detectChanges();
  }

  getGames(callback = null) {
    const filter = 'game_state=READY,LIVE&game_type=1&game_mode=CONTEST&only_som=true';
    this.gameService.getGames(this.companyId, 'game_name', 'asc', 0, 5000, filter).subscribe(res => {
      const response: any = res;
      this.games = [];
      this.gameMenuList = [];
      if (response.data) {
        this.games = response.data.game_list;
      }
      this.games.forEach((game) => {
        this.gameMenuList.push({
          id: game.game_id,
          value: game.game_name,
        });
      });
      this.menuList = this.gameMenuList;
    });
  }

  getLocations() {
    const managerID = this.storageService.getUser() ? JSON.parse(this.storageService.getUser()) : '';
    let filters = '';
    // const mid = managerID ? managerID.manager_id : '';
    if (managerID) {
      filters = `manager_id=${managerID.manager_id}`;
    }
    this.locationService.getLocations(this.storageService.getCompanyId(),
      Constants.LOCATION_NAME, 'asc', 0, 0, filters, false).subscribe((res) => {
        const response: any = res;
        let locations = [];
        const locList = [];
        if (!response.success) { return; }
        if (response.data) {
          locations = response.data.location_list;
        }
        locations.forEach((location) => {
          locList.push({
            id: location.location_id,
            value: location.location_name,
          });
        });
        let forceSelection = false;
        this.appliedFilters.filter((filter) => {
          if (filter.filter === Constants.LOCATION_IDS && filter.value === 'All') {
            forceSelection = true;
          }
        });
        const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': 'Location' };
        this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters, forceSelection);
        this.menuList = this.locationList;
        this.cdRef.detectChanges();
      });
  }

  getDepartments() {
    const locIds = [];
    let isAllLocation = false;
    const locationFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.LOCATION_IDS;
    });
    if (locationFilters && locationFilters.length > 0) {
      locationFilters.forEach(loc => {
        if (loc['id'] !== -1) {
          locIds.push(loc['id']);
        } else {
          isAllLocation = true;
        }
      });
    }

    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'location_ids': isAllLocation ? [] : locIds,
      'is_all': isAllLocation
    };
    this.departmentService.getDepartmentsByLocations(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      const list = [];
      const deptList = response.data.department_list;
      deptList.forEach((department) => {
        list.push({
          id: department.department_id,
          value: department.department_name,
        });
      });
      this.menuList = [];
      let forceSelection = false;
      this.appliedFilters.filter((filter) => {
        if (filter.filter === Constants.DEPARTMENT_IDS && filter.value === 'All') {
          forceSelection = true;
        }
      });
      const filterInfo = {
        'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': this.translate.instant('department'),
        'dependentOn': Constants.LOCATION_IDS
      };
      this.departmentList = this.globalService.prepareSelectionList(list, filterInfo, this.appliedFilters, forceSelection);
      this.menuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }


  sortData(sort: Sort) {
    switch (sort.active) {
      case 'name':
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
      case 'attempts':
        this.sort.sortBy = Constants.ATTEMPT;
        break;
      case 'location':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      case 'department':
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
      case 'created_on':
        this.sort.sortBy = Constants.CREATED_ON;
        break;
    }
    this.sort.order = sort.direction;
    this.getAttempts();
  }

  refreshListOnFilterChange(filters) {
    this.storeFilters(filters);
  }

  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, filters);
    this.getAttempts();
  }

  getDateTime(date) {
    return this.datePipe.transform(date.replace(/ /g, 'T'), 'MM/dd/yyyy hh:mm a');
  }

  getAttempts(startLimit = 0) {
    this.is_loading = true;
    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      'start_index': startLimit,
      'limit':  this.noOfItemsPerPage,
      };
      // console.log('applied filters', this.appliedFilters) ;
      this.preparePayloadFor(Constants.GAME_ID, payload, 'game_id');
      this.preparePayloadFor(Constants.NAME, payload, 'name');
      
      this.appliedFilters.forEach((elem) => {
        if (payload[elem.customFilterKey] && elem.isAll) {
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
              elem.customFilterKey
            );
          }
        }
      });
    this.attemptsService.getAttempts(payload).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        this.selection.selected.forEach(attempt => {
          this.selection.deselect(attempt);
        });
        if (response.data) {
          this.attempts = response.data.attempt_list;
          this.totalAttempts = response.data.total_count;
          this.dataSource = new MatTableDataSource(this.attempts);
        }
      });
  }

  presentAddAttemptPopup() {
    const dialogRef = this.dialog.open(AddAttemptsComponent);
    dialogRef.componentInstance.games = this.games;
    this.disabledAppSearch = true;
    dialogRef.componentInstance.limitsAdded.subscribe(res => {
      this.getAttempts();
    });

    dialogRef.afterClosed().subscribe(result => {
      this.disabledAppSearch = false;
    });


  }
  preparePayloadFor(constant, payload, key) {
    const filters = this.appliedFilters.filter((item) => {
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
          if (payload.hasOwnProperty(key)) {
            if (payload[key]['ids'].indexOf(element.id) === -1) {
              payload[key]['ids'].push(element.id);
            }
          }
        } else if (element.filter === key) {
          payload[key] = key === Constants.GAME_ID ? element.id : element.value;
        }

      });
    }
  }

  confirmDeletion() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ?
      this.translate.instant('confirm_delete_attempt') : this.translate.instant('confirm_delete_attempts');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteSelectedAttempts();
    });
  }

  deleteSelectedAttempts() {
    const companyId = this.storageService.getCompanyId();
    const attemptsToDelete = [];
    this.selection.selected.forEach(attempt => {
      if (attempt.game_attempt_id != null && attempt.game_attempt_id !== -1) {
        attemptsToDelete.push(attempt.game_attempt_id);
      }
    });
    const payload = { company_id: companyId, game_attempt_ids: attemptsToDelete };
    this.is_loading = true;
    this.attemptsService.deleteAttempts(payload).subscribe(res => {
      this.is_loading = false;
      if (res.success) {
        this.getAttempts();
      }
    });
  }

  getAttemptsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getAttempts(this.startLimit);
  }

  markForUpdation(attempt) {
    if (attempt.game_attempt_id && +attempt.attempts > 0 && +attempt.attempts <= 10) {
      const gameAttemptIds = [+attempt.game_attempt_id];
      const payload = {
        company_id: this.companyId,
        game_attempt_ids: gameAttemptIds,
        attempt: +attempt.attempts
      };
      this.attemptsService.updateAttempts(payload).subscribe(res => {
      });
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Attempts_Select_${filter.filter}`;
    // console.log('trying', keyName);
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }

  getCustomFieldsValues(filterDetails) {
    if (filterDetails.custom_filter_key === Constants.LOCATION_IDS) {
      this.getLocations();
      return;
    }
    if (filterDetails.custom_filter_key === Constants.DEPARTMENT_IDS) {
      this.getDepartments();
      return;
    }

    const companyId = this.storageService.getCompanyId();
    const field = filterDetails.filter;
    const searchingIn = filterDetails.value;
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.companyService.getCustomFieldsValues(field, companyId, searchText ? searchText : null).subscribe(res => {
      const response: any = res;
      if (response.success) {
        if (filterDetails.is_multi_selection) {
          const mList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
          const filterInfo = { 'filter_name': field, 'searching_in': searchingIn };
          const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
          const forceSelection = clickedFilter && clickedFilter.value === 'All' ? true : false;
          this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
        } else {
          this.menuList = this.globalService.prepareMenuList(response.data.values, filterDetails, this.context);
        }
        this.cdRef.detectChanges();
      }
    });
  }
  toggleMenu(event, id, type) {
    console.log('hiiiii')
    this.openCustomMenu = event;
    this.selectedId = id;
    this.selectedType = type;
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
