import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Constants, ApiService, PlaceholderText } from 'src/app/services/network/api.service';
import { SelectionModel } from '@angular/cdk/collections';
import { Paginations, GlobalService, UsageLimit } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PlayerService, Player } from 'src/app/services/player/player.service';
import { AddUserComponent } from '../add-user/add-user.component';
import { LocationService } from 'src/app/services/location/location.service';
import { DepartmentService } from 'src/app/services/department/department.service';
import { GroupService } from 'src/app/services/group/group.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { AddGroupComponent } from '../add-group/add-group.component';
import { ChangeDepartmentComponent } from '../change-department/change-department.component';
import { UploaderComponent } from '../uploader/uploader.component';
import { CompanyService } from 'src/app/services/company/company.service';
import { VipCodeService } from 'src/app/services/vip-code/vip-code.service';
import { TutorialVideoComponent } from '../tutorial-video/tutorial-video.component';
import { ManagerService } from 'src/app/services/manager/manager.service';
   
import { PaywallActionComponent } from '../paywallAction/paywall-action.component';
import { MatMenuPanel } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';


export enum Status {
  EXPIRED = 'EXPIRED',
  LIVE = 'LIVE'
}

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss']
})

export class PlayersComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sort: any = {
    sortBy: Constants.FIRST_NAME,
    order: 'asc'
  };
  selectedPlayer: Player;
  playerPermission: any = {};
  player_id;
  companyId;
  locations = [];
  is_loading = false;
  startLimit = 0;
  pageIndex = 0;
  totalUsers = 0;
  noOfItemsPerPage: number;
  userDataSource: any;
  playerList = [];
  menuList = [];
  locationList = [];
  departmentList = [];
  vipCodeList = [];
  customManagerList = [];
  groupList = [];
  selectedPlayerIds = [];
  appliedFilters = [];
  context = 'players';
  player_ids = [];
  customFields = [];
  completeUserDetails: any = {
    userInfo: '',
    userType: ''
  };
  allowMultiSelect = true;
  selection = new SelectionModel<Player>(this.allowMultiSelect, []);
  // selection;
  pageSizeOptions: number[];
  displayedColumns: string[] = ['select', 'user_logo', 'first_name', 'user_status', 'location_name', 'department_name', 'group_name'];
  userStatusList = [{ 'id': 'active', 'value': this.translate.instant('active') },
  { 'id': 'inactive', 'value': this.translate.instant('inactive') },
  { 'id': 'unverified', 'value': this.translate.instant('pending_verification') }];
  filter_options = [];
  search_filters = [
    {
      'filter': Constants.NAME, value: this.translate.instant('name'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.PLAYER_NAME
    },
    {
      'filter': Constants.EMAIL, value: this.translate.instant('email'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.EMAIL
    },
    // {
    //   'filter': Constants.LOCATION_IDS, value: this.translate.instant('location'), 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.LOCATION_NAME, 'is_multi_selection': true, 'is_generic_menu': true, 'custom_menu_Item': true
    // },
    // {
    //   'filter': Constants.DEPARTMENT_IDS, value: this.translate.instant('department'), 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.DEPARTMENT_NAME, 'is_multi_selection': true, 'is_generic_menu': true, 'custom_menu_Item': true
    // },
    // {
    //   'filter': Constants.GROUP_IDS, value: this.translate.instant('group'), 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.GROUP_NAME, 'is_generic_menu': true, 'is_multi_selection': true, 'custom_menu_Item': true
    // },
    // {
    //   'filter': Constants.STATUS, value: this.translate.instant('status'), 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.STATUS, 'is_generic_menu': true
    // }, {
    //   'filter': Constants.VIP_CODE, value: this.translate.instant('vip_code'), 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.VIP_CODE, 'is_generic_menu': true, 'is_multi_selection': true, 'custom_menu_Item': true,
    //   'shouldRequestDataSourceWithSearchKey': true
    // }
  ];
  static_filters = [
    {
      'filter': Constants.GROUP_IDS, value: this.translate.instant('group'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.GROUP_NAME, 'is_generic_menu': true, 'is_multi_selection': true, 'custom_menu_Item': true
    },
    {
      'filter': Constants.STATUS, value: this.translate.instant('status'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.STATUS, 'is_generic_menu': true
    },
    {
      'filter': Constants.VIP_CODE, value: this.translate.instant('vip_code'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.VIP_CODE, 'is_generic_menu': true, 'is_multi_selection': true, 'custom_menu_Item': true,
      'shouldRequestDataSourceWithSearchKey': true
    }
  ];

  title = this.translate.instant('confirm_action');
  message: string;
  negativeButtonText = this.translate.instant('no_uppercase');
  positiveButtonText = this.translate.instant('yes_uppercase');
  totalPlayerSelected = false;
  delegateSubscription: any;
  fieldFetchSubscription: any;
  loginUser: any;
  customFieldsTemp = [];
  companySettingPermission: any;
  customFieldFetchSubscription: any;
  // @ViewChild('menuTrigger') matMenuTrigger: MatMenuTrigger;
  // private readonly _myService: PlayerService;
  @ViewChild("Item") Item: MatMenuPanel;
  openCustomMenu: any;
  selectedId: any;
  selectedType: any;

  constructor(public playerService: PlayerService,
    public storageService: StorageService,
    public dialog: MatDialog,
    public departmentService: DepartmentService,
    public translate: TranslateService,
    public delegateService: DelegateService,
    public router: Router,
    public globalService: GlobalService,
    public permissionService: PermissionsService,
    public activatedRoute: ActivatedRoute,
    public apiService: ApiService,
    public locationService: LocationService,
    public groupService: GroupService,
    public vipCodeService: VipCodeService,
    public companyService: CompanyService,
    public managerService: ManagerService,
    public snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef) {

      // this._myService = playerService;
      // this._myService.menuEmitter.subscribe(this.toggleMenu.bind(this));
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;


    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      this.appliedFilters = [];
      this.locationList = [];
      this.departmentList = [];
      this.groupList = [];
      this.companyId = companyID;
      if (this.router.url.indexOf('players') !== -1) {
        this.getPlayers();

        // this.filter_options = this.globalService.editCustomFilters(this.search_filters);
      }

    });
    // Dynamic Filter menu will arrive here
    this.globalService.filterMenu.subscribe((menuList) => {
      const filterInfo = { 'filter_name': Constants.GROUP_IDS, 'searching_in': 'Group' };
      this.groupList = this.globalService.prepareSelectionList(menuList, filterInfo, this.appliedFilters);

      this.menuList = this.groupList;
      this.cdRef.detectChanges();
    });

    this.activatedRoute.params.subscribe(params => {
      this.pageIndex = params['pageIndex'];
      if (params['pageIndex'] && params['pageLimit']) {
        this.startLimit = params['pageIndex'] * params['pageLimit'];
        this.noOfItemsPerPage = params['pageLimit'];
      } else {
        this.noOfItemsPerPage = 20;
      }
    });


    this.fieldFetchSubscription = this.companyService.onFieldsFetched.subscribe(res => {
      const manager = {
        allow_multiselection: true,
        is_custom: true,
        key_id: -1,
        filter_key: 'manager_name_ids',
        title: this.translate.instant('manager_name')
      };
      if (res.length) {
        res.push(manager);
        this.filter_options = this.globalService.addeditCustomFilters(this.search_filters, res, 2);
        this.addFilter(this.static_filters[1], this.filter_options.length);
      }
      this.setDefaultFiltersForCustomCompany(true);
    });



    this.customFieldFetchSubscription = this.companyService.onCustomFieldsFetched.subscribe(res => {
      if (!this.globalService.isCompanyBelongsToCustomField()) {
        this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, res, 2);
        this.static_filters.forEach(filter => {
          this.addFilter(filter, this.filter_options.length);
        });
        // this.filter_options.forEach(filterOption => {
        //   if (filterOption.custom_filter_key === Constants.DEPARTMENT_IDS) {
        //     filterOption['dependent_on'] = Constants.LOCATION_IDS;
        //   }
        // });
      }
    });

  }

  ngOnInit() {
    this.getURL(null);
    this.companySettingPermission = this.globalService.getCompanySetting(PermissionsKey.PLAYER);
    console.log('companySettingPermission', this.companySettingPermission);
    this.globalService.companySettingReceived$.subscribe(res => {
      this.companySettingPermission = this.globalService.getCompanySetting(PermissionsKey.PLAYER);
    });
    this.companyId = this.storageService.getCompanyId();
    // console.log('companySettingPermission', this.companySettingPermission);

    if (!this.companySettingPermission) {          // when you refresh component players permission object updated from storage
      const company = this.storageService.getCompany();
      this.companySettingPermission = company.permission && company.permission.player;
    }

    this.setPlayerPermission();
    // for on referesh
    this.globalService.permissionReceived$.subscribe(res => {
      this.setPlayerPermission();
    });
    this.selectedPlayer = new Player();
    if (this.globalService.isCompanyBelongsToCustomField()) {
      // Load fields
      const fields = this.companyService.getFields(true);
      if (!(fields && fields.length)) { return; }
      const managerFields = fields.filter((field) => field.key_id === -1);
      if (!managerFields.length) {
        const manager = {
          allow_multiselection: true,
          is_custom: true,
          key_id: -1,
          filter_key: 'manager_name_ids',
          title: this.translate.instant('manager_name')
        };
        fields.push(manager);
      }
      this.filter_options = this.globalService.addeditCustomFilters(this.search_filters, fields, 2);
      this.addFilter(this.static_filters[1], this.filter_options.length);
    } else {
      // this.filter_options = this.globalService.addeditCustomFilters(this.search_filters);
      const fields = this.companyService.getCustomFields();
      this.filter_options = this.globalService.addeditCompanyCustomFilters(this.search_filters, fields, 2);
      this.static_filters.forEach(filter => {
        this.addFilter(filter, this.filter_options.length);
      });
    }
    if (this.storageService.getFilterArray(this.context)) {
      this.appliedFilters = this.storageService.getFilterArray(this.context);
    }
    this.getPlayers();
  }
  getURL(url){
// getURL
console.log('asdsadsad');
// https://sh-devhuddle.s3.us-west-2.amazonaws.com/dev/dsdr/company/assets/asset_1.jpg
    //  this.getImageURLService.getURL('dev/1Huddle/profile/1665491379665.jpg');
    // this.getImageURLService.getURL('dev/1Huddle/company/game-profiles/3847.mp4');
    // https://1h-assets-dev.s3.us-west-2.amazonaws.com/dev/1Huddle/company/game-profiles/3847.mp4
    //  return '';
  }
  addFilter(filter, index) {
    if (this.filter_options.indexOf(filter) === -1) {
      this.filter_options.splice(index, 0, filter);
    }
    this.filter_options = this.globalService.removeCustomFilters(
      this.filter_options
    );
  }

  prepareDisplayedColumns() {
    this.displayedColumns = [];
    this.displayedColumns = ['select',
      'user_logo',
      'first_name',
      'user_status'
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

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    if (this.pageIndex) {
      this.paginator.pageIndex = this.pageIndex;
    }
    this.globalService.getFormattedPaginationLabel(this.paginator);
    this.cdRef.detectChanges();
  }

  setPlayerPermission() {
    this.playerPermission = this.permissionService.getPermissions(PermissionsKey.PLAYER);
  }

  setDefaultFiltersForCustomCompany(refreshDashboard) {
    // this.appliedFilters = this.teamDefaultFilters;
    this.refreshListOnFilterChange(this.appliedFilters);
  }

  getPlayers() {
    this.is_loading = true;
    this.loginUser = JSON.parse(this.storageService.getUser());
    let payload = {
      'company_id': this.storageService.getCompanyId(),
      'sort_by': this.sort.sortBy,
      'order': this.sort.order,
      'start_index': this.startLimit,
      'limit': this.noOfItemsPerPage,
      'manager_id': this.loginUser.manager_id,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };

    if (this.appliedFilters && this.appliedFilters.length) {

      this.preparePayloadFor(Constants.NAME, payload, 'name');
      this.preparePayloadFor(Constants.EMAIL, payload, 'email');
      this.preparePayloadFor(Constants.STATUS, payload, 'status');
      this.preparePayloadFor(Constants.VIP_CODE, payload, 'vip_code');
      
      this.appliedFilters.forEach((elem) => {
        if ((payload[elem.customFilterKey] || payload[elem.filter]) && elem.isAll) {
          return;
        }
        if (elem.customFilterKey) {
          if (elem.isAll && !this.globalService.isCompanyBelongsToCustomField()) {
            payload[elem.customFilterKey] = {
              'ids' : [],
              'is_all': true
            };
            // return;
          } else {
            this.preparePayloadFor(
              Constants.CUSTOM_FILTER_KEY,
              payload,
              elem.customFilterKey
            );
          }
        } else if (elem.filter == Constants.GROUP_IDS) {
          if (elem.isAll) {
            payload[elem.filter] = {
              'ids' : [],
              'is_all': true
            };
          } else {
            this.preparePayloadFor(Constants.GROUP_IDS, payload, 'group_ids');
          }
        }
      });
    }

    this.playerService.getPlayersForCustomFields(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }

      // Clear selection
      this.selection.selected.forEach(user => {
        this.selection.deselect(user);
      });
      this.totalUsers = response.data.total_player;
      this.playerList = response.data.player_list;
      this.customFieldsTemp = response.data.custom_fields;
      this.userDataSource = new MatTableDataSource(this.playerList);
      this.prepareDisplayedColumns();
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
      // console.log(filters);
      let queryString = [];
      filters.forEach((element) => {
        if (element.customFilterKey === key && this.globalService.isCompanyBelongsToCustomField()) {
          queryString.push(element.id);
          payload[key] = queryString.join(',');
        } else if ((element.customFilterKey === key || key == Constants.GROUP_IDS)) {
          payload[key]['ids'].push(element.id);
          if (payload.hasOwnProperty(key)) {
            if (payload[key]['ids'].indexOf(element.id) === -1) {
              payload[key]['ids'].push(element.id);
            }
          }
        } else if (element.filter === key) {
          if (key == Constants.VIP_CODE) {
            queryString.push(element.id);
            payload[key] = queryString.join(',');
          } else {
            payload[key] = (key == Constants.NAME || key == Constants.EMAIL) ? element.value : element.id;
          }
        }
      });
    }
  }

  allUserSelectionUpdated(allSelection) {
    this.totalPlayerSelected = allSelection;
    if (!this.totalPlayerSelected) {
      this.masterToggle();
    }
    return this.totalPlayerSelected;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userDataSource.data.length;
    return numSelected === numRows && numSelected;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.userDataSource.data.filter((element) => {
        return true;
      }).forEach(row => this.selection.select(row));
    // reset allPlayerSelection
    if (!this.isAllSelected()) {
      this.totalPlayerSelected = false;
    }
  }


  addToGroup(group = null, title = '', editableItems = ['all']) {
    // Get selected Player ids
    const dialogRef = this.dialog.open(AddGroupComponent, {
      data: { 'group': group, 'selectedPlayers': this.getSelectedPlayers(), 'title': title },
      panelClass: 'show-group'
    });
    // Callback on Add/update event
    dialogRef.componentInstance.refreshPlayerList.subscribe(() => {
      this.getPlayers();
    });
    dialogRef.componentInstance.editableItems = editableItems;

  }

  menuOptionsToBeDisplay() {
    if (this.selection.selected.length === 1) {
      this.selection.selected.forEach(player => {
        this.selectedPlayer.isGroup = player['group_id'];
        this.selectedPlayer.status = player['status'];
      });
    } else {
      this.selectedPlayer.isGroup = false;
      this.selectedPlayer.status = 'active';
    }
  }

  getSelectedPlayers() {
    this.selectedPlayerIds = [];
    this.selection.selected.forEach(player => {
      this.selectedPlayerIds.push(player['player_id']);
    });
    return this.selectedPlayerIds;
  }

  confirmRemoval() {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: this.selectedPlayerIds
    });
    this.getSelectedPlayers();
    const message = this.selection.selected.length === 1 ? this.translate.instant('confirm_remove_player_from_group')
      : this.translate.instant('confirm_remove_players_from_group');
    dialogReference.componentInstance.title = this.translate.instant('confirm_action');
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.removeFromGroup();

    });
  }

  removeFromGroup() {
    const payload = { 'company_id': this.companyId, 'player_ids': this.getSelectedPlayers(), 'group_id': 0 }; // 0 = Reset group
    this.is_loading = true;
    this.playerService.bulkUpdate(payload).subscribe((res) => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('cant_remove_grp_of_selected_player'));
        return;
      }
      this.getPlayers();
    });
  }

  addNewPlayer() {
    const newPlayer = { 'userType': 'Player', 'isNew': true };
    this.companyService.checkUsageLimit(this.companyId, UsageLimit.PLAYER).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'PLAYER_LIMIT_EXCEEDED') {
          this.showLimit(response);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Players_Manual_Adding');
          return;
        }
      }
      this.navigateToUserDetailsPage(newPlayer);
    });
  }

  navigateToUserDetailsPage(player) {
    if ((this.playerPermission && !this.playerPermission.edit) || this.globalService.isCompanyBelongsToCustomField() ||
      (this.companySettingPermission && !this.companySettingPermission.edit)) { return; }
    player['userType'] = 'Player';
    this.completeUserDetails.userInfo = player;
    this.completeUserDetails.userType = Constants.PLAYER;
    const dialogRef = this.dialog.open(AddUserComponent, {
      data: this.completeUserDetails
    });
    // Callback on Add/update event
    dialogRef.componentInstance.refreshPlayerList.subscribe(() => {
      this.getPlayers();
    });
    // Callback for Delete event
    dialogRef.componentInstance.userDeleted.subscribe((user) => {
      this.deletePlayers(user);
    });
  }

  changeDepartment() {
    const dialogRef = this.dialog.open(ChangeDepartmentComponent, {
      data: this.getSelectedPlayers()
    });
    // Callback on Add/update event
    dialogRef.componentInstance.refreshPlayerList.subscribe(() => {
      this.getPlayers();
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

  deletePlayers(deletedPlayedId = null) {
    this.is_loading = true;
    const playersToBeDeleted = [];
    if (deletedPlayedId) {
      playersToBeDeleted.push(deletedPlayedId);
    } else {
      this.selection.selected.forEach(player => {
        playersToBeDeleted.push(player.player_id);
      });
    }
    const payload = {
      'player_list_ids': playersToBeDeleted,
      'company_id': this.companyId,
    };
    this.playerService.deletePlayers(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('unable_to_delete_player'));
        return;
      }
      this.selection = new SelectionModel<Player>(true, []);
      this.getPlayers();
    });
  }

  confirmOnboardingEmail() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ? this.translate.instant('send_onboarding_email_to_player') :
      this.totalPlayerSelected ? this.translate.instant('send_onboarding_email_to_all_players').replace('%d', this.totalUsers) :
        this.translate.instant('send_onboarding_email_to_selected_players').replace('%d', this.getSelectedPlayers().length);
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      const playerIDS = this.totalPlayerSelected ? [] : this.getSelectedPlayers();
      this.sendOnboardingEmail(this.totalPlayerSelected, playerIDS);
    });
  }
  sendOnboardingEmail(totalPlayerSelected, playerIDS, dialogRef = null) {
    const payload: any = {
      'player_ids': playerIDS,
      'company_id': this.companyId,
      'send_to_all': totalPlayerSelected
    };

    this.updatePayloadForFilters(payload);

    this.playerService.sendOnboardingEmail(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      this.totalPlayerSelected = false;
      if (!response.success) {
        this.globalService.showMessage(this.translate.instant('unable_to_send_onboarding_email'));
        return;
      }
      if (dialogRef) {
        dialogRef.componentInstance.is_loading = false;
        dialogRef.close(true);
      }
      this.showAlert(this.translate.instant('onboarding_email_sent'), this.translate.instant('onboarding_email_sent_msg'),
        false, this.translate.instant('ok_uppercase'));
      this.selection = new SelectionModel<Player>(true, []);
    });
  }

  updatePayloadForFilters(payload) {
    this.appliedFilters.forEach(appliedFilter => {
      const filter = appliedFilter.filter;
      if (this.isFilterArray(filter)) {
        const array = payload[filter] ? payload[filter] : [];
        array.push(appliedFilter.id);
        payload[filter] = array;
      } else {
        payload[filter] = appliedFilter.id ? appliedFilter.id : appliedFilter.value;
      }
    });
  }

  isFilterArray(filter) {
    return filter === Constants.LOCATION_IDS || filter === Constants.DEPARTMENT_IDS || filter === Constants.GROUP_IDS;
  }

  activateDeactivatePlayers(statusToBeUpdated) {
    const playersIdsToBeUpdated = []; // List of Player Id's
    let filterPlayersToBeUpdated = [];

    // Filter Players which are converted to expected states.
    filterPlayersToBeUpdated = this.selection.selected.filter(p => {
      return p['status'] !== statusToBeUpdated;
    });
    if (filterPlayersToBeUpdated && filterPlayersToBeUpdated.length <= 0) {
      return;
    }
    this.is_loading = true;
    // Get ids of Players which states are going to update
    filterPlayersToBeUpdated.forEach(player => {
      playersIdsToBeUpdated.push(player.player_id);
    });
    const payload = {
      'player_ids': playersIdsToBeUpdated,
      'action': statusToBeUpdated === 'active' ? 'activate' : 'deactivate',
      'company_id': this.companyId,
    };
    this.playerService.activateDeactivatePlayers(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'PLAYER_LIMIT_EXCEEDED' && statusToBeUpdated === 'active') {
          this.showLimit(response);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Players_Reactivation');
          return;
        }
        this.globalService.showMessage(this.translate.instant(this.apiService.getErrorMessage(response.message_code)));
        return;
      }
      this.getPlayers();
    });
  }


  refreshListOnFilterChange(filters) {
    this.storeFilters(filters);
    this.totalPlayerSelected = false;
  }

  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, filters);
    this.getPlayers();
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.LOCATION_IDS:
        // this.getLocations();
        this.getCustomFieldsValues(filter);
        break;
      case Constants.DEPARTMENT_IDS:
        // this.getDepartments();
        this.getCustomFieldsValues(filter);
        break;
      case Constants.GROUP_IDS:
        this.globalService.getGroups();
        break;
      case Constants.VIP_CODE:
        this.getVipCodees();
        break;
      case Constants.STATUS:
        this.menuList = [];
        this.menuList = this.userStatusList;
        break;
      default:
        if (this.globalService.isCompanyBelongsToCustomField()) {
          this.getValues(filter);
        } else {
          this.getCustomFieldsValues(filter);
        }
        break;
    }
    this.cdRef.detectChanges();
  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    const currentFilter = event.currentFilter;
    switch (filterKey) {
      case Constants.VIP_CODE:
        this.getVipCodees(searchKey);
        break;
      default:
        const searchFilter = {
          'search_text': searchKey ? searchKey : '',
          'filter': filterKey,
          'value': currentFilter.value,
          'is_multi_selection': currentFilter.is_multi_selection,
          'custom_filter_key': currentFilter.custom_filter_key
        };
        if (searchKey) {
          if (this.globalService.isCompanyBelongsToCustomField()) {
            this.getValues(searchFilter);
          } else {
            this.getCustomFieldsValues(searchFilter);
          }
        }
        break;
    }
    this.cdRef.detectChanges();
  }

  getValues(filterDetails) {
    if (filterDetails.custom_filter_key === 'manager_name_ids') {
      this.getCustomManagerList(filterDetails);
      return;
    }
    const companyId = this.storageService.getCompanyId();



    const field = filterDetails.filter;
    const searchingIn = filterDetails.value;
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.companyService.getValues(field, companyId, searchText ? searchText : null).subscribe(res => {
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
    this.departmentService.getDepartments(this.companyId, 'department_name', 'asc', 0, 0, filters, false).subscribe((res) => {
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
  getVipCodees(searchKey = null) {
    let filters = '';
    if (searchKey) {
      filters = `vip_code=${searchKey}`;
    }
    const companyId = this.storageService.getCompanyId();
    this.vipCodeService.getVipCodes(companyId, Constants.VIP_CODE, 'asc',
      0, 100, filters).subscribe(res => {
        const response: any = res;
        if (!response.success) {
          return;
        }
        let vipCodes = [];
        const tempVipCodes = [];
        if (!response.success) { return; }
        if (response.data) {
          vipCodes = response && response.data && response.data.vip_code_list;
        }
        vipCodes.forEach((vipCode) => {
          tempVipCodes.push({
            id: vipCode.vip_code_id,
            value: vipCode.vip_code,
          });
        });
        const filterInfo = { 'filter_name': Constants.VIP_CODE, 'searching_in': 'VIP Code' };
        this.vipCodeList = this.globalService.prepareSelectionList(tempVipCodes, filterInfo, this.appliedFilters);
        this.menuList = this.vipCodeList;
        this.cdRef.detectChanges();
      });
  }
  getCustomManagerList(filterDetails) {
    let searchText = null;
    if (filterDetails.search_text) {
      searchText = `search_text=${filterDetails.search_text}`;
    }
    this.managerService.getCustomManagerList(0, 100, searchText ? searchText : null).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      let managerList = [];
      const tempManagerList = [];
      if (!response.success) { return; }
      if (response.data) {
        managerList = response && response.data && response.data.customManagers;
      }
      managerList.forEach((manager) => {
        tempManagerList.push({
          id: manager.id,
          value: manager.text,
        });
      });
      const mList = this.globalService.prepareMenuList(response.data.customManagers, filterDetails, this.context);
      const filterInfo = { 'filter_name': filterDetails.filter, 'searching_in': 'Manager' };
      this.customManagerList = this.globalService.prepareSelectionList(tempManagerList, filterInfo, this.appliedFilters);
      const clickedFilter = this.appliedFilters.filter(appliedFilter => appliedFilter.searchingIn === filterDetails.value)[0];
      const forceSelection = clickedFilter && clickedFilter.value === 'All' ? true : false;
      this.menuList = this.globalService.prepareSelectionList(mList, filterInfo, this.appliedFilters, forceSelection);
      this.menuList = this.customManagerList;
      this.cdRef.detectChanges();
    });
  }

  filterOptionUpdated(filter) {
    if (!filter) { return; }
    let keyName = `Users_Players_Players_Filter_By_${filter.filter}`;
    if (filter && !filter.filter) {
      keyName = `Users_Players_Players_Filter_By_${filter.userInfo.searching_in}`;
    }
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }

  downloadPlayersCSV() {
    this.loginUser = JSON.parse(this.storageService.getUser());
    let payload = {
      'company_id': this.storageService.getCompanyId(),
      'sort_by': Constants.FIRST_NAME,
      'order': 'asc',
      'manager_id': this.loginUser.manager_id,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false
    };

    this.preparePayloadFor(Constants.NAME, payload, 'name');
    this.preparePayloadFor(Constants.EMAIL, payload, 'email');
    this.preparePayloadFor(Constants.STATUS, payload, 'status');
    this.preparePayloadFor(Constants.GROUP_IDS, payload, 'group_ids');
    this.preparePayloadFor(Constants.VIP_CODE, payload, 'vip_code');
      
    this.appliedFilters.forEach((elem) => {
      if (elem.customFilterKey) {
        if (elem.isAll && !this.globalService.isCompanyBelongsToCustomField()) {
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
      } else if (elem.filter == Constants.GROUP_IDS && elem.isAll) {
        payload[elem.filter] = {
          'ids' : [],
          'is_all': true
        };
      }
    });


    this.playerService.getUrlToDowload(payload)
      .subscribe(res => {
        const response: any = res;
        if (!response.success) {
          this.globalService.showMessage(this.translate.instant('error_downloading'));
          return;
        }
        this.globalService.addAdminGoogleEvent('Users_Players_Player_Report_Download_CSV');
        // Download file
        window.location.assign(response.data.fileURL);
        this.globalService.showMessage(this.translate.instant('downloading_file'));
      });

  }

  showAlert(title, message, isMultiOption, positiveButtonText) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = isMultiOption;
    dialogReference.componentInstance.positiveButtonText = positiveButtonText;
  }


  openUploader() {
    const companyDetails = this.storageService.getCompany();
    const dialogRef = this.dialog.open(UploaderComponent, {
      data: companyDetails.player_csv_template
    });


    dialogRef.componentInstance.onUploadComplete.subscribe((res) => {
      this.uploadPlayerCSV(res, dialogRef);
    });


    dialogRef.componentInstance.sendOnboardingEmail.subscribe((res) => {
      if (this.player_ids.length) {
        this.sendOnboardingEmail(false, this.player_ids, dialogRef);
      }

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPlayers();

      }
    });
  }


  uploadPlayerCSV(url, dialogRef) {
    const companyId = this.storageService.getCompanyId();
    const payload = {
      'company_id': companyId,
      'csv_url': url,

    };
    this.playerService.uploadPlayer(payload).subscribe(res => {
      const response: any = res;
      dialogRef.componentInstance.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'PLAYER_LIMIT_EXCEEDED') {
          this.showLimit(response);
          this.globalService.addAdminGoogleEvent('Contract_Enforcement_Players_Using_CSV');
          dialogRef.close();
          return;
        }
        this.globalService.showMessage(this.translate.instant('unable_to_upload_csv'));
        return;
      }
      if (response.data) {

        const uploadPlayerData = response.data;
        dialogRef.componentInstance.uploadSuccess = true;

        if (uploadPlayerData.valid_record > 0) {
          dialogRef.componentInstance.dataAdded = true;
          dialogRef.componentInstance.playersAdded = true;
        }
        const responseData = [
          `${this.translate.instant('added_players_count')}: ${uploadPlayerData.valid_record}`,
          `${this.translate.instant('duplicate_entries_skipped_count')}: ${uploadPlayerData.exist_players}`,
          `${this.translate.instant('invalid_entries')}: ${uploadPlayerData.invalid_record}`
        ];
        dialogRef.componentInstance.uploadedData = responseData;
        this.globalService.addAdminGoogleEvent('Users_Players_Upload_Players_List');
        this.player_ids = uploadPlayerData.player_ids;
      }
    });
  }


  sortData(sort: Sort) {
    switch (sort.active) {
      case 'first_name':
        this.sort.sortBy = Constants.FIRST_NAME;
        break;
      case 'user_status':
        this.sort.sortBy = Constants.STATUS;
        break;
      case 'department_name':
        this.sort.sortBy = Constants.DEPARTMENT_NAME;
        break;
      case 'location_name':
        this.sort.sortBy = Constants.LOCATION_NAME;
        break;
      case 'group_name':
        this.sort.sortBy = Constants.GROUP_NAME;
        break;
      default:
        this.sort.sortBy = sort.active ? sort.active : Constants.FIRST_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getPlayers();
  }

  getUsersOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.totalPlayerSelected = false;
    this.getPlayers();
  }

  allowEdit() {
    if (this.globalService.isCompanyBelongsToCustomField() ||
      (this.companySettingPermission && !this.companySettingPermission.edit)) {
      return false;
    }
    return this.playerPermission && this.playerPermission.edit &&
      this.selection.selected.length === 1 && !this.totalPlayerSelected;
  }
  allowUnlick() {
    if (this.storageService.getAccessType() !== Role.ADMIN) {
      return false;
    }
    return this.selection.selected.length === 1 && !this.totalPlayerSelected;
  }

  allowActivate() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      return false;
    }
    return this.playerPermission && this.playerPermission.edit &&
      (this.selection.selected.length === 1 ? this.selectedPlayer.status === 'inactive' : true)
      && !this.totalPlayerSelected && this.shouldDisplayOption(true);
  }

  allowDeactivate() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      return false;
    }
    return this.playerPermission && this.playerPermission.edit
      && (this.selection.selected.length === 1 ? this.selectedPlayer.status === 'active' : true)
      && !this.totalPlayerSelected && this.shouldDisplayOption(false);
  }

  shouldDisplayOption(isActiveCheck) {
    const activePlayerCount = this.selection.selected.filter(player => {
      return isActiveCheck ? player.status === 'active' : player.status === 'inactive';
    }).length;
    if (this.selection.selected.length === activePlayerCount) {
      return false;
    }
    return true;
  }

  allowEditLocationDepartment() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      return false;
    }
    return this.playerPermission && this.playerPermission.edit
      && this.selection.selected.length > 1 && !this.totalPlayerSelected;
  }

  allowAddEditGroup() {
    return this.selection.selected.length && (this.selection.selected.length === 1 ? !this.selectedPlayer.isGroup : true)
      && !this.totalPlayerSelected;
  }

  allowRemoveGroup() {
    return this.selection.selected.length && (this.selection.selected.length === 1 ? this.selectedPlayer.isGroup : true)
      && !this.totalPlayerSelected;
  }

  allowSendOnBoardingEmail() {
    if (this.totalPlayerSelected) { return true; }
    const activePlayers = this.selection.selected.filter(player => {
      return player.status === 'active';
    });
    return activePlayers.length;
  }

  allowDelete() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      return false;
    }
    return this.playerPermission && this.playerPermission.delete && this.selection.selected.length && !this.totalPlayerSelected;
  }

  showVideo() {
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { name: this.translate.instant('how_to_login_add_users'), 
        url: this.globalService.tutorialVideo.LOGIN_ADD_USER }
      });
    this.globalService.addAdminGoogleEvent('Users_Players_Video_Play');
  }
  selectionBasedText(text, totalCount, selectedCount = null) {
    return text.replace('%d', this.globalService.formatNumber(selectedCount)).replace('%n', this.globalService.formatNumber(totalCount));
  }

  showLimit(response) {
    const displayData = this.globalService.usageLimit(response.data, UsageLimit.PLAYER_EXCEEDED);
    const dialogRef = this.dialog.open(PaywallActionComponent,
      {
        disableClose: true,
        data: displayData
      });
    dialogRef.componentInstance.title = displayData.title;
    dialogRef.componentInstance.message = displayData.message;
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
  toggleMenu(event, id, type) {
    console.log('hiiiii')
    this.openCustomMenu = event;
    this.selectedId = id;
    this.selectedType = type;
  }
  // open(): void {
  //   console.log('hiiiii')
  //   this.playerService.open();
  // }
  getMenu() {
    return this.Item;
  }

  confirmUnlink(player) {
    this.playerService.getPlayerPhone(player.player_id).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      // confirmmation_msg_phone_number_unlink
      const dialogReference = this.dialog.open(ConfirmActionComponent, {
        data: event
      });
      this.getSelectedPlayers();
      const message = this.translate.instant('confirmmation_msg_phone_number_unlink').replace('%d', response.data.phone_number)
      dialogReference.componentInstance.title = this.translate.instant('unlink');
      dialogReference.componentInstance.message = message;
      dialogReference.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
      dialogReference.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
      dialogReference.componentInstance.onNegativeAction.subscribe(() => {
        this.unlickPlayerFromPhoneNumber(player)
  
      });
    });
  }
  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 5000,
      horizontalPosition: 'left',
      verticalPosition: 'top',
    });
  }

  unlickPlayerFromPhoneNumber(player){
    const payload = { 'company_id': player.company_id, 'player_id': player.player_id }; // 0 = Reset group
    this.is_loading = true;
    
    this.playerService.unlinkPlayer(payload).subscribe((res) => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        this.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.globalService.showMessage(this.translate.instant('success_phone_number_unlink'));
      this.selection = new SelectionModel<Player>(true, []);
      this.getPlayers();
    });

  }
  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }

    if (this.fieldFetchSubscription) {
      this.fieldFetchSubscription.unsubscribe();
    }
  }
}
