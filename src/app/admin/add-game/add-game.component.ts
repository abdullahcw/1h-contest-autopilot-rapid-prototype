import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GamesService } from '../../services/games/games.service';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { Route } from '../../services/login/login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage/storage.service';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { Constants, ApiService, PlaceholderText } from '../../services/network/api.service';
import { QuestionsService, QuestionType } from 'src/app/services/questions/questions.service';
import { HeaderService } from '../../services/header/header.service';
import { UploaderComponent } from '../uploader/uploader.component';
import { TranslateService } from '@ngx-translate/core';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { SearchComponent } from '../../shared/search/search.component';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { TutorialVideoComponent } from '../tutorial-video/tutorial-video.component';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import { QuestionComponent } from '../question/question.component';
import { AiAssistComponent } from './ai-assist/ai-assist.component';
import { title } from 'process';
import { GameProgressDialogComponent } from '../game-progress-dialog/game-progress-dialog.component';
import { AiGameBuilderComponent } from './ai-game-builder/ai-game-builder.component';


class MenuGame {
  'id': any;
  'game_id': any; // Should be same as search key in api
}
class GameCategory {
  'id': any;
  'category_id': any; // Should be same as search key in api
}
const questionTimeList = [{ 'id': 10, 'value': 10 }, { 'id': 15, 'value': 15 }, { 'id': 30, 'value': 30 },
{ 'id': 45, 'value': 45 }, { 'id': 60, 'value': 60 }];

const questionPointListManager = [{ 'id': 100, 'value': 100 }, { 'id': 200, 'value': 200 },
{ 'id': 300, 'value': 300 }, { 'id': 400, 'value': 400 }, { 'id': 500, 'value': 500 }];
let questionPointList = [];

let gameFilter = {};
let questionType = {};
const questionTypeList = [
  { 'id': 2, 'value': QuestionType.SINGLE_CHOICE },
  { 'id': 1, 'value': QuestionType.MULTIPLE_CHOICE }];


