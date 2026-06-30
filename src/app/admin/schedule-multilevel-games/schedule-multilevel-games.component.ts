import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { HeaderService } from '../../services/header/header.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalService } from '../../services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { Route } from 'src/app/services/login/login.service';
import { BreadcrumbsService } from 'src/app/services/breadcrumbs/breadcrumbs.service';
import { MultilevelGamesService } from 'src/app/services/multilevel-games/multilevel-games.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ApiService, Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { ConfirmActionMultilevelGameComponent } from '../confirm-action-multilevel-game/confirm-action-multilevel-game.component';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { Role } from 'src/app/services/permissions/permissions.service';
import { LocationService } from 'src/app/services/location/location.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { AlertComponent } from '../alert/alert.component';
import { CustomAudienceService } from 'src/app/services/custom-audience/custom-audience.service';
import { AddPlayersInScheduleMultilevelgamesComponent } from './add-players-in-schedule-multilevelgames/add-players-in-schedule-multilevelgames.component';

@Component({
  selector: 'app-schedule-multilevel-games',
  templateUrl: './schedule-multilevel-games.component.html',
  styleUrls: ['./schedule-multilevel-games.component.scss']
})
export class ScheduleMultilevelGamesComponent implements OnInit {
  is_loading = false;
  is_loading_games = false;
  displayedColumns: string[] = ['owner_img', 'name', 'type', 'add_player', 'action'];
  multilevelGameDataSource = new MatTableDataSource();
  multilevelGame: any;
  // context = 'schedule_multilevel';
  shouldOpenAddPopupByDefault: boolean;
  isMobile = false;
  action = false;
  isMlgPlayable = false;
  appliedFilters = [];
  role = Role;
  menuList: any[];
  filter_options = [];
  loginUser: any;
  locationList = [];
  locations = [];
  departments = [];
  departmentList = [];
  companyId;
  is_updating = false;
  is_mlg_live = false;
  selectedLocations = [];
  selectedDepartments = [];
  filters = [];
  mlgAssignedData;
  mlgAssignedAudienceData;
  customAudience = [];
  audienceList = [];
  totalAudience: any;
  assignmentType = '';
  assignmentId = null;

