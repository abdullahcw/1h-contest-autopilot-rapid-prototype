import { Component, OnInit, Inject, Output, EventEmitter, ChangeDetectorRef, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global/global.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';

@Component({
  selector: 'app-add-items',
  templateUrl: './add-items.component.html',
  styleUrls: ['./add-items.component.scss']
})
export class AddItemsComponent implements OnInit {

  @Output() updateItems: EventEmitter<any> = new EventEmitter();
  @Output() searchItems: EventEmitter<any> = new EventEmitter();
  forMlgObj = false;
  list_loaded = true;

  items = [];
  dataSourceItems: any[];
  selectedItemIds = [];
  companyId;
  title;
  itemList;

  constructor(public dialogRef: MatDialogRef<any>,
    private storageService: StorageService,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    public globalService: GlobalService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { dialogRef.disableClose = true; }


  ngOnInit() {
    this.companyId = this.storageService.getCompanyId();
    this.items = this.data.items;
    this.prepareItemsDataSource();
    this.updateTitle();
    setTimeout(() => {
      this.list_loaded = false;
    }, 1200);
  }

  cancel() {
    this.dataSourceItems = [];
    this.selectedItemIds = [];
    this.dialogRef.close();
  }

  prepareItemsDataSource() {
    this.dataSourceItems = [];
    let index = 0;
    if (!this.items) { return; }
    this.items.forEach(item => {
      let isSelected = false;
      if (this.selectedItemIds.length) {
        if (this.forMlgObj) {
          index = this.getIndex(item.itemKeyId);
        } else {
          index = this.selectedItemIds.indexOf(item.itemKeyId);
        }
        if (index !== -1) {
          isSelected = true;
        }
      }
      const ds = {
        itemId: item.itemKeyId,
        itemName: item.itemKeyName,
        itemLogo: item.itemKeyLogo,
        isSelected: isSelected,
        userInfo: item
      };
      this.dataSourceItems.push(ds);
    });

    const sortedArray = this.dataSourceItems && this.dataSourceItems.reduce((acc, element) => {
      if (element.isSelected === true) {
        return [element, ...acc];
      }
      return [...acc, element];
    }, []);
    this.dataSourceItems = sortedArray;
  }

  getIndex(keyId) {
    const gameIds = [];
    this.selectedItemIds.forEach(elem => {
      if (elem.itemId === keyId) {
        gameIds.push(keyId);
      }
    });
    return gameIds.indexOf(keyId);
  }

  requestedItems(event) {
    this.searchItems.emit(event.searchKeyword);
    this.cdRef.detectChanges();
    this.globalService.itemList$.subscribe(res => {
      this.items = res;
      this.prepareItemsDataSource();
    });
  }

  // List selection callback
  itemsSelected(event) {
    const selectedItems = event.items;
    if (!this.selectedItemIds) {
      this.selectedItemIds = [];
    }
    let index = 0;
    selectedItems.forEach(element => {
      if (this.forMlgObj) {
        index = this.getIndex(element.itemId);
        if (index === -1) {
          this.selectedItemIds.push(element);
        }
      } else {
        index = this.selectedItemIds.indexOf(element.itemId);
        if (index === -1) {
          this.selectedItemIds.push(element.itemId);
        }
      }
    });
    this.updateTitle();
  }

  itemSelected(event) {
    if (!this.selectedItemIds) {
      this.selectedItemIds = [];
    }
    if (this.forMlgObj) {
      this.selectedItemIds.push(event.item);
    } else {
      this.selectedItemIds.push(event.item.itemId);
    }
    this.updateTitle();
  }

  itemsDeselected(event) {
    const deselectedItems = event.items;
    const searchKeyword = event.searchKeyword;
    if (!searchKeyword || searchKeyword === '') {
      this.selectedItemIds = [];
    } else {
      deselectedItems.forEach(element => {
        const index = this.getIndex(element.itemId);
        if (index !== -1) {
          this.selectedItemIds.splice(index, 1);
        }
      });
    }
    this.updateTitle();
  }

  itemDeselected(event) {
    let index = 0;
    if (this.forMlgObj) {
      this.selectedItemIds.forEach(elem => {
        if (elem.itemId === event.item.itemId) {
          index = this.selectedItemIds.indexOf(elem);
          this.selectedItemIds.splice(index, 1);
        }
      });
    } else {
      index = this.selectedItemIds.indexOf(event.item.itemId);
      if (index !== -1) {
        this.selectedItemIds.splice(index, 1);
      }
    }
    this.updateTitle();
  }

  updateTitle() {
    if (this.selectedItemIds && this.selectedItemIds.length) {
      const length = this.selectedItemIds.length;
      if (length === 1) {
        this.title = `${this.translate.instant('selected')} ${length} ${this.data.singularWord} `;
      } else {
        this.title = `${this.translate.instant('selected')} ${length} ${this.data.pluralWord}`;
      }
    } else {
      this.title = this.data.pluralWord;
    }
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  save() {
    if (this.data && this.data.uniqueKey === 'game_for_mlg' && (this.data && this.data.gameCount + this.selectedItemIds.length) > 25) {
      this.showAlert(this.translate.instant('mlg_max_limit_title'), this.translate.instant('mlg_max_limit_message'));
      return;
    }
    this.updateItems.emit(this.selectedItemIds);
    this.globalService.addAdminGoogleEvent('Contests_Contests_Games_Added');
    this.cancel();
  }
}
