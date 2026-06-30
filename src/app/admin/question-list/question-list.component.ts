import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Constants, ApiService, PlaceholderText } from 'src/app/services/network/api.service';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { QuestionsService, QuestionState, QuestionType } from 'src/app/services/questions/questions.service';
import { GamesService } from 'src/app/services/games/games.service';
import { UploaderService } from '../../services/uploader/uploader.service';
import { AddEditQuestionComponent } from '../../shared/add-edit-question/add-edit-question.component';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';

declare let $: any;

const questionTimeList = [{ 'id': 10, 'value': '10' }, { 'id': 15, 'value': '15' }, { 'id': 30, 'value': '30' },
{ 'id': 45, 'value': '45' }, { 'id': 60, 'value': '60' }];

const pointListForShortQuestion = [{ 'id': 100, 'value': '100' }, { 'id': 200, 'value': '200' },
{ 'id': 300, 'value': '300' }, { 'id': 400, 'value': '400' }, { 'id': 500, 'value': '500' }];

let pointList = [];

const questionStateList = [{ 'id': true, 'value': QuestionState.ACTIVE }, { 'id': false, 'value': QuestionState.INACTIVE }];

const questionTypeList = [{ 'id': 1, 'value': QuestionType.MULTIPLE_CHOICE },
{ 'id': 2, 'value': QuestionType.SINGLE_CHOICE }];

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.scss']
})
export class QuestionListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  manage_options = [{ key: 2, text: this.translate.instant('short_answer'), count: 1 },
  { key: 3, text: this.translate.instant('yes_or_no'), count: 2 },
  { key: 1, text: this.translate.instant('multiple_choice'), count: 4 }];
  optionsLoop = Array;
  questionBeingEdited: any;
  copyOfQuestionBeingEdited: any;
  isSinglePlayerGameSelected = true;
  addQuestion = false;
  menuList: any;
  games: [any];
  is_loading: boolean;
  isSmallDevice = false;
  isAllCollapsed = true;
  statusAction = false;
  displayedColumns: string[] = ['select', 'card', 'question', 'answer', 'category'];
  filter_options = [
    {
      'filter': Constants.QUESTION_TITLE, value: this.translate.instant('question'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.QUESTION_TITLE
    },
    {
      'filter': Constants.QUESTION_TYPE, value: this.translate.instant('type_of_question'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.QUESTION_TYPE, 'is_generic_menu': true
    },
    {
      'filter': Constants.QUESTION_POINTS, value: this.translate.instant('points'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.QUESTION_POINTS, 'is_generic_menu': true
    },
    {
      'filter': Constants.QUESTION_TIME, value: this.translate.instant('timer'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.QUESTION_TIME, 'is_generic_menu': true
    },
    {
      'filter': Constants.GAME_ID, value: this.translate.instant('game'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.GAME_NAME, 'is_generic_menu': true
    },
    {
      'filter': Constants.QUESTION_TAGS, value: this.translate.instant('tag'), 'is_text_search': true, 'is_list_search': false,
      'is_multi': true, 'placeholder': PlaceholderText.QUESTION_TAGS
    },
    {
      'filter': Constants.CARD_NUMBER, value: this.translate.instant('card_number'), 'is_text_search': true, 'is_list_search': false,
      'placeholder': PlaceholderText.CARD_NUMBER
    },
    {
      'filter': Constants.QUESTION_STATE, value: this.translate.instant('active_or_inactive'), 'is_text_search': true,
      'is_list_search': true, 'placeholder': PlaceholderText.QUESTION_STATE, 'is_generic_menu': true
    },
    {
      'filter': Constants.CATEGORY_ID, value: this.translate.instant('category_name'), 'is_text_search': true, 'is_list_search': true,
      'dependent_on': Constants.GAME_ID, 'placeholder': PlaceholderText.CATEGORY_NAME, 'is_generic_menu': true
    }];


  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  noOfItemsPerPage: number;
  dataSource: any;
  questions: any;
  totalQuestions;
  startLimit = 0;
  context = 'questions';
  pageSizeOptions: number[];

  selectedCategoryForFilter = {
    'category_id': null,
    'category_name': null
  };
  questionCategoryListForFilters = [];
  gameListForFilters = [];
  allowMultiSelect = true;
  selection = [];
  appliedFilters = [];
  timer_options = [10, 15, 30, 45, 60];
  points_options = [100, 200, 300, 400, 500];
  selectedGameIdForAddQuestion = '';
  selectedCategoryIdForAddQuestion = '';
  selectedAnswerType: number;
  companyId: any;
  isContextMenu = false;
  isActive = false;
  @ViewChild('imgInput') imageInput: ElementRef;
  @ViewChild('audioInput') audioInput: ElementRef;
  questionPermission: any;
  delegateSubscription: any;
  is_editable: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth < 768) {
      this.isSmallDevice = true;
    } else {
      this.isSmallDevice = false;
    }
  }
  constructor(public questionsService: QuestionsService,
    public dialog: MatDialog, public delegateService: DelegateService, public snackBar: MatSnackBar, public apiService: ApiService,
    public translate: TranslateService, public router: Router, public storageService: StorageService,
    public globalService: GlobalService, public gameService: GamesService,
    public uploaderService: UploaderService, public permissionService: PermissionsService,
    public cdRef: ChangeDetectorRef) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    pointList = [{ 'id': 0, 'value': this.translate.instant('ai_gamegenius') }, { 'id': 100, 'value': '100' }, { 'id': 200, 'value': '200' },
    { 'id': 300, 'value': '300' }, { 'id': 400, 'value': '400' }, { 'id': 500, 'value': '500' }];
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyId) => {
      if (this.router.url.indexOf('questions') !== -1) {
        this.companyId = companyId;
        this.questionCategoryListForFilters = [];
        this.getGameLangauge();
        this.getGames();
        this.getQuestions();
      }
    });
  }

  ngOnInit() {
    this.getGameLangauge();
    this.companyId = this.storageService.getCompanyId();
    this.setQuestionPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setQuestionPermission();
    });

    if (window.innerWidth < 768) {
      this.isSmallDevice = true;
    } else {
      this.isSmallDevice = false;
    }
    this.getGames();
    this.getQuestions();

    $(document).click(function (e) {
      if (e.target.id !== 'openContext') {
        const menu = document.getElementById('contextWrapper');
        if (menu) {
          menu.style.display = 'none';
        }
      }
    });
    document.addEventListener('contextmenu', (e) => {
      if (!($(e.target).is('td'))) {
        if (document.getElementById('contextWrapper')) {
          document.getElementById('contextWrapper').style.display = 'none';
        }
      }
    }, false);
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  // tslint:disable-next-line:use-life-cycle-interface
  setQuestionPermission() {
    this.questionPermission = this.permissionService.getPermissions(PermissionsKey.GAME);
  }
  selectedQuestions(event) {
    const selectedQuestions = [];
    for (let i = 0; i < event.length; i++) {
      for (let j = 0; j < this.questions.length; j++) {
        if (event[i] == this.questions[j].question_id) {
          selectedQuestions.push(this.questions[j]);
        }
      }
    }
    this.selection = selectedQuestions;
  }

  getQuestions(startLimit = 0) {
    this.is_loading = true;
    this.companyId = this.storageService.getCompanyId();
    const filters = this.storageService.getFilterFromStroage(this.context);
    this.statusAction = false;
    this.questionsService.getQuestions(
      this.sort.sortBy, this.sort.order, startLimit, this.noOfItemsPerPage, filters, this.companyId).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        this.scrollListToTop();
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
        this.statusAction = true;
        this.selection = [];
        if (response.data) {
          this.questions = response.data.question_list;
          this.totalQuestions = response.data.total_question;
          this.dataSource = new MatTableDataSource(this.questions);
          this.isAllCollapsed = true;
        }
      });
  }

  scrollListToTop() {
    const scrollToTop = document.getElementById('scrollToTop');
    if (scrollToTop) {
      scrollToTop.scrollIntoView(true);
    }
  }
  updateQuestionList(question) {
    const index = this.questions.findIndex(qs => question.question_id === qs.question_id);
    if (index > -1) {
      this.questions[index] = question;
    } else {
      this.questions.splice(0, 0, question);
    }
    this.getQuestions();
  }

  addMore(question) {
    question.answer.options.push({});
  }

  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = `Question_Report_By_${filter.filter}`;
    if (filter.filter === Constants.QUESTION_STATE) {
      this.globalService.addAdminGoogleEvent(`${keyName}_${filter.value}`);
      return;
    }
    this.globalService.addAdminGoogleEvent(keyName);
  }

  refreshListOnFilterChange(filters) {
    this.appliedFilters = filters;
    this.storeFilters();
  }

  storeFilters() {
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    this.storageService.setFilters(this.context, this.appliedFilters);
    this.getQuestions();
  }

  activateAnswers(question, answerType, count) {
    const newAnswers = [];
    for (let i = 0; i < count; i++) {
      if (i < question.answer.options.length) {
        newAnswers.push(question.answer.options[i]);
      } else {
        newAnswers.push({});
      }
    }
    question.answer.options = newAnswers;
    this.selectedAnswerType = answerType;
    question.question_type = this.selectedAnswerType;
    question.is_answer_choice_required = false;
  }

  presentQuestionPopup(question = null) {
    if (this.isSmallDevice) {
      const dialogRef = this.dialog.open(AddEditQuestionComponent, {
        width: '550px',
        data: {
          question: question, 'timer_options': this.timer_options,
          'points_options': this.points_options
        }
      });

      dialogRef.afterClosed().subscribe(reason => {
      });
    }

  }

  getQuestionsOverPagination(pageEvent) {

    this.noOfItemsPerPage = pageEvent.pageSize;
    const startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getQuestions(startLimit);
  }

  updateQuestionsState(questionState, question = null) {
    const questionIdsToBeUpdated = [];
    let filterQuestionsToBeUpdated = [];
    if (question == null) {
      // Filter Questions which are converted to expected states.
      filterQuestionsToBeUpdated = this.selection.filter(selectedQuestion => {
        return selectedQuestion['is_active'] !== questionState;
      });
      if (filterQuestionsToBeUpdated && filterQuestionsToBeUpdated.length <= 0) {
        return;
      }
      this.is_loading = true;
      // Get ids of Question which states are going to update
      filterQuestionsToBeUpdated.forEach(que => {
        questionIdsToBeUpdated.push(que.question_id);
      });
    } else {
      questionIdsToBeUpdated.push(question.question_id);
    }
    this.statusAction = false;
    const payload = { 'question_ids': questionIdsToBeUpdated, 'status': questionState ? 'activate' : 'deactivate' };
    if (questionState == true) {
      this.globalService.addAdminGoogleEvent('Questions_By_Question_Activate');
    }
    if (questionState == false) {
      this.globalService.addAdminGoogleEvent('Questions_By_Question_Deactivate');
    }

    this.questionsService.updateQuestionsState(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        if (response.message_code === 'RESTRICT_TO_DEACTIVATE_QUESTION_IN_LIVE_SLG') {
          this.showAlert(this.translate.instant('cant_deactivate_questions'), this.apiService.getErrorMessage(response.message_code));
          return;
        }
        this.globalService.showMessage(this.translate.instant(this.apiService.getErrorMessage(response.message_code)));
        return;
      }
      if (question != null) {
        question.is_active = questionState;
      } else {
        this.getQuestions();
      }
      this.statusAction = true;
    });
  }
  addNewQuestion() {
    this.addQuestion = !this.addQuestion;
    this.cdRef.detectChanges();
  }
  shouldDisplayOption(isActiveCheck) {
    const activeQuestionCount = this.selection.filter(question => {
      return isActiveCheck ? question.is_active : !question.is_active;
    }).length;
    if (this.selection.length === activeQuestionCount) {
      return false;
    }
    return true;
  }
  menuOptionsToBeDisplaySom() {
    const numRows = this.selection.filter(question => {
      return question.is_editable === false;
    });
    if (numRows.length !== 0) {
      return false;
    } else {
      return true;
    }
  }
  getDataSource(filterName) {
    switch (filterName) {
      case Constants.QUESTION_TIME:
        this.menuList = questionTimeList;
        break;
      case Constants.QUESTION_POINTS:
        const questionTypeFilter = this.appliedFilters.filter(appliedFilter => {
          return appliedFilter['filter'] === Constants.QUESTION_TYPE;
        });
        if (questionTypeFilter.length > 0 && questionTypeFilter[0]['value'] === QuestionType.SINGLE_CHOICE) {
          this.menuList = pointListForShortQuestion;
        } else {
          this.menuList = pointList;
        }
        break;
      case Constants.QUESTION_TYPE:
        this.menuList = questionTypeList;
        break;
      case Constants.QUESTION_STATE:
        this.menuList = questionStateList;
        break;
      case Constants.GAME_ID:
        this.getGames();
        break;
      case Constants.CATEGORY_ID:
        this.getQuestionCategory();
        break;
    }
  }

  getGames() {
    this.gameService.getGames(this.companyId).subscribe(res => {
      const response: any = res;
      this.games = response.data.game_list;
      if (response.success) {
        this.gameListForFilters = [];
        response.data.game_list.forEach(item => {
          this.gameListForFilters.push({ 'id': item.game_id, 'value': item.game_name });
        });
        this.menuList = this.gameListForFilters;
      }
    });
  }

  getQuestionCategory() {
    const gameFilters = this.appliedFilters.filter(element => {
      return element.filter === 'game_id';
    });
    if (gameFilters && gameFilters.length) {
      const gameId = gameFilters[0].id;
      if (!gameId) { return; }
      this.gameService.getQuestionCategories(gameId).subscribe(res => {
        const response: any = res;
        if (response.success) {
          this.questionCategoryListForFilters = [];
          response.data.game_category_list.forEach(item => {
            this.questionCategoryListForFilters.push({ 'id': item.question_category_id, 'value': item.name });
          });
          this.menuList = this.questionCategoryListForFilters;
        }
      });
    }
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'question':
        this.sort.sortBy = Constants.QUESTION_TITLE;
        break;
      case 'points':
        this.sort.sortBy = Constants.QUESTION_POINTS;
        break;
      case 'time':
        this.sort.sortBy = Constants.QUESTION_TIME;
        break;
      case 'card':
        this.sort.sortBy = Constants.CARD_NUMBER;
        break;
      case 'game_name':
        this.sort.sortBy = Constants.GAME_NAME;
        break;
      case 'state':
        this.sort.sortBy = Constants.QUESTION_STATE;
        break;
      case 'type':
        this.sort.sortBy = Constants.QUESTION_TYPE;
        break;
    }
    this.sort.order = sort.direction;
    this.getQuestions(this.startLimit);
  }


  downloadQuestionsCSV() {
    let filters = this.storageService.getFilterFromStroage(this.context);
    filters = this.storageService.getFilterFromStroage(this.context) || '';
    this.companyId = this.storageService.getCompanyId();
    this.questionsService.getUrlToDowload(this.companyId, filters)
      .subscribe(res => {
        const response: any = res;
        if (!response.success) {
          this.globalService.showMessage(this.translate.instant('error_downloading'));
          return;
        }
        // Download file
        window.location.assign(response.data.fileURL);
        this.globalService.showMessage(this.translate.instant('downloading_file'));
        if (response.data.fileURL) {
          this.globalService.addAdminGoogleEvent('Questions_By_Question_Download_CSV');
        }
      });
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }
  getGameLangauge() {
    this.is_loading = true;
    this.companyId = this.storageService.getCompanyId();
    this.gameService.getGameLanguage(this.companyId, null).subscribe((res) => {
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
