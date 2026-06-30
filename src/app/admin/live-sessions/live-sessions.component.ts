import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StorageService } from '../../services/storage/storage.service';
import { Constants, PlaceholderText } from '../../services/network/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Paginations, GlobalService } from '../../services/global/global.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LocationService } from '../../services/location/location.service';
import { DepartmentService } from '../../services/department/department.service';
import { GamesService } from '../../services/games/games.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { DatePipe } from '@angular/common';
import { DelegateService } from '../../services/delegate/delegate.service';
import { GameSessionsService } from '../../services/game-sessions/game-sessions.service';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'src/app/services/company/company.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-live-sessions',
  templateUrl: './live-sessions.component.html',
  styleUrls: ['./live-sessions.component.scss']
})
export class LiveSessionsComponent implements OnInit, OnDestroy {
  is_loading: boolean;
  displayedColumns: string[] = ['select', 'name', 'game_name', 'played_on'];
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
    //   'is_list_search': true, 'dependent_on': Constants.LOCATION_ID, 'placeholder': PlaceholderText.DEPARTMENT_NAME, 'custom_menu_Item': true
    // }
  ];
  appliedFilters = [];
  noOfItemsPerPage: number;
  sort = {
    'sortBy': Constants.PLAYED_ON,
    'order': 'desc'
  };
  dataSource: any;
  totalSessions: any;
  startLimit = 0;
  pageSizeOptions: number[];
  selection = new SelectionModel<any>(true, []);
  sessions: any;
  context = 'live-sessions';
  companyId: any;
  gameMenuList: any[];
  menuList: any[];
  games: any[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  delegateSubscription: any;
  customFieldFetchSubscription: any;


  constructor(private storageService: StorageService,
    public globalService: GlobalService,
    private gameSessionsService: GameSessionsService,
    private gameService: GamesService,
    private locationService: LocationService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public translate: TranslateService,
    private datePipe: DatePipe,
    private companyService: CompanyService,
    private departmentService: DepartmentService,
    private delegateService: DelegateService) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      this.refreshData(companyID);
    });
    this.customFieldFetchSubscription =
      this.companyService.onCustomFieldsFetched.subscribe((res) => {
        if (!this.globalService.isCompanyBelongsToCustomField()) {
          console.log('m here');
          this.filter_options = this.globalService.addeditCompanyCustomFilters(
            this.filter_options,
            res,
            2
          );
          // this.setDefaultFiltersForCustomCompany(true);
          this.filter_options.forEach((filterOption) => {
            if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
              filterOption['dependent_on'] = Constants.LOCATION_IDS;
              filterOption['custom_menu_Item'] = true;
            }
            if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
              filterOption['custom_menu_Item'] = true;
            }
          });
        }
      });
  }

  // setDefaultFiltersForCustomCompany(refreshDashboard) {
  //   this.refreshListOnFilterChange(this.appliedFilters);
  // }

  ngOnInit() {
    const companyId = this.storageService.getCompanyId();
    this.refreshData(companyId);

    if (!this.globalService.isCompanyBelongsToCustomField()) {
      const fields = this.companyService.getCustomFields();
      this.filter_options = this.globalService.addeditCompanyCustomFilters(
        this.filter_options,
        fields,
        2
      );

      this.filter_options.forEach((filterOption) => {
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
          filterOption['custom_menu_Item'] = true;
        }
        if (filterOption.custom_filter_key === Constants.LOCATION_IDS) {
          filterOption['custom_menu_Item'] = true;
        }
      });
    }
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  refreshData(companyId) {
    this.filter_options = this.globalService.removeCustomFilters(this.search_filters);
    this.companyId = companyId;
    // this.appliedFilters = this.storageService.removeAppliedFiltersOnCompanyChange(this.appliedFilters, this.context);
    if (!this.storageService.getFilterFromStroage(this.context)) {
      this.appliedFilters = [];
    }
    this.getSessions();
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

  getDataSource(filterName) {
    // console.log('filterName);
    switch (filterName.filter) {
      case Constants.GAME_ID:
        this.getGames();
        break;
      case Constants.LOCATION_ID:
        // this.getLocations();
        this.getCustomFieldsValues(filterName);
        break;
      case Constants.DEPARTMENT_ID:
        // this.getDepartments();
        this.getCustomFieldsValues(filterName);
        break;
      default:
        if (!this.globalService.isCompanyBelongsToCustomField()) {
          this.getCustomFieldsValues(filterName);
        }
        break;
    }
  }

  getCustomFieldsValues(filterDetails) {
    console.log('madnisfbs', filterDetails);
    if (filterDetails.custom_filter_key === Constants.LOCATION_IDS) {
      this.getLocations();
      return;
    }
    if (filterDetails.custom_filter_key === Constants.DEPARTMENT_IDS) {
      this.getDepartmentsByLocations();
      return;
    }

    const companyId = this.storageService.getCompanyId();
    const field = filterDetails.filter;
    const searchingIn = filterDetails.value;
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.companyService
      .getCustomFieldsValues(field, companyId, searchText ? searchText : null)
      .subscribe((res) => {
        const response: any = res;
        if (response.success) {
          if (filterDetails.is_multi_selection) {
            const mList = this.globalService.prepareMenuList(
              response.data.values,
              filterDetails,
              this.context
            );
            const filterInfo = {
              filter_name: field,
              searching_in: searchingIn,
            };
            const clickedFilter = this.appliedFilters.filter(
              (appliedFilter) =>
                appliedFilter.searchingIn === filterDetails.value
            )[0];
            const forceSelection =
              clickedFilter && clickedFilter.value === 'All' ? true : false;
            // console.log('mlist', mList, filterInfo, this.appliedFilters, forceSelection);
            this.menuList = this.globalService.prepareSelectionList(
              mList,
              filterInfo,
              this.appliedFilters,
              forceSelection
            );
            // console.log('menulist', this.menuList);
          } else {
            this.menuList = this.globalService.prepareMenuList(
              response.data.values,
              filterDetails,
              this.context
            );
          }
        }
      });
    this.cdRef.detectChanges();
  }

  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Incomplete_Sessions_Report_By_${filter.filter}`;
    // console.log(keyName);
    // const keyName = this.trophyType === 'general' ? `Trophies_General_${filter.filter}` : `Trophies_Game_${filter.filter}`;
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }
  getGames(callback = null) {
    const filter = 'game_state=READY,LIVE&game_type=1&game_mode=CONTEST&only_som=true';
    this.gameService.getGames(this.companyId, 'game_name', 'asc', 0, 5000, filter, true, true).subscribe(res => {
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
          is_deleted: game.is_deleted
        });
      });
      this.menuList = this.gameMenuList;
    });
  }

  getLocations() {
    const managerID = this.storageService.getUser() ? JSON.parse(this.storageService.getUser()) : '';
    let filters = '';
    if (managerID) {
      filters = `manager_id=${managerID.manager_id}`;
    }
    this.locationService.getLocations(this.storageService.getCompanyId(), Constants.LOCATION_NAME,
      'asc', 0, 0, filters, false).subscribe((res) => {
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
      const locFilterInfo = {
        filter_name: Constants.LOCATION_IDS,
        searching_in: this.translate.instant('location'),
      };
      this.menuList = this.globalService.prepareSelectionList(
        locList,
        locFilterInfo,
        this.appliedFilters
      );
      this.cdRef.detectChanges();
    // });
      // this.menuList = locList;
      // console.log('loc', locations, locList, this.menuList);
    });
  }

  // getDepartments() {
  //   const managerID = this.storageService.getUser() ? JSON.parse(this.storageService.getUser()) : '';
  //   let filters = '';
  //   if (managerID) {
  //     filters = `manager_id=${managerID.manager_id}`;
  //   }
  //   this.departmentService.getDepartments(this.companyId, 'department_name', 'asc', 0, 0, filters, false).subscribe((res) => {
  //     const response: any = res;
  //     let departments = [];
  //     const deptList = [];
  //     if (!response.success) { return; }
  //     if (response.data) {
  //       departments = response.data.department_list;
  //     }
  //     departments.forEach((department) => {
  //       deptList.push({
  //         id: department.department_id,
  //         value: department.department_name,
  //       });
  //     });
  //     this.menuList = deptList;
  //   });
  // }

  getDepartmentsByLocations() {
    const locIds = [];
    let isAllLocation = false;
    const locationFilters = this.appliedFilters.filter((appliedFilter) => {
      return appliedFilter['filter'] === Constants.LOCATION_IDS;
    });
    if (locationFilters && locationFilters.length > 0) {
      locationFilters.forEach((loc) => {
        if (loc['id'] !== -1) {
          locIds.push(loc['id']);
        } else {
          isAllLocation = true;
        }
      });
    }

    const payload = {
      company_id: this.storageService.getCompanyId(),
      location_ids: isAllLocation ? [] : locIds,
      is_all: isAllLocation,
    };
    this.departmentService
      .getDepartmentsByLocations(payload)
      .subscribe((res) => {
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
        const deptFilterInfo = {
          filter_name: Constants.DEPARTMENT_IDS,
          searching_in: this.translate.instant('department'),
          dependentOn: Constants.LOCATION_IDS,
        };
        this.menuList = this.globalService.prepareSelectionList(
          list,
          deptFilterInfo,
          this.appliedFilters
        );
        // this.cdRef.detectChanges();
      });
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
    this.getSessions();
  }

  getDateTime(date) {
    if(date){
      return this.datePipe.transform(date.replace(/ /g, 'T', 'MM/dd/yyyy hh:mm a'));
    }else{
      return '--';
    }
  }

  getSessions(startLimit = 0) {
    this.is_loading = true;
    const payload = {
        'company_id': this.storageService.getCompanyId(),
        'sort_by': this.sort.sortBy,
        'order': this.sort.order,
        'start_index': startLimit,
        'limit': this.noOfItemsPerPage,
        'only_som': true,
        'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
        'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
    };

    if (this.storageService.getFilterFromStroage(this.context)) {
      this.appliedFilters = this.storageService.getFilterArray(this.context);
    }

    if (this.appliedFilters.length) {
      this.preparePayloadFor(Constants.GAME_ID, payload, 'game_id');
      this.preparePayloadFor(Constants.NAME, payload, 'name');
      this.appliedFilters.forEach((elem) => {
        if (elem.customFilterKey) {
          this.preparePayloadFor(
            Constants.CUSTOM_FILTER_KEY,
            payload,
            elem.customFilterKey
          );
        } else {
          this.preparePayloadFor(
            elem.filter === Constants.GAME_ID ? Constants.GAME_ID : Constants.NAME,
            payload,
            elem.filter
          );
        }
      });
    }
    this.gameSessionsService.getSessions(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      // this.sessions = [];
      this.selection.selected.forEach(session => {
        this.selection.deselect(session);
      });
      if (response.data) {
        this.sessions = response.data.session_list;
        this.totalSessions = response.data.total_count;
        this.dataSource = new MatTableDataSource(this.sessions);
      }
    });
  }

  preparePayloadFor(constant, payload, key) {
    const filters = this.appliedFilters.filter((item) => {
      return item.filter === constant || item.hasOwnProperty(constant);
    });
    if (filters.length) {
      payload[key] = [];
      filters.forEach((element) => {
        if (element.customFilterKey == key) {
          payload[key].push(element.id);
        } else if (element.filter == key) {
          payload[key] = key == Constants.GAME_ID ? element.id : element.value;
        }
      });
    }
  }

  confirmDeletion() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ?
      this.translate.instant('confirm_delete_session') : this.translate.instant('confirm_delete_sessions');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteSelectedLimits();
    });
  }

  deleteSelectedLimits() {
    const companyId = this.storageService.getCompanyId();
    const sessionsToDelete = [];
    // console.log('selected filter', sessionsToDelete);
    this.selection.selected.forEach(session => {
      if (session.game_session_id != null && session.game_session_id !== -1) {
        sessionsToDelete.push(session.game_session_id);
      }
    });
    const payload = { company_id: companyId, game_session_ids: sessionsToDelete };
    this.is_loading = true;
    this.gameSessionsService.deleteSessions(payload).subscribe(res => {
      this.is_loading = false;
      if (res.success) {
        this.getSessions();
      }
      if (sessionsToDelete) {
        this.globalService.addAdminGoogleEvent('Incomplete_Sessions_Report_By_Incomplete_Sessions_Deleted');

      }
    });
  }


  sortData(sort: Sort) {
    switch (sort.active) {
      case 'name':
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
      case 'game_name':
        this.sort.sortBy = Constants.GAME_NAME;
        break;
      case 'played_on':
        this.sort.sortBy = Constants.PLAYED_ON;
        break;
    }
    this.sort.order = sort.direction;
    this.getSessions();
  }


  getSessionsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getSessions(this.startLimit);
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
