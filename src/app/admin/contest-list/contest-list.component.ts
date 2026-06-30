import { Component, OnInit, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { ApiService, Constants, PlaceholderText, ErrorCode } from 'src/app/services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService, Range, Paginations } from 'src/app/services/global/global.service';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ContestService } from 'src/app/services/contest/contest.service';
import { Router } from '@angular/router';
import { Route } from '../../services/login/login.service';
import { DatePipe } from '@angular/common';
import { GamesService } from 'src/app/services/games/games.service';
import { CreateContestComponent } from '../create-contest/create-contest.component';
import moment from 'moment-timezone';
import { DatepickerRangeComponent } from '../datepicker-range/datepicker-range.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
   

class Owner {
  id: any;
  text: String;
}

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-contest-list',
  templateUrl: './contest-list.component.html',
  styleUrls: ['./contest-list.component.scss']
})
export class ContestListComponent implements OnInit, OnDestroy {
  selectedContest;
  range;
  contestPermissions: any;
  constructor(public storageService: StorageService,
    public delegateService: DelegateService,
    public apiService: ApiService, public router: Router,
    public contestService: ContestService,
    public gamesService: GamesService,
    private dialog: MatDialog,
    public translate: TranslateService,
    private datePipe: DatePipe,
    private cdRef: ChangeDetectorRef,
    public globalService: GlobalService,
     
    public permissionService: PermissionsService) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('contests') !== -1) {
        this.getContestsList();
      }
    });
    this.range = Range;
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setContestPermission();
    });
    this.setContestPermission();
  }

  filter_options = [{
    'filter': Constants.CONTEST_NAME, value: this.translate.instant('contest'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.CONTEST_NAME
  },
  {
    'filter': Constants.CONTEST_STATE, value: this.translate.instant('state'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.CONTEST_STATE, 'is_generic_menu': true
  },
  {
    'filter': Constants.OWNER_ID, value: this.translate.instant('owner'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.OWNER_NAME, 'is_generic_menu': true
  }];

  contestState = [{ 'id': 'live', 'value': this.translate.instant('live') }, { 'id': 'ready', 'value': this.translate.instant('ready') },
  { 'id': 'draft', 'value': this.translate.instant('draft') }, { 'id': 'closed', 'value': this.translate.instant('closed') },
  { 'id': 'ended', 'value': this.translate.instant('ended') }];

  defaultBreakpoint = 4;
  breakpoint = this.defaultBreakpoint;
  is_loading = false;
  click_disabled = false;
  totalContests;
  dateRange: Date[] = this.createDateRange();
  startLimit = 0;
  delegateSubscription;
  menuList = [];
  owners = [];
  ownerListForFilters: any = [];
  currentDate = new Date();
  contestDetails: any = {
    contest_name: this.translate.instant('new_contest'),
    contest_image_url: '',
    start_date: this.currentDate,
    end_date: this.currentDate
  };

  noOfItemsPerPage: number;
  pageSizeOptions: number[];
  sort = {
    'sortBy': 'created_on',
    'order': 'desc'
  };
  context = 'contest_list';
  contests: any;
  timeZone: string = null;
  filterStartDate;
  filterEndDate;
  selectedRange = Range.TODAY;
  appliedFilters = [];
  dateRangeFilters;
  ngOnInit() {
    this.getContestsList();
    this.calculateBreakpoint();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateBreakpoint();
  }

  calculateBreakpoint() {
    this.breakpoint = window.innerWidth / 400;
    if (this.breakpoint <= 1.8 && this.breakpoint > 1.2) {
      this.breakpoint = 1.4;
    }
  }
  getContestsList() {
    this.is_loading = true;
    const company = this.storageService.getCompany();
    const companyId = company && company['company_id'];
    const appliedFilters = this.storageService.getFilterFromStroage(this.context);
    this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    this.contestService.getContestsList(companyId, this.sort.sortBy, this.sort.order, this.startLimit,
      this.noOfItemsPerPage, appliedFilters).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        this.click_disabled = false;
        
        if (response.data) {
          this.contests = response.data.contest_list;
          this.contests.filter(item => {
            const dateOnly = item.contest_end_date.split(' ');
            item.contest_end_date = this.getDateTime(dateOnly[0]);
          });


          this.totalContests = response.data.total_contest;
        }
      });
  }

  getDateTime(date) {
    return this.datePipe.transform(date.replace(/ /g, 'T'), 'MM/dd/yyyy');
  }
  setContestPermission() {
    this.contestPermissions = this.permissionService.getPermissions(PermissionsKey.CONTEST);
  }
  createDateRange(): Date[] {
    const dates: Date[] = [];
    for (let i = 4; i <= 90; i++) {
      dates.push(new Date(2019, 10, i));
    }
    return dates;
  }

  createContest() {
    this.dialog.open(CreateContestComponent);
  }
  menuOpened(index, contest) {
    this.selectedContest = null;
    this.selectedContest = contest;
  }
  menuClosed() {

  }
  scheduleContest() {
    this.contestService.contestProperty = 'schedule';
    this.editContest();
  }

  routeToAddContestPage(contest, isEdit = false) {
    const contest_data = {
      contest_id: contest.contest_id
    };
    this.storageService.setContest(contest_data);
    this.storageService.setShowGameScreen(false);
    this.contestService.setContestDetails(contest);
    isEdit ? this.globalService.addAdminGoogleEvent('Contests_Contest_Edited') :
      this.globalService.addAdminGoogleEvent('Contests_Detailed_Viewed');
    this.router.navigate([Route.CREATE_CONTEST]);
  }

  editContest() {
    this.routeToAddContestPage(this.selectedContest, true);
  }
  deleteContest() {
    const dialogRef = this.dialog.open(ConfirmActionComponent);

    dialogRef.componentInstance.title = this.translate.instant('delete_contest');
    dialogRef.componentInstance.message = this.translate.instant('confirm_delete_contest');
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.is_loading = true;
      this.contestService.deleteContest(this.selectedContest.company_id, this.selectedContest.contest_id).subscribe((res) => {
        const response = res;
        this.is_loading = false;
        if (!response.success) { return; }
        this.getContestsList();
        this.globalService.showMessage(this.translate.instant('contest_deleted_message'));
        this.globalService.addAdminGoogleEvent('Contests_Contest_Deleted');
      });
    });
  }

  moveToDraft() {
    const dialogRef = this.dialog.open(ConfirmActionComponent);

    dialogRef.componentInstance.title = this.translate.instant('move_to_draft');
    dialogRef.componentInstance.message = this.translate.instant('move_to_draft_contest_confirm_msg');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.is_loading = true;
      this.click_disabled = true;
      const payload = {
        'company_id': this.selectedContest.company_id,
        'contest_id': this.selectedContest.contest_id,
      };
      this.contestService.moveToDraft(payload).subscribe((res) => {
        const response = res;
        this.is_loading = false;
        if (!response.success) {
          if (ErrorCode[response.message_code]) {
            this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          }
        } else {
          this.globalService.showMessage(this.translate.instant('contest_moved_to_draft_message'));
        }
        this.getContestsList();
      });
    });
  }
  forceCloseContest() {
    const dialogRef = this.dialog.open(ConfirmActionComponent);

    dialogRef.componentInstance.title = this.translate.instant('force_close');
    dialogRef.componentInstance.message = this.translate.instant('force_close_contest_confirm_msg');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('cancel_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('end_now_uppercase');
    dialogRef.componentInstance.isCheckbox = true;
    dialogRef.componentInstance.messageForCheckbox = this.translate.instant('confirm_declare_winner_for_contest');
    dialogRef.componentInstance.onPositiveAction.subscribe((data) => {
      this.is_loading = true;
      const declare_winner = data;
      const payload = {
        'company_id': this.selectedContest.company_id,
        'contest_id': this.selectedContest.contest_id,
        'is_winner_declared': declare_winner
      };
      this.contestService.forceCloseContest(payload).subscribe((res) => {
        const response = res;
        this.is_loading = false;
        if (!response.success) { return; }
        this.getContestsList();
        this.globalService.showMessage(this.translate.instant('contest_force_closed_message'));
        this.globalService.addAdminGoogleEvent('Contests_Live_Contest_Stopped');
      });
    });
  }
  getContestsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getContestsList();
  }

  refreshListOnFilterChange(filters) {
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.storageService.setFilters(this.context, filters);
    this.getContestsList();
  }

  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.CONTEST_STATE:
        this.menuList = this.contestState;
        this.cdRef.detectChanges();
        this.globalService.addAdminGoogleEvent('Contests_Library_Filtered_By_State');
        break;
      case Constants.OWNER_ID:
        this.getOwner();
        break;
    }
  }

  getOwner() {
    const companyId = this.storageService.getCompanyId();
    this.gamesService.getOwners(companyId, 'first_name', 'asc').subscribe((res) => {
      const response: any = res;
      this.owners = [];
      this.menuList = [];
      if (response.success) {
        const superAdmin: any = {
          'first_name': this.translate.instant('huddle_team'),
          'last_name': '',
          'access_type': 'SA',
          'manager_id': -1
        };
        response.data.owner_list.push(superAdmin);
        response.data.owner_list.forEach(item => {
          const owner = new Owner();
          owner.id = item.manager_id;
          const space: any = ' ';
          owner.text = item.first_name + space + item.last_name;
          this.owners.push(owner);
        });
        this.menuList = this.globalService.prepareMenuList(this.owners);
        this.globalService.addAdminGoogleEvent('Contests_Library_Filtered_By_Owner');
      }
    });
  }

  openDatePicker() {
    const dialogRef = this.dialog.open(DatepickerRangeComponent, {
      data: {
        title: this.translate.instant('date_filter'),
        isRequired: true,
        startDate: this.filterStartDate,
        endDate: this.filterEndDate,
      }
    });
    dialogRef.componentInstance.dateRangePicked.subscribe(data => {
      this.filterStartDate = this.globalService.formatDateForPayload(data.startDate);
      this.filterEndDate = this.globalService.formatDateForPayload(data.endDate);
      this.setDateRangeFilter();
      this.refreshListOnFilterChange(this.appliedFilters);
    });

  }

  prepareDateRangeChip(startDate, endDate) {
    this.dateRangeFilters = [];
    this.dateRangeFilters = [{
      'filter': 'date_range', 'searchingIn': this.translate.instant('date_range'), 'is_static': true, 'is_default': false,
      'value': `${this.datePipe.transform(startDate, 'mediumDate')} - ${this.datePipe.transform(endDate, 'mediumDate')}`
    }];
  }

  setRange(value, refreshList) {
    this.filterStartDate = '';
    this.filterEndDate = '';
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    switch (value) {
      case Range.TODAY:
        this.filterStartDate = moment().tz(this.timeZone).format(DATE_FORMAT);
        this.filterEndDate = moment().tz(this.timeZone).format(DATE_FORMAT);
        break;
      case Range.THIS_WK: // isoWeek - wk starts from Monday, week - Wk start from Sunday
        if (this.timeZone) {
          this.filterStartDate = moment().tz(this.timeZone).startOf('isoWeek').format(DATE_FORMAT);
          this.filterEndDate = moment().tz(this.timeZone).endOf('isoWeek').format(DATE_FORMAT);
        }
        break;
      case Range.LAST_WK:
        this.filterStartDate = moment().tz(this.timeZone).subtract(1, 'weeks').startOf('isoWeek').format(DATE_FORMAT);
        this.filterEndDate = moment().tz(this.timeZone).subtract(1, 'weeks').endOf('isoWeek').format(DATE_FORMAT);
        break;
      case Range.THIS_MONTH:
        if (this.timeZone) {
          this.filterStartDate = moment().tz(this.timeZone).startOf('month').format(DATE_FORMAT);
          this.filterEndDate = moment().tz(this.timeZone).endOf('month').format(DATE_FORMAT);
        }
        break;
      case Range.LAST_MONTH:
        this.filterStartDate = moment().tz(this.timeZone).subtract(1, 'months').startOf('month').format(DATE_FORMAT);
        this.filterEndDate = moment().tz(this.timeZone).subtract(1, 'months').endOf('month').format(DATE_FORMAT);
        break;
      case Range.CUSTOM:
        this.openDatePicker();
        break;
    }
    if (value && value !== Range.CUSTOM) {
      this.getContestsList();
    }
  }

  setDateRangeFilter() {
    if (!(this.filterStartDate || this.filterEndDate)) {
      return;
    }
    const startDate = this.globalService.formatDate(this.filterStartDate);
    const endDate = this.globalService.formatDate(this.filterEndDate);
    const filterValue = this.filterStartDate + ' - ' + this.filterEndDate;
    const dateRangeFilter = {
      'filter': 'date_range', 'searchingIn': this.translate.instant('date_range'), 'value': filterValue
    };

    this.appliedFilters.push(dateRangeFilter);
  }

  duplicateContest(contest) {
    console.log(contest);
    const payload = {
      'contest_id': contest.contest_id,
      'company_id': this.storageService.getCompanyId(),
      'created_by': this.storageService.getLoginUserID()
    };

    this.contestService.copyContest(payload).subscribe(res => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      const data = res.data;
      console.log(data);
      let cloneContest: any;
      cloneContest = data.contest_details;
      cloneContest.polling_identifier = data.polling_identifier;
      this.contests.forEach((contestItem, index) => {
        if (contestItem.contest_id === contest.contest_id) {
          this.contests.splice(index + 1, 0, cloneContest);
        }
      });
      this.globalService.addAdminGoogleEvent('Contests_Contest_Cloned');
      this.getCopyContestProgress(data.polling_identifier, data.contest_details.contest_id);
    });
  }
  
  getCopyContestProgress(pollingID, contestId) {
    let response;
    let that;
    that = this;
    const contestInterval = setInterval(function () {
      that.contestService.copyContestProgress(pollingID).subscribe((res) => {
        response = res;
        if (response && response.data && response.data.question_copy_progress === 100) {
          clearInterval(contestInterval);
          that.contests.forEach(contest => {
            if (contest.contest_id === contestId) {
              contest['polling_identifier'] = null;
            }
          });
        }
      });
    }, 5000);
    console.log(this.contests);
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }

}
