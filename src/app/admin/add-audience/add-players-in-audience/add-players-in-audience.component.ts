import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CompanyService } from 'src/app/services/company/company.service';
import { CustomAudienceService } from 'src/app/services/custom-audience/custom-audience.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { LocationService } from 'src/app/services/location/location.service';
import { Constants, PlaceholderText, ApiService } from 'src/app/services/network/api.service';
import { PlayerService } from 'src/app/services/player/player.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-add-players-in-audience',
  templateUrl: './add-players-in-audience.component.html',
  styleUrls: ['./add-players-in-audience.component.scss']
})
export class AddPlayersInAudienceComponent implements OnInit, OnDestroy {

  selectSearchFilterKey = 'full_name';
  searchKey='';
  appliedFilters = [];
  menuList = [];
  locationList = [];
  departmentList = [];
  loginUser: any;
  editMode: any = false;
  startLimit = 0;
  pageIndex = 0;
  totalUsers = 0;
  noOfItemsPerPage: number = 100;
  playerPermission: any = {};
  companyId;
  is_loading: boolean;
  sort: any = {
    sortBy: Constants.FIRST_NAME,
    order: 'asc'
  };
  playerList = [];
  filter_options = [];
  context = 'players';
  isFossilCustomField = true;
  title;
  filterPlayers = new FormControl();
  searchText: string = null;
  isAllNextPlayersSelected = false;
  allowMultiSelect = true;
  selection = new SelectionModel(this.allowMultiSelect, []);
  totalItemSelected = false;
  audienceId;
  copyOfPlayerList = [];
  noPlayer = false;
  notScrolly = true;
  notEmpty = true;
  isSuperMasterToggle = false;
  isMasterToggle = false;
  unlinked_players = [];
  scrollDistance = 2;
  getPlayersPayload: any;
  isMobile = false;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  constructor(public translate: TranslateService,
    public companyService: CompanyService,
    public storageService: StorageService,
    public locationService: LocationService,
    public departmentService: DepartmentService,
    public globalService: GlobalService,
    public apiService: ApiService,
    public customAudienceService: CustomAudienceService,
    public snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public playerService: PlayerService) {
      dialogRef.disableClose = true;
     }

  ngOnInit(): void {
    this.getCustomFields();
    this.getPlayers();
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
  }

  ngAfterViewInit() {
    this.filterPlayers.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((res) => {
        this.searchText = res;
        this.playerList = [];
        this.startLimit = 0;
        if (this.isSuperMasterToggle) {
          this.selection.clear();
        }
        this.getPlayers();
      });
    this.cdRef.detectChanges();
  }

