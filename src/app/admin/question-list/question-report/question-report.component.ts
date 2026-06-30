import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Constants, PlaceholderText, ApiService } from '../../../services/network/api.service';
import { StorageService } from '../../../services/storage/storage.service';
import { DashboardService, Range } from '../../../services/dashboard/dashboard.service';
import { GamesService } from '../../../services/games/games.service';
import { PlayerService } from '../../../services/player/player.service';
import { DelegateService } from '../../../services/delegate/delegate.service';
import moment from 'moment-timezone';
import { GlobalService, Paginations } from '../../../services/global/global.service';
import { CustomDatepickerComponent } from '../../custom-datepicker/custom-datepicker.component';
import { DatePipe } from '@angular/common';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from 'src/app/services/login/login.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-question-report',
  templateUrl: './question-report.component.html',
  styleUrls: ['./question-report.component.scss']
})
export class QuestionReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sort = {
    'sortBy': Constants.QUESTION_TITLE,
    'order': 'asc'
  };
  companyId;
  is_loading = false;
  startLimit = 0;
  pageIndex = 0;
  totalQuestions = 0;
  noOfItemsPerPage: number;
  userDataSource: any;
  menuList = [];
  appliedFilters = [];
  context = 'question_report';
  allowMultiSelect = true;
  questionList;
  pageSizeOptions: number[];
  gameListForFilters = [];
  selectedRange;
  timeZone: string = null;
  startDate;
  endDate;
  dialogRef;
  range;
  displayedColumns: string[] = ['card', 'question', 'game', 'correct_count', 'incorrect_count', 'total_attempts', 'accuracy'];
  filter_options = [
    {
      'filter': Constants.QUESTION_TITLE, value: this.translate.instant('question'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.QUESTION_TITLE
    },
    {
      'filter': Constants.GAME_ID, value: this.translate.instant('game'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.GAME_NAME, 'is_generic_menu': true, 'show_deleted_game': true
    },
    {
      'filter': Constants.PLAYER_ID, value: this.translate.instant('player'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.PLAYER_NAME, 'is_generic_menu': true, 'shouldRequestDataSourceWithSearchKey': true
    }];
  delegateSubscription: any;
  showAccuracyReport = false;
  accuracyReportGameId;

  constructor(private storageService: StorageService,
    private reportService: DashboardService,
    private globalService: GlobalService,
    private apiService: ApiService,
    private gameService: GamesService,
    private playerService: PlayerService,
    private dialog: MatDialog,
    public translate: TranslateService,
    private datePipe: DatePipe,
    private delegateService: DelegateService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private cdRef: ChangeDetectorRef) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      this.getQuestionReport();
    });

    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.showAccuracyReport) {
        this.showAccuracyReport = queryParams.showAccuracyReport;
        this.accuracyReportGameId = queryParams.game_id
        this.getGames(queryParams.game_id);
      } else {
        this.storageService.setFilters(this.context, []);
        this.appliedFilters = [];
      }
    });
    this.range = Range;
  }

  ngOnInit() {
    this.setDateRange(true);
  }

  ngAfterViewInit() {
    if (this.appliedFilters && this.appliedFilters.length === 0 && !this.showAccuracyReport) {
      this.getQuestionReport();
    }
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  getDefaultPayload() {
    let payload: any = {
      company_id: this.companyId,
      start_date: this.startDate,
      end_date: this.endDate,
      timezone: this.timeZone,
      sort_by: this.sort.sortBy,
      order: this.sort.order,
    };
    payload = this.globalService.filterApplied(payload, Constants.GAME_ID, this.appliedFilters);
    payload = this.globalService.filterApplied(payload, Constants.PLAYER_ID, this.appliedFilters);
    return payload;
  }

  getQuestionReport() {
    const company = this.storageService.getCompany();
    this.companyId = company && company['company_id'];
    this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    this.is_loading = true;
    const filters = this.storageService.getFilterArray(this.context) || '';
    let payload: any = this.getDefaultPayload();
    payload.limit_offset = this.startLimit;
    payload.limit_perpage = this.noOfItemsPerPage;
    payload = this.globalService.filterApplied(payload, Constants.QUESTION_TITLE, this.appliedFilters);
    this.reportService.getQuestionReport(payload)
      .subscribe(res => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
        this.questionList = [] = response.data.question_list;
        this.totalQuestions = response.data.total_count;
        this.userDataSource = new MatTableDataSource(this.questionList);
      });
    this.cdRef.detectChanges();
  }
  storeAccuracyDateRangeFilter(value) {
    if (value && value === Range.CUSTOM) {
      return;
    }
    const accuracyDateRangeFilter = {
      'range': value,
      'start_date': this.startDate,
      'end_date': this.endDate
    };
    this.storageService.setObject('accuracy-date-range-filter', accuracyDateRangeFilter);
  }

  getAccuracyDateRangeFilter() {
    return this.storageService.getObject('accuracy-date-range-filter');
  }

  setDateRange(refreshQuestionReport) {
    const questionReportLocalSetting = this.getAccuracyDateRangeFilter();
    this.selectedRange = this.showAccuracyReport ? Range.THIS_MONTH : questionReportLocalSetting && questionReportLocalSetting['range'] ?
      questionReportLocalSetting['range'] : Range.THIS_MONTH;
    // Set this start and end date of month as default start date
    this.startDate = this.showAccuracyReport ? moment().startOf('month').format(DATE_FORMAT) : questionReportLocalSetting && questionReportLocalSetting['start_date'] ?
      questionReportLocalSetting['start_date'] : moment().startOf('month').format(DATE_FORMAT);
    this.endDate = this.showAccuracyReport ? moment().endOf('month').format(DATE_FORMAT) : questionReportLocalSetting && questionReportLocalSetting['end_date'] ?
      questionReportLocalSetting['end_date'] : moment().endOf('month').format(DATE_FORMAT);
      console.log(this.selectedRange, this.startDate, this.endDate);
    if (!this.startDate || !this.endDate) {
      this.setRange(this.selectedRange, refreshQuestionReport);
    }
  }

  setRange(value, shouldRefresh = true) {
    if (this.selectedRange) {
      this.globalService.addAdminGoogleEvent(`Question_Report_Accuracy_${this.selectedRange}`);
    }
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    switch (value) {
      case Range.TODAY:
        this.startDate = moment().tz(this.timeZone).format(DATE_FORMAT);
        this.endDate = moment().tz(this.timeZone).format(DATE_FORMAT);
        break;
      case Range.THIS_WK: // isoWeek - wk starts from Monday, week - Wk start from Sunday
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('isoWeek').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('isoWeek').format(DATE_FORMAT);
        }
        break;
      case Range.LAST_WK:
        this.startDate = moment().tz(this.timeZone).subtract(1, 'weeks').startOf('isoWeek').format(DATE_FORMAT);
        this.endDate = moment().tz(this.timeZone).subtract(1, 'weeks').endOf('isoWeek').format(DATE_FORMAT);
        break;
      case Range.THIS_MONTH:
        this.startDate = moment().tz(this.timeZone).startOf('month').format(DATE_FORMAT);
        this.endDate = moment().tz(this.timeZone).endOf('month').format(DATE_FORMAT);
        break;
      case Range.LAST_MONTH:
        this.startDate = moment().tz(this.timeZone).subtract(1, 'months').startOf('month').format(DATE_FORMAT);
        this.endDate = moment().tz(this.timeZone).subtract(1, 'months').endOf('month').format(DATE_FORMAT);
        break;
    }
    this.storeAccuracyDateRangeFilter(value);
    if (shouldRefresh) {
      this.getQuestionReport();
    }
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Question_Report_Accuracy_By_${filter.filter}`;
    if (filter.filter === Constants.QUESTION_STATE) {
      this.globalService.addAdminGoogleEvent(`${keyName}_${filter.value}`);
      return;
    }
    this.globalService.addAdminGoogleEvent(keyName);
  }

  getDataSource(filterName) {
    switch (filterName) {
      case Constants.GAME_ID:
        this.getGames();
        break;
      case Constants.PLAYER_ID:
        this.getPlayers();
        break;
    }
  }

  refreshListOnFilterChange(filters) {
    this.storageService.setFilters(this.context, filters);
    // Reset start limit and pageIndex on Filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.getQuestionReport();
  }

  getGames(game_id = null) {
    const companyId = this.storageService.getCompanyId();
    let queryFilter = `${'game_type=1'}`; // Only SP games are required here
    if (game_id) {
      queryFilter = `game_id=${game_id}`;
    }
    this.gameService.getGames(companyId, 'game_name', 'asc', 0, 5000, queryFilter, true, true).subscribe(res => {
      const response: any = res;
      if (response.success) {
        if (!game_id) {
          this.gameListForFilters = [];
          response.data.game_list.forEach(item => {
            this.gameListForFilters.push({ 'id': item.game_id, 'value': item.game_name, 'is_deleted': item.is_deleted });
          });
          this.menuList = this.gameListForFilters;
        } else {
          const defaultFilters = [];
          const gameObj = response.data.game_list[0];
          // this.selectedRange = Range.THIS_MONTH;
          const item = {
            'additionalFilter': false,
            'dependentOn': '',
            'filter': Constants.GAME_ID,
            'id': gameObj.game_id,
            'isDefault': false,
            'is_static': false,
            'searchingIn': 'Game',
            'value': gameObj.game_name,
          };
          defaultFilters.push(item);
          this.storageService.setFilters(this.context, defaultFilters);
          this.appliedFilters = defaultFilters;
          this.getQuestionReport();
        }
      }
    });
  }

  getDataSourceWithSearchKey(event) {
    const searchKey = event.searchKeyword;
    const filterKey = event.filterKey;
    this.getPlayers(searchKey);
  }

  getPlayers(searchkey = null) {
    const filters = searchkey ? `name=${searchkey}` : null;
    this.playerService.getPlayers(this.companyId, Constants.FIRST_NAME, 'asc', 0, 100, filters).subscribe((res) => {
      const response: any = res;
      if (!response.success) { return; }
      const playerList = response.data.player_list;
      this.menuList = [];
      playerList.forEach(item => {
        const name = item.first_name + ' ' + item.last_name;
        this.menuList.push({ 'id': item.player_id, 'value': name });
      });
    });
  }

  downloadReport() {
    const payload = this.getDefaultPayload();
    if (!payload) { return; }
    if (payload.hasOwnProperty('email_ids')) { delete payload['email_ids']; }
    const downloadRequest = this.reportService.downloadQuestionReport(payload).subscribe((res) => {
      this.processDownloadResponse(res);
    });

    this.showPreparingDownloadDialog(downloadRequest);
    this.globalService.addAdminGoogleEvent('Question_Report_By_Accuracy_Report_Download');
  }

  showPreparingDownloadDialog(downloadRequest) {
    this.dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    this.dialogRef.disableClose = true;
    this.dialogRef.componentInstance.isMultiOption = false;
    this.dialogRef.componentInstance.title = this.translate.instant('please_wait');
    this.dialogRef.componentInstance.message = this.translate.instant('preparing_download');
    this.dialogRef.componentInstance.positiveButtonText = this.translate.instant('cancel').toUpperCase();
    this.dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.dialogRef.close();
      downloadRequest.unsubscribe();
    });
  }

  processDownloadResponse(res) {
    const response: any = res;
    if (!response.success) { return; }
    // Download file
    if (response.data && response.data.url) {
      window.location.assign(response.data.url);
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    }
  }


  sortData(sort: Sort) {
    switch (sort.active) {
      case 'card':
        this.sort.sortBy = Constants.CARD_NUMBER;
        break;
      case 'question':
        this.sort.sortBy = Constants.QUESTION_TITLE;
        break;
      case 'game':
        this.sort.sortBy = Constants.GAME_NAME;
        break;
      case 'correct_count':
        this.sort.sortBy = Constants.CORRECT_COUNT;
        break;
      case 'incorrect_count':
        this.sort.sortBy = Constants.INCORRECT_COUNT;
        break;
      case 'total_attempts':
        this.sort.sortBy = Constants.SERVED_COUNT;
        break;
      case 'accuracy':
        this.sort.sortBy = Constants.ACCURACY;
        break;
    }
    this.sort.order = sort.direction;
    this.getQuestionReport();
  }

  openEmailRecipientsPicker(openBy, eventContext = null) {
    // const userEmail = this.storageService.getObject('user').email;
    const userEmail = this.storageService.userPersonalData && this.storageService.userPersonalData.email;    
    const dialogRef = this.dialog.open(CustomDatepickerComponent, {
      data: {
        startDate: this.startDate,
        endDate: this.endDate,
        emails: [userEmail],
        title: openBy,
      }
    });
    dialogRef.componentInstance.dateRangePicked.subscribe((data) => {
      const payload: any = this.getDefaultPayload();
      payload.email_ids = data.emails;
      payload.start_date = moment(data.startDate).format(DATE_FORMAT);
        payload.end_date = moment(data.endDate).format(DATE_FORMAT);
        this.emailReport(payload);
      const logEventInfo = {
        filter: eventContext || ''
      };
      this.filterOptionUpdated(logEventInfo);
    });
  }

  emailReport(payload) {
    this.reportService.downloadQuestionReport(payload).subscribe((res) => {
      this.processEmailResponse(res);
    });
  }

  processEmailResponse(res) {
    this.is_loading = false;
    const response: any = res;
    if (!response.success) {
      this.showAlert(this.apiService.getErrorMessage(response.message_code));
      return;
    }
    if (response.success) {
      this.globalService.addAdminGoogleEvent('Question_Report_By_Accuracy_Report_Send_By_Email');
    }
    this.showAlert(this.translate.instant('report_sent_via_email'));
  }

  showAlert(message) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.isMultiOption = false;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  getFormattedDate(date) {
    return this.datePipe.transform(date, DATE_FORMAT);
  }

  getQuestionsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getQuestionReport();
  }

  navigateToDashboard() {
    const queryParams = {
      showReport: true,
      game_id: this.accuracyReportGameId,
    };
    this.router.navigate([Route.DASHBOARD], {
      queryParams: queryParams
    });
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
