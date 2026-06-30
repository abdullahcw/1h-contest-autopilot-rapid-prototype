import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit,
  Output, QueryList, SimpleChanges, ViewChild, ViewChildren
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ListSelectionComponent, ListItem } from '../list-selection/list-selection.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('multiSelection') listSelectionComponent: ListSelectionComponent;

  addOnBlur = true;
  @Input() applied_filters = [];
  @Input() viewMode = false;
  @Input() viewModeFossilManager = false;
  @Input() chipCloseButtonHide = false;
  @Input() shouldAllowChipSelection = false;
  @Input() isFossilCustomField = false;
  @Input() hideTypeToSearch = false;
  is_editing = false;
  is_search_placeholder = false;
  selectedSearchKey = '';
  alterSearchKey = '';
  alterSearchId;
  selectedSearchHeader;
  selectedSearchFilter;
  selectSearchFilterKey;
  currentFilter;
  index = 0;
  additionalFilterSize = 0;
  additionalFilterItems = [];
  filters = [];
  addFilterChip = true;
  searchKey: any;
  localFilters = ['status', 'game_type', 'game_mode', 'game_state', 'time', 'points', 'contest_mode', 'hierarchy',
    'mlg_completeness', 'question_type', 'is_active', 'type', 'dashboard_by', 'access_type', 'is_achieved', 'contest_state',
    'mlg_state', 'paywall_status', 'account_type', 'win_rate', 'game_status','game_state_mode','include_deleted','risk','rate_category'];

  @ViewChild('search') searchForm;

  selectable = true;
  removable = true;
  selectedOptionEmpty;
  showLoader;
  @Input() filter_options;
  @Input() list_options;
  @Input() context;
  @Input() is_pick_only;
  @Input() placeholder_text = 'Add a filter';
  @Input() dataSource;
  @Input() multiMenuDataSource;
  @Input() shouldAllowMultiline = false;
  @Input() shouldAllowAddMore = true;
  @Input() hideMode = false;
  @Input() isDashboard = false;
  @Output() searchKeyChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() filtersUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() filtersAdded: EventEmitter<any> = new EventEmitter<any>();
  @Output() filtersDeleted: EventEmitter<any> = new EventEmitter<any>();
  @Output() getDataSource: EventEmitter<any> = new EventEmitter<any>();
  @Output() getDataSourceWithFilterDetails: EventEmitter<any> = new EventEmitter<any>();
  @Output() getDataSourceWithSearchKey: EventEmitter<any> = new EventEmitter<any>();
  @Output() datePicker: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemsSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() filterOptionUpdated: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  @ViewChild('filterMenu', { read: MatMenuTrigger, static: true }) filterMenu: MatMenuTrigger;
  @ViewChild('filterOptionMenu', { read: MatMenuTrigger, static: true }) filterOptionMenu: MatMenuTrigger;
  @ViewChild('triggerMatMenu', { static: true }) triggerMatMenu: MatMenuTrigger;
  @ViewChildren(MatMenuTrigger) allMenuTrigger;
  @ViewChild(MatAutocompleteTrigger) autocomplete;
  @ViewChild('searchField', { static: true }) search;
  @ViewChild('multiSelectionMenu') multiSelectionMenu;
  @ViewChild('updateFilterMenu', { read: MatMenuTrigger, static: true }) alterFilter: MatMenuTrigger;
  @ViewChild('updateFilterMenu', { static: true }) updateFilterMenuElement: ElementRef;
  @ViewChild('selectionMenu', { read: MatMenuTrigger, static: true }) selectionMenu: MatMenuTrigger;
  @ViewChild('selectionMenu', { static: true }) selectionMenuElement: ElementRef;
  @ViewChildren('popupMenu1', { read: MatMenuTrigger }) popupMenu1: QueryList<MatMenuTrigger>;
  @ViewChildren('popupMenu', { read: MatMenuTrigger }) popupMenu: QueryList<MatMenuTrigger>;
  @ViewChildren('popupMenu2', { read: MatMenuTrigger }) popupMenu2: QueryList<MatMenuTrigger>;
  @ViewChildren('popupMultiMenu', { read: MatMenuTrigger }) popupMultiMenu: QueryList<MatMenuTrigger>;
  @ViewChildren('multiOptionMenu', { read: MatMenuTrigger }) multiOptionMenu: QueryList<MatMenuTrigger>;
  @ViewChild('selectionMultiMenu', { read: MatMenuTrigger, static: true }) selectionMultiMenu: MatMenuTrigger;
  @ViewChild('selectionMultiMenu', { static: true }) selectionMultiMenuElement: ElementRef;
  // this is for single list support in multi option scenario
  @ViewChild('updateFilterMultiMenu', { read: MatMenuTrigger, static: true }) alterFilter3: MatMenuTrigger; 
  @ViewChild('updateFilterMultiMenu', { static: true }) updateFilterMultiMenuElement: ElementRef;
  @ViewChild('alterSearchField') alterSearchField;
  @ViewChild('scrollable', { static: true }) scrollable;
  menuSearchSubscription: Subscription;

  storeTimeout;

  searchText = '';
  isRecordFound = false;
  openMenuSubscription: any;
  addFilterSubscription: any;
  resetFilterSubscription: any;
  emptyData = false;
  menuSearchInput: FormControl;

  constructor(private cdRef: ChangeDetectorRef, public storageService: StorageService,
    private elementRef: ElementRef, public globalService: GlobalService) {

    this.globalService.resetFilters.subscribe((res) => {
      console.log('reset filters: ', res);
      this.applied_filters = [];
    });

    this.globalService.addMoreChips.subscribe((filtersToAdd) => {
      console.log('filter to be added: ', filtersToAdd);
    });

    this.openMenuSubscription = this.globalService.openMenu.subscribe((res) => {
      this.filterOptionMenu.openMenu();
      this.hideAddFilterChip();
      this.search.nativeElement.focus();
      this.cdRef.detectChanges();
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showAddFilterChip();
      this.selectedSearchKey = '';
      this.alterSearchKey = '';
      this.alterSearchId = '';

    }
  }

  ngOnInit() {
    this.setupMenuSearchInput();
    // remove this code to individual components for component base handling
    this.filters = this.storageService.getFilterArray(this.context) || [];
    if (this.filters.length > 0) {
      this.applyExistingFilters();
    }
  }

  setupMenuSearchInput() {
    this.menuSearchInput = new FormControl();
    this.menuSearchSubscription = this.menuSearchInput.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((res) => {
        if (this.currentFilter && this.currentFilter.shouldRequestDataSourceWithSearchKey) {
          console.log('Current filter: ', this.currentFilter);
          this.getDataSourceWithSearchKey.emit({
            filterKey: this.selectSearchFilterKey, searchKeyword: this.selectedSearchKey,
            currentFilter: this.currentFilter
          });
        }
      });

  }

  ngAfterViewInit() {
    this.selectionMenu.menuOpened.subscribe(() => {
      this.setupMenuSearchInput();
    });
  }

  // this function is used to display the existing applied filters when search component loads on refresh or on tab change
  applyExistingFilters() {
    this.filters.forEach((filter) => {
      if (filter && filter.filter === 'default_location' ||
        filter && filter.filter === 'default_department' ||
        filter && filter.filter === 'default_country' ||
        filter && filter.filter === 'default_org') {
        filter['is_static'] = true;
        filter['is_default'] = true;

      }
      if (filter && filter.filter === 'reportee' || filter.filter === 'default_manager') {
        filter['is_static'] = true;
        filter['is_default'] = true;
        filter['isHierarchy'] = true;
      }
      let option: any;
      if (filter.hasOwnProperty('id')) {
        option = { 'id': filter.id, 'value': filter.searchingIn, 'filter': filter.filter };
      } else {
        option = { 'value': filter.searchingIn, 'filter': filter.filter };
      }
      const tz: any = {};
      if (filter.hasOwnProperty('tz_id')) {
        tz['tz_id'] = filter.tz_id;
      }
      if (filter.hasOwnProperty('tz_name')) {
        tz['tz_name'] = filter.tz_name;
      }
      if (tz) { option['tz'] = tz; }
      if (filter.hasOwnProperty('customFilterKey')) {
        option['customFilterKey'] = filter.customFilterKey;
      }
      if (filter.hasOwnProperty('additionalFilter')) {
        option['additionalFilter'] = filter.additionalFilter;
      }
      if (filter.hasOwnProperty('dependentOn')) {
        option['dependentOn'] = filter.dependentOn;
      }
      if (filter.hasOwnProperty('isHierarchy')) {
        option['isHierarchy'] = filter.isHierarchy;
      }
      if (filter.hasOwnProperty('is_static')) {
        option['is_static'] = filter.is_static;
      }
      // this case is used to add key for multi menu scenario
      if (filter.hasOwnProperty('isMultiDependantOn')) {
        option['isMultiDependantOn'] = filter.isMultiDependantOn;
      }
      this.addSearchKey(null, option, filter.value);
      // }
    });
    this.broadcastFilterUpdated();
  }

  openFilterMenu(e) {
    if (e) { e.preventDefault(); }
    console.log('Trying to opening filter menu: ', e + ' ' + this.filterMenu);
    if (this.filterMenu) {
      console.log('opening filter menu: ', this.filterMenu);
      this.hideAddFilterChip();
      this.filterMenu.openMenu();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dataSource && changes.dataSource.currentValue) {
      if (changes.dataSource.currentValue.length > 0) {
        this.showLoader = false;
        this.emptyData = false;
      } else {
        this.showLoader = false;
        this.emptyData = true;
      }
    } else if (changes.multiMenuDataSource && changes.multiMenuDataSource.currentValue) {
      if (changes.multiMenuDataSource.currentValue.length > 0) {
        this.showLoader = false;
        this.emptyData = false;
      } else {
        this.showLoader = false;
        this.emptyData = true;
      }
    }
  }

  showAddFilterChip() {
    this.is_editing = false;
    this.is_search_placeholder = false;
    this.search.nativeElement.blur();
    this.addFilterChip = true;
  }

  hideAddFilterChip() {
    console.log('yes in hide');
    this.is_editing = false;
    this.is_search_placeholder = true;
    this.addFilterChip = false;
  }

  shouldDisable() {
    const selectedItems = this.dataSource ? this.dataSource.filter((data) => data.isSelected).length : 0;
    const selectedItemsFromSearch = this.additionalFilterItems ? this.additionalFilterItems.filter((data) => data.isSelected).length : 0;
    return ((this.dataSource && this.dataSource.length === 0) || selectedItems === 0) && selectedItemsFromSearch === 0;
  }

  shouldShowOption(option) {
    return (option.is_text_search || !(this.search.value)) &&
      (this.isDependentFilterApplied(option.dependent_on) &&
        !this.isAlreadyApplied(option.filter, option.is_multi) &&
        !this.mutuallyExclusiveApplied(option.mutually_exclusive_with) &&
        !option.is_default);
  }

  //this function is used to create filterObj for various filter options
  addSearchKey(event, option, searchField, fromTemplate = false): void {
    // If applied filter has customFilterKey take that out, we need that while creating filter object
    let customFilterKey: any = null;
    if (this.currentFilter && this.currentFilter.custom_filter_key) {
      customFilterKey = this.currentFilter.custom_filter_key;
    } else if (option && option.customFilterKey) { // this check is needful when custom filter is already applied
      customFilterKey = option.customFilterKey;
    }

    this.currentFilter = option;
    this.focusPlainTextField();
    if (option.is_list_search) {
      event.stopPropagation();
      return;
    }
    if (searchField && searchField.value === '' && !this.is_pick_only && !option.is_list_search && !option.is_static) {
      this.selectedOptionEmpty = option;
      this.selectedSearchHeader = option.value;
      if (option.is_multi_menu) {
        this.alterFilter3.openMenu();
      } else {
        this.alterFilter.openMenu();
      }
      this.hideAddFilterChip();
      return;
    }
    this.selectedOptionEmpty = null;
    if (option && option.filter && searchField && searchField.value) {
      searchField = searchField && searchField.value ? searchField.value : searchField;
    }
    const searchStr = searchField && searchField.value ? searchField.value : searchField;
    const searchingIn: String = option.value;
    const filter: String = option.filter;
    let filterObj: any = '';

    const filterToBeApplied = this.filter_options.filter(filterOption => {
      return filterOption.filter === filter;
    });
    const isMultiSelection = ((filterToBeApplied.length && filterToBeApplied[0]['is_multi_selection'])
      || option.additionalFilter === true) ? true : false;
    const dependentOn = filterToBeApplied.length && filterToBeApplied[0]['dependent_on'] ? filterToBeApplied[0]['dependent_on'] : '';
    const isDefault = filterToBeApplied.length && filterToBeApplied[0]['is_default'] ? filterToBeApplied[0]['is_default'] : false;

    if (option.hasOwnProperty('id')) {
      filterObj = {
        filter: filter,
        searchingIn: searchingIn.trim(),
        id: option.id,
        value: searchStr,
        additionalFilter: isMultiSelection,
        isMultiDependantOn: option.isMultiDependantOn,
        dependentOn: dependentOn,
        isDefault: isDefault,
        is_static: this.currentFilter.is_static,
      };
    } else {
      filterObj = {
        filter: filter,
        searchingIn: searchingIn.trim(),
        value: searchStr,
        additionalFilter: isMultiSelection,
        isMultiDependantOn: option.isMultiDependantOn,
        dependentOn: dependentOn,
        isDefault: isDefault,
        is_static: this.currentFilter.is_static,
      };
    }
    if (filterObj && filterObj.filter === 'default_location' || // fix me
      filterObj && filterObj.filter === 'default_department' ||
      filterObj && filterObj.filter === 'default_country' ||
      filterObj && filterObj.filter === 'default_org') {
      filterObj['is_static'] = true;
      filterObj['is_default'] = true;
    }

    if (option.hasOwnProperty('isHierarchy') && option.isHierarchy) {
      filterObj['is_static'] = true;
      filterObj['isHierarchy'] = true;
      if (option.filter === 'default_manager') {
        filterObj['is_default'] = true;
        filterObj['isDefault'] = true;
      }
    }

    if (option.hasOwnProperty('tz')) {
      filterObj['tz_id'] = option.tz.tz_id;
      filterObj['tz_name'] = option.tz.tz_name;
    }

    if (customFilterKey) {
      filterObj['customFilterKey'] = customFilterKey;
    }

    if (this.menuTrigger) {
      this.menuTrigger.closeMenu();
    }

    if (searchStr === '') {
      this.smartSearch(filterObj);

    } else {
      if ((searchingIn || '').trim()) {
        this.applied_filters.push(filterObj);
      }
      this.addOnBlur = true;
      if (searchField) {
        searchField && searchField.value ? searchField.value = '' : searchField = '';
      }
    }

    if (option.hasOwnProperty('isHierarchy')) {
      this.applied_filters.push(filterObj);
    }

    if (option.hasOwnProperty('is_static') && option.filter === Constants.ARCHIVE) {  // added for Archive filter on game list
      filterObj.value = 'Archive';
      this.broadcastFilterUpdated();
    }

    if (fromTemplate) {
      this.broadcastFilterUpdated();
    }

    this.filterOptionUpdated.emit(filterObj);
    this.search.value = '';
    this.selectedSearchKey = '';
    this.alterSearchKey = '';
    this.alterSearchId = '';

    this.showAddFilterChip();

    this.cdRef.detectChanges();
    this.alterFilter.closeMenu();
    this.alterFilter3.closeMenu();
  }

  // this function is used to broadcast the applied filters back to respective components
  broadcastFilterUpdated() {
    this.cdRef.detectChanges();
    this.scrollable._elementRef.nativeElement.scrollLeft = this.scrollable._elementRef.nativeElement.scrollWidth
      - this.scrollable._elementRef.nativeElement.clientWidth;
    // filtersUpdated broadcast goes to Company module
    // console.log('this.applied_filters', this.applied_filters);
    this.filtersUpdated.emit(this.applied_filters);
    // filter Added/Deleted broadCast goes to Question module
    this.filtersAdded.emit(this.applied_filters);
  }

  onSearchChange(searchValue: string) {
    this.searchText = searchValue;
    this.searchKeyChanged.emit(searchValue);
    if (!this.triggerMatMenu.menuOpen) {
      this.triggerMatMenu.openMenu();
      this.search.nativeElement.focus();
    }
    this.cdRef.detectChanges();
  }

  isAlreadyApplied(filter: String, isMulti: boolean, mutuallyExclusive = false) {
    if (isMulti) { return false; }
    return this.applied_filters.filter((element) => {
      return element.filter === filter;
    }).length;
  }

  isDependentFilterApplied(dependentOn: String) {
    if (!dependentOn) {
      return true;
    }
    return this.applied_filters.filter((element) => {
      return element.filter === dependentOn;
    }).length;
  }

  mutuallyExclusiveApplied(mutuallyExclusive: String) {
    if (!mutuallyExclusive) {
      return false;
    }
    return this.applied_filters.filter((element) => {
      return element.filter === mutuallyExclusive;
    }).length;
  }

  clearFilters() {
    this.applied_filters.splice(0);
    this.filtersUpdated.emit(this.applied_filters);
    this.filtersDeleted.emit(this.applied_filters);
  }

  shouldDisableOptions() {
    if (!this.filter_options) {
      return false;
    }
    const possibleOptions = this.filter_options.filter(filterOption => {
      return this.shouldShowOption(filterOption);
    });
    return possibleOptions.length === 0;
  }

  selectedItems(selectedItem) {
    // console.log('this.additionalFilterItems', selectedItem);
    this.additionalFilterItems = selectedItem;
    this.additionalFilterSize = selectedItem.length;
  }

  // this function is called when done button is clicked for multi select option
  applyAdditionalFilters(searchKeyWord) {
    // do not write code above this and this code is used to handle done button when no changes has been made in selection
    const selectedItems = this.dataSource ? this.dataSource.filter((item) => item.isSelected).length : 0;
    if (this.additionalFilterItems.length === 0 && selectedItems !== 0) {
      return;
    }
    const that = this;
    // Reset menuSearchInput, to avoid API call after Done button click
    this.menuSearchSubscription.unsubscribe();
    this.menuSearchInput.reset();

    const filtersToBeKept = this.applied_filters.filter((existingFilter) => {
      return existingFilter['filter'] !== that.currentFilter.filter;
    });
    if (this.globalService.isCompanyBelongsToCustomField() && !this.isFossilCustomField) {
      this.additionalFilterItems.forEach((filter) => {
        const listItem = new ListItem();
        listItem.itemId = filter.itemId;
        listItem.itemName = filter.itemName;
        listItem.userInfo = filter.userInfo;
        listItem.isSelected = filter.isSelected;
        this.dataSource.push(listItem);
      });
      this.additionalFilterItems = Array.from(this.additionalFilterItems.reduce((m, t) => m.set(t.itemId, t), new Map()).values());
    }

    this.applied_filters = [];
    this.applied_filters = filtersToBeKept;
    this.additionalFilterItems = this.additionalFilterItems.filter(items => {
      return items['isSelected'] === true;
    });

    this.additionalFilterItems = Array.from(this.additionalFilterItems.reduce((m, t) => m.set(t.itemId, t), new Map()).values());     
    this.dataSource = Array.from(this.dataSource.reduce((m, t) => m.set(t.itemId, t), new Map()).values());

    const appliedFilterLength = this.additionalFilterItems.length;
    const dataSourceLength = this.dataSource.length;
    this.additionalFilterItems.map(additionalFilter => {
      const item = {
        'filter': additionalFilter.userInfo['filter_name'],
        'searchingIn': additionalFilter.userInfo['searching_in'],
        'value': additionalFilter.itemName,
        'id': additionalFilter.itemId,
        'additionalFilter': true,
        'isAll': this.isAllSelected(searchKeyWord, dataSourceLength, appliedFilterLength, additionalFilter.userInfo['filter_name']),
        'dependentOn': additionalFilter.userInfo['dependentOn'], // dependent_on key shd be same as applied filter key
        'isDefault': additionalFilter.userInfo['is_default'],
        'customFilterKey': this.currentFilter['custom_filter_key']
      };
      that.applied_filters.push(item);
      this.deleteDependentFilter(item);
    });

    const optionDataType = this.additionalFilterItems[0];
    if (optionDataType) {
      optionDataType['searchingIn'] = optionDataType.userInfo.searching_in;
      optionDataType['value'] = '';
      this.filterOptionUpdated.emit(optionDataType);
    }
    this.closeAllMenu();
    that.broadcastFilterUpdated();
    this.additionalFilterItems = [];
    this.listSelectionComponent.clearSelection();
    this.itemsSelected.emit();
  }

  isAllSelected(searchKeyWord, dataSourceCount, appliedFilterCount, filterName) {
    if (dataSourceCount === appliedFilterCount && filterName !== 'audience_ids' && filterName !== 'custom_audience') {
      return true;
    } else { return false; }
  }

  closeAllMenu() {
    const closeAllMenu = this.allMenuTrigger.toArray();
    closeAllMenu.forEach((item) => {
      item.closeMenu();
    });
  }
  additionalMenuClosed() {
    this.additionalFilterItems = []; // options selected and clicked outside (done not clicked)
    this.additionalFilterSize = 0;
    if (this.dataSource && !this.dataSource.length) { return; }
    if (this.listSelectionComponent && this.listSelectionComponent.itemsToBeDisplayed &&
      this.listSelectionComponent.itemsToBeDisplayed.length) {
      this.listSelectionComponent.itemsToBeDisplayed = [];
    }
    if (this.listSelectionComponent && this.listSelectionComponent.checkedItems && this.listSelectionComponent.checkedItems.length) {
      this.listSelectionComponent.checkedItems = [];
    }
  }
  findUniqueFilters() {
    return this.globalService.findUniqueFilters(this.applied_filters);
  }

  getBadgeCount(filter) {
    return this.applied_filters.filter(currentFilter => {
      return currentFilter.filter === filter.filter;
    }).length - 1;
  }

  resetSelection() {
    if (!this.dataSource || !this.multiMenuDataSource) { return; }
    if (this.multiMenuDataSource) {
      this.multiMenuDataSource.forEach(element => {
        element['isSelected'] = false;
      });
      this.additionalFilterItems = this.multiMenuDataSource;
      return;
    }
    this.dataSource.forEach(element => {
      element['isSelected'] = false;
    });
    this.additionalFilterItems = this.dataSource;
  }

  removeFilter(filter: any): void {
    this.resetSelection();
    const dependentFilterIndexToBeDeleted: any = null;
    // Remove dependent filter
    this.deleteDependentFilter(filter);

    // Remove all additional filter attached to same filter
    if (filter['additionalFilter']) {
      const filterNotToBeRemoved = this.applied_filters.filter((eachFilter) => {
        return (eachFilter['filter'] !== filter['filter']);
      });
      this.applied_filters = [];
      this.applied_filters = filterNotToBeRemoved;
    } else {
      const index = this.applied_filters.indexOf(filter);
      if (index >= 0) {
        this.applied_filters.splice(index, 1);
        if (index === 0) {
          this.triggerMatMenu.closeMenu();
        }
        this.filtersDeleted.emit({
          'filters': this.applied_filters, 'isFilterDeleted': true, 'deletedFilterIndex': index,
          'dependentDeletedFilterIndex': dependentFilterIndexToBeDeleted
        });
      }
    }

    this.is_editing = false;
    this.filtersUpdated.emit(this.applied_filters);
  }

  // this function is called when we update or change existing applied filters having multi selection
  smartSearch(filter, event = null) {
    if (filter.is_static) {
      if (
        filter.filter === 'm1' ||
        filter.filter === 'm2' ||
        filter.filter === 'm3' ||
        filter.filter === 'm4'
      ) {
        this.broadcastFilterUpdated();

      }
      return;
    }
    this.setMenuPosition(event);
    this.prepareCurrentFilter(filter);
    this.focusPlainTextField();
    if (this.currentFilter && this.currentFilter.filter === 'date_range') {
      this.datePicker.emit(filter.filter);
      return;
    }
    if (this.currentFilter && this.currentFilter['is_multi_selection']) {
    } else if (this.currentFilter && this.currentFilter['is_multi_menu'] && !this.currentFilter['is_multi_selection']){
      this.alterFilter3.openMenu();
    } else {
      this.alterFilter.openMenu();
    }
    this.searchForm.reset();
    this.selectedSearchHeader = filter.searchingIn;
    this.selectedSearchFilter = filter;
    this.selectedSearchKey = '';
    this.alterSearchKey = filter.value;
    this.alterSearchId = filter.id;
    if (this.currentFilter && (this.currentFilter.is_multi_option_menu || this.currentFilter.is_multi_menu)) { 
      this.chipSearchRequestForMultiMenu(null, this.currentFilter, filter.value);
    } else {
      this.chipSearchRequest(null, this.currentFilter, filter.value);
    }
  }
  closeMenus(index) {
    this.selectedSearchKey = '';
    if (this.popupMenu.toArray()[index]) {
      this.popupMenu.toArray()[index].closeMenu();
    }
    if (this.popupMenu1.toArray()[index]) {
      this.popupMenu1.toArray()[index].closeMenu();
    } else {
      index = 0;
      if (this.popupMenu1.toArray()[index]) {
        this.popupMenu1.toArray()[index].closeMenu();
      }
    }
    if (this.popupMenu2.toArray()[index]) {
      this.popupMenu2.toArray()[index].closeMenu();
    } else {
      index = 0;
      if (this.popupMenu2.toArray()[index]) {
        this.popupMenu2.toArray()[index].closeMenu();
      }
    }
    if (this.popupMultiMenu.toArray()[index]) {
      this.popupMultiMenu.toArray()[index].closeMenu();
    } else {
      index = 0;
      if (this.popupMultiMenu.toArray()[index]) {
        this.popupMultiMenu.toArray()[index].closeMenu();
      }
    }
    if (this.multiOptionMenu.toArray()[index]) {
      this.multiOptionMenu.toArray()[index].closeMenu();
    } else {
      index = 0;
      if (this.multiOptionMenu.toArray()[index]) {
        this.multiOptionMenu.toArray()[index].closeMenu();
      }
    }
  }

  chipLeaveRequest() {
    this.showLoader = false;
    if (this.storeTimeout) {
      window.clearTimeout(this.storeTimeout);
    }
  }
  callTochiprequest($event, option, searchField, index) {
    if (this.storeTimeout) {
      window.clearTimeout(this.storeTimeout);
    }
    if (!option.is_multi_menu_dependant) {
      this.closeMenus(index);
    }
    if ($event) {
      this.storeTimeout = window.setTimeout(() => {
        if (option.is_multi_option_menu || option.is_multi_menu) { 
          this.chipSearchRequestForMultiMenu($event, option, searchField, index);
        } else {
          this.chipSearchRequest($event, option, searchField, index);
        }
        // Subscribe search menu again to get search result from server bcoz we are unsubcribe it on menu close to avoid
        // multiple API calls
        this.setupMenuSearchInput();
      }, 800);
      this.setMenuPosition($event);
    }
  }

  // this function is used to open menu based on scenarios like mutliselection, update existing filters and list selection
  // and also to emit applied filters
  chipSearchRequestForMultiMenu($event, option, searchField, index = null) {
    if (option === 'undefined' || option === undefined) { return; }
    if (!option.hasOwnProperty('is_multi_selection')) {
      option.is_multi_selection = false;
    }
    if (!option.is_list_search) {
      return;
    }
    if ($event) {
      if (option.is_multi_option_menu) {
        // for eg: is_multi_option_menu = display_winrate_by and is_multi_menu = mean any custom fields(like loc, dept, custom fields or fossil fields)
        if (this.multiOptionMenu.toArray()[index]) {
          this.multiOptionMenu.toArray()[index].openMenu();
        } else {
          index = 0;
          if (this.multiOptionMenu.toArray()[index]) {
            this.multiOptionMenu.toArray()[index].openMenu();
          }
        }
      } else if (option.is_multi_menu) {
        if (option.is_multi_selection) {
          if (this.popupMenu2.toArray()[index]) {
            this.popupMenu2.toArray()[index].openMenu();
          } else {
            index = 0;
            if (this.popupMenu2.toArray()[index]) {
              this.popupMenu2.toArray()[index].openMenu();
            }
          }
        } else {
          if (this.popupMultiMenu.toArray()[index]) {
            this.popupMultiMenu.toArray()[index].openMenu();
          } else {
            index = 0;
            if (this.popupMultiMenu.toArray()[index]) {
              this.popupMultiMenu.toArray()[index].openMenu();
            }
          }
        }
      } 
    } else if (option.is_multi_selection) {
      if (option.is_multi_menu) {
        if (this.selectionMultiMenu) {
          this.selectionMultiMenu.openMenu();
        }
      }
    }

    this.dataSourceEmitters(option, searchField);
  }

  chipSearchRequest($event, option, searchField, index = null) {
    console.log('This is a search field', searchField);
 
    console.log('optionn', option);
    if (option === 'undefined' || option === undefined) { return; }
    if (!option.hasOwnProperty('is_multi_selection')) {
      option.is_multi_selection = false;
    }
    if (!option.is_list_search) {
      return;
    }
 
    if ($event) {
      if (option.is_multi_selection) {
        if (this.popupMenu.toArray()[index]) {
          this.popupMenu.toArray()[index].openMenu();
        } else {
          index = 0;
          this.popupMenu.toArray()[index].openMenu();
        }
      } else {
        if (this.popupMenu1.toArray()[index]) {
          this.popupMenu1.toArray()[index].openMenu();
        } else {
          index = 0;
          if (this.popupMenu1.toArray()[index]) {
            this.popupMenu1.toArray()[index].openMenu();
          }
        }
      }
    } else if (option.is_multi_selection) {
      if (this.selectionMenu) {
        this.selectionMenu.openMenu();
      }
    }

    this.dataSourceEmitters(option, searchField);
  }

  dataSourceEmitters(option, searchField) {
    this.currentFilter = option;
    this.focusPlainTextField();
    this.showLoader = true;
    if (this.localFilters.indexOf(option.filter) === -1 && !option.is_multi_menu) {
      this.dataSource = null;
      this.multiMenuDataSource = null;
    }

    this.searchForm.reset();
    this.selectedSearchHeader = option.value;
    this.selectedSearchKey = searchField.value;
    this.selectSearchFilterKey = option.filter;

    // Bundle and send back filter details if asked for
    if (this.getDataSourceWithFilterDetails.observers.length) {
      console.log('optionnn', this.getDataSourceWithFilterDetails);
      this.getDataSourceWithFilterDetails.emit(this.currentFilter);
    } else if (this.currentFilter && this.currentFilter.shouldRequestDataSourceWithSearchKey) {
      this.getDataSourceWithSearchKey.emit({
        filterKey: this.selectSearchFilterKey, searchKeyword: this.selectedSearchKey,
        currentFilter: this.currentFilter
      });
    } else {
      this.getDataSource.emit(this.selectSearchFilterKey);
    }
  }

  focusPlainTextField() {
    setTimeout(() => {
      if (this.alterSearchField && this.currentFilter && !this.currentFilter.is_list_search) {
        this.alterSearchField.nativeElement.focus();
      }
    }, 100);
  }

  //this function is called when we update or change existing applied filters having list selection 
  addChip(filter) {
    this.closeAllMenu();
    const option = {
      'value': this.selectedSearchHeader,
      'filter': this.selectSearchFilterKey
    };
    // Added 'id' and 'value' to make filter menu genric
    if (filter.hasOwnProperty('id')) {
      option['id'] = filter['id'];
    }
    if (filter.hasOwnProperty('tz')) {
      option['tz'] = filter['tz'];
    }
    if (filter.hasOwnProperty('value')) {
      this.addSearchKey(null, option, filter['value']);
    } else { // Remove me once set up menu list with id and value
      this.addSearchKey(null, option, filter[this.selectSearchFilterKey]);
    }
    // this code is to create chip for is manager filter of fossil or any other filter where multiselection is false.
    this.dataSource.forEach(element => {
      if (element.filter ==  option.filter) {
        this.applied_filters.forEach(appliedFilter => {
          if (appliedFilter.filter == option.filter && element.is_multi_menu_dependant) {
            appliedFilter['isMultiDependantOn'] = element.is_multi_menu_dependant;
          }
        })
      }
    });
    this.broadcastFilterUpdated();
  }

  changeSearchKey(searchKey, id) {
    if (!searchKey) {
      this.removeFilter(this.selectedSearchFilter);
      return;
    } else {
      const index = this.applied_filters.indexOf(this.selectedSearchFilter);
      if (index !== -1) {
        this.applied_filters[index].value = searchKey;
        this.applied_filters[index].id = id;
        this.deleteDependentFilter(this.applied_filters[index]);
      }
      this.searchForm.reset();
      this.filtersUpdated.emit(this.applied_filters);
      this.filtersAdded.emit(this.applied_filters);
      this.filterOptionUpdated.emit(this.applied_filters[index]);
    }
    this.alterFilter.closeMenu();
    this.alterFilter3.closeMenu();
  }

  // Delete dependent filter on filter update
  deleteDependentFilter(filter) {
    if (filter && filter.isHierarchy) {
      this.applied_filters.splice(this.applied_filters.indexOf(filter), this.applied_filters.length);
      return;
    }

    this.applied_filters = this.applied_filters.filter((filterToBeFiltered) => {
      return filterToBeFiltered.dependentOn !== filter['filter'];
    });
  }

  // the code below is added for multi menu scenario
  applyAdditionalFiltersForMultiMenu(searchKeyWord) {
    const selectedItems = this.multiMenuDataSource ? this.multiMenuDataSource.filter((item) => item.isSelected).length : 0;
    if (this.additionalFilterItems.length === 0 && selectedItems !== 0) {
      return;
    }
    const that = this;
    // Reset menuSearchInput, to avoid API call after Done button click
    this.menuSearchSubscription.unsubscribe();
    this.menuSearchInput.reset();


    const filtersToBeKept = this.applied_filters.filter((existingFilter) => {
      return existingFilter['filter'] !== that.currentFilter.filter;
    });
    if (this.globalService.isCompanyBelongsToCustomField() && !this.isFossilCustomField) {
      this.additionalFilterItems.forEach((filter) => {
        const listItem = new ListItem();
        listItem.itemId = filter.itemId;
        listItem.itemName = filter.itemName;
        listItem.userInfo = filter.userInfo;
        listItem.isSelected = filter.isSelected;
        this.multiMenuDataSource.push(listItem);
      });
      this.additionalFilterItems = Array.from(this.additionalFilterItems.reduce((m, t) => m.set(t.itemId, t), new Map()).values());
    }

    this.applied_filters = [];
    this.applied_filters = filtersToBeKept;
    this.additionalFilterItems = this.additionalFilterItems.filter(items => {
      return items['isSelected'] === true;
    });
    this.additionalFilterItems = Array.from(this.additionalFilterItems.reduce((m, t) => m.set(t.itemId, t), new Map()).values());     
    this.multiMenuDataSource = Array.from(this.multiMenuDataSource.reduce((m, t) => m.set(t.itemId, t), new Map()).values());

    const appliedFilterLength = this.additionalFilterItems.length;
    const multiMenuDataSourceLength = this.multiMenuDataSource.length;
    this.additionalFilterItems.map(additionalFilter => {
      const item = {
        'filter': additionalFilter.userInfo['filter_name'],
        'searchingIn': additionalFilter.userInfo['searching_in'],
        'value': additionalFilter.itemName,
        'id': additionalFilter.itemId,
        'additionalFilter': true,
        'isAll': this.isAllSelected(searchKeyWord, multiMenuDataSourceLength, appliedFilterLength, additionalFilter.userInfo['filter_name']),
        'dependentOn': additionalFilter.userInfo['dependentOn'], // dependent_on key shd be same as applied filter key
        'isMultiDependantOn': additionalFilter.userInfo['is_multi_menu_dependant'] ? additionalFilter.userInfo['is_multi_menu_dependant'] : '',
        'isDefault': additionalFilter.userInfo['is_default'],
        'customFilterKey': this.currentFilter['custom_filter_key']
      };
      that.applied_filters.push(item);
      this.deleteDependentFilter(item);
    });

    const optionDataType = this.additionalFilterItems[0];
    if (optionDataType) {
      optionDataType['searchingIn'] = optionDataType.userInfo.searching_in;
      optionDataType['value'] = '';
      this.filterOptionUpdated.emit(optionDataType);
    }
    this.closeAllMenu();
    that.broadcastFilterUpdated();
    this.additionalFilterItems = [];
    this.listSelectionComponent.clearSelection();
    this.itemsSelected.emit();
  }

  shouldDisableForMultiMenu() {
    const selectedItems = this.multiMenuDataSource ? this.multiMenuDataSource.filter((data) => data.isSelected).length : 0;
    const selectedItemsFromSearch = this.additionalFilterItems ? this.additionalFilterItems.filter((data) => data.isSelected).length : 0;
    return ((this.multiMenuDataSource && this.multiMenuDataSource.length === 0) || selectedItems === 0) && selectedItemsFromSearch === 0;
  }

  additionalMenuClosedForMultiMenu() {
    this.additionalFilterItems = []; // options selected and clicked outside (done not clicked)
    this.additionalFilterSize = 0;
    if (this.multiMenuDataSource && !this.multiMenuDataSource.length) { return; }
    if (this.listSelectionComponent && this.listSelectionComponent.itemsToBeDisplayed &&
      this.listSelectionComponent.itemsToBeDisplayed.length) {
      this.listSelectionComponent.itemsToBeDisplayed = [];
    }
    if (this.listSelectionComponent && this.listSelectionComponent.checkedItems && this.listSelectionComponent.checkedItems.length) {
      this.listSelectionComponent.checkedItems = [];
    }
  }

  prepareUniqueAdditionalFilters() {
    let tempAdditionalFilters = this.additionalFilterItems;
    this.additionalFilterItems.forEach(() => {
      const uniqueItems = Array.from(new Set(tempAdditionalFilters.map(itm => itm.itemId)))
        .map(itemId => {
          return tempAdditionalFilters.find(d => d.itemId === itemId);
        });
      tempAdditionalFilters = uniqueItems;

    });
    this.additionalFilterItems = tempAdditionalFilters;
  }

  prepareUniqueItems(data, source) {
    source.forEach(() => {
      const uniqueItems = Array.from(new Set(data.map(itm => itm.itemId)))
        .map(itemId => {
          return data.find(d => d.itemId === itemId);
        });
      data = uniqueItems;
    });
    return data;
  }

  setMenuPosition(event) {
    // Set menu position dynamically
    if (event && this.selectionMenuElement && this.selectionMenuElement.nativeElement) {
      this.selectionMenuElement.nativeElement.style.left = event.pageX + 'px';
    }
    if (event && this.updateFilterMenuElement && this.updateFilterMenuElement.nativeElement) {
      this.updateFilterMenuElement.nativeElement.style.left = event.pageX + 'px';
    }
    if (event && this.selectionMultiMenuElement && this.selectionMultiMenuElement.nativeElement) {
      this.selectionMultiMenuElement.nativeElement.style.left = event.pageX + 'px';
    }
    if (event && this.updateFilterMultiMenuElement && this.updateFilterMultiMenuElement.nativeElement) {
      this.updateFilterMultiMenuElement.nativeElement.style.left = event.pageX + 'px';
    }
  }

  prepareCurrentFilter(filter) {
    // this code is for preparing the current filter for existing applied filters
    if (filter.isMultiDependantOn) {
      this.filter_options.forEach(filterOption => {
        if (filterOption.is_multi_option_menu) {
          this.currentFilter = {
            custom_filter_key: filter.customFilterKey,
            filter: filter.filter,
            is_generic_menu: true,
            is_list_search: true,
            is_multi_menu: true,
            is_multi_menu_dependant: filterOption.filter,
            is_multi_selection: filter.additionalFilter,
            is_text_search: true,
            placeholder: filter.searchingIn,
            value: filter.searchingIn,
          }
        }
      });
    } else {
      this.currentFilter = this.filter_options.filter(fill => fill.filter === filter.filter)[0];
    }
  }

  ngOnDestroy() {
    if (this.openMenuSubscription) {
      this.openMenuSubscription.unsubscribe();
    }
    if (this.addFilterSubscription) {
      this.addFilterSubscription.unsubscribe();
    }
    if (this.resetFilterSubscription) {
      this.resetFilterSubscription.unsubscribe();
    }
  }
}
