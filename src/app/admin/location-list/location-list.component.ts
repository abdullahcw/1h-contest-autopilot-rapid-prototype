import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { LocationService, Location } from '../../services/location/location.service';
import { StorageService } from '../../services/storage/storage.service';
import { Constants, ApiService, PlaceholderText } from '../../services/network/api.service';
import { AddLocationComponent } from '../add-location/add-location.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DelegateService } from '../../services/delegate/delegate.service';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../services/company/company.service';
import { Router } from '@angular/router';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { PermissionsKey, PermissionsService } from 'src/app/services/permissions/permissions.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  showDelay = new FormControl(500);
  is_loading: boolean;
  // displayedColumns: string[] = ['select', 'location', 'timezone', 'address'];
  displayedColumns: string[];
  filter_options = [{
    'filter': Constants.LOCATION_NAME, value: this.translate.instant('location'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.LOCATION_NAME
  },
  {
    'filter': Constants.CITY, value: this.translate.instant('city'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.CITY_NAME
  },
  {
    'filter': Constants.COUNTRY_ID, value: this.translate.instant('country'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.COUNTRY_NAME, 'is_generic_menu': true
  },
  {
    'filter': Constants.STATE_ID, value: this.translate.instant('state'), 'is_text_search': true, 'is_list_search': true,
    'dependent_on': Constants.COUNTRY_ID, 'placeholder': PlaceholderText.STATE_NAME, 'is_generic_menu': true
  }];

  noOfItemsPerPage: number;
  sort = {
    'sortBy': Constants.LOCATION_NAME,
    'order': 'asc'
  };
  isHeadLocation = false;
  dataSource: any;
  totalLocations: any;
  startLimit = 0;
  pageSizeOptions: number[];
  locationPermission: any;
  allowMultiSelect = true;
  selection = new SelectionModel<Location>(this.allowMultiSelect, []);
  locations: any;
  context = 'location';
  menuList = [];
  appliedFilters = [];
  delegateSubscription;
  selectedTab = 0;

  constructor(public locationService: LocationService,
    public storageService: StorageService, public dialog: MatDialog, public delegateService: DelegateService,
    public apiService: ApiService,
    public snackBar: MatSnackBar, public translate: TranslateService, public companyService: CompanyService,
    public router: Router, public globalService: GlobalService, public permissionService: PermissionsService) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = [...Paginations.PAGE_SIZE_OPTIONS];
    if (this.pageSizeOptions.indexOf(20) === -1) {
      this.pageSizeOptions.push(20);
    }
    this.noOfItemsPerPage = 20;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('location') !== -1) {
        this.getLocations(0);
      }
    });
    this.getCountries();
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

  ngOnInit() {
    this.setLocationPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setLocationPermission();
    });
    this.getLocations(0);
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  setLocationPermission() {
    this.locationPermission = this.permissionService.getPermissions(PermissionsKey.LOCATION);
    if (this.locationPermission && this.locationPermission.edit) {
      this.displayedColumns = ['select', 'location', 'timezone', 'address'];
    } else {
      this.displayedColumns = ['location', 'timezone', 'address'];
    }
  }

  getDataSource(filterName) {
    switch (filterName) {
      case Constants.COUNTRY_ID:
        this.getCountries();
        break;
      case Constants.STATE_ID:
        this.getStateList();
        break;
      default:
        break;
    }
  }

  getCountries() {
    this.locationService.getCountries().subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      if (response.data) {
        const countries = response.data.countries;
        this.menuList = [];
        countries.forEach(country => {
          this.menuList.push({ id: country.country_id, value: country.country_name });
        });
      }
    });
  }

  getStateList() {
    const countryId = this.findCountryIdFromFilters();
    if (countryId === null) {
      return;
    }
    this.locationService.getStates(countryId).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      if (response.data) {
        const states = response.data.states;
        this.menuList = [];
        states.forEach(state => {
          // HARDCODED, FIXME, REMOVE ONCE FIXED FROM BACKEND
          if (state.state_name !== 'No State') {
            this.menuList.push({ id: state.state_id, value: state.state_name });
          }
        });
      }
    });
  }

  findCountryIdFromFilters() {
    const countryFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.COUNTRY_ID;
    });
    if (countryFilters && countryFilters.length > 0) {
      return countryFilters[0]['id'];
    }
    return null;
  }

  menuOptionsToBeDisplay() {
    if (this.selection.selected.length === 1) {
      this.selection.selected.forEach(location => {
        this.isHeadLocation = location['head_location'];
      });
    } else {
      this.isHeadLocation = false;
    }
  }

  refreshListOnFilterChange(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, filters);
    this.getLocations(0);
  }

  getLocations(startLimit = 0) {
    const companyId = this.storageService.getCompanyId();
    this.is_loading = true;
    const appliedFilters = this.storageService.getFilterFromStroage(this.context);
    this.locationService.getLocations(companyId, this.sort.sortBy, this.sort.order, startLimit,
      this.noOfItemsPerPage, appliedFilters,false).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (response.data) {
          this.selection.clear();
          this.locations = response.data.location_list;
          this.totalLocations = response.data.total_locations;
          // this.company_list = response['data']['company_list'];


          // HARCODED, FIXME, FROM_BACKEND
          // this.locations.forEach(location => {
          //   if (location.head_location === true) {
          //     location.location_name = this.translate.instant('headquarters_uppercase');
          //   }
          // });

          this.dataSource = new MatTableDataSource(this.locations);
        }
      });
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'location':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      case 'country':
        this.sort.sortBy = Constants.COUNTRY_NAME;
        break;
      case 'state':
        this.sort.sortBy = Constants.STATE_NAME;
        break;
      case 'city':
        this.sort.sortBy = Constants.CITY;
        break;
      case 'timezone':
        this.sort.sortBy = Constants.TIME_ZONE_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getLocations(this.startLimit);
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `location_by_${filter.filter}`;
    // console.log(keyName);
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }

  presentAddLocationPopup(locations = null, title = '', editableItems = ['all']) {
    if (this.locationPermission && !this.locationPermission.edit && locations && !locations[0].is_editable) { return; }
    const dialogRef = this.dialog.open(AddLocationComponent, {
      data: { 'locations': locations, 'title': title },
      panelClass: editableItems.indexOf('all') > -1 ? 'add-location' : ''
    });
    dialogRef.componentInstance.onSuccess.subscribe(() => {
      this.getLocations(0);
    });
    dialogRef.componentInstance.locationDeleted.subscribe((locationId) => {
      this.deleteLocations(locationId);
    });
    dialogRef.componentInstance.editableItems = editableItems;

  }

  confirmDeletion(event) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ?
      this.translate.instant('confirm_delete_location') : this.translate.instant('confirm_delete_locations');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteLocations();
    });
  }
  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.isLinked = true;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }
  deleteLocations(locationId = null) {
    this.is_loading = true;
    const locationsToBeDeleted = [];
    if (locationId) {
      locationsToBeDeleted.push(locationId);
    } else {
      this.selection.selected.forEach(location => {
        locationsToBeDeleted.push(location.location_id);
      });
    }
    const payload = { 'location_list_ids': locationsToBeDeleted, 'company_id': this.storageService.getCompanyId() };
    this.locationService.deleteLocations(payload, this.storageService.getCompanyId()).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        // this.globalService.showMessage(this.translateService.instant('unable_to_delete_locations'));
        if (response.message_code === 'PLAYER_LINKED_TO_LOCATION') {
          this.showAlert(this.translate.instant('cant_delete_locations'), this.apiService.getErrorMessage(response.message_code));
        } else  if (response.message_code === 'MIDMANAGER_TEAMLEAD_LINKED_TO_LOCATION') {
          this.showAlert(this.translate.instant('cant_delete_locations'), this.apiService.getErrorMessage(response.message_code));
        }
        return;
      }
      this.selection = new SelectionModel<Location>(true, []);
      this.getLocations(0);
    });
  }

  getLocationsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    const startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getLocations(startLimit);
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }

}
