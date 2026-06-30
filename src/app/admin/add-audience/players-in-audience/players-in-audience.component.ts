import { Component, OnInit, EventEmitter, Output, Inject, ChangeDetectorRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { ApiService, Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { CustomAudienceService, Audience } from 'src/app/services/custom-audience/custom-audience.service';
import { Player, PlayerService } from 'src/app/services/player/player.service';
import { SelectionModel } from '@angular/cdk/collections';
import { CompanyService } from 'src/app/services/company/company.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { LocationService } from 'src/app/services/location/location.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AddPlayersInAudienceComponent } from '../add-players-in-audience/add-players-in-audience.component';
import { HeaderService } from 'src/app/services/header/header.service';
import { MatPaginator } from '@angular/material/paginator';
import { PermissionsKey, PermissionsService } from 'src/app/services/permissions/permissions.service';


@Component({
  selector: 'app-players-in-audience',
  templateUrl: './players-in-audience.component.html',
  styleUrls: ['./players-in-audience.component.scss']
})
export class PlayersInAudienceComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  sort: any = {
    sortBy: Constants.FIRST_NAME,
    order: 'asc'
  };
  companyId;
  is_loading: boolean;
  @Output() refreshPlayerList: EventEmitter<any> = new EventEmitter();  
  audience: Audience = new Audience();
  audienceExist: boolean = false;
  loginUser: any;
  editMode: any = false;
  startLimit = 0;
  pageIndex = 0;
  totalUsers = 0;
  noOfItemsPerPage: number;
  playerDataSource: any;
  playerList = [];
  mergePlayerList = [];
  pageSizeOptions: number[];
  allowMultiSelect = true;
  totalPlayerSelected = false;
  isSearchText =false; 
  selection = new SelectionModel<Player>(this.allowMultiSelect, []);
  notEmpty = true;
  notScrolly = true;
  displayedColumns: string[] = [];
  searchText: string = null;
  activePlayers: any;
  inactivePlayers = [];
  errorMsg = '';
  filter_options = [];
 
  delegateSubscription: any;
  playersInAudience = [];
  filterPlayers = new FormControl();
  audienceName: string;
  companySettingPermission: any;
  hasChanged = false;
  customFieldsTemp = [];
  customFields = [];
  openCustomMenu: any;
  selectedId: any;
  selectedType: any;

  constructor(
    public translate: TranslateService,
    public authService: StorageService,
    public companyService: CompanyService,
    public storageService: StorageService,
    public locationService: LocationService,
    public departmentService: DepartmentService,
    public globalService: GlobalService,
    private headerService: HeaderService,
    public apiService: ApiService,
    public permissionService: PermissionsService,
    public customAudienceService: CustomAudienceService,
    public snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public delegateService: DelegateService,
    public playerService: PlayerService) {

      // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    
    }

  ngOnInit() {
    const audienceDetails = this.storageService.getAudienceDetails('audience-details');
    this.editMode = audienceDetails && audienceDetails.editableItems;
    this.audience = {
      audience_id: audienceDetails && audienceDetails.audience_id,
      audience_name: audienceDetails && audienceDetails.audience_name
    };
    if(!this.editMode){
      this.addNewPlayerToAudience(null, true);
    }else{
      this.getAudienceDetails();
    }
    this.audienceName = this.audience && this.audience.audience_name;
    this.headerService.showCompanyFilter(false);
    if (!this.companySettingPermission) {          // when you refresh component players permission object updated from storage
      const company = this.storageService.getCompany();
      this.companySettingPermission = company.permission && company.permission.player;
    }
  }

  ngAfterViewInit() {
    this.filterPlayers.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((res) => {
        this.searchText = res;
        if(this.searchText){
          this.startLimit = 0;
          this.paginator.pageIndex = 0;
          this.isSearchText = true;
        }else{
          this.isSearchText = false;
        }
        this.getAudienceDetails();
      });
    this.globalService.getFormattedPaginationLabel(this.paginator);
    this.cdRef.detectChanges();
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'first_name':
        this.sort.sortBy = Constants.FIRST_NAME;
        this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_add_player_player_name_sorted');
        break;
      case 'department_name':
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
      case 'location_name':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      default:
        this.sort.sortBy = sort.active ? sort.active : Constants.FIRST_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getAudienceDetails();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.playerDataSource.data.length;
    return numSelected === numRows && numSelected;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.playerDataSource.data.filter((element) => {
        return true;
      }).forEach(row => {
        this.selection.select(row);
      });
    }
    if (!this.isAllSelected()) {
      this.totalPlayerSelected = false;
    }
  }
  gameNameValidation(key, audienceName) {
    if (!audienceName.trim().length) {
      this.audience.audience_name = this.audienceName;
    } else {
      this.updateAudience(false, audienceName);

    }
  }
  getAudienceDetails() {
    this.is_loading = true;
    const company_id = this.authService.getCompanyId();
    const managerId = this.authService.getLoginUserID();
    let filters = '';
    if (this.searchText) {
      filters = 'name=' + this.searchText;
    }
    this.customAudienceService.getAudienceDetails(company_id, this.audience.audience_id, managerId, this.startLimit, this.noOfItemsPerPage, this.sort.sortBy, this.sort.order, filters).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.success) {
        this.selection.clear();
        this.playersInAudience = response.data.audience_details.players;
        this.totalUsers = response.data.audience_details.total_player;
        this.customFieldsTemp = response.data.audience_details.custom_fields;
        this.playerDataSource = new MatTableDataSource(this.playersInAudience);
        this.prepareDisplayedColumns();
      }
    });
  }

  changeAudienceName() {
    if (this.audienceExist) {
      const audienceData = {
        'audience': this.audience,
        'isAudience': this.audienceExist,
        'editMode': this.editMode
      };
    }
  }
  updateAudience(playersInAudience, audienceName) {

    const updateAudiencePayload = {
      'company_id': this.authService.getCompanyId(),
      'manager_id': this.authService.getLoginUserID(),
      'audience_id': this.audience.audience_id,
    };
    if(audienceName){
      updateAudiencePayload['audience_name'] =  audienceName
    } else {
      this.preparePayload(playersInAudience, updateAudiencePayload)
    }
    this.is_loading = true;
    this.customAudienceService.updateAudience(updateAudiencePayload).subscribe(res => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'INACTIVE_PLAYERS') {
          this.inactivePlayers = response.data.inactive_players;
          this.highlightInactivePlayers(this.inactivePlayers);
          this.errorMsg = this.translate.instant('players_inactive_for_custom_audience');
          return;
        }
        if (response.message_code === 'AUDIENCE_EXIST') {
          this.audienceExist = response.data.is_exist;
          this.audience.audience_name = this.audienceName;
          this.errorMsg = this.translate.instant('audience_already_exists');
          return;
        }
    
        this.audience.audience_name = this.audienceName;
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      if (audienceName) {
        this.audienceName = audienceName;
        this.audience.audience_name = audienceName;
        this.globalService.showMessage(this.translate.instant('audience_edited'), 'right', 'bottom');
      } else {
        this.globalService.showMessage(this.translate.instant('players_added_in_audience'), 'right', 'bottom');
      }
      this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_edited');
      this.getAudienceDetails();
    });
  }

  onSearch(event) {
    this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_add_player_player_search');
  }

  highlightInactivePlayers(inactivePlayerIds) {
    if (inactivePlayerIds && inactivePlayerIds.length > 0) {
      this.playerList.filter(nplayer => {
        inactivePlayerIds.filter(inactivePlayerId => {
          if (inactivePlayerId === nplayer.player_id) {
            nplayer.is_player_inactive = true;
          }
        });
      });
    }
  }

  // disable add and save button when inactive player is selected while creating or updating audience
  shouldDisable() {
    let isInactive;
    this.inactivePlayers.forEach(iPlayerId => {
      isInactive = this.selection.selected.filter(selection => {
        return selection.player_id === iPlayerId;
      });
    });
    return isInactive && isInactive.length > 0 ? true : false;
  }

  selectPlayer(player) {
    this.selection.select(player);
  }

  prepareDisplayedColumns() {
    this.displayedColumns = [];
    this.displayedColumns = ['select',
     'player_logo',
      'first_name',
    ];
    this.customFields = [];
    this.customFieldsTemp.forEach(field => {
      this.displayedColumns.push(field['column_key']);
      this.customFields.push({
        key: field['column_key'],
        value: field['column_name']
      });
    });
  }

  confirmDeletion() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    // tslint:disable-next-line:max-line-length
    const message = this.selection.selected.length === 1 ? this.translate.instant('confirm_delete_player')
      : this.translate.instant('confirm_delete_players');
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.deletePlayers();
    });
  }

  addNewPlayerToAudience(audienceId = null, fromInit = false) {
    const dialogRef = this.dialog.open(AddPlayersInAudienceComponent, {
    });
    dialogRef.componentInstance.audienceId = audienceId;
    if (fromInit) {
      const audience_details = {
        'audience_name': this.audience.audience_name,
        'audience_id': this.audience.audience_id,
        'editableItems': true
      }
      this.storageService.setAudienceDetails('audience-details', audience_details);
    }
    dialogRef.afterClosed().subscribe(playersInAudience => {
      if (playersInAudience) {
        this.updateAudience(playersInAudience, false);
      }
    });
  }

  selectionBasedText(text, totalCount, selectedCount = null) {
    return text.replace('%d', this.globalService.formatNumber(selectedCount)).replace('%n', this.globalService.formatNumber(totalCount));
  }

  getUsersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.totalPlayerSelected = false;
    this.getAudienceDetails();
  }

  deletePlayers() {
    this.is_loading = true;
    let playerIds = {
      'ids' : [],
      'is_all': this.totalPlayerSelected
    };
    if (this.totalPlayerSelected) {
      playerIds.ids = [];
    } else {
      this.selection.selected.map((selectedPlayer) => {
        playerIds.ids.push(selectedPlayer.player_id); 
      });
    }
    const removePlayersePayload = {
      'company_id': this.authService.getCompanyId(),
      'manager_id': this.authService.getLoginUserID(),
      'audience_name': this.audience.audience_name,
      'audience_id': this.audience.audience_id,
      'linked_players': playerIds,
    };
    this.customAudienceService.deletePlayersAudience(removePlayersePayload).subscribe((res) => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {}

      this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_Delete_Player');
      this.getAudienceDetails();
      this.selection.clear();
    });
  }

  noSpace(event = null) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 32 && !this.audience.audience_name.trim().length) {
      return false;
    }
  }

  allUserSelectionUpdated(allSelection) {
    this.totalPlayerSelected = allSelection;
    if (!this.totalPlayerSelected) {
      this.masterToggle();
    }
    return this.totalPlayerSelected;
  }

  preparePayload(playersInAudience, payload) {
    payload['is_all'] = playersInAudience.is_all;
    payload['linked_players'] = playersInAudience.is_all ? [] : playersInAudience.selectedPlayers.map(player => player.player_id);
    payload['unlinked_players'] = playersInAudience.unselectedPlayers ? playersInAudience.unselectedPlayers.map(player => player.player_id) : [];
    if (playersInAudience.getPlayersPayload) {
      payload['criteria'] = {};
      for(let key in playersInAudience.getPlayersPayload) {
        if (typeof playersInAudience.getPlayersPayload[key] === 'object' && key != 'excluded_audiences') {
          payload['criteria'][key] = playersInAudience.getPlayersPayload[key];
        }
      }
    }
  }
  toggleMenu(event, id, type) {
    console.log('hiiiii')
    this.openCustomMenu = event;
    this.selectedId = id;
    this.selectedType = type;
  }

  ngOnDestroy() {
    this.selection.clear();
    this.headerService.showCompanyFilter(true);
  }

}
