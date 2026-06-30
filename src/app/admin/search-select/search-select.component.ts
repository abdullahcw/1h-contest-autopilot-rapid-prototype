import { Component, OnInit, ViewChild, Input, EventEmitter, Output, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss']
})
export class SearchSelectComponent implements OnInit, OnChanges {
  searchKey;
  searchInput;
  @Input() items = [];
  @Input() selectedId;
  @Input() isRequired = false;
  @Input() placeholderText = this.translate.instant('select');
  @Input() disabled = false;
  @Input() disabledArrow = false;
  @Input() shouldAllowSearch = true;
  @Input() applyCustomWidthToOverlay = false;
  @Output() change: EventEmitter<any> = new EventEmitter();
  @ViewChild('search', { read: MatAutocompleteTrigger, static: true }) autocomplete;
  filterControl: FormControl;
  selectedItem: any = { title: '', id: -1 };
  allItems = [];
  CSSClasses: string | string[] = '';
  
  constructor(public translate: TranslateService) { }

  scroll = (event: any): void => {
    if (event.srcElement && event.srcElement.className && event.srcElement.className.indexOf('mat-tab-body-content') !== -1) { // angular class
      this.autocomplete.closePanel();
    }
  }

  ngOnInit() {
    console.log('applyCustomWidthToOverlay' ,this.applyCustomWidthToOverlay)
    if(this.applyCustomWidthToOverlay){
      this.CSSClasses = 'custom-game-category-container';
    }
    window.addEventListener('scroll', this.scroll, true);
    this.findSelectedItem();
    this.filterControl = new FormControl();
    this.filterControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {
        this.filterItems(res);
      });
      if(this.items){
        this.allItems = (JSON.parse(JSON.stringify(this.items)));
      }
  }

  findSelectedItem() {
    this.selectedItem = { title: '', id: -1 };
    if (this.selectedId && this.items && this.items.length) {
      const filteredArray = this.items.filter(element => {
        return element.id === this.selectedId;
      });
      if (filteredArray.length) {
        this.selectedItem = filteredArray[0];
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.items) {
      this.items = changes.items.currentValue;
      console.log('this.items',this.items);
      if(this.items){
        this.allItems = (JSON.parse(JSON.stringify(this.items)));
      }
      this.findSelectedItem();
    }

    if (changes.selectedId) {
      this.selectedId = changes.selectedId.currentValue;
      this.findSelectedItem();
    }
  }

  filterItems(text = '') {
    const toFilter = (JSON.parse(JSON.stringify(this.allItems)));
    this.items = toFilter.filter((item) => {
      const itemTitle = item.title.toLowerCase();
      const didFindTitle = itemTitle.indexOf(text.toLowerCase()) !== -1;
      if (!didFindTitle && item.subtitle) {
        const itemSubtitle = item.subtitle.toLowerCase();
        return itemSubtitle.indexOf(text.toLowerCase()) !== -1;
      }
      return didFindTitle;
    });
  }

  itemClicked(item) {
    this.selectedItem = item;
    this.selectedId = item.id;
    this.change.emit(this.selectedId);
    this.searchKey = '';
    this.items = (JSON.parse(JSON.stringify(this.allItems)));
  }

  activateAutocomplete(panel) {
    if (panel) {
      this.autocomplete.closePanel();
      return;
    }
    setTimeout(() => {
      this.searchKey = '';
      this.autocomplete.openPanel();
    }, 0);
  }

}
