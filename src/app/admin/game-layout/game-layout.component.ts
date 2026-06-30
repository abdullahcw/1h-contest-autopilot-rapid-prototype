import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { GlobalService } from 'src/app/services/global/global.service';
import { PermissionsKey, PermissionsService } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { CreateSeriesComponent } from './create-series/create-series.component';
import { GameSeriesService, Series } from 'src/app/services/game-series/game-series.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'src/app/services/company/company.service';
import { GamesInSeriesComponent } from './games-in-series/games-in-series.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { ManagerService } from 'src/app/services/manager/manager.service';

// Add gameState array for GAME_STATE filter
const gameState = [
  { 'id': 'LIVE', 'game_state': 'Live' },
  { 'id': 'READY', 'game_state': 'Ready' },
];

@Component({
  selector: 'app-game-layout',
  templateUrl: './game-layout.component.html',
  styleUrls: ['./game-layout.component.scss']
  
})

export class GameLayoutComponent implements OnInit {
    gameCount: any;
    gameType: any;
    multilevelGameData: any;
    filter_options = [];
    search_filters = [
      {
        'filter': Constants.GAME_STATE,
        value: this.translate.instant('state'),
        'is_text_search': true,
        'is_list_search': true,
        'placeholder': PlaceholderText.GAME_STATE,
        'is_filter_disabled': false
      }
    ];
    static_filters = [];
    menuList = [];
    appliedFilters = [];
    locationList = [];
    departmentList = [];
    gameSeriesList: any;
  displayedColumns: string[] = ['icon','position', 'series_name', 'game_logo', 'game_owner', 'action'];
  dataSource = new MatTableDataSource();
  layoutPermission: any;
  is_loading: boolean;
  customFieldFetchSubscription: any;
  @ViewChild('table', { static: true }) table: MatTable<any>;
  dragDisabled = true;
  delegateSubscription: any;
  companyId: any;
  context = 'series';
  loginUser: any;
  customManagerList: any[];
  

