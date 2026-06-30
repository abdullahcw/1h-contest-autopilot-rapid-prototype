import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { LocationService } from '../../services/location/location.service';
import { StorageService } from '../../services/storage/storage.service';
import { GamesService } from '../../services/games/games.service';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DepartmentService } from '../../services/department/department.service';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { DelegateService } from '../../services/delegate/delegate.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { GlobalService } from '../../services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from '../../services/company/company.service';
import { Route } from 'src/app/services/login/login.service';
import { Constants } from 'src/app/services/network/api.service';
import { CustomAudienceService } from 'src/app/services/custom-audience/custom-audience.service';
import { AddPlayersInScheduleGamesComponent } from './add-players-in-schedule-games/add-players-in-schedule-games.component';
import { AddGameLimitsComponent } from './add-game-limits/add-game-limits.component';


@Component({
  selector: 'app-schedule-game',
  templateUrl: './schedule-game.component.html',
  styleUrls: ['./schedule-game.component.scss']
})
export class ScheduleGameComponent implements OnInit, OnDestroy {

  is_loading = false;
  is_loading_games = false;
  is_loading_recipant = false;
  dataSource: any;
  audiencelimits;
  displayedColumns: string[] = ['select', 'recipients', 'attempts', 'schedule'];
  // limits;
  selection = new SelectionModel<any>(true, []);
  locations: any;
  departments: any;
  filterGames: FormControl;
  minDate = this.globalService.getCurrentDate();
  mode = 'CONTEST';
  isDatePickerOpen = false;
  games: any;
  game: any;
  searchedText: any;
  updatingCount = 0;
  allText = '[ ' + this.translate.instant('all') + ' ]';
  isLoadingLocations = false;
  shouldOpenAddPopupByDefault: boolean;
  delegateSubscription: any;
  filter_options = [];
  menuList: any;
  isMobile = false;
  hideGameAttempts = false;
  hideGameSelection = false;
  deviceHeight;
  customAudience = [];
  totalAudience: any;
  showAudienceOption = false;
  recipients;
  assignmentId;
  assignment = [];
  assignmentEditAppliedFilters = [];
  attempts = [];

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.globalService.platform.ANDROID) {
      if (window.innerHeight === this.deviceHeight) {
        this.resizeLeftRightPane();
        this.showRightPanel();
      } else {
        this.deviceHeight = window.innerHeight;
      }
    } else {
      this.resizeLeftRightPane();
      this.showRightPanel();
    }

  }


  constructor(private locationService: LocationService,
    private departmentService: DepartmentService,
    private storageService: StorageService,
    private gamesService: GamesService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private delegateService: DelegateService,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private globalService: GlobalService,
    private companyService: CompanyService,
    public customAudienceService: CustomAudienceService) {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.modal && queryParams.modal === 'add') {
        this.shouldOpenAddPopupByDefault = true;
      }
    });
  }

  ngOnInit() {
    this.prepareFilterOptions();
    this.getGames();
    this.resizeLeftRightPane();
    this.deviceHeight = window.innerHeight;
    this.filterGames = new FormControl();
    this.filterGames.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {
        this.searchedText = res;
        this.getGames();
      });

    const loggedInUserID = this.globalService.isRoleLimited() ? this.storageService.getLoginUserID() : null;
    if (this.storageService.getObject('scheduling_game')) {
      this.game = this.storageService.getObject('scheduling_game');
      const gameOwnerId = this.game.owner_id;
      this.storageService.setObject('scheduling_game', null);
      this.getAssignment();
    }

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      this.game = null;
      this.resizeLeftRightPane();
      this.storageService.setObject('scheduling_game', null);
      this.refreshRoute(loggedInUserID);
    });
  }

  refreshRoute(loggedInUserID) {
    // if (!this.globalService.isCompanyBelongsToCustomField()) {
      this.getGames();
      return;
    // }
    // this.router.navigate([Route.GAME_SCHEDULER]);
  }

  prepareFilterOptions() {
    const fields = this.companyService.getFields();
    if (fields) {
      fields.forEach(field => {
        const filterOption = {
          'filter': field.key, value: field.title, 'is_text_search': true, 'is_list_search': true,
          'placeholder': field.title, 'is_generic_menu': true
        };
        this.filter_options.push(filterOption);
      });
    }
  }

  changeGame(gameData) {
    this.router.navigate(
      [], {
      relativeTo: this.route,
      queryParams: { modal: null },
      queryParamsHandling: 'merge'
    });
    this.game = gameData;
    this.storageService.setObject('scheduling_game', this.game);
    this.getAssignment();


    // Refresh locations
    const gameOwnerId = this.game.owner_id;
    this.toggleGameSelection();

  }

  toggleGameSelection() {
    if (window.innerWidth <= 768) {
      this.hideGameAttempts = !this.hideGameAttempts;
    }
  }

  resizeLeftRightPane() {
    if (window.innerWidth <= 768) {
      this.isMobile = true;
      this.hideGameAttempts = true;
    } else {
      this.isMobile = false;
      this.hideGameAttempts = false;
    }
  }

  showRightPanel() {
    this.hideGameAttempts = false;
  }

  getGames() {
    this.is_loading_games = true;
    this.gamesService.getGames(this.storageService.getCompanyId(),
      'game_name', 'asc', 0, 100, this.getFilters()).subscribe((res) => {
        const response: any = res;
        this.is_loading_games = false;
        if (response.data) {
          this.games = response.data.game_list;
          if (this.game) {
            const isAvailable = this.games.filter(game => {
              return game.game_id === this.game.game_id;
            }).length;
            if (!isAvailable) {
              this.games.splice(0, 0, this.game);
            }
          }
        }
      });
  }

  getFilters() {
    let filters = '&game_state=LIVE,READY&game_type=1&only_som=true';
    if (this.searchedText && this.searchedText !== '') {
      filters += '&game_name=' + this.searchedText;
    }
    return filters;
  }

  updateDate(limit) {
    limit.start_date = this.datePipe.transform(limit.startDate, 'yyyy-MM-dd');
    limit.end_date = this.datePipe.transform(limit.endDate, 'yyyy-MM-dd');
  }

  markForUpdation(limit, index) {
    console.log('limit', limit);
    if (limit.assignment_id) {
      limit.isMarkedForUpdation = true;
      if (limit.startDate > limit.endDate) {
        limit.endDate = limit.startDate;
        this.updateDate(limit);
      }
      if (!limit.attempts.length) {
        limit.attempts = this.attempts[index];
      }
      this.updateAttempts(limit);
    }
  }


  showSchedulePopup(playerAssignmentData = [], assignment_id = null, isChanged = false, appliedFilters = [], editAssignment = false) {
    const dialogRef = this.dialog.open(AddPlayersInScheduleGamesComponent, {
    });
    console.log('assignment', playerAssignmentData, appliedFilters, isChanged, assignment_id);
    if (appliedFilters.length && !isChanged && !editAssignment) {
      dialogRef.componentInstance.appliedFilters = appliedFilters;
      dialogRef.componentInstance.filters = appliedFilters;
    }

    if (playerAssignmentData && !isChanged && editAssignment) {
      this.globalService.addAdminGoogleEvent('Schedule_edit_started');
      dialogRef.componentInstance.appliedFilters = appliedFilters.length ? appliedFilters : playerAssignmentData[0].appliedFilters;
      dialogRef.componentInstance.filters = appliedFilters.length ? appliedFilters : playerAssignmentData[0].appliedFilters;
    }
    dialogRef.afterClosed().subscribe(result => {
      this.globalService.addAdminGoogleEvent('Schedule_a_Game_By_Select_Players');
      if (result.is_changed) {
        this.presentLimitsPopup(playerAssignmentData, false, assignment_id, result.applied_filters, editAssignment);
      }
    });
  }

  presentLimitsPopup(playerAssignment, editAttempts = false, assignment_id = null, appliedFilters = [], editAssignment = false) {
    console.log('data', playerAssignment, appliedFilters, assignment_id);
    const dialogRef = this.dialog.open(AddGameLimitsComponent, {
    });
    if (this.assignment && this.assignment.length) {
      this.assignment.forEach(limit => {
        limit.should_highlight = false;
      });
    }
    dialogRef.componentInstance.assignmentData = playerAssignment;
    dialogRef.componentInstance.appliedFilters = appliedFilters;
    dialogRef.componentInstance.editAttempts = editAttempts;
    dialogRef.afterClosed().subscribe(result => {
      // console.log('limits result', result, playerAssignment);
      if (result && !result.is_changed) {
        this.showSchedulePopup(result.assignment_data, assignment_id, result.is_changed, result.applied_filters, editAssignment);
        this.shouldCloseAddPopupByDefault();
      }
    });
    dialogRef.componentInstance.limitsUpdated.subscribe((updatedLimits) => {
      console.log('updated limits', updatedLimits);
      if (editAttempts) {
        this.globalService.addAdminGoogleEvent('Scheduling_parameter_edited');
        this.updateAttempts(updatedLimits, editAttempts);
      } else {
        this.save(updatedLimits, assignment_id);
      }
    });
  }

  getRecipients(limit) {
    // console.log(limit);
    const uniqueFilters = this.globalService.findUniqueFilters(limit);
    console.log('uniques', uniqueFilters);
    const recipients = [];
    const payload = {};
    payload['company_id'] = this.storageService.getCompanyId();
    payload['game_id'] = this.game.game_id;
    uniqueFilters.forEach(uniqueFilter => {
      const filterId = uniqueFilter.filter;
      const assignment = {
        'key_id': uniqueFilter.filter,
        'filter_key': uniqueFilter.filter === Constants.CUSTOM_AUDIENCE ? 'custom_audience' : uniqueFilter.filter_key,
        'is_all': uniqueFilter.isAll ? uniqueFilter.isAll : false,
      };
      // console.log('assignment', assignment, filterId, limit);
      const ids = this.globalService.filtersAppliedCustom(assignment, filterId, limit, 'values');
      if (ids.values[0].id === -1) {
        assignment['values'] = [];
      }
      recipients.push(assignment);
    });
    console.log('recipients[0].key_id', recipients[0].key_id);
    payload['recipients'] = [{
      'max_attempts': limit[0].attempts,
      'end_date': limit[0].end_date,
      'start_date': limit[0].start_date,
      'attempts_type': limit[0].limit_type,
      'recipient_type': recipients[0].key_id === 'custom_audience' ? 'AUDIENCE_BASED' : 'FIELDS_BASED',
      'players': recipients,
    }];
    if (recipients[0].key_id === 'custom_audience') {
      this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_scheduling_Standalone');
    }
    return payload;
  }

  filterKey(limit, uniqueFilter) {
    console.log('limit', limit);
    console.log('uniqueFilter', uniqueFilter);
    limit.appliedFilters.filter(appliedFilter => {
      if (appliedFilter.filter === uniqueFilter.filter) {
        console.log('appliedFilter.customFilterKey', appliedFilter.customFilterKey);
        return appliedFilter.customFilterKey;
      }
    });
  }

  presentEditLimitsPopup() {
    this.presentLimitsPopup(this.selection.selected, true);
  }

  editAssignment(limit, assignmentId) {
    const editfilter = [];
    editfilter.push(limit);
    this.showSchedulePopup(editfilter, assignmentId, false, [], true);
  }

  save(updatedLimits, assignment_id) {
    this.updatingCount++;
    if (assignment_id) {
      this.globalService.addAdminGoogleEvent('Schedule_edit_completed');
      this.updateAssignment(updatedLimits, assignment_id);
    } else {
      this.addAssignment(updatedLimits);
    }
  }

  // addAssignments(newLimits) {
  //   console.log('assignment', newLimits, this.assignment);
  //   const newAssignment = {
  //     'appliedFilters': newLimits.appliedFilters,
  //     'attempts': newLimits[0].attempts,
  //     'endDate': newLimits[0].endDate,
  //     'startDate': newLimits[0].startDate,
  //     'limit_type': newLimits[0].limit_type,
  //   };
  //   this.assignment.push(newAssignment);
  //   this.selection.clear();
  //   this.dataSource = new MatTableDataSource(this.assignment);
  // }

  addAssignment(limits) {
    this.is_loading = true;
    this.recipients = this.getRecipients(limits);
    // console.log('payload', this.recipients);
    // this.updatingCount++;
    this.gamesService.addSLGLimits(this.recipients).subscribe(res => {
      console.log('add limits response:', res);
      this.is_loading = false;
      if (res.success) {
        if (this.recipients.attempts_type === 'DAILY') {
          this.globalService.addAdminGoogleEvent('Schedule_a_Game_By_Schedule_Game_Daily_Limit');
        } else {
          this.globalService.addAdminGoogleEvent('Schedule_a_Game_By_Schedule_Game_Total_Limit');
        }
        // this.assignmentId = res.data.assignment_id;
        this.updatingCount--;
        // this.addAssignments(limits);
        this.getAssignment();
      }
    });
  }

  updateAssignment(limits, assignmentId) {
    this.is_loading = true;
    console.log('assignment update', limits);
    this.recipients = this.getRecipients(limits);
    this.recipients['assignment_id'] = assignmentId;
    // this.updatingCount++;
    this.gamesService.updateSLGLimits(this.recipients).subscribe(res => {
      console.log('update limits response:', res);
      this.is_loading = false;
      if (res.success) {
        // this.assignmentId = res.data.assignment_id;
        this.updatingCount--;
        this.getAssignment();
      } else {
        if (res.message_code === 'RESTRICT_TO_CHANGE_SLG_ASSIGNMENT') {
          this.globalService.showMessage('You are not allowed to change this assignment', 'right', 'bottom');
        }
      }
    });
  }

  updateAttempts(limits, editAttempts = false) {
    console.log('limit update', limits, limits.appliedFilters, editAttempts);
    const limitsToUpdate = [];
    if (limits.assignment_id) {
      limitsToUpdate.push(limits.assignment_id);
    } else {
      limits.appliedFilters.forEach(limit => {
        if (limit.assignment_id) {
          limitsToUpdate.push(limit.assignment_id);
        }
      });
    }
    this.updateDate(limits);
    const updateAttemptPayload = {
      'company_id': this.storageService.getCompanyId(),
      'game_id': this.game.game_id,
      'assignment_ids': limitsToUpdate,
      'max_attempts': limits && limits.attempts ? limits.attempts : !editAttempts ? limits.attempt_details.max_attempts : limits[0].attempts,
      'end_date': limits.end_date ? limits.end_date : limits[0].end_date,
      'start_date': limits.start_date ? limits.start_date : limits[0].start_date,
      'attempts_type': limits.limit_type ? limits.limit_type : limits[0].limit_type,
    };

    this.removeIfRequired('max_attempts', updateAttemptPayload);
    this.removeIfRequired('start_date', updateAttemptPayload);
    this.removeIfRequired('end_date', updateAttemptPayload);
    this.removeIfRequired('attempts_type', updateAttemptPayload);

    this.updatingCount++;
    this.gamesService.updateSLGAttempts(updateAttemptPayload).subscribe(res => {
      console.log('update attempts response:', res);
      // this.assignmentId = res.data.assignment_id;
      this.updatingCount--;
      this.getAssignment();
    });
  }

  removeIfRequired(key, payload) {
    if (!payload[key]) {
      delete payload[key];
    }
  }

  getAssignment() {
    this.is_loading = true;
    this.is_loading_recipant = true;

    const is_custom = this.globalService.isCompanyBelongsToCustomField() ? true : false;
    const is_company_with_custom_fields = this.globalService.isCompanyWithCustomField() ? true : false;
    this.gamesService.getSLGLimits(this.storageService.getCompanyId(), this.game.game_id, is_custom, is_company_with_custom_fields).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      this.is_loading_recipant = false;
      this.attempts = [];
      if (response.success) {
        console.log('get', this.assignment);
        this.assignment = response.data.recipients || [];
        console.log('get', this.assignment);
        this.assignment.forEach(limit => {
          limit.appliedFilters = [];
          if (limit.attempt_details) {
            limit.startDate = this.globalService.formatDate(limit.attempt_details.start_date);
            limit.endDate = this.globalService.formatDate(limit.attempt_details.end_date);
            limit.attempts = limit.attempt_details.max_attempts;
            this.attempts.push(limit.attempt_details.max_attempts);
            limit.limit_type = (limit.attempt_details.attempts_type).toUpperCase();
          }
          const recipients: any = limit.players;
          // console.log('reci', recipients);
          if (recipients) {
            const appliedFilters = [];
            recipients.forEach(recipient => {
              if (recipient.is_all) {
                appliedFilters.push({
                  'id': -1,
                  'value': 'All',
                  'isAll': true,
                  'searchingIn': recipient.text.charAt(0).toUpperCase() + recipient.text.slice(1),
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
                      'searchingIn': recipient.text.charAt(0).toUpperCase() + recipient.text.slice(1),
                      'filter': recipient.key_id,
                      'customFilterKey': recipient.filter_key
                    });
                  });
                }
              }
            });
            limit.appliedFilters = appliedFilters;
            console.log('applied', limit.appliedFilters);
          }
        });
      } else {
        this.assignment = [];
      }
      console.log('Limits:', this.assignment);
      this.selection.clear();
      this.dataSource = new MatTableDataSource(this.assignment);
    });
  }

  deleteAssignment(selectedLimits) {
    const limitsToDelete = [];
    selectedLimits.forEach(limit => {
      if (limit.assignment_id) {
        limitsToDelete.push(limit.assignment_id);
      }
    });
    const deletePayload = {
      'company_id': this.storageService.getCompanyId(),
      'game_id': this.game.game_id,
      'assignment_ids': limitsToDelete
    };
    this.gamesService.deleteSLGLimits(deletePayload).subscribe(res => {
      if (res.success) {
        this.globalService.addAdminGoogleEvent('schedule_deleted');
      }
      this.is_loading = false;
    });

    const newLimits = [];
    this.assignment.forEach(limit => {
      if (selectedLimits.indexOf(limit) === -1) {
        newLimits.push(limit);
      }
    });
    this.assignment = newLimits;
    this.dataSource = new MatTableDataSource(this.assignment);
    this.selection.clear();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // List selection callback
  departmentsSelected(selectedDepartments, limit) {
    limit.selectedDepartments = selectedDepartments;
  }

  getDepartmentsDataSource(location_id, limit) {
    const departmentsDataSource = [];

    // Check if selected departments value is present, add if not
    if (limit && !limit.selectedDepartments) {
      limit.selectedDepartments = [];
    }


    this.locations.forEach(location => {
      if (location.location_id === location_id && location.department_list) {
        location.department_list.forEach(department => {
          const isAlreadyAvailable = this.assignment.filter((element) => {
            return element.location_id === location_id && element.department_id === department.department_id;
          }).length;
          const ds: any = {
            itemId: department.department_id, itemName: department.department_name,
            isSelected: isAlreadyAvailable, isDisabled: isAlreadyAvailable, userInfo: location
          };
          departmentsDataSource.push(ds);
        });
      }
    });

    return departmentsDataSource;
  }


  confirmDeletion() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    const message = this.selection.selected.length === 1 ?
      this.translate.instant('confirm_delete_game_attempt') : this.translate.instant('confirm_delete_game_attempts');
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      // to seperate out the arrays for deleting limits for audience and location/department
      const deletedGamelimits = [];
      // const deletedAudienceGamelimits = [];
      this.selection.selected.forEach(selection => {
        console.log('selected', selection);
        if (selection.assignment_id) {
          deletedGamelimits.push(selection);
        }
      });
      if (deletedGamelimits.length) {
        this.deleteAssignment(deletedGamelimits);
      }
    });
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (event.target.value.length == 0 && event.which == 48) {
      return false;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  shouldCloseAddPopupByDefault() {
    const editedUrl = { ...this.route.snapshot.queryParams };
    if (editedUrl.modal) {
      delete editedUrl.modal;
    }
    this.router.navigate([], { queryParams: editedUrl });
  }

  ngOnDestroy() {
    this.storageService.setObject('scheduling_game', null);
    this.shouldOpenAddPopupByDefault = false;
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