enum QUESTIONS_SOURCE {
  CSV = -3,
  QUESTION_LIBRARY = -2,
  ALL_IN_GAME = -1
}

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss']
})
export class AddGameComponent implements OnInit {
  menuList: any;
  modifiedFilters = [];
  manage_options = [{ key: 2, text: this.translate.instant('short_answer'), count: 1 },
  { key: 1, text: this.translate.instant('multiple_choice'), count: 4 }];
  displayedColumns: string[] = ['select', 'card', 'question', 'answer', 'category'];
  filter_options;
  game: any = {
    game_type: 1, 
    game_state: this.translate.instant('draft_uppercase'),
    game_logo: '', 
    game_name: '',
    lang_id: 1,
    game_category_id: 0, 
    pathway_ids: [], 
    game_category_name: ''
  };
  dataSource: any;
  isLinear = false;
  addQuestion = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  is_loading = false;
  is_progress = false;
  is_loading_category = false;
  copyOfCategories;
  gameID;
  hasChanged = false;
  visible = true;
  openCustomMenu: any;
  selectable = true;
  removable = false;
  selectedChip;
  games;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  categories = [];
  is_editing = false;
  isCopyMoveCompleted = false;
  selectedTag: any;
  companyId;
  noOfItemsPerPage = 20;
  pageSizeOptions: number[];
  context = 'gameBuilder';
  questions;
  questionsCount;
  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  categoryColors = [
    '#FD6669',
    '#FF8533',
    '#19CAB0',
    '#0BA8DC',
    '#954AF4'
  ];
  loading_is = false;
  questionsCopy: any = [];
  shouldSearchLocally = true;
  startLimit = 0;
  gamesListForFilters: any[];
  gameDetails: any;
  is_categoryAdd = false;
  isCopiedQuestion = false;
  isMovedQuestion = false;
  isVerticalMenu = false;
  defaultSelectCategory = false;
  fromQuestionLibrary = false;
  categoryListForFilters: any[];
  isTimeUpdated = false;
  isPointsUpdated = false;
  isQuestionUpdated = false;
  updating = false;
  lastAddedCategoryCount = 0;
  questionPermission: any;
  inString = '';
  width = 64;
  @ViewChild('search', { static: true }) search: SearchComponent;
  @ViewChild('invisibleText') invTextER: ElementRef;
  @ViewChild('questionComponent') questionComponent: QuestionComponent;
  isCategoryFocused: boolean;
  isMobile = false;
  pinGameLimitReached:boolean = false;
  clearUnsavedQuestion = false;
  hoverAiAssist = false;
  selectedLanguage: any;
  allLanguage: any;
  gameModeLanguage: any;
  isLangugeChanged: boolean;
  gameUpdated = false;
  progress = 50;
  show_progress_bar = false;
  localisation_progress = 0;
  gameReset = true;
  languageSwitch=[];
  selectedLanguageObject=[];
  accessType;
  ai_game_builder= false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  constructor(private _formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private dialog: MatDialog,
    private questionsService: QuestionsService,
    private gamesService: GamesService,
    public globalService: GlobalService,
    private translateService: TranslateService,
    private storageService: StorageService,
    private headerService: HeaderService,
    public permissionService: PermissionsService,
    private cdRef: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbsService,
    public translate: TranslateService,
    public getImageURLService:GetImageURLService,
    private activatedRoute: ActivatedRoute) {
    questionPointList = [{ 'id': 0, 'value': 'AI GameGenius' }, { 'id': 100, 'value': 100 }, { 'id': 200, 'value': 200 },
    { 'id': 300, 'value': 300 }, { 'id': 400, 'value': 400 }, { 'id': 500, 'value': 500 }];
    gameFilter = {
      'filter': Constants.GAME_ID, value: this.translate.instant('game'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.GAME_NAME, 'is_generic_menu': true
    };
    questionType = {
      'filter': Constants.QUESTION_TYPE, value: this.translate.instant('type_of_question'), 'is_text_search': true, 'is_list_search': true,
      'placeholder': PlaceholderText.QUESTION_TYPE, 'is_generic_menu': true
    };
    // Set Default items per page and number of items per page

    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
    this.companyId = this.storageService.getCompanyId();
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.id) {
        this.reset();
      } else {
        this.resetAll();
      }

      if (queryParams.modal && queryParams.modal === 'add-game') {
        this.clearUnsavedQuestion = true;
      } else {
        this.clearUnsavedQuestion = false;
      }
    });
    this.accessType  = this.storageService.getAccessType();
  }


  ngOnInit() {
    const company = this.storageService.getCompany();
    this.ai_game_builder = company.ai_game_builder;
    this.headerService.showCompanyFilter(false);
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
  }

  reset() {
    this.gameReset = false;
    this.is_loading = false;
    this.is_progress = false;
    this.is_loading_category = false;
    this.hasChanged = false;
    this.categories = [];
    this.is_editing = false;
    this.isCopyMoveCompleted = false;
    this.questions = [];
    this.questionsCopy = [];
    this.gamesListForFilters = [];
    this.is_categoryAdd = false;
    this.isVerticalMenu = false;
    this.lastAddedCategoryCount = 0;
    this.modifiedFilters = [];
    this.resetAll();
  }

  resetAll() {
    this.gameReset = true;
    this.resetFilterOptions();
    this.setQuestionPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setQuestionPermission();
    });

    this.defaultSelectCategory = true;
    // Hide Company Selection filter
    this.headerService.showCompanyFilter(false);
    this.companyId = this.storageService.getCompanyId();
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
    this.loadGameData();
    // fetch and parse games serach
    this.getGames();
    
  }


  resetFilterOptions() {
    this.filter_options = [
      {
        'filter': Constants.QUESTION_TITLE, value: this.translate.instant('question'), 'is_text_search': true, 'is_list_search': false,
        'placeholder': PlaceholderText.QUESTION_TITLE
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
        'filter': Constants.QUESTION_TAGS, value: this.translate.instant('tag'), 'is_text_search': true, 'is_list_search': false,
        'placeholder': PlaceholderText.QUESTION_TAGS
      },
      {
        'filter': Constants.CARD_NUMBER, value: this.translate.instant('card_number'), 'is_text_search': true, 'is_list_search': false,
        'placeholder': PlaceholderText.CARD_NUMBER
      },
      {
        'filter': Constants.CATEGORY_ID, value: this.translate.instant('category_name'), 'is_text_search': true, 'is_list_search': true,
        'dependent_on': Constants.GAME_ID, 'placeholder': PlaceholderText.CATEGORY_NAME, 'is_generic_menu': true
      }];
  }
  setQuestionPermission() {
    this.questionPermission = this.permissionService.getPermissions(PermissionsKey.GAME);
  }

  loadGameData(langData = null) {
    if (this.storageService.getGameObject('storageService')) {
      this.gamesService.gameBeingEdited = this.storageService.getGameObject('storageService');
    }
    this.game = this.gamesService.gameBeingEdited;
    if ((+this.game.game_type === 2) || (this.selectedChip === QUESTIONS_SOURCE.QUESTION_LIBRARY)) {
      this.filter_options.splice(1, 0, questionType);
    }
    this.breadcrumbService.updateBreadcrumbLabel(this.game.game_name);
    this.is_loading = true;
    this.getGameDetails(this.game['game_id']);
    this.getQuestions(this.game['game_id']);
  }
  loadGameDataLang(){
    if ((+this.game.game_type === 2) || (this.selectedChip === QUESTIONS_SOURCE.QUESTION_LIBRARY)) {
      this.filter_options.splice(1, 0, questionType);
    }
    this.breadcrumbService.updateBreadcrumbLabel(this.game.game_name);
    this.is_loading = true;
    this.isLangugeChanged = true;
    this.getGameDetails(this.game['game_id']);
    this.gameUpdated = true;
    this.getQuestions(this.game['game_id']);
  }

  getGameDetails(gameid) {
    const managerId = this.storageService.getLoginUserID();
    this.loading_is = false;
    this.selectedLanguage = this.storageService.getGameLanguage();
    const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    console.log('selectedLanguage',selectedLanguage)
    this.gamesService.getGameDetails(gameid, this.companyId, managerId, selectedLanguage).subscribe(res => {
      this.loading_is = true;

      if (!res.success) {
        return;
      }

      if (!res.data || !res.data.question_categories || res.data.question_categories.length === 0) {
        this.addNextCategory();
        return;
      }
      // hiding AI Assist for multiplayer game
      if(+res.data.game_type == 2){
        this.ai_game_builder = false;
      }      
      this.processGameDetailsResponse(res.data);
    });
  }
  processGameDetailsResponse(data: any) {
    this.gameDetails = data;
    this.categories = data.question_categories;

    this.copyOfCategories = JSON.parse(JSON.stringify(data.question_categories));
    this.pinGameLimitReached = data.pin_game_limit_reached;

    if (this.isLangugeChanged) {
      this.game['game_name'] = data.game_name;
      this.game['default_lang_id'] = data.default_lang_id;
      this.imageUrlUpdated(data.game_image_url);
      this.isLangugeChanged = false;
      
      // Sync the updated game object back to service and storage
      this.gamesService.gameBeingEdited = this.game;
      this.storageService.setGameObject(this.game);
    }

    if (this.defaultSelectCategory) {
      this.defaultSelectCategory = false;
      this.selectChip(0);
    }

    if (data.pathway_ids) {
      this.game['pathway_ids'] = data.pathway_ids;
    }
    this.breadcrumbService.updateBreadcrumbLabel(this.gameDetails.game_name);
    this.gamesService.getGameDetails$.next(data);
  }

  addNewQuestion() {
    this.addQuestion = !this.addQuestion;
    this.cdRef.detectChanges();
  }
  getQuestions(game_id = null, shouldLoadForCurrentGame = false) {
    const gameId = game_id;
    let appliedFilters;
    // Ignore all filter while fetching questions for current game
    if (shouldLoadForCurrentGame) {
      appliedFilters = 'is_active=true';
    } else {
      appliedFilters = this.getFiltersQuery(this.modifiedFilters);
    }
    if (!gameId && +this.game.game_type === 1) {
      appliedFilters += '&game_type=1';
    }
    if (!this.shouldSearchLocally) {
      this.is_loading = true;
    }
    if (this.selectedChip !== QUESTIONS_SOURCE.QUESTION_LIBRARY) {
      appliedFilters = [];
      appliedFilters = 'is_active=true';
    }
    const shopGame = this.game && this.game.is_shop_game;
    appliedFilters += '&is_gamebuilder_question=' + shopGame;
    this.selectedLanguage = this.storageService.getGameLanguage();
    const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    appliedFilters += '&lang_id=' + selectedLanguage;
    this.questionsService.getQuestions(
      this.sort.sortBy, this.sort.order, this.startLimit, this.noOfItemsPerPage,
      appliedFilters, this.companyId, gameId).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
        this.questionComponent.selectedQuestionsList = [];
        if (response.data) {
          this.is_loading = false;
          const allQuestions = response.data.question_list;
          allQuestions.forEach(question => {  
                      question.language = { 
                      'code': response.data.language.lang_code, 
                      'id': response.data.language.lang_id, 
                      'img': response.data.language.lang_image, 
                      'text': response.data.language.lang_name 
                    };
                    });
          if (this.shouldSearchLocally) {
            // Do not replace the copy in case of search in question library
            this.questionsCopy = (JSON.parse(JSON.stringify(allQuestions)));
            this.questionsCount = 0;
            this.searchLocally();
          } else if (!shouldLoadForCurrentGame) {
            this.questions = allQuestions;
            this.questionsCount = response.data.total_question;
          } else {
            this.questionsCopy = (JSON.parse(JSON.stringify(allQuestions)));
          }
          this.getQuestionCount();
        }
      });
      if(game_id){
        this.getProgressDetails(game_id) 
      }
  }
  getAppliedFilters(shouldLoadForCurrentGame) {
    if (shouldLoadForCurrentGame) {
      return 'is_active=true';
    } else {
      return this.getFiltersQuery(this.modifiedFilters);
    }
  }
  
  addAdditionalFilters(appliedFilters) {
    const shopGame = this.game && this.game.is_shop_game;
    appliedFilters += '&is_gamebuilder_question=' + shopGame;
  
    this.selectedLanguage = this.storageService.getGameLanguage();
    const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    appliedFilters += '&lang_id=' + selectedLanguage;
  
    return appliedFilters;
  }
    
  getQuestionCount(category = null) {
    category = category?.length ? category[0] : category;
    if (category && this.questionsCopy?.length) {
      const questionCount = this.questionsCopy.filter(({ category_id }) => category_id === +category.question_category_id);
      return questionCount.length;
    }
    return this.questionsCopy?.length || 0;
  }

  addNextCategory() {
    let name = this.getNewCategoryName();
    for (; this.doesCategoryExist(name); this.lastAddedCategoryCount++) {
      name = this.getNewCategoryName();
      +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Question_Category') :
        this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Question_Category');
    }
    this.addCategory(name);
  }

  doesCategoryExist(name) {
    return this.categories.filter(category => {
      return category.name === name;
    }).length;
  }

  getNewCategoryName() {
    return this.lastAddedCategoryCount < 2 ? this.translate.instant('untitled') :
      `${this.translate.instant('untitled')} ${this.lastAddedCategoryCount}`;
  }

  addCategory(name) {
    this.is_categoryAdd = true;
    const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    const payload = {
      'game_id': +this.game['game_id'],
      'company_id': +this.game['company_id'],
      'category_name': name,
      'lang_id':selectedLanguage
    };
    this.gamesService.addQuestionCategory(payload).subscribe(res => {
      if (res.success) {
        const cat = {
          'name': name,
          'question_category_id': res.data.question_category_id
        };
        this.categories.push(cat);
        this.getGameDetails(this.game['game_id']);
        this.is_categoryAdd = false;
      } else {
        this.is_categoryAdd = false;
      }
    });
  }
  toggleMenu(event) {
    this.openCustomMenu = event;
  }

  updateQuestionCategory(index) {
    this.isCategoryFocused = false;
    if (this.categories[index].name === '') {
      this.categories[index].name = this.copyOfCategories[index].name;
      return;
    }
    if (this.categories[index].name.length < 1 || this.categories[index].name.length > 15) {
      this.categories[index].name = this.categories[index].name.replace(/^\s+|\s+$/g, '');
      this.categories[index].name = this.categories[index].name.slice(0, 14);
      return;
    } else {
      +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Change_Question_Category_Name') :
        this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Change_Question_Category_Name');

      this.categories[index].name = this.categories[index].name.replace(/^\s+|\s+$/g, '');
      if (this.categories[index].name.length <= 0) {
        this.categories[index].name = this.copyOfCategories[index].name;
        return;
      }
      this.categories[index].name = this.categories[index].name.slice(0, 14);
    }
    let existingCategory;
    existingCategory = this.copyOfCategories.filter((categoryData) => {
      return this.checkCategoryEquals(categoryData, this.categories[index]);
    });

    const payload = {
      'game_id': this.game['game_id'],
      'question_category_id': this.categories[index].question_category_id,
      'category_name': this.categories[index].name,
      'company_id': this.companyId,
      'lang_id': this.selectedLanguage
    };

    if (existingCategory.length === 0) {
      this.updating = true;
      this.gamesService.updateQuestionCategories(payload).subscribe((res) => {
        const response = res;
        this.updating = false;
        this.is_loading_category = false;
        this.getGameDetails(this.game['game_id']);
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
      });
    } else {
      if (this.categories[index].name !== this.copyOfCategories[index].name) {
        this.categories[index].name = this.copyOfCategories[index].name;
        const dialogReference = this.dialog.open(ConfirmActionComponent, {
        });
        dialogReference.componentInstance.title = this.translate.instant('alert');
        dialogReference.componentInstance.message = this.translate.instant('category_exists');
        dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
        dialogReference.componentInstance.isMultiOption = false;
      }
    }
  }
  checkCategoryEquals(catA, catB) {
    const a = catA.name;
    const b = catB.name;
    return catA.question_category_id !== catB.question_category_id
      && typeof a === 'string' && typeof b === 'string'
      ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
      : a === b;
  }
  switchToCsv() {
    this.selectedChip = QUESTIONS_SOURCE.CSV;
  }

  switchToQuestionLibrary() {
    this.filter_options.unshift(gameFilter);
    this.selectedChip = QUESTIONS_SOURCE.QUESTION_LIBRARY;
    if (this.questions && this.questions[0] && this.questions[0].is_new) {
      this.questions.splice(0, 1);
    }
    this.shouldSearchLocally = false;
    this.refreshList();
  }

  preventEnter(event, i = 0) {

    // Prevent return or new line
    if (event.keyCode === 13) {
      event.preventDefault();
      event.target.blur();
      return;
    }
  }

  blur(categoryIndex) {
    this.isCategoryFocused = false;
    if (this.gameDetails && this.gameDetails.is_default_category) {
      if (this.categories[categoryIndex].name === this.copyOfCategories[categoryIndex].name) {
        return;
      } else {
        this.checkDefaultCategory(categoryIndex);
      }
    } else {
      this.updateQuestionCategory(categoryIndex);
    }
  }
  checkDefaultCategory(categoryIndex) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
    });
    dialogReference.componentInstance.title = this.translate.instant('warning');
    dialogReference.componentInstance.message = this.translate.instant('confirm_category_name_change');
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogReference.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.updateQuestionCategory(categoryIndex);
    });
    dialogReference.componentInstance.onPositiveAction.subscribe(() => {
      this.categories[categoryIndex].name = this.copyOfCategories[categoryIndex].name;
    });
  }
  selectChip(category) {
    const index = this.filter_options.indexOf(gameFilter);
    if (index >= 0) {
      this.filter_options.splice(index, 1);
    }
    this.shouldSearchLocally = true;
    if (category === 'all') {
      this.selectedChip = QUESTIONS_SOURCE.ALL_IN_GAME;
      if (this.questions[0] && this.questions[0].is_new) {
        this.questions.splice(0, 1);
      }
    } else {
      this.selectedTag = this.categories[category];
      this.selectedChip = category;
    }
    // Remove game filter if applied
    const gameFilters = this.modifiedFilters.filter(element => {
      return element.filter === Constants.GAME_ID;
    });
    if (gameFilters.length) {
      this.search.removeFilter(gameFilters[0]);
    }
    this.searchLocally();
  }
  confirmCategoryDeletion(category) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: category
    });
    +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Delete_Question_Category') :
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Delete_Question_Category');

    dialogReference.componentInstance.title = this.translate.instant('confirm');
    dialogReference.componentInstance.message = this.translate.instant('confirm_category_delete');
    dialogReference.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.deletedCategory(category);
    });
  }
  deletedCategory(category, uploadCsv = false) {
    const payload = {
      'game_id': +this.game['game_id'],
      'company_id': +this.game['company_id'],
      'question_category_id': category && category.question_category_id
    };
    this.gamesService.deleteQuestionCategory(payload).subscribe(res => {
      if (!res.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(res.message_code));
        return;
      } else {
        const index = this.categories.indexOf(category);
        this.categories.splice(index, 1);
          
        if (this.categories.length > 0) {
          this.defaultSelectCategory = false;
          this.selectChip(0);
        } else {
          this.questions.length = 0;
          this.selectChip(QUESTIONS_SOURCE.ALL_IN_GAME);
        }
        if (!uploadCsv) {
          this.getQuestions(this.game['game_id']);
        }
      }
    });
  }
  getQuestionsOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.refreshList();
  }
  remove(category: string): void {
    const index = this.categories.indexOf(category);
    if (index >= 0) {
      this.categories.splice(index, 1);
    }
  }
  goToNextStep() {
    this.router.navigate([Route.GAME_PROFILE]);
  }
  status(value) {
    this.updating = value;
  }
  loading(value) {
    this.is_loading = value;
  }
  // Search
  getDataSource(filterName) {
    switch (filterName) {
      case Constants.QUESTION_TIME:
        this.menuList = questionTimeList;
        break;
      case Constants.QUESTION_POINTS:
        if (+this.game.game_type === 2) {
          this.menuList = questionPointListManager;
        } else {
          this.menuList = questionPointList;
        }
        break;
      case Constants.QUESTION_TYPE:
        this.menuList = questionTypeList;
        break;
      case Constants.GAME_ID:
        this.getGames();
        break;
      case Constants.CATEGORY_ID:
        let gameFilterObject: any = {};
        gameFilterObject = this.globalService.filterApplied(gameFilterObject, Constants.GAME_ID, this.modifiedFilters);
        this.getQuestionCategory(gameFilterObject.game_id);
        break;
    }
  }

  getGames() {
    const companyId = this.storageService.getCompanyId();
    this.gamesService.getGames(companyId).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        this.games = response.data.game_list;
        this.gamesListForFilters = [];
        response.data.game_list.forEach(item => {
          const menuGame = new MenuGame();
          menuGame['id'] = item.game_id;
          menuGame['value'] = item.game_name;
          this.gamesListForFilters.push(menuGame);
        });
        this.menuList = this.gamesListForFilters;
      }
    });
  }
  getQuestionCategory(gameid) {
    // getQuestionCategories
    this.gamesService.getQuestionCategories(gameid).subscribe(res => {
      if (res.success) {
        this.categoryListForFilters = [];
        this.categoryListForFilters = res.data.game_category_list.map(item => {
          const gameCategory = new GameCategory();
          gameCategory['id'] = item.question_category_id;
          gameCategory['value'] = item.name;
          return gameCategory;
        });
        this.menuList = this.categoryListForFilters;
      }
    });
  }

  updateQuestionList(question) {
    const index = this.questionsCopy.findIndex(qs => question.question_id === qs.question_id);
    if (index > -1) {
      this.questionsCopy[index] = question;
    } else {
      this.questionsCopy.splice(0, 0, question);
    }
    this.getQuestions(this.game['game_id']);
  }


  deletedFilters(filters) {
    this.refreshListOnFilterChange(filters.filters);
  }

  refreshListOnFilterChange(filters) {
    this.modifiedFilters = (JSON.parse(JSON.stringify(filters)));
    this.startLimit = 0;
    this.refreshList();
  }

  refreshList() {
    if (this.shouldSearchLocally) {
      this.searchLocally();
    } else {
      this.getQuestions();
    }
  }

  getFiltersQuery(filtersToParse) {
    let appliedFilters = ['is_active=true'];
    if (filtersToParse && filtersToParse.length > 0) {
      const filterQueries = filtersToParse.map(filter => {
        const filterValue = filter['id'] ? filter['id'] : filter['value'];
        return filterValue === 'Random' ? `${filter.filter}=0` : `${filter.filter}=${filterValue}`;
      });
      appliedFilters = [...appliedFilters, ...filterQueries];
    }
    return appliedFilters.join('&');
  }

  // Searches questions locally
  searchLocally() {
    let filteredQuestions = (JSON.parse(JSON.stringify(this.questionsCopy)));
    this.modifiedFilters.forEach(filterObj => {
      filteredQuestions = filteredQuestions.filter((questionData) => {
        let data = questionData[filterObj.filter];
        const type = typeof (data);
        if (Number(data) === NaN && !filterObj.id) {
          data = `${data}`;
          const filterValue = `${filterObj.value}`;
          return data.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
        } if (type === 'string') {
          return String(data).toLowerCase().indexOf(filterObj.value.toLowerCase()) !== -1;
        } else {
          // Check if filter is question type and user is searching for multiple choice, HARDCODED, FIXME
          if (filterObj.filter === 'question_type' && filterObj.id === 1) {
            return (data === 1 || data === 3);
          }
          const filterValue = (filterObj.id && filterObj.id) >= 0 ? filterObj.id : Number(filterObj.value);
          return filterValue === data;
        }
      });
    });
    // check if category fiter is applied locally
    if (this.selectedTag) {
      if (this.selectedChip !== QUESTIONS_SOURCE.ALL_IN_GAME) {
        filteredQuestions = filteredQuestions.filter((questionData) => {
          return questionData.category_id === this.selectedTag.question_category_id;
        });
      }
    }

    this.questionsCount = 0;
    this.questions = [] = filteredQuestions;
  }

  applyFilters(questions, filters) {
    return filters.reduce((filtered, filter) => this.applyFilter(filtered, filter), questions);
  }

  applyFilter(questions, filterObj) {
    return questions.filter(questionData => this.doesQuestionMatchFilter(questionData, filterObj));
  }
  doesQuestionMatchFilter(questionData, filterObj) {
    const data = questionData[filterObj.filter];
    const type = typeof data;
  
    if (isNaN(Number(data)) && !filterObj.id) {
      return this.isStringMatch(data, filterObj.value);
    }
  
    if (type === 'string') {
      return this.isStringMatch(data, filterObj.value);
    }
  
    // Check if filter is question type and user is searching for multiple choice, HARDCODED, FIXME
    if (filterObj.filter === 'question_type' && filterObj.id === 1) {
      return data === 1 || data === 3;
    }
  
    const filterValue = filterObj.id >= 0 ? filterObj.id : Number(filterObj.value);
    return filterValue === data;
  }
  isStringMatch(data, filterValue) {
    return String(data).toLowerCase().includes(filterValue.toLowerCase());
  }
  
  applyCategoryFilter(questions, selectedTag, selectedChip) {
    if (selectedTag && selectedChip !== QUESTIONS_SOURCE.ALL_IN_GAME) {
      return questions.filter(questionData => questionData.category_id === selectedTag.question_category_id);
    }
  
    return questions;
  }
  selectedQuestions(event) {
    if (event.length) {
      this.isVerticalMenu = true;
    } else {
      this.isVerticalMenu = false;
    }
  }
  moveCopyActionList(payload) {
    if (this.isQuestionUpdated || this.isCopiedQuestion || this.isMovedQuestion) {
      this.globalService.showMessage(this.translate.instant('inprogress_wait'));
      return;
    }
    switch (payload.action) {
      case 'move':
        this.moveQuestions(payload.question_list, payload.category_id);
        break;
      case 'copy':

        this.copiedQuestions(payload.question_list, payload.category_id);
        break;
      case 'time':
        this.bulkTimerAndPointsUpdate(payload.question_list, 'time', payload.pointOrTime);
        break;
      case 'points':
        this.bulkTimerAndPointsUpdate(payload.question_list, 'points', payload.pointOrTime);
        break;
      case 'inactive':
        this.qustionStateUpdate(payload.question_list, 'deactivate');
        break;
    }
  }
  qustionStateUpdate(questionsIds, context) {
    this.is_progress = true;
    this.isQuestionUpdated = true;
    const payload = { 'question_ids': questionsIds, 'status': context };
    this.questionsService.updateQuestionsState(payload).subscribe((res) => {
      const response: any = res;
      this.isQuestionUpdated = false;
      this.is_progress = false;
      if (!response.success) {
        this.is_loading = false;
        if (response.message_code === 'RESTRICT_TO_DEACTIVATE_QUESTION_IN_LIVE_SLG') {
          this.showAlert(this.translate.instant('cant_deactivate_questions'), this.apiService.getErrorMessage(response.message_code));
          return;
        }
        this.globalService.showMessage(this.translateService.instant(this.apiService.getErrorMessage(response.message_code)));
        return;
      }
      this.getQuestions(this.game['game_id']);
    });
  }
  bulkTimerAndPointsUpdate(questionsIds, context, value) {
    this.is_progress = true;
    this.isQuestionUpdated = true;
    this.isCopyMoveCompleted = false;
    const payload = {
      'question_ids': questionsIds,
      'game_id': this.game['game_id'],
      'company_id': this.companyId
    };
    payload[context] = context == 'points' && value == 'Random' ? 0 : value;
    this.gamesService.updateQuestionTimeAndPoints(payload).subscribe(response => {
      this.is_progress = false;
      this.isQuestionUpdated = false;
      if (response.success) {
        this.getQuestions(this.game['game_id']);
        this.isCopyMoveCompleted = true;
      } else {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
      }
    });
  }
  moveQuestions(questionsIds, categoryId) {  // Objecting 314 Presenting 353 dummy data for testing
    this.is_progress = true;
    this.isCopyMoveCompleted = false;
    if (!questionsIds) {
      return;
    }
    this.isMovedQuestion = true;
    const payload = {
      'question_ids': questionsIds,
      'question_category_id': categoryId,
      'company_id': this.companyId,
      'game_id': this.game['game_id']
    };

    this.gamesService.moveQuestions(payload).subscribe(response => {
      if (response.success) {
        this.is_progress = false;
        this.isVerticalMenu = false;
        this.isMovedQuestion = false;
        this.isCopyMoveCompleted = true;
        this.getQuestions(this.game['game_id']);
      } else {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
      }
    });
  }

  copiedQuestions(questionsIds, categoryId) {
    this.is_progress = true;
    const payload = {
      'question_ids': questionsIds,
      'question_category_id': categoryId,
      'game_id': this.game['game_id'],
      'company_id': this.companyId
    };
    this.gamesService.copyQuestions(payload).subscribe(res => {
      if (res.success) {
        if (this.selectedChip === QUESTIONS_SOURCE.QUESTION_LIBRARY) {
          if (+this.game.game_type === 2) {
            this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Add_Questions_From_Library');
          } else if (+this.game.game_type === 1) {
            this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Add_Questions_From_Library');
          }
        }
        this.isCopiedQuestion = true;
        this.getCopyQuestionsProgress(res.data.polling_identifier);
      }
    });
  }
  getCopyQuestionsProgress(pollingID) {
    this.isCopyMoveCompleted = false;
    let response;
    let that;
    that = this;
    const questionInterval = setInterval(function () {
      that.gamesService.copyQuestionsProgress(pollingID).subscribe((res) => {
        response = res;
        if (response.success) {
          if (response.data.question_copy_progress === 100) {
            clearInterval(questionInterval);
            that.isVerticalMenu = false;
            that.isCopiedQuestion = false;
            that.isCopyMoveCompleted = true;
            // Only for libray
            let shouldLoadForCurrentGame = false;
            if (that.selectedChip === QUESTIONS_SOURCE.QUESTION_LIBRARY) {
              shouldLoadForCurrentGame = true;
            }
            that.getQuestions(that.game['game_id'], shouldLoadForCurrentGame);
          }
          if (response.data.question_copy_progress === 100) {
            clearInterval(questionInterval);
          }
        } else {
          clearInterval(questionInterval);
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        }
      });
    }, 4000);


  }

  questionCsvAction(value) {
    if (value === 'download') {
      this.downloadQuestionsCSV();
    } else {
      this.openUploader();
    }
  }

  openUploader() {
    const dialogRef = this.dialog.open(UploaderComponent, {
      data: environment.questionCSVSample,
      disableClose: true
    });

    dialogRef.componentInstance.onUploadComplete.subscribe((res) => {
      if (this.categories.length === 1) {
        this.deleteUntitledCategory();
        setTimeout(() => {
          this.uploadPlayerCSV(res, dialogRef);
        }, 300);
      } else {
        this.uploadPlayerCSV(res, dialogRef);
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.is_loading = true;
        this.getGameDetails(this.game['game_id']);
        this.getQuestions(this.game['game_id']);
      }
    });
  }
  deleteUntitledCategory() {
    const questionCategory = this.categories.filter(category => category.name === 'Untitled');
    if (questionCategory.length === 1 && this.getQuestionCount(questionCategory[0]) === 0) {
      this.deletedCategory(questionCategory[0], true);
    }
  }
  // UPLOAD_QUESTIONS
  uploadPlayerCSV(url, dialogRef) {
    const companyId = this.storageService.getCompanyId();
    const payload = {
      'company_id': companyId,
      'game_id': this.game['game_id'],
      'csv_url': url,
    };
    this.gamesService.uploadQuestions(payload).subscribe(res => {
      const response: any = res;
      const uploadQuestionData = response.data;
      dialogRef.componentInstance.is_loading = false;

      if (!response.success) {
        dialogRef.componentInstance.showError = true;
        const message = this.apiService.getErrorMessage(response.message_code);
        dialogRef.componentInstance.errorMessage = message;
        return;
      }
      if (response.data) {
        dialogRef.componentInstance.uploadSuccess = true;
        if (uploadQuestionData.success_questions > 0) {
          dialogRef.componentInstance.dataAdded = true;
        }
        const message = uploadQuestionData.success_questions > 1 ? this.translate.instant('no_of_questions_added') :
          this.translate.instant('no_of_question_added');
        const responceData = [
          `${this.translate.instant('total_records_found')}: ${uploadQuestionData.total_questions}`,
          `${message}: ${uploadQuestionData.success_questions}`,
          `${this.translate.instant('duplicate_records_skipped')}: ${uploadQuestionData.exist_questions}`,
          `${this.translate.instant('invalid_records_found')}: ${uploadQuestionData.failed_questions}`
        ];
        dialogRef.componentInstance.uploadedData = responceData;
        if (response.success) {
          +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Upload_Questions') :
            this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Upload_Questions');

        }
      }
    });
  }

  downloadQuestionsCSV() {
    // tslint:disable-next-line:max-line-length
    +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Download_Question') :
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Download_Questions');
      this.selectedLanguage = this.storageService.getGameLanguage();
      const selectedLanguage = this.selectedLanguage ? this.selectedLanguage : 1;
    let appliedFilters = '&is_active=true&game_id=' + this.game['game_id'];
    appliedFilters += '&lang_id=' + selectedLanguage;
    this.companyId = this.storageService.getCompanyId();
    this.questionsService.getUrlToDowload(this.companyId, appliedFilters)
      .subscribe(res => {
        const response: any = res;
        if (!response.success) {
          this.globalService.showMessage(this.translate.instant('error_downloading'));
          return;
        }
        // Download file
        window.location.assign(response.data.fileURL);
        this.globalService.showMessage(this.translate.instant('downloading_file'));
      });

  }
  downloadTemplate() {
    window.location.assign(environment.questionCSVSample);
    this.globalService.showMessage(this.translate.instant('downloading_file'));

  }

  // we can either use inputText as parameter (from inputText.value) or use inString (from ngModel)
  resizeInput(inputText) {
    // without setTimeout the width gets updated to the previous length
    setTimeout(() => {
      const minWidth = 64;
      if (this.invTextER.nativeElement.offsetWidth > minWidth) {
        this.width = this.invTextER.nativeElement.offsetWidth + 2;
      } else {
        this.width = minWidth;
      }

    }, 0);
  }

  showVideo() {
    +this.game.game_type === 1 ? this.globalService.addAdminGoogleEvent('Game_Builder_Single_level_By_Video_Play') :
      this.globalService.addAdminGoogleEvent('Game_Builder_Multi_Player_By_Video_Play');
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { name: this.translate.instant('how_to_build_games'), 
        url: this.globalService.tutorialVideo.BUILD_GAME }
      });
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.game.game_logo  = data;
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

  switchLanguage(value){
    this.selectedLanguage = value;
    this.selectedLanguageObject = this.storageService.getSelectedLanguage();
    this.storageService.setGameLanguage(value);
    this.loadGameDataLang();
    this.languageSwitch = value;
  }
  allLanguageData(allLanguage){
    this.allLanguage = allLanguage;
  }
  showGameProgress(game){
    this.globalService.addAdminGoogleEvent('SLG_Translation_Tab_Clicked')
    const dialogRef = this.dialog.open(GameProgressDialogComponent, {
      data: game
    });

    dialogRef.componentInstance.progressUpdated.subscribe((progress: number) => {
      this.localisation_progress = progress;
    });
  }
  getProgressDetails(gameId){
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    this.gamesService.getLocalizationProgress(companyId,gameId).subscribe(res => {
       this.is_loading = false;
       if (res.success) {
          this.localisation_progress = res?.data?.completed;
          this.show_progress_bar = res.data && res.data.show_progress;
       }
     });
 }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset Company selectinn filter
    this.headerService.showCompanyFilter(true);
  }

  openAiAssist() {
    this.game.lang_id = this.gameDetails.lang_id;
    this.globalService.addAdminGoogleEvent('AI_Assist_Tab_Clicked');    
    const dialogRef = this.dialog.open(AiGameBuilderComponent, {
      disableClose: true,
      data: {
        game : this.game,
        categories : this.categories,
        currentCategories:this.categories
      },
      panelClass:'ai-assist-dialog-wrapper'
    });
        
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadGameData();
      }
    })

  }
}