  constructor(
    public dialog: MatDialog,
    public globalService: GlobalService,
    public translate: TranslateService,
    public gameReorderService: GameSeriesService,
    public storageService: StorageService,
    public permissionService: PermissionsService,
    public gameSeriesService: GameSeriesService,
    public companyService: CompanyService,
    public delegateService: DelegateService,
    private cdRef: ChangeDetectorRef,
    public locationService: LocationService,
    public departmentService: DepartmentService,
    public managerService: ManagerService,


  ) { 
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
    this.locationList = [];
    this.departmentList = [];
    this.appliedFilters = [];
    this.companyId = companyID;
    this.setLayoutPermission();
    this.getSeriesList();

    });
    
    this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, res, 2);
        this.static_filters.forEach(filter => {
          this.addFilter(filter, this.filter_options.length);
        });
    });
  }
  addFilter(filter, index) {
    if (this.filter_options.indexOf(filter) === -1) {
      this.filter_options.splice(index, 0, filter);
    }
    this.filter_options = this.globalService.removeCustomFilters(
      this.filter_options
    );
  }
  ngOnChanges() {
    this.dataSource = new MatTableDataSource(this.gameSeriesList);
  }

  ngOnInit() {
    this.setLayoutPermission();
    this.getSeriesList();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setLayoutPermission();
    });

      const fields = this.companyService.getCustomFields();
      this.filter_options = this.globalService.addeditCompanyCustomFilters(
        this.search_filters,
        fields,
        2
      );
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    let keyName = `Layout_By_${filter.filter}`;
    if (filter && !filter.filter) {
      keyName = `Layout_By_${filter.userInfo.searching_in}`;
    }
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }
  refreshListOnFilterChange(filters) {
    this.storeFilters(filters);
  }
  storeFilters(filters) {
    this.appliedFilters = filters;
    this.storageService.setFilters(this.context, filters);
    this.getSeriesList();
  }
  setLayoutPermission() {
    this.layoutPermission = this.permissionService.getPermissions(PermissionsKey.LIVE_GAME_POSITION);
  }
  getSeriesList() {
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    const payload = {
      company_id: companyId,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };
    
  if (this.appliedFilters && this.appliedFilters.length) {
    this.appliedFilters.forEach((elem) => {
      if ((payload[elem.customFilterKey] || payload[elem.filter]) && elem.isAll) {
        return;
      }
      if (elem.customFilterKey) {
        if (elem.isAll) {
          payload[elem.customFilterKey] = {
            'ids' : [],
            'is_all': true
          };
          // return;
        } else {
          this.preparePayloadFor(
            Constants.CUSTOM_FILTER_KEY,
            payload,
            elem.customFilterKey
          );
        }
      }
    });
    this.preparePayloadFor(Constants.GAME_STATE, payload, 'game_state');
  }
  
    this.gameSeriesService.getSeries(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.gameSeriesList = response.data.series;
        this.dataSource = new MatTableDataSource(response.data.series);
      }
    });

  }
  preparePayloadFor(constant, payload, key) {
    const filters = this.appliedFilters.filter((item) => {
      return item.filter === constant || item.hasOwnProperty(constant);
    });
    if (filters.length) {
      // Special handling for GAME_STATE: set as string, not object
      if (constant === Constants.GAME_STATE) {
        payload[key] = filters[0].id;
      } else {
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
  }
 
  createSeries() {
    this.globalService.addAdminGoogleEvent('Created_A_Game_Series');
    const dialogRef = this.dialog.open(CreateSeriesComponent, {
      data: { series_name: '', series_id: null, edit_mode: false}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('result',result);
      if (result) {
      this.openSeriesGamesList(result);
      }
    });
  }
  openSeriesGamesList(result){
    const dialogRef = this.dialog.open(GamesInSeriesComponent, {
      data: result
    });
    dialogRef.afterClosed().subscribe(test => {
      console.log('test',test);
      if (test) {
        this.getSeriesList();

      }
    });
  }
  deleteGameSeries(series) {  
    console.log(series);
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: series
    });
    dialogRef.componentInstance.title = this.translate.instant('delete_a_games_series');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_series');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteSeries(series);
    });
  
  }
  deleteSeries(series){
    this.is_loading = true;
    this.gameSeriesService.deleteSeries(series.series_id).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.globalService.addAdminGoogleEvent('Delete_Game_Series');
        this.getSeriesList();
      }
    });
  }
  renameGameSeries(series){
    this.globalService.addAdminGoogleEvent('Rename_Game_Series_Clicked');    
    const dialogRef = this.dialog.open(CreateSeriesComponent, {
      data: { series_name: series.series_name, series_id: series.series_id ,edit_mode: true}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('result',result);
      if (result) {
        this.getSeriesList();
      }
    });
  }
  manageGames(series){
    this.globalService.addAdminGoogleEvent('Manage_Game_Series');    
    this.openSeriesGamesList(series);
  }
  drop(event: CdkDragDrop<any[]>) {
    // Return the drag container to disabled.
    this.dragDisabled = true;
    // const previousIndex = this.dataSource.data.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
    this.table.renderRows();
    this.updateSeriesPosition(event.item.data, event.currentIndex);
    // moveItemInArray(this.pinnedGamesList, event.previousIndex, event.currentIndex);

  }
  updateSeriesPosition(series, position) {
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    const payload = {
      company_id: companyId,
      series_id: series.series_id,
      position: position + 1,           
    };
    this.gameSeriesService.updateGameSeries(payload).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        this.getSeriesList();
      }
    });
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.GAME_STATE:
        this.menuList = gameState;
        this.cdRef.detectChanges();
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
        if (searchKey) {
          this.getCustomFieldsValues(searchFilter);
        }
        break;
    }
    this.cdRef.detectChanges();
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
  getLocations() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
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
        const filterInfo = { 'filter_name': Constants.LOCATION_IDS, 'searching_in': 'Location' };
        this.locationList = this.globalService.prepareSelectionList(locList, filterInfo, this.appliedFilters);
        this.menuList = this.locationList;
        this.cdRef.detectChanges();
      });
  }
  getDepartments() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    const filters = 'manager_id=' + this.loginUser.manager_id;
    this.departmentService.getDepartments(this.storageService.getCompanyId(), 'department_name', 'asc', 0, 0, filters, false).subscribe((res) => {
      const response: any = res;
      let departments = [];
      const deptList = [];
      if (!response.success) { return; }
      if (response.data) {
        departments = response.data.department_list;
      }
      departments.forEach((department) => {
        deptList.push({
          id: department.department_id,
          value: department.department_name,
        });
      });
      const filterInfo = { 'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': 'Department' };
      this.departmentList = this.globalService.prepareSelectionList(deptList, filterInfo, this.appliedFilters);
      this.menuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }
  getValues(filterDetails) {

    const companyId = this.storageService.getCompanyId();
    const field = filterDetails.filter;
    const searchingIn = filterDetails.value;
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.companyService.getValues(field, companyId, searchText ? searchText : null).subscribe(res => {
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

}
