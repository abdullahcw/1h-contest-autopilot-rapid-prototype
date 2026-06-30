import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { GamesService } from '../../../services/games/games.service';
import { PlayerService } from '../../../services/player/player.service';
import { StorageService } from '../../../services/storage/storage.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { AttemptsService } from '../../../services/attempts/attempts.service';
import { MatDialogRef } from '@angular/material/dialog';
import {
  Constants,
  PlaceholderText,
} from '../../../services/network/api.service';
import { LocationService } from '../../../services/location/location.service';
import { DepartmentService } from '../../../services/department/department.service';
import { ListSelectionComponent } from '../../../shared/list-selection/list-selection.component';
import { GlobalService } from '../../../services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
@Component({
  selector: 'app-add-attempts',
  templateUrl: './add-attempts.component.html',
  styleUrls: ['./add-attempts.component.scss'],
})
export class AddAttemptsComponent implements OnInit {

  games = [];
  players;
  totalPlayersCount;
  attempts;
  dataSourceGames;
  dataSourcePlayers;
  selectedTab = 0;
  title;
  backButtonTitle;
  nextButtonTitle;
  selectedGameIds;
  selectedPlayers;
  // context = 'add_attempts';
  companyId: any;
  is_loading;
  is_loading_players;
  menuList: any;
  locationMenuList;
  noOfPlayersPerPage = 100;
  isAllNextPlayersSelected = false;
  customFieldFetchSubscription: any;
  delegateSubscription: any;
  departmentList = [];

  @ViewChild('playerSelectionComponent')
  playerSelectionComponent: ListSelectionComponent;

  @Output() limitsAdded: EventEmitter<any> = new EventEmitter<any>();
  filter_options = [];
  search_filters = [
    {
      filter: Constants.NAME,
      value: this.translate.instant('name'),
      is_text_search: true,
      is_list_search: false,
      placeholder: PlaceholderText.PLAYER_NAME,
    },

    // {
    //   'filter': Constants.LOCATION_IDS, value: this.translate.instant('location'), 'is_generic_menu': true, 'is_text_search': true,
    //   'is_list_search': true, 'placeholder': PlaceholderText.LOCATION_NAME, is_multi_selection: true, 'custom_menu_Item': true
    // },
    // {
    //   'filter': Constants.DEPARTMENT_IDS, value: this.translate.instant('department'), 'is_generic_menu': true, 'is_text_search': true,
    //   'is_list_search': true, 'dependent_on': Constants.LOCATION_IDS, 'placeholder': PlaceholderText.DEPARTMENT_NAME,
    //   is_multi_selection: true, 'custom_menu_Item': true
    // }
  ];
  appliedFilters: any = [];

