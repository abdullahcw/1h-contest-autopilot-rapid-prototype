import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Constants, PlaceholderText } from 'src/app/services/network/api.service';
import { PlayerFeedbackService } from 'src/app/services/player_feedback/player-feedback.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GamesService } from 'src/app/services/games/games.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { Route } from 'src/app/services/login/login.service';


@Component({
  selector: 'app-player-feedback',
  templateUrl: './player-feedback.component.html',
  styleUrls: ['./player-feedback.component.scss']
})

export class PlayerFeedbackComponent implements OnInit, OnDestroy {
  isFromTeamDashboard = false;
  tootlTipText = '';
  userStatusList = [{ 'id': 'open', 'value': this.translate.instant('open') },
  { 'id': 'resolve', 'value': this.translate.instant('closed') }];

  feedbackTypeList = [
    { 'id': 'QUESTION_CORRECT', 'value': this.translate.instant('question_is_correct') ,isMatICon : true},
    { 'id': 'QUESTION_SUGGESTION', 'value': this.translate.instant('question_is_correct_but_suggestion') ,isMatICon : true},
    { 'id': 'QUESTION_WRONG', 'value': this.translate.instant('question_is_wrong') ,isMatICon : true}
  ];

  filter_options = [
    {
      'filter': Constants.GAME_ID, value: this.translate.instant('game'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.GAME_NAME, 'is_generic_menu': true
    },
    {
      'filter': Constants.STATUS, value: this.translate.instant('status'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.STATUS, 'is_generic_menu': true, 'remove_search': true
    },
    {
      'filter': Constants.RATE_CATEGORY, value: this.translate.instant('type'), 'is_text_search': false, 'is_list_search': true,
      'placeholder': PlaceholderText.TYPE, 'is_generic_menu': true ,'remove_search': true
    }
  ];
  context = 'player-feedback';
  is_loading = false;
  gameListForFilters;
  menuList;
  questionFeedback = [];
  startLimit = 0;
  pageSizeOptions;
  noOfItemsPerPage;
  resetSelection = false;
  disabledResolve = true;
  appliedFilters = [];
  totalQuestion;
  feedbackPermission;
  question_feedback_ids = [];
  questionsSelected = [];
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  delegateSubscription: any;
  isOpenFilterApplied: boolean = false;
  showFeedbackReport = false;
  feedbackReportGameId;
  constructor(public playerFeedbackService: PlayerFeedbackService,
    public gameService: GamesService,
    public globalService: GlobalService,
    public delegateService: DelegateService,
    public router: Router,
    public translate: TranslateService,
    public permissionService: PermissionsService,
    private activatedRoute: ActivatedRoute,
    public storageService: StorageService) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('player-feedback') !== -1) {
        this.getPlayerFeedback();
        this.getGameLangauge();
      }
    });

    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.showFeedbackReport) {
        this.showFeedbackReport = queryParams.showFeedbackReport;
        this.feedbackReportGameId = queryParams.game_id
        this.getGames(queryParams.game_id);
        this.tootlTipText = this.translate.instant('back_to_slg_dashboard');
      } else if(queryParams?.showFeedbackReportByTeam){
        this.tootlTipText = this.translate.instant('back_to_team_dashboard');
        this.showFeedbackReport = queryParams.showFeedbackReportByTeam;
        this.isFromTeamDashboard = true;
        this.getGameLangauge();
        setTimeout(() => {
          this.setStatusFilter();
          this.getPlayerFeedback();
        });
      }
      else {
        this.storageService.setFilters(this.context, []);
        this.appliedFilters = [];
      }
    });
  }

  ngOnInit() {
    this.setFeedbackPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setFeedbackPermission();
    });
    if (this.appliedFilters && this.appliedFilters.length === 0 && !this.showFeedbackReport) {
      this.getPlayerFeedback();
      this.getGameLangauge();
    }

  }

  setStatusFilter() {
    console.log('in here11')
    const defaultFilters = [            
            {
              'additionalFilter': false,
              'dependentOn': '',
              'filter': Constants.STATUS,
              'id': 'open',
              'isDefault': false,
              'searchingIn': "Status",
              'value': "Open"
            }
          ];
          this.storageService.setFilters(this.context, defaultFilters);
          this.appliedFilters = defaultFilters;
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  setFeedbackPermission() {
    this.feedbackPermission = this.permissionService.getPermissions(PermissionsKey.PLAYERFEEDBACK);
  }

  getPlayerFeedback() {
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    const filters = this.storageService.getFilterFromStroage(this.context);
    const only_som = true;
    console.log('filters',filters);
    let result = filters.includes("status=open");
    if(filters.includes("status=open")){
      this.isOpenFilterApplied = true;
    } else {
      this.isOpenFilterApplied = false;
    }
    this.playerFeedbackService.getFeedback(companyId, only_som, filters, this.startLimit,
      this.noOfItemsPerPage).subscribe(res => {
        this.is_loading = false;
        this.questionsSelected = [];
        this.resetSelection = true;
        if (!res.success) {
          return;
        }
        this.totalQuestion = res.data.total_feedbacks;
        if (res.data.feedback_list.length) {
          this.questionFeedback = res.data.feedback_list;
        } else {
          this.questionFeedback = [];
        }
      });
  }

  getDataSource(filterName) {
    switch (filterName) {
      case Constants.GAME_ID:
        this.getGames();
        break;
      case Constants.STATUS:
        this.menuList = [] = this.userStatusList;
        break;
      case Constants.RATE_CATEGORY:
        this.menuList = [] = this.feedbackTypeList;
        break;
    }
  }z

  getGames(game_id = null) {
    const companyId = this.storageService.getCompanyId();
    let queryFilter = `${'game_type=1&only_som=true'}`; // Only SP games are required here
    if (game_id) {
      queryFilter = `game_id=${game_id}`;
    }
    this.gameService.getGames(companyId, 'game_name', 'asc', 0, 5000, queryFilter).subscribe(res => {
      const response: any = res;
      if (response.success) {
        if (!game_id) {
          this.gameListForFilters = [];
          response.data.game_list.forEach(item => {
            this.gameListForFilters.push({ 'id': item.game_id, 'value': item.game_name });
          });
          this.menuList = this.gameListForFilters;
        } else {
          const gameObj = response.data.game_list[0];
          const defaultFilters = [
            {
              'additionalFilter': false,
              'dependentOn': '',
              'filter': Constants.GAME_ID,
              'id': gameObj.game_id,
              'isDefault': false,
              'is_static': false,
              'searchingIn': 'Game',
              'value': gameObj.game_name,
            },
            {
              'additionalFilter': false,
              'dependentOn': '',
              'filter': Constants.STATUS,
              'id': 'open',
              'isDefault': false,
              'searchingIn': "Status",
              'value': "Open"
            }
          ];
          this.storageService.setFilters(this.context, defaultFilters);
          this.appliedFilters = defaultFilters;
          this.getPlayerFeedback();
        }
      }
    });
  }

  refreshListOnFilterChange(filters) {
    this.storageService.setFilters(this.context, filters);
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.getPlayerFeedback();
  }

  downloadQuestionsReport() {
    const companyId = this.storageService.getCompanyId();
    const company = this.storageService.getCompany();
    const timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    this.playerFeedbackService.getUrlToDowload(companyId, timeZone)
      .subscribe(res => {
        const response: any = res;
        if (!response.success) {
          this.globalService.showMessage(this.translate.instant('error_downloading'));
          return;
        }
        // Download file
        window.location.assign(response.data.fileURL);
        this.globalService.showMessage(this.translate.instant('downloading_file'));
        this.globalService.addAdminGoogleEvent('Player_Feedback_Player_Feedback_Download');
      });

  }

  getFeedbackOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getPlayerFeedback();
  }

  resolveQuestion() {
    this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    const payload = {
      'question_feedback_ids': this.question_feedback_ids,
      'company_id': company_id
    };
    this.playerFeedbackService.resolveQuestion(payload).subscribe((res) => {
      this.is_loading = false;
      if (!res.success) {
        return;
      }
      this.resetSelection = true;
      this.disabledResolve = true;
      this.getPlayerFeedback();
      this.globalService.addAdminGoogleEvent('Player_Feedback_Player_Feedback_Status_Resolved');
    });
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Player_Feedback_${filter.filter}`;
    // console.log('trying', keyName);
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }
  updateQuestionList(event) {
    this.getPlayerFeedback();
  }
  selectedQuestions(event) {
    this.question_feedback_ids = [];
    this.resetSelection = false;
    this.questionsSelected = [];
    for (let i = 0; i < event.length; i++) {
      for (let j = 0; j < this.questionFeedback.length; j++) {
        if (event[i] == this.questionFeedback[j].question_feedback_id) {
          this.questionsSelected.push(this.questionFeedback[j]);

        }
      }
    }
    const feedback_ids = [] = this.questionsSelected.filter(item => {
      if (item.status === 'open') {
        this.question_feedback_ids.push(item.question_feedback_id);
        return item;
      }
    });

    if (this.question_feedback_ids.length) {
      this.disabledResolve = false;
    } else {
      this.disabledResolve = true;
    }
    this.globalService.addAdminGoogleEvent('Player_Feedback_Selected');
  }

  navigateToDashboard() {

    if(this.isFromTeamDashboard){
      this.router.navigate([Route.DASHBOARD]);
    }else{
      const queryParams = {
        showReport: true,
        game_id: this.feedbackReportGameId,
      };
      this.router.navigate([Route.DASHBOARD], {
        queryParams: queryParams
      });
    }
  }
  getGameLangauge() {
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    this.gameService.getGameLanguage(companyId, null).subscribe((res) => {
      const response = res;
      if(response.success){
        this.is_loading = false;
        this.storageService.setAllLanguage(response.data);
      }
    });
  }
  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
