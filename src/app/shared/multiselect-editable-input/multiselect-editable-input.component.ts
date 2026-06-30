import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-multiselect-editable-input',
  templateUrl: './multiselect-editable-input.component.html',
  styleUrls: ['./multiselect-editable-input.component.scss']
})
export class MultiselectEditableInputComponent implements OnInit, OnChanges {
  searchKey = '';
  @Input() gameItems;
  @Input() selectedIds;
  @Input() isRequired;
  @Input() placeholderText = this.translate.instant('add_criteria');
  @Input() searchEmptyText = this.translate.instant('no_record_found');
  @Input() isDisabled;
  @Input() shouldAllowSearch = true;
  @Input() needsIndividualEvents = false;
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() selectedItems: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('search', { read: MatAutocompleteTrigger }) autocomplete;
  filterControl: FormControl;
  allItems = [];
  items: any;
  allowMultiSelect = true;
  isCheckSelecteditems = false;
  searchKeyword: any;
  multiSelect = [];

  constructor(public translate: TranslateService) { }
  scroll = (event: any): void => {
    if (event.srcElement.className.indexOf('mat-tab-body-content') !== -1) {
      this.autocomplete.closePanel();
    }
  }
  ngOnInit() {
    this.items = JSON.parse(JSON.stringify(this.gameItems));
    window.addEventListener('scroll', this.scroll, true);
    this.filterControl = new FormControl();
    this.filterControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {
      });
    this.allItems = this.items;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      this.items = changes.items.currentValue;
      this.allItems = this.items['criteria'];
    }
  }

  isItemSelected() {
    return this.items && this.items.criteria && this.items.criteria.filter((item) => {
      return item.isSelected === true;
    }).length;
  }

  onItemClick(itemToBeToggle) {
    itemToBeToggle.isSelected = !itemToBeToggle.isSelected;
  }

  selectionDone() {
    this.selectedItems.emit(this.items);
  }
  activateAutocomplete(panel) {
    this.items = JSON.parse(JSON.stringify(this.gameItems));
    if (panel) {
      this.autocomplete.closePanel();
      return;
    }
    this.autocomplete.openPanel();
  }
}
