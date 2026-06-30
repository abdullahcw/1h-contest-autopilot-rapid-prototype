import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DelegateService } from 'src/app/services/delegate/delegate.service';

@Component({
  selector: 'app-search-multiselect',
  templateUrl: './search-multiselect.component.html',
  styleUrls: ['./search-multiselect.component.scss']
})
export class SearchMultiselectComponent implements OnInit, OnChanges {
  searchKey = '';
  @Input() items = [];
  @Input() userType;
  @Input() forPathwayList = false;
  @Input() selectedIds;
  @Input() isRequired;
  @Input() placeholderText = this.translate.instant('select');
  @Input() searchEmptyText = this.translate.instant('no_record_found');
  @Input() disabled = false;
  @Input() readMode = false;
  @Input() showCount = false;
  @Input() shouldAllowSearch = true;
  @Input() needsIndividualEvents = false;
  @Input() selectedReportId;
  @Input() limit = 0;
  @Input() limitMassage = '';
  @Input() limitValidation = false;
  @Input() isNewLocationLinked = false;
  @Output() isAllSected: EventEmitter<any> = new EventEmitter<any>();
  @Output() linkedItems: EventEmitter<any> = new EventEmitter<any>();
  @Output() unLinkedItems: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() selectedItems: EventEmitter<any> = new EventEmitter<any>();
  @Output() closedPanel: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('search', { read: MatAutocompleteTrigger, static: true }) autocomplete;
  @ViewChild('searchInput') searchInput!: ElementRef;
  filterControl: FormControl;
  allItems = [];
  allowMultiSelect = true;
  searchKeyword: any;
  multiSelect = '';
  companyChangeSubscription: any;
  limitReached: boolean= false;

  constructor(public translate: TranslateService, private delegateService: DelegateService) {
    this.companyChangeSubscription = this.delegateService.selectedHeaderCompany.subscribe((_companyID) => {
      if (this.filterControl && this.filterControl.value) {
        this.filterControl.setValue('');
      }
    });
  }
  scroll = (event: any): void => {
    if (event.srcElement && event.srcElement.className && event.srcElement.className.indexOf('mat-tab-body-content') !== -1) { // angular class
      this.autocomplete.closePanel();
    }
  }

  ngOnInit() {
    window.addEventListener('scroll', this.scroll, true);
    this.filterControl = new FormControl();
    this.filterControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {
        this.filterItems(res);
      });
    this.allItems = this.items;
    // console.log(this.allItems)
    this.searchLocally(this.allItems);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      // console.log('hiiiiiiiiiii',changes.items);
      // console.log('changes.items.currentValue;', changes.items.firstChange);
      this.items = changes.items.currentValue;
      this.allItems = this.items;
      // console.log('this.items;',this.items);
      this.displaySelection();
      this.checkItemSelected();
    }
    if (changes.selectedReportId || changes.isNewLocationLinked) {
      if (this.filterControl && this.filterControl.value) {
        this.filterControl.setValue('');
      }
      this.multiSelect = '';
    }
  }

  searchLocally(searchValue) {
    let filteredItems = (JSON.parse(JSON.stringify(this.allItems)));
    filteredItems = filteredItems && filteredItems.filter((item) => {
      if (item && item.itemName) {
        return item.itemName.toLowerCase().indexOf(searchValue && searchValue.toLowerCase()) !== -1;
      }
    });
    this.items = filteredItems;
  }

  filterItems(text = '') {
    const toFilter = (JSON.parse(JSON.stringify(this.allItems)));
    this.items = toFilter.filter((item) => {
      const itemTitle = item.title && item.title.toLowerCase();
      const didFindTitle = itemTitle.indexOf(text.toLowerCase()) !== -1;
      if (!didFindTitle && item.subtitle) {
        const itemSubtitle = item.subtitle.toLowerCase();
        return itemSubtitle.indexOf(text.toLowerCase()) !== -1;
      }
      return didFindTitle;
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const allSelected = this.items ? this.items.filter((item) => {
      return item.isSelected === true;
    }).length : 0;

    // If itemsToBeDisplayed in search result is zero then return false
    if (this.items && this.items.length === 0) { return false; }
    return this.items ? allSelected === this.items.length : false;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    const shouldSelectAll = !this.isAllSelected();    
    this.isAllSected.emit(shouldSelectAll);
    this.items.forEach(item => {
      item.isSelected = shouldSelectAll;
    });
    if (this.needsIndividualEvents) {
      if (shouldSelectAll) {
        this.linkedItems.emit({ items: this.items, searchKeyword: this.searchKeyword });
      } else {
        this.unLinkedItems.emit({ items: this.items, searchKeyword: this.searchKeyword });
      }
    } else {
      this.selectionUpdated();
    }
  }

  isItemSelected() {
    return this.items && this.items.filter((item) => {
      return item.isSelected === true;
    }).length > 0;
  }

  onItemClick(itemToBeToggle) {
    itemToBeToggle.isSelected = !itemToBeToggle.isSelected;
    
    if (this.needsIndividualEvents) {
      if (itemToBeToggle.isSelected) {
        this.linkedItems.emit({ item: itemToBeToggle });
      } else {
        this.unLinkedItems.emit({ item: itemToBeToggle });
      }
    } else {
      this.selectionUpdated();
    }

  }

  selectionUpdated(updateItem = null) {
    this.items.forEach((selectedItem) => {
      const matchingItem = this.allItems && this.allItems.find(item => item.id === selectedItem.id);
      if (matchingItem) {
        matchingItem.isSelected = selectedItem.isSelected;
      }
    });
    const itemSelected = this.allItems.filter((item) => {
      return item.isSelected;
    });

    this.selectedItems.emit(itemSelected);
    this.displaySelection();
    if(this.limitValidation){
      this.checkItemSelected();
    }
  }

  displaySelection() {
    const itemSelected = this.allItems && this.allItems.filter((item) => {
      return item.isSelected;
    });
    if (itemSelected.length !== 0) {
      this.multiSelect = (itemSelected[0]).title;
      if (itemSelected.length > 1) {
        this.multiSelect = `${(itemSelected[0]).title}  +${itemSelected.length - 1} more`;
      }
    } else {
      this.multiSelect = '';

    }
  }

  closed() {    
    this.filterControl.setValue('');
    if(this.forPathwayList){
      const itemSelected = this.allItems.filter((item) => {
        return item.isSelected;
      });
      console.log('itemSelected', itemSelected);
      console.log('this.allItems', this.allItems);
      this.closedPanel.emit(itemSelected);
    }else{
      this.closedPanel.emit(true);
    }
  }

  activateAutocomplete(panel) {
    if (panel) {      
      this.autocomplete.closePanel();
      return;
    }
    this.autocomplete.openPanel();
  }
  checkItemSelected(){
    const selectedItemLength = this.allItems && this.allItems.filter((item) => item.isSelected );
    if((selectedItemLength.length > (this.limit - 1) ) && this.limitValidation){
     this.limitReached = true;
    }else {  
        this.limitReached = false;
    }
  }
}
 