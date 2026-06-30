import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss']
})
export class EditAccountComponent implements OnInit {
  accountId: any;
  is_loading: boolean;
  searchText: string = null;
  selection = new SelectionModel(true, []);
  account: any = {
    first_name: '',
    last_name: '',
    email: '',
  };
  platforms: any;
  selectedSearchKey = '';
  @ViewChild('editAccountForm', { static: true }) editAccountForm: NgForm;
  filterItem = new FormControl();

  constructor(public dialogRef: MatDialogRef<any>,
    public accounService: AccountsService, public apiService: ApiService, public globalService: GlobalService,) { }

  ngOnInit(): void {
    this.getCSMAccountDetails();
  }

  ngAfterViewInit() {
    if (!this.filterItem) { return; }
    this.filterItem.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {  
        this.searchText = res;
        console.log('res',res);      
        if (!res) {
          this.searchText = null;
          this.platforms = this.selectedItemDiffPlatformsWithSearchText(this.selection.selected, this.platforms);          
        }
      });
  }

  getCSMAccountDetails() {
    this.is_loading = true;
    this.accounService.getAccountDetails(this.accountId)
    .subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.account = response.data.manager_details;
      this.platforms = response.data.manager_details.company_list;
      if (this.platforms) {
        this.platforms.forEach(platform => {
          if (platform.can_access) {
            this.selection.select(platform);
          }
        });
        this.platforms = this.selectedItemDiffPlatformsWithSearchText(this.selection.selected, this.platforms);
      }
    });
  }

  selectedItemDiffPlatformsWithSearchText(existingSelectedPlatforms, currentPlatformList) {
    const selectedPlatforms = [];
    if (existingSelectedPlatforms && existingSelectedPlatforms.length > 0) {
      existingSelectedPlatforms.map(platform => {
        currentPlatformList.map(nplatform => {
          if (platform.company_id === nplatform.company_id) {
            const index = currentPlatformList.indexOf(nplatform);
            currentPlatformList.splice(index, 1);
            selectedPlatforms.push(platform);
          }
        });
      });
      if (selectedPlatforms.length) {
        const sortedItems = selectedPlatforms.slice().sort((a, b) => a.company_name.localeCompare(b.company_name));
        const uncheckedSortedItems = currentPlatformList.slice().sort((a, b) => a.company_name.localeCompare(b.company_name));
        return [...sortedItems, ...uncheckedSortedItems];
      }
    }
  }

  masterToggle() {
    if (!this.isAllSelected()) {
      this.platforms.filter((element) => {
        return true;
      }).forEach(row => this.selection.select(row));
    } else {
      this.selection.clear();
    
      //1huddle company selected
      this.platforms.forEach(platform => {
        if (!platform.is_editable) {
          this.selection.select(platform);
        }
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.platforms.length;
    return numSelected === numRows && numSelected;
  }

  onItemClick(platform) {
    this.selection.toggle(platform);
  }

  cancel() {
    this.selection.clear();
    this.dialogRef.close();
  }

  done() {
    const accountPayload = {
      'selectedPlatforms': this.selection.selected,
      'first_name': this.account.first_name,
      'last_name': this.account.last_name,      
      'manager_id': this.accountId
    }
    this.dialogRef.close(accountPayload);
  }

  shouldDisableAction() {
    if (!this.account.first_name || !this.account.last_name || !this.selection.selected.length) {
      return true;
    }
    return false;
  }

}