  constructor(
    private storageService: StorageService,
    private gameService: GamesService,
    private playersService: PlayerService,
    private attemptsService: AttemptsService,
    public dialogRef: MatDialogRef<any>,
    private companyService: CompanyService,
    private locationService: LocationService,
    private departmentService: DepartmentService,
    public translate: TranslateService,
    private globalService: GlobalService,
    private cdRef: ChangeDetectorRef,
    private delegateService: DelegateService
  ) {
    dialogRef.disableClose = true;
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.globalService.isCompanyBelongsToCustomField()) {
        this.filter_options = this.globalService.removeCustomFilters(this.search_filters);
      }
      this.appliedFilters = [];
    });

    this.customFieldFetchSubscription =
      this.companyService.onCustomFieldsFetched.subscribe((res) => {
        if (!this.globalService.isCompanyBelongsToCustomField()) {
          this.filter_options = this.globalService.addeditCompanyCustomFilters(
            this.search_filters,
            res,
            1
          );
          this.setDefaultFiltersForCustomCompany(true);
          this.filter_options.forEach((filterOption) => {
            if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
              filterOption['dependent_on'] = Constants.LOCATION_IDS;
            }
          });
        }
      });
  }

  ngOnInit() {
    this.companyId = this.storageService.getCompanyId();
    // this.storageService.setFilters(this.context, null);

    this.prepareGamesDataSource();
    this.updateHeaderAndFooter();
    this.searchPlayers();
    if (!this.globalService.isCompanyBelongsToCustomField()) {
      const fields = this.companyService.getCustomFields();
      this.filter_options = this.globalService.addeditCompanyCustomFilters(
        this.search_filters,
        fields,
        1
      );

      this.filter_options.forEach((filterOption) => {
        if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
          filterOption['dependent_on'] = Constants.LOCATION_IDS;
        }
      });
      if (this.appliedFilters) {
        this.appliedFilters.forEach((filterOption) => {
          if (filterOption.customFilterKey === Constants.DEPARTMENT_IDS) {
            filterOption['dependentOn'] = Constants.LOCATION_IDS;
          }
        });
      }
    } else {
      this.filter_options = this.globalService.removeCustomFilters(this.search_filters);
    }
  }

  updateHeaderAndFooter() {
    switch (this.selectedTab) {
      case 0:
        this.updateGameTitle();
        this.backButtonTitle = this.translate.instant('cancel');
        this.nextButtonTitle = this.translate.instant('next');
        break;
      case 1:
        this.title = this.translate.instant('select_players');
        this.backButtonTitle = this.translate.instant('back');
        this.nextButtonTitle = this.translate.instant('next');
        break;
      case 2:
        this.title = this.translate.instant('add_attempts');
        this.backButtonTitle = this.translate.instant('back');
        this.nextButtonTitle = this.translate.instant('done');
        break;
    }
  }

  updateGameTitle() {
    if (this.selectedGameIds && this.selectedGameIds.length) {
      const length = this.selectedGameIds.length;
      if (length === 1) {
        this.title = `${this.translate
          .instant('selected_game')
          .replace('%d', length)}`;
      } else {
        this.title = `${this.translate
          .instant('selected_games')
          .replace('%d', length)}`;
      }
    } else {
      this.title = this.translate.instant('select_games');
    }
  }

  prepareGamesDataSource() {
    this.dataSourceGames = [];
    if (this.games && this.games.length) {
      this.games.forEach(game => {
        // Check if all locations need to be selected
        let isSelected = false;
        if (this.selectedGameIds) {
          const index = this.selectedGameIds.indexOf(game.game_id);
          if (index !== -1) {
            isSelected = true;
          }
        }
        const ds = {
          itemId: game.game_id,
          itemName: game.game_name,
          isSelected: isSelected, userInfo: game
        };
        this.dataSourceGames.push(ds);
      });
    }
  }

  preparePlayersDataSource() {
    this.dataSourcePlayers = [];
    // this is used to clear the checkedItems and itemsToBeDisplayed array to avoid duplicate selection of items
    if (!this.appliedFilters.length && this.playerSelectionComponent) { 
      this.playerSelectionComponent.clearSelection();
    }
    let index = 0;
    this.players.forEach((player) => {
      // Check if all locations need to be selected
      let isSelected = false;
      if (this.selectedPlayers && this.selectedPlayers.length) {
        index = this.getIndex(player.player_id);
        if (index !== -1) {
          isSelected = true;
        }
      }
      const ds = {
        itemId: player.player_id,
        itemName: `${player.first_name} ${player.last_name}`,
        isSelected: isSelected,
        userInfo: player,
      };
      this.dataSourcePlayers.push(ds);
    });
    this.cdRef.detectChanges();
  }

  getIndex(keyId) {
    const gameIds = [];
    this.selectedPlayers.forEach(elem => {
      if (elem.itemId === keyId) {
        gameIds.push(keyId);
      }
    });
    return gameIds.indexOf(keyId);
  }

  requestedGames(event) {
    this.searchGames(event.searchKeyword);
  }

  // List selection callback - Games
  gamesSelected(event) {
    const selectedItems = event.items;
    if (!this.selectedGameIds) {
      this.selectedGameIds = [];
    }
    selectedItems.forEach((element) => {
      const index = this.selectedGameIds.indexOf(element.itemId);
      if (index === -1) {
        this.selectedGameIds.push(element.itemId);
      }
    });
    this.updateGameTitle();
  }
  gamesDeselected(event) {
    const deselectedItems = event.items;
    const searchKeyword = event.searchKeyword;

    if (!searchKeyword || searchKeyword === '') {
      this.selectedGameIds = [];
    } else {
      deselectedItems.forEach((element) => {
        const index = this.selectedGameIds.indexOf(element.itemId);
        if (index !== -1) {
          this.selectedGameIds.splice(index, 1);
        }
      });
    }
    this.updateGameTitle();
  }

  gameSelected(event) {
    if (!this.selectedGameIds) {
      this.selectedGameIds = [];
    }
    this.selectedGameIds.push(event.item.itemId);
    this.updateGameTitle();
  }

  gameDeselected(event) {
    const index = this.selectedGameIds.indexOf(event.item.itemId);
    if (index !== -1) {
      this.selectedGameIds.splice(index, 1);
    }
    this.updateGameTitle();
  }

  playersSelected(selectedItems) {
    this.selectedPlayers = selectedItems;
  }

  canGoNext() {
    switch (this.selectedTab) {
      case 0:
        return this.selectedGameIds && this.selectedGameIds.length;
      case 1:
        return this.selectedPlayers && this.selectedPlayers.length;
      default:
        return this.attempts && this.attempts > 0 && this.attempts <= 10;
    }
  }

  searchPlayers() {
    const managerID =
    this.storageService.getUser() &&
    JSON.parse(this.storageService.getUser());
    this.is_loading_players = true;
    let payload = {
      'company_id': this.storageService.getCompanyId(),
      'manager_id': managerID.manager_id,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
      'sort_by': Constants.FIRST_NAME,
      'order': 'asc',
      'start_index': 0,
      'limit': this.noOfPlayersPerPage,
      'status': 'active'
    };

    this.preparePayloadFor(Constants.NAME, payload, 'name');
      
    this.appliedFilters.forEach((elem) => {
      if (elem.customFilterKey) {
        if (elem.isAll) {
          payload[elem.customFilterKey] = {
            'ids' : [],
            'is_all': true
          };
        } else {
          this.preparePayloadFor(
            Constants.CUSTOM_FILTER_KEY,
            payload,
            elem.customFilterKey
          );
        }
      }
    });

    this.playersService.getPlayersForCustomFields(payload).subscribe((res) => {
      this.is_loading_players = false;
      if (res.success) {
        this.players = res.data.player_list;
        this.totalPlayersCount = res.data.total_player;
        this.preparePlayersDataSource();
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
        } else if (element.filter === key && key === Constants.NAME) {
          payload[key] = element.value;
        }

      });
    }
  }

  searchGames(searchText = null) {
    let filter =
      'game_state=READY,LIVE&game_type=1&game_mode=CONTEST&only_som=true';
    filter += searchText ? `&game_name=${searchText}` : '';
    this.is_loading = true;
    this.gameService.getGames(this.companyId, 'game_name', 'asc', 0, 100, filter).subscribe(res => {
      this.is_loading = false;
      if (res.success) {
        this.games = res.data.game_list;
        this.prepareGamesDataSource();
      }
    });
  }

  back() {
    if (this.selectedTab === 0) {
      this.dialogRef.close();
    } else {
      this.selectedTab--;
      this.updateHeaderAndFooter();
      if (this.appliedFilters.length && this.selectedTab == 1) {
        this.appliedFilters = [];
        this.searchPlayers();
      }
    }
    this.cdRef.detectChanges();
  }


  next() {
    if (!this.players || this.players.length === 0) {
      this.appliedFilters = [];
      this.searchPlayers();
    }
    if (this.selectedTab === 2) {
      this.globalService.addAdminGoogleEvent('Attempts_Select_Players_Name');
      const playerIds = [];
      this.selectedPlayers.forEach((selectedPlayer) => {
        playerIds.push(selectedPlayer.itemId);
      });
      const payload = {
        company_id: this.companyId,
        player_ids: playerIds,
        game_ids: this.selectedGameIds,
        attempt: +this.attempts,
        send_to_all: this.isAllNextPlayersSelected,
      };
      this.updatePayloadForFilters(payload);
      this.is_loading = true;
      this.attemptsService.addAttempts(payload).subscribe((res) => {
        this.is_loading = false;
        this.limitsAdded.emit();
        this.dialogRef.close();
        this.globalService.addAdminGoogleEvent('Attempts_Add_Attempts');
      });
    } else {
      this.selectedTab++;
      this.updateHeaderAndFooter();
      if (this.appliedFilters.length && this.selectedTab == 1) {
        this.appliedFilters = [];
        this.searchPlayers();
      }
    }
    this.detectChanges();
  }

  updatePayloadForFilters(payload) {
    if (this.appliedFilters && this.appliedFilters.length) {
      this.appliedFilters.forEach((appliedFilter) => {
        const filter = appliedFilter.customFilterKey ? appliedFilter.customFilterKey : appliedFilter.filter;
        if (this.isFilterArray(filter)) {
          const array = payload[filter] ? payload[filter] : [];
          array.push(appliedFilter.id);
          payload[filter] = array;
        } else if (filter == Constants.NAME) {
          payload[filter] = appliedFilter.value;
        }
      });
    }
  }

  isFilterArray(filter) {
    return (
      filter === Constants.LOCATION_IDS || filter === Constants.DEPARTMENT_IDS
    );
  }

  refreshListOnFilterChange(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.searchPlayers();
  }

  getDataSource(filter) {
    // console.log('filter',filter);
    const filterName = filter['filter'];
    console.log('filter_name', filterName);
    switch (filterName) {
      case Constants.LOCATION_IDS:
        this.getCustomFieldsValues(filter);
        break;
      case Constants.DEPARTMENT_IDS:
        this.getCustomFieldsValues(filter);
        break;
      // case Constants.CUSTOM_AUDIENCE:
      //   this.getAudience();
      //   break;
      default:
        this.getCustomFieldsValues(filter);
        break;
    }
    this.cdRef.detectChanges();

    // switch (filterName) {
    //   case Constants.LOCATION_IDS:
    //     this.getLocations();
    //     break;
    //   case Constants.DEPARTMENT_IDS:
    //     this.getDepartments();
    //     break;
    // }
  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    switch (filterKey) {
      // case Constants.CUSTOM_AUDIENCE:
      //   this.getAudience();
      //   break;
      default:
        const searchFilter = {
          search_text: searchKey ? searchKey : '',
          filter: filterKey,
          value: currentFilter.value,
          is_multi_selection: currentFilter.is_multi_selection,
          custom_filter_key: currentFilter.custom_filter_key,
        };
        // after applying this check the api is not called multiple times does menulist is not repopulated with same key value pairs
        if (searchKey) {
          this.getCustomFieldsValues(searchFilter);
        }
        break;
    }
    this.cdRef.detectChanges();
  }

  getLocations() {
    const managerID = this.storageService.getUser()
      ? JSON.parse(this.storageService.getUser())
      : '';
    let filters = '';
    if (managerID) {
      filters = `manager_id=${managerID.manager_id}`;
    }
    this.locationService
      .getLocations(
        this.storageService.getCompanyId(),
        Constants.LOCATION_NAME,
        'asc',
        0,
        0,
        filters,
        false
      )
      .subscribe((res) => {
        const response: any = res;
        let locations;
        const locList = [];
        if (!response.success) {
          return;
        }
        if (response.data) {
          locations = response.data.location_list;
        }
        locations.forEach((location) => {
          locList.push({
            id: location.location_id,
            value: location.location_name,
          });
        });
        const filterInfo = {
          filter_name: Constants.LOCATION_IDS,
          searching_in: this.translate.instant('location'),
        };
        this.locationMenuList = this.globalService.prepareSelectionList(
          locList,
          filterInfo,
          this.appliedFilters
        );
        this.menuList = this.locationMenuList;
        this.cdRef.detectChanges();
      });
  }

  getDepartments() {
    const locIds = [];
    let isAllLocation = false;
    const locationFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.LOCATION_IDS;
    });
    if (locationFilters && locationFilters.length > 0) {
      locationFilters.forEach(loc => {
        if (loc['id'] !== -1) {
          locIds.push(loc['id']);
        } else {
          isAllLocation = true;
        }
      });
    }

    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'location_ids': isAllLocation ? [] : locIds,
      'is_all': isAllLocation
    };
    this.departmentService.getDepartmentsByLocations(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      const list = [];
      const deptList = response.data.department_list;
      deptList.forEach((department) => {
        list.push({
          id: department.department_id,
          value: department.department_name,
        });
      });
      this.menuList = [];
      let forceSelection = false;
      this.appliedFilters.filter((filter) => {
        if (filter.filter === Constants.DEPARTMENT_IDS && filter.value === 'All') {
          forceSelection = true;
        }
      });
      const filterInfo = {
        'filter_name': Constants.DEPARTMENT_IDS, 'searching_in': this.translate.instant('department'),
        'dependentOn': Constants.LOCATION_IDS
      };
      this.departmentList = this.globalService.prepareSelectionList(list, filterInfo, this.appliedFilters, forceSelection);
      this.menuList = this.departmentList;
      this.cdRef.detectChanges();
    });
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  masterToggle() {
    this.playerSelectionComponent.masterToggle();
  }

  isItemSelected() {
    return this.playerSelectionComponent
      ? this.playerSelectionComponent.isItemSelected()
      : false;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    return this.playerSelectionComponent
      ? this.playerSelectionComponent.isAllSelected()
      : false;
  }

  selectionBasedText(text, totalCount, selectedCount = null) {
    return text.replace('%d', selectedCount).replace('%n', totalCount);
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
    this.companyService
      .getCustomFieldsValues(field, companyId, searchText ? searchText : null)
      .subscribe((res) => {
        const response: any = res;

        if (response.success) {
          if (filterDetails.is_multi_selection) {
            const mList = this.globalService.prepareMenuList(
              response.data.values,
              filterDetails
            );
            const filterInfo = {
              filter_name: field,
              searching_in: searchingIn,
            };
            const clickedFilter = this.appliedFilters.filter(
              (appliedFilter) =>
                appliedFilter.searchingIn === filterDetails.value
            )[0];
            const forceSelection =
              clickedFilter && clickedFilter.value === 'All' ? true : false;
            this.menuList = this.globalService.prepareSelectionList(
              mList,
              filterInfo,
              this.appliedFilters,
              forceSelection
            );
          } else {
            this.menuList = this.globalService.prepareMenuList(
              response.data.values,
              filterDetails
            );
          }
          this.cdRef.detectChanges();
        }
      });
  }

  setDefaultFiltersForCustomCompany(refreshDashboard) {
    // this.appliedFilters = this.teamDefaultFilters;
    this.refreshListOnFilterChange(this.appliedFilters);
  }

  detectChanges() {
    this.cdRef.detectChanges();
  }
}
