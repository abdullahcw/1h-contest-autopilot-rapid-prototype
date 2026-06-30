import {
  Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges,
  SimpleChanges, OnDestroy, ElementRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';

export class ListItem {
  itemId: number;
  itemName: string;
  itemLogo: string;
  isSelected: boolean;
  userInfo: any;
}

@Component({
  selector: 'app-list-selection',
  templateUrl: './list-selection.component.html',
  styleUrls: ['./list-selection.component.scss']
})

export class ListSelectionComponent implements OnInit, OnChanges, OnDestroy {

  @Output() selectedItems: EventEmitter<any> = new EventEmitter<any>();
  @Output() requestedDataSource: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemAdded: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemsAdded: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemsRemoved: EventEmitter<any> = new EventEmitter<any>();
  @Input() itemsToBeDisplayed = [];
  @Input() shouldRequestDataSource = false;
  @Input() searchPlaceHolder;
  @Input() searchString;
  @Input() fixedHeightContextMenu;
  @Input() needsIndividualEvents = false;
  @Input() isListSelection = false;
  @Input() shouldAllowSearch = true;
  @Input() viewMode = false;
  @Input() isCompanyBelongsToCustomField = false;
  @Input() isFossilCustomField = false;
  @Input() isDashboard = false;
  @Input() isMultiMenu = false;
  @Input() itemSize = 10;

  @ViewChild('listSelectionSearchInput') listSelectionSearchInput: ElementRef;

  headerTitle;
  copyOfItemsToBeDisplayed: any;
  allowMultiSelect = true;
  filterItem: FormControl;
  selectedRow = [];
  checkedItems = [];

  displayedColumns: string[] = ['select', 'listItem'];
  searchKeywordValue: any = '';
  @Output() searchKeywordChange = new EventEmitter();

  set searchKeyword(val) {
    if (val !== undefined) {
      this.searchKeywordValue = val;
      this.searchKeywordChange.emit(this.searchKeywordValue);
    }
  }

  @Input()
  get searchKeyword() {
    return this.searchKeywordValue;
  }

  constructor(public permissionService: PermissionsService) { }

  ngOnInit() {
    this.findSelectedItems();
    this.copyOfItemsToBeDisplayed = this.itemsToBeDisplayed;
    this.filterItem = new FormControl();
    if (!this.filterItem) { return; }
    this.filterItem.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {
        this.searchKeyword = res;
        if (this.shouldRequestDataSource) {
          this.requestedDataSource.emit({ searchKeyword: res });
        } else {
          this.searchLocally(res);
        }
      });
    this.selectedRow = this.itemsToBeDisplayed;
    if (this.itemsToBeDisplayed) {
      this.checkedItems = this.itemsToBeDisplayed.filter((item) => item.isSelected === true);
    }
    if (this.isListSelection) {
      this.itemSize = 10;
    } else {
      this.itemSize = 15;
    }

  }

  findSelectedItems() {
    if (this.itemsToBeDisplayed) {
      this.itemsToBeDisplayed.forEach(item => {
        if (item.isSelected) {
          this.checkedItems.push(item);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.itemsToBeDisplayed) {
      this.copyOfItemsToBeDisplayed = changes.itemsToBeDisplayed.currentValue;
      if (this.searchKeyword && !this.shouldRequestDataSource) {
        // some dashboard key
        this.searchLocally(this.searchKeyword);
      }
      this.prepareItemsToBeDisplayed();
    }
  }

  prepareItemsToBeDisplayed() {

    if (!this.isCompanyBelongsToCustomField || (this.isCompanyBelongsToCustomField && this.isFossilCustomField)) {
      if (this.checkedItems && this.checkedItems.length && !this.searchKeyword) {
        this.checkedItems.forEach((checkedItem) => {
          this.itemsToBeDisplayed.push(checkedItem);
        });
        this.itemsToBeDisplayed = Array.from(this.itemsToBeDisplayed.reduce((m, t) => m.set(t.itemId, t), new Map()).values());
      }
    }
  // Show Selected items on top
  // acc => Callback, element => Initial value
    const sortedArray = this.itemsToBeDisplayed && this.itemsToBeDisplayed.reduce((acc, element) => {
      if (element.isSelected === true) {
        return [element, ...acc];
      }
      return [...acc, element];
    }, []);
    this.itemsToBeDisplayed = sortedArray;
  }

  reset() {
    this.listSelectionSearchInput.nativeElement.value = '';
  }

  searchLocally(searchValue) {
    if (this.copyOfItemsToBeDisplayed) {
      let filteredItems = (JSON.parse(JSON.stringify(this.copyOfItemsToBeDisplayed)));
      filteredItems = filteredItems && filteredItems.filter((item) => {
        if (item && item.itemName) {
          return item.itemName.toLowerCase().indexOf(searchValue && searchValue.toLowerCase()) !== -1;
        }
      });
      this.itemsToBeDisplayed = filteredItems;
      this.prepareItemsToBeDisplayed();
    }
  }


  onItemClick(itemToBeToggle) {
    if (this.viewMode) { return; }
    this.checkedItems.filter((item) => (item.itemId === itemToBeToggle.itemId) ? item.isSelected = itemToBeToggle.isSelected : '');
    this.itemsToBeDisplayed.filter((item) => (item.itemId === itemToBeToggle.itemId) ? item.isSelected = itemToBeToggle.isSelected : '');

    itemToBeToggle.isSelected = !itemToBeToggle.isSelected;
    if (this.needsIndividualEvents) {
      if (itemToBeToggle.isSelected) {
        this.itemAdded.emit({ item: itemToBeToggle });
      } else {
        this.itemRemoved.emit({ item: itemToBeToggle });
      }
    } else {
      this.removeUnselectedItemWhichAreSelectedBefore(itemToBeToggle);
    }
    this.selectionUpdated();
  }

  removeUnselectedItemWhichAreSelectedBefore(itemToBeToggle) {
    this.checkedItems.forEach((item) => {
      if (item.itemId === itemToBeToggle.itemId && !itemToBeToggle.isSelected) {
        const index = this.checkedItems.indexOf(item);
        this.checkedItems.splice(index, 1);
      }
    });
  }

  isItemSelected() {
    return this.itemsToBeDisplayed && this.itemsToBeDisplayed.filter(item => item.isSelected).length > 0 && !this.isAllSelected();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const allSelected = this.itemsToBeDisplayed && this.itemsToBeDisplayed.filter(item => item.isSelected);
    // If itemsToBeDisplayed in search result is zero then return false
    return this.itemsToBeDisplayed && this.itemsToBeDisplayed.length ? allSelected.length === this.itemsToBeDisplayed.length : false;
  }

  masterToggle() {
    if (this.viewMode) { return; }
    const shouldSelectAll = !this.isAllSelected();
    // Clear All selection on master toggle
    if (!shouldSelectAll) {
      this.checkedItems = [];
    }
    this.itemsToBeDisplayed.forEach(item => {
      item.isSelected = shouldSelectAll;
    });
    if (this.needsIndividualEvents) {
      if (shouldSelectAll) {
        this.itemsAdded.emit({ items: this.itemsToBeDisplayed, searchKeyword: this.searchKeyword });
      } else {
        this.itemsRemoved.emit({ items: this.itemsToBeDisplayed, searchKeyword: this.searchKeyword });
      }
    }
    this.selectionUpdated();
  }

  clearSelection() {
    this.itemsToBeDisplayed = [];
    this.checkedItems = [];
  }

  selectionUpdated() {
    const itemSelected = this.itemsToBeDisplayed.filter((item) => {
      item['search_key'] = this.searchKeyword ? this.searchKeyword : null;
      return item.isSelected;
    });
    itemSelected.forEach(item => {
      const itemExist = this.checkedItems.filter(checkedItem => {
        return checkedItem.itemId === item.itemId;
      }).length > 0;
      if (!itemExist) {
        this.checkedItems.push(item);
      }
    });

    this.selectedItems.emit(this.checkedItems);
    // update copyOfItemsToBeDisplayed after selection
    this.itemsToBeDisplayed.forEach((selectedItem) => {
      const matchingItem = this.copyOfItemsToBeDisplayed && this.copyOfItemsToBeDisplayed.find(item => item.itemId === selectedItem.itemId);
      if (matchingItem) {
        matchingItem.isSelected = selectedItem.isSelected;
      }
    });
  }

  ngOnDestroy() {
    this.clearSelection();
  }

}