  getPlayers(isScroll = false) {
    this.is_loading = true;
    this.loginUser = JSON.parse(this.storageService.getUser());
    this.getPlayersPayload = {
      'company_id': this.storageService.getCompanyId(),
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      'manager_id': this.loginUser.manager_id,
      'is_custom': !!this.globalService.isCompanyBelongsToCustomField(),
      'is_company_with_custom_fields': !!this.globalService.isCompanyWithCustomField(),
      'status': 'active',
      'include_status': 'UNVERIFIED',
      'start_index': this.startLimit,
      'limit': this.noOfItemsPerPage,
    };

    if (this.searchText) {
      this.getPlayersPayload['name'] = this.searchText;
    }
    if (this.audienceId) {
      this.getPlayersPayload['excluded_audiences'] = [];
      this.getPlayersPayload['excluded_audiences'].push(this.audienceId);
    }

    if (this.appliedFilters && this.appliedFilters.length) {

      this.appliedFilters.forEach((elem) => {
        if (this.getPlayersPayload[elem.customFilterKey] && elem.isAll) {
          return;
        }
        if (elem.customFilterKey && elem.isAll) {
          this.getPlayersPayload[elem.customFilterKey] = {
            'ids' : [],
            'is_all': true
          };
        } else {
          this.preparePayloadFor(
            Constants.CUSTOM_FILTER_KEY,
            this.getPlayersPayload,
            elem.customFilterKey
          );
        }
      });
    }
    this.playerService.getPlayersForCustomAudiance(this.getPlayersPayload).subscribe(res => {
      const response: any = res;
      this.notScrolly = true;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      } 
      // Clear selection
      if (response.success) {
        this.totalUsers = response.data.count;
        if (response.data.players.length) {
          const players = response.data.players;
          if (this.selection.selected.length && !this.isSuperMasterToggle) {
            if (this.searchText) {
              let ids = new Set(this.playerList.map(d => d.player_id));
              let merged = [...this.playerList, ...players.filter(d => !ids.has(d.player_id))];
              const updatedSelection = this.selection.selected.filter((checkedItem) => { // to show searched item on the top
                return merged.map((player) => {
                  return player.player_id === checkedItem.player_id;
                });
              });
              this.playerList = this.selectedItemDiffPlayersWithSearchText(updatedSelection, merged);
            } else {// without search text
              let ids = new Set(this.selection.selected.map(d => d.player_id));
              let merged = [...this.playerList, ...players.filter(d => !ids.has(d.player_id))];
              this.playerList = this.selectedItemDiffPlayersWithoutSearchText(this.selection.selected, merged);
            }
          } else {
            if (this.isSuperMasterToggle) {
              if (this.searchText) {
                this.preparePlayerListForSuperMasterToggle(players);
              } else {
                if (this.unlinked_players.length) {
                  this.preparePlayerListForSuperMasterToggle(players);
                  if (this.unlinked_players) {
                    this.playerList = this.selectedItemDiffPlayersWithUnlinkedPlayers(this.unlinked_players, this.playerList);
                  }
                } else {
                  players.map(player => this.selection.select(player));
                  this.playerList = [...this.playerList, ...players];
                }
              }
            } else {
              this.playerList = [...this.playerList, ...players];
            }
          }
          this.noPlayer = false;
          this.notEmpty = true;
        } else {
          if (this.startLimit <= this.totalUsers) {
            this.playerList = [-1];
            this.noPlayer = true;
            this.notEmpty = false;
          }
        }
        if (!this.playerList.length) {
          this.notEmpty = false;
        }
        this.is_loading = false;
        this.cdRef.detectChanges();
        if (isScroll) {
          const scrollContainer = document.getElementById('container');
          if (scrollContainer) {
            scrollContainer.scrollTop =  scrollContainer.scrollHeight/2;
          }
        }
      }
    });
  }

  preparePayloadFor(constant, payload, key) {
    const filters = this.appliedFilters.filter((item) => {
      return item.filter === constant || item.hasOwnProperty(constant);
    });
    if (filters.length) {
      payload[key] = {
        'ids' : [],
        'is_all': false
      };
      filters.forEach((element) => {
        if (element.customFilterKey === key) {
          payload[key]['ids'].push(element.id);
          if (payload.hasOwnProperty(key)) {
            if (payload[key]['ids'].indexOf(element.id) === -1) {
              payload[key]['ids'].push(element.id);
            }
          }
        }
      });
    }
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    if(filterName){
    this.getCustomFieldsValues(filter);
    }
    this.cdRef.detectChanges();
  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    if (filterKey) {
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
    }
    this.cdRef.detectChanges();
  }

  refreshListOnFilterChange(filters) {
    this.storeFilters(filters);
  }

  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.resetAll();
    this.notEmpty = true;
    this.getPlayers();
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

  getCustomFields() {
    this.companyService.getCompanyCustomFields(this.storageService.getCompanyId()).subscribe(res => {
      if (res.success) {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.filter_options, res.data.fields, 1, this.isFossilCustomField);
      }
    });
  }

  canGoNext() {
    return this.selection && this.selection.selected.length;
  }

  next() {
    const playersPayload = {
      'selectedPlayers': this.selection.selected,
      'unselectedPlayers': this.isSuperMasterToggle ? this.unlinked_players.length ? this.unlinked_players : [] : [],      
      'is_all': this.isSuperMasterToggle
    }
    if(this.appliedFilters.length){
      playersPayload['getPlayersPayload'] = this.getPlayersPayload
    }
    this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_player_added');
    this.dialogRef.close(playersPayload);
  }

  selectionBasedText(text, totalCount, selectedCount = null, unselectedCount = null) {
    if (this.isSuperMasterToggle) {
      return text.replace('%d', this.globalService.formatNumber(totalCount - unselectedCount)).replace('%n', this.globalService.formatNumber(totalCount));
    } else {
      return text.replace('%d', this.globalService.formatNumber(selectedCount)).replace('%n', this.globalService.formatNumber(totalCount));
    }
  }

  onSearch(event) {
    this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_add_player_player_search');
  }

  masterToggle() {
    if (this.isSuperMasterToggle) {
      this.isMasterToggle = true;
      this.playerList.filter((element) => {
        return true;
      }).forEach(row => this.selection.select(row));
    } else {
      if (this.isAllSelected()) {
        this.selection.clear();
        this.unlinked_players = [];
        this.isMasterToggle = false;
        if (!this.isSuperMasterToggle) {
          this.startLimit = 0;
          this.playerList = [];
          this.getPlayers();
        }
      } else {
        this.isMasterToggle = true;
        this.playerList.filter((element) => {
          return true;
        }).forEach(row => this.selection.select(row));
      }
    }
    // reset allPlayerSelection
    if (!this.isAllSelected()) {
      this.totalItemSelected = false;
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.playerList.length;
    return numSelected === numRows && numSelected;
  }

  onItemClick(player) {
    if (player == -1) return;
    this.selection.toggle(player);
    if (this.isSuperMasterToggle) {
      if (this.isAllNextPlayersSelected) { 
        this.isAllNextPlayersSelected = false;
      }
      const index = this.getIndex(player.player_id);
      if (index === -1) { // to avoid duplicates
        this.unlinked_players.push(player);
      } else {
        this.unlinked_players.splice(index, 1);
      }
    }
  }

  back() {
    this.resetAll();
    this.dialogRef.close();
  }

  onScroll() {
    if (this.notScrolly && this.notEmpty) {
      this.notScrolly = false;
      this.getNextSessions();
    }
    this.cdRef.detectChanges();
  }

  getNextSessions() {
    this.startLimit = this.startLimit + this.noOfItemsPerPage;
    if (!this.playerList.length) {
      this.scrollTop();
    }
    if (this.startLimit < this.totalUsers) {
      this.getPlayers(true);
    }
  }

  scrollTop() {
    if (document.getElementById('container') && this.startLimit == 0) {
      document.getElementById('container').scrollTop = 0;
    }
    this.cdRef.detectChanges();
  }
  selectedItemDiffPlayersWithSearchText(existingSelectedPlayers, currentPlayerList) {
    const selectedPlayers = [];
    if (existingSelectedPlayers && existingSelectedPlayers.length > 0) {
      existingSelectedPlayers.map(player => {
        currentPlayerList.map(nplayer => {
          if (player.player_id === nplayer.player_id) {
            const index = currentPlayerList.indexOf(nplayer);
            currentPlayerList.splice(index, 1);
            selectedPlayers.push(player);
          }
        });
      });
      if (selectedPlayers.length) {
        return [...selectedPlayers, ...currentPlayerList];
      } else {
        return currentPlayerList;
      }
    }
  }

  selectedItemDiffPlayersWithoutSearchText(existingSelectedPlayers, currentPlayerList) {
    if (existingSelectedPlayers && existingSelectedPlayers.length > 0) {
      existingSelectedPlayers.map(player => {
        currentPlayerList.map(nplayer => {
          if (player.player_id === nplayer.player_id) {
            const index = currentPlayerList.indexOf(nplayer);
            currentPlayerList.splice(index, 1);
          }
        });
      });
      return [...existingSelectedPlayers, ...currentPlayerList];
    }
  }

  selectedItemDiffPlayersWithUnlinkedPlayers(unselectedPlayers, currentPlayerList) {
    if (unselectedPlayers && unselectedPlayers.length > 0) {
      unselectedPlayers.map(player => {
        currentPlayerList.map(nplayer => {
          if (player.player_id === nplayer.player_id) {
            const index = currentPlayerList.indexOf(nplayer);
            currentPlayerList.splice(index, 1);
          }
        });
      });
      return [...currentPlayerList, ...unselectedPlayers];
    }
  }

  resetAll() {
    this.selection.clear();
    this.unlinked_players = [];
    this.startLimit = 0;
    this.playerList = [];
    this.isMasterToggle = false;
    this.isSuperMasterToggle = false;
  }

  preparePlayerListForSuperMasterToggle(players) {
    let ids = new Set(this.unlinked_players.map(d => d.player_id));
    players.filter(player => {
      if (!ids.has(player.player_id)) {
        this.selection.select(player);
      } else {
        this.selection.deselect(player);
      }
    });
    this.playerList = [...this.playerList, ...players];
  }

  getIndex(keyId) {
    const gameIds = [];
    this.unlinked_players.forEach(elem => {
      if (elem.player_id === keyId) {
        gameIds.push(keyId);
      }
    });
    return gameIds.indexOf(keyId);
  }

  noTyping(event = null) {
    if (this.is_loading) {
      return false;
    }
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    let keyName = `Custom_Audience_Custom_Audience_Filter_${filter.filter}`;
    if (filter && !filter.filter) {
      keyName = `Custom_Audience_Custom_Audience_Filter_${filter.userInfo.searching_in}`;
    }
    this.globalService.addAdminGoogleEvent(keyName);
    return;

  }

  ngOnDestroy() {
    this.resetAll();
    this.is_loading = false;
  }
}