  search_filters = [
    // {
    //   'filter': Constants.LOCATION_IDS, value: this.translate.instant('location'), 'is_text_search': true, 'is_list_search': true,
    //   'placeholder': PlaceholderText.LOCATION_NAME, 'is_multi_selection': true, 'is_generic_menu': true
    // },
    // {
    //   'filter': Constants.DEPARTMENT_IDS, value: this.translate.instant('department'), 'is_text_search': true, 'is_list_search': true,
    //   'dependent_on': Constants.LOCATION_IDS,
    //   'placeholder': PlaceholderText.DEPARTMENT_NAME, 'is_multi_selection': true, 'is_generic_menu': true
    // },
    {
      'filter': Constants.AUDIENCE_IDS, value: this.translate.instant('custom_audience'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.AUDIENCE_NAME, 'is_multi_selection': true, 'is_generic_menu': true
    },
  ];


  mlgAssignmentList: any = {};

  constructor(
    public globalService: GlobalService,
    public translate: TranslateService,
    private dialog: MatDialog,
    private headerService: HeaderService,
    public router: Router,
    private route: ActivatedRoute,
    public storageService: StorageService,
    public apiService: ApiService,
    private multilevelGameService: MultilevelGamesService,
    public breadcrumbService: BreadcrumbsService,
    public managerService: ManagerService,
    private companyService: CompanyService,
    public snackBar: MatSnackBar,
    public customAudienceService: CustomAudienceService,
    private cdRef: ChangeDetectorRef
  ) {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.modal && queryParams.modal === 'add') {
        // console.log('queryparams', queryParams);
        this.shouldOpenAddPopupByDefault = true;
      }
    });
  }

  ngOnInit() {
    this.headerService.showCompanyFilter(false);
    this.multilevelGame = this.storageService.getmultilevelGameObject();
    const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
    breadcrumbs[1].key = this.multilevelGame.mlg_name;

    this.filter_options = this.globalService.addeditCustomFilters(this.search_filters, this.companyService.getFields(), 2);
    this.defaultFilter();
  }

  defaultFilter() {
    this.is_loading = this.action ? false : true;
    // if (this.globalService.isCompanyBelongsToCustomField()) {
    //   this.getManagerDetails();
    //   this.getMlgAssignment();
    //   this.appliedFilters = [{
    //     'id': -1, 'value': 'All', 'isAll': true, 'is_static': true, 'isDefault': true,
    //     'searchingIn': 'Country: All', 'filter': Constants.LOCATION_IDS
    //   },
    //   {
    //     'id': -1, 'value': 'All', 'isAll': true, 'is_static': true, 'isDefault': true,
    //     'searchingIn': 'Org: All', 'filter': Constants.DEPARTMENT_IDS
    //   }];
    // } else {
    this.getMlgAssignment();
    // }
  }

  // getManagerDetails() {
  //   this.is_loading = true;
  //   this.managerService.getManagerDetails(this.multilevelGame.owner_id).subscribe((res) => {
  //     const response = res;
  //     this.is_loading = false;
  //     if (!response.success) {
  //       this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
  //       return;
  //     }
  //     if (response.success) {
  //       // console.log('getManagerDetails', response);
  //       this.multilevelGame['profile_image_url'] = response.data.manager_details.profile_image_url;
  //     }

  //   });
  //   this.multilevelGameDataSource = new MatTableDataSource([this.multilevelGame]);
  // }


  getMlgAssignment() {
    const companyId = this.storageService.getCompanyId();
    const mlgId = this.multilevelGame.mlg_id;
    const is_custom = this.globalService.isCompanyBelongsToCustomField() ? true : false;
    const is_company_with_custom_fields = this.globalService.isCompanyWithCustomField() ? true : false;

    this.multilevelGameService.getMultilevelGameAssignment_CF(mlgId, companyId, is_custom, is_company_with_custom_fields).subscribe((res) => {
      const response = res;
      this.is_loading = false;
      if (!response.success) { return; }
      if (response.success) {
        this.mlgAssignmentList = response.data;
        this.action = this.mlgAssignmentList.available;
        this.is_mlg_live = this.mlgAssignmentList.available;
        this.isMlgPlayable = this.mlgAssignmentList.mlg_playable;
        this.assignmentType = this.mlgAssignmentList.recipient_type;

        this.multilevelGame['recipients'] = this.mlgAssignmentList.recipients;
        const playersAssignment = this.multilevelGame['recipients'][0].players;
        if (playersAssignment) {
          const appliedFilters = [];
          playersAssignment.forEach(recipient => {
            if (recipient.is_all) {
              appliedFilters.push({
                'id': -1,
                'value': 'All',
                'isAll': true,
                'searchingIn': recipient.text,
                'filter': recipient.key_id,
                'customFilterKey': recipient.filter_key
              });
            } else {
              console.log('reci values', recipient.values);
              if (recipient.values) {
                recipient.values.forEach(value => {
                  appliedFilters.push({
                    'id': value.id,
                    'value': value.text,
                    'isAll': false,
                    'additionalFilter': true,
                    'searchingIn': recipient.text,
                    'filter': recipient.key_id,
                    'customFilterKey': recipient.filter_key
                  });
                });
              }
            }
          });
          this.appliedFilters = appliedFilters;
          console.log('applied', this.appliedFilters);
        }
      }
      this.multilevelGameDataSource = new MatTableDataSource(this.mlgAssignmentList.recipients);
    });
  }

  editAssignment(assignment) {
    console.log('assignment', assignment);
    const dialogRef = this.dialog.open(AddPlayersInScheduleMultilevelgamesComponent, {
    });
    dialogRef.componentInstance.appliedFilters = this.appliedFilters;
    dialogRef.componentInstance.filters = this.appliedFilters;
    dialogRef.componentInstance.action = this.action;
    dialogRef.componentInstance.isMlgPlayable = this.isMlgPlayable;
    dialogRef.componentInstance.disjunction_filter_value = this.multilevelGame.recipients[0].disjunction_filter;
    // console.log(this.multilevelGame)    
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result.is_changed) {
        this.appliedFilters = result.applied_filters;
        // if (!this.globalService.isCompanyBelongsToCustomField()) {
          this.addMultilevelGameAssignment(result.disjunction_filter);
        // }
      }
    });
  }

  preparePayload() {
    const payload = {
      'company_id': this.multilevelGame.company_id,
      'mlg_id': this.multilevelGame.mlg_id,
      'available': this.action,
      'mlg_playable': this.isMlgPlayable,
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
      'recipients': [{
        'created_by': this.storageService.getLoginUserID(),
        // 'recipient_type': this.multilevelGame['recipients'][0].recipients_type,
        'owner_id': this.multilevelGame.owner_id,
        'players': this.prepareRecipients()
        // 'players': this.globalService.isCompanyBelongsToCustomField() ? [] : this.prepareRecipients()
      }],
    };
    // if (!this.globalService.isCompanyBelongsToCustomField()) {
      payload['recipients'][0]['recipient_type'] = this.multilevelGame['recipients'][0].recipients_type;
    // }
    return payload;
  }

  prepareRecipients() {
    const uniqueFilters = this.globalService.findUniqueFilters(this.appliedFilters);
    const recipients = [];
    uniqueFilters.forEach(filter => {
      const filterId = filter.filter;
      const assignment = {
        'key_id': filter.filter,
        'filter_key': filter.filter === Constants.CUSTOM_AUDIENCE ? 'custom_audience' : filter.customFilterKey,
        'is_all': filter.isAll ? filter.isAll : false,
      };
      // console.log('assignment', assignment, filterId, limit);
      const ids = this.globalService.filtersAppliedCustom(assignment, filterId, this.appliedFilters, 'values');
      if (ids.values[0].id === -1) {
        assignment['values'] = [];
      }
      recipients.push(assignment);
    });
    this.multilevelGame['recipients'][0].recipients_type = recipients[0].key_id === 'custom_audience' ?
      'AUDIENCE_BASED' : 'FIELDS_BASED';
    if (recipients[0].key_id === 'custom_audience') {
      this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_scheduling_MLG');
    }
    console.log('recipients', recipients);
    return recipients;
  }

  allowAssignmentChange() {
    // return (this.multilevelGame && this.multilevelGame.owner_id === this.storageService.getLoginUserID() || Role.ADMIN) && !this.action;
    // return (this.multilevelGame && this.multilevelGame.owner_id === this.storageService.getLoginUserID() || Role.ADMIN);
    return (this.multilevelGame && this.storageService.getAccessType() !== Role.MID_MANAGER);
    // return (this.storageService.getAccessType() === Role.ADMIN || this.storageService.getAccessType() === Role.MID_MANAGER);
  }

  confirmModeChange() {
    console.log(this.appliedFilters);
    // const checkDeptInSearch = this.appliedFilters.filter((filter) => filter.filter === Constants.DEPARTMENT_IDS);
    // const checkLocInSearch = this.appliedFilters.filter((filter) => filter.filter === Constants.LOCATION_IDS);
    const checkCustomFilterInSearch = this.appliedFilters.filter(filter => filter.hasOwnProperty('customFilterKey'));
    const checkAudienceInSearch = this.appliedFilters.filter((filter) => filter.filter === Constants.AUDIENCE_IDS);
    if (!(checkCustomFilterInSearch.length || checkAudienceInSearch.length)) {
      this.globalService.showMessage(this.translate.instant('please_select_players'));
      return;
    }
    // if (!this.globalService.isCompanyBelongsToCustomField() && checkLocInSearch.length) {
    //   this.globalService.showMessage(this.translate.instant('please_select_depts'));
    //   return;
    // }

    if (this.action && this.isMlgPlayable) {
      // if (this.action) {
      // for turn off case directly api called
      // this.action = false;
      this.isMlgPlayable = false;
      this.setMultilevelGameAssignment();
      return;
    }
    const dialogReference = this.dialog.open(ConfirmActionMultilevelGameComponent, {
      data: event
    });
    dialogReference.componentInstance.title = this.translate.instant('game_complete');
    dialogReference.componentInstance.negativeButtonText = this.translate.instant('continue_editing');
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('turn_on');
    dialogReference.componentInstance.isMultiOption = true;
    dialogReference.componentInstance.isCheckbox = false;
    dialogReference.componentInstance.isMLGLIVE = this.is_mlg_live;
    dialogReference.componentInstance.onPositiveAction.subscribe(() => {
      this.isMlgPlayable = true;
      this.setMultilevelGameAssignment();
    });
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.action = false;
      // this.setMultilevelGameAssignment();
    });
  }




  addMultilevelGameAssignment(disjunction_filter) {
    const payload = this.preparePayload();
    if (this.multilevelGame['recipients'][0].assignment_id ) {
      payload['assignment_id'] = this.multilevelGame['recipients'][0].assignment_id;
    }
    this.is_loading = true;
    payload['disjunction_filter'] = disjunction_filter;
    this.multilevelGameService.addMultilevelGameAssignment_CF(payload).subscribe(res => {
      const response = res;
      if (response.success) {
        // this.multilevelGame['recipients'][0].assignment_id = response.assignment_id;
        this.getMlgAssignment();
      }
    });
  }

  setMultilevelGameAssignment() {
    this.is_loading = true;
    // const payload = this.preparePayload();
    const payload = {
      'company_id': this.multilevelGame.company_id,
      'mlg_id': this.multilevelGame.mlg_id,
      'assignment_id': this.multilevelGame['recipients'][0].assignment_id,
      'mlg_publish_status': this.isMlgPlayable,
      'mlg_published_by': this.storageService.getLoginUserID(),
      'is_custom': this.globalService.isCompanyBelongsToCustomField() ? true : false,
      'is_company_with_custom_fields': this.globalService.isCompanyWithCustomField() ? true : false,
    };
    // console.log(payload);
    this.multilevelGameService.setMultilevelGameAssignment_CF(payload).subscribe((res) => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        // this.action = false;
        this.isMlgPlayable = false;
        if (response.message_code === 'RESTRICT_GAME_DELETE_ON_CONTEST_MLG') {
          this.checkIsGameLive();
          return;
        }
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      if (response.success) {
        this.isMlgPlayable = response.data.mlg_playable;
        this.action = response.data.available;
        this.is_mlg_live = response.data.available;
        // this.action = true;
        if (this.isMlgPlayable) {
          // this.mlgAssignmentStatus = false;
          // this.action = false;
          this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Game_Status_Turn_On');
          this.showMessage(this.translate.instant('mlg_now_live'));
        } else {
          this.globalService.addAdminGoogleEvent('Game_Builder_Multi_level_By_Game_Status_Turn_Off');
          // this.action = true;
        }
      }
    });
  }

  checkIsGameLive() {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('remove_delete_games');
    dialogRef.componentInstance.title = this.translate.instant('game_not_available_title');
    dialogRef.componentInstance.showOKbtn = true;
  }

  // preparePayload() {
  //   const allLocDept = this.checkAllLocationSelected() && this.checkAllDepartmentSelected();
  //   const allAudience = this.checkAllAudienceSelected();
  //   if (this.filters) {
  //     if (!(allLocDept)) {
  //       this.prepareRecipients();
  //     }

  //     if (!allAudience) {
  //       this.prepareAudience();
  //     } else {
  //       this.mlgAssignedAudienceData = [];
  //       this.customAudience.forEach((audience) => {
  //         this.mlgAssignedAudienceData.push(audience.audience_id);
  //       });
  //     }

  //     const payload = {
  //       'company_id': this.multilevelGame.company_id,
  //       'mlg_id': this.multilevelGame.mlg_id,
  //       'available': this.action,
  //       'mlg_playable': this.isMlgPlayable,
  //       'assignment_type': this.assignmentType,
  //       'recipients': [{
  //         'owner_id': this.multilevelGame.owner_id,
  //         'manager_id': this.storageService.getLoginUserID(),
  //         'type': this.mlgAssignmentList.recipients[0].type,
  //         'is_all': this.globalService.isCompanyBelongsToCustomField() ? true : allLocDept,
  //         'players': this.globalService.isCompanyBelongsToCustomField() ? [] : allLocDept ? [] : this.mlgAssignedData,
  //       }],
  //     };
  //     if (this.assignmentId) {
  //       payload['assignment_id'] = this.assignmentId;
  //     }
  //     if (this.assignmentType === Constants.AUDIENCE && payload['audience']) {
  //       this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_scheduling_MLG');
  //     }
  //     return payload;
  //   }
  // }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: 'snack-bar-style'
    });
  }

  navigateToEditGamePage(game = null) {
    this.router.navigate([Route.MULTILEVEL_GAME]);
  }
  navigateToLibrary(game = null) {
    this.storageService.setTeb('mlg');
    this.router.navigate([Route.GAMES]);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset Company selection filter
    this.headerService.showCompanyFilter(true);
  }
}
