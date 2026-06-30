import {
  Component, OnInit, ViewChild, ElementRef, Input, SimpleChanges, OnChanges,
  EventEmitter, Output, ChangeDetectorRef, OnDestroy, HostListener
} from '@angular/core';
import { Question, QuestionsService, QuestionState, QuestionType } from '../../services/questions/questions.service';
import { Constants, ApiService } from '../../services/network/api.service';
import { GlobalService,answerOptionsType } from '../../services/global/global.service';
import { GamesService } from '../../services/games/games.service';
import { UploaderService } from '../../services/uploader/uploader.service';
import { DelegateService } from '../../services/delegate/delegate.service';
import { StorageService } from '../../services/storage/storage.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { CropImageComponent } from '../../shared/crop-image/crop-image.component';
import { AddTagsComponent } from '../add-tags/add-tags.component';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { MobileQuestionComponent } from '../mobile-question/mobile-question.component';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';

declare let $: any;
class MenuGame {
  'id': any;
  'game_id': ''; // Should be same as search key in api
}

class MenuCategory {
  'id': any;
  'category_id': ''; // Should be same as search key in api
}
enum COMPOSE_MODE {
  Add,
  Edit
}
let gameListForFilters: any = [];

// let questionCategoryListForFilters: any = [];
const questionTimeList = [{ 'id': 0, 'time': '10' }, { 'id': 0, 'time': '15' }, { 'id': 0, 'time': '30' },
{ 'id': 0, 'time': '45' }, { 'id': 0, 'time': '60' }];

// let questionPointList = [];

const questionStateList = [{ 'id': true, 'is_active': QuestionState.ACTIVE }, { 'id': false, 'is_active': QuestionState.INACTIVE }];

const questionTypeList = [
{ 'id': 1, 'question_type': QuestionType.MULTIPLE_CHOICE },
{ 'id': 2, 'question_type': QuestionType.SINGLE_CHOICE }, 
{ 'id': 3, 'question_type': QuestionType.YES_NO }
];
@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() questions;
  @Input() addQuestion;
  @Input() isCategory;
  @Input() isGame;
  @Input() isfeedback;
  @Input() game;
  @Input() category;
  @Input() contextfrom;
  @Input() allCategory;
  @Input() copyMoveAction;
  @Input() statusAction;
  @Input() openCustomMenu;
  @Input() selectedChip;
  @Input() isAllCollapsed;
  @Input() showHeader;
  @Input() clearUnsavedQuestion;
  @Input() allLanguage;
  @Input() gameModeLanguage;
  @Input() languageSwitch;
  @Input() selectedLanguageObject;
  isEditingQuestion = false;

  @ViewChild('rightClickMenu', { static: true }) triggerMenu: ElementRef;
  @ViewChild('rightClickMenu', { read: MatMenuTrigger, static: true }) menuTrigger: MatMenuTrigger;
  @ViewChild('audioPlayer') audioPlayer;
  isCheckClicked = false;
  isContextMenu = false;
  copyAssets = false;
  @Output() updateQuestionList: EventEmitter<any> = new EventEmitter<any>();
  @Output() moveCopyActionList: EventEmitter<any> = new EventEmitter<any>();
  @Output() questionCsvAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkBoxAction: EventEmitter<any> = new EventEmitter<any>();

  isSinglePlayerGameSelected = true;
  companyId;
  games;
  noOfItemsPerPage = 20;
  context = 'questions';
  questionAction;
  // questions;
  totalQuestions;
  selectedQuestionsList = [];
  selectedAnswerType: number;
  timer_options = [10, 15, 30, 45, 60];
  points_options = [100, 200, 300, 400, 500];
  points_options_inbulk_edit: any = [100, 200, 300, 400, 500];
  is_loading = false;
  checked = false;
  indeterminate = false;
  allowMultiSelect = true;
  selection = new SelectionModel<Question>(this.allowMultiSelect, []);
  selectedCategoryIdForAddQuestion = '';
  sort = {
    'sortBy': Constants.CREATED_ON,
    'order': 'desc'
  };
  @ViewChild('imgInput', { static: true }) public imageInput: ElementRef;
  @ViewChild('audioInput', { static: true }) audioInput: ElementRef;
  questionBeingEdited: any;
  copyOfQuestionBeingEdited: any;
  selectedGameIdForAddQuestion = '';
  manage_options = [];
  delegateSubscription: any;
  isMobile = false;

  questionData: any;
  mobileDialogRef: any;
  isimageAssetsBase64: boolean =false;
  emptyAnswersWithDelete: any = [];
  emptyAnswersWithoutDelete: any;
  // answer_options_type = [answerOptionsType.RANDOM, answerOptionsType.SHORT_ANSWER, answerOptionsType.TWO_ANSWER, answerOptionsType.THREE_ANSWER, answerOptionsType.FOUR_ANSWER];
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      if (!this.isMobile) {
        this.toggleExpansion(false);
      }
      this.isMobile = true;
    } else {
      this.isMobile = false;
      if (this.mobileDialogRef) {
        this.mobileDialogRef.close();
      }
    }
  }

  constructor(public questionsService: QuestionsService,
    public apiSerivce: ApiService,
    public globalService: GlobalService,
    public gameService: GamesService,
    public uploaderService: UploaderService,
    public delegateService: DelegateService,
    public storageService: StorageService,
    public dialog: MatDialog,
    public router: Router,
    public getImageURLService:GetImageURLService,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef) {
    // questionPointList = [{ 'id': 0, 'points': this.translate.instant('random') }, { 'id': 0, 'points': '100' },
    // { 'id': 0, 'points': '200' }, { 'id': 0, 'points': '300' }, { 'id': 0, 'points': '400' }, { 'id': 0, 'points': '500' }];
    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyId) => {
      if (this.router.url.indexOf('questions') !== -1 && this.storageService.getCompanyId()) {
        this.companyId = companyId;
        this.getGames();
      }
    });
  }

  ngOnInit() {
    // console.log('allLanguage',this.storageService.getAllLanguage);
    // console.log('this.storageService.getGameLanguage()', this.storageService.getAllLanguage());

    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
    this.companyId = this.storageService.getCompanyId();
    if (this.game && this.game.game_type) {
      this.manage_options = this.game.game_type > 1 ? [
        { key: 2, text: this.translate.instant('short_answer'), count: 1, isEmpty: true },
        { key: 3, text: this.translate.instant('multiple_choice'), count: 2, isEmpty: false }] :
        [{ key: 3, text: this.translate.instant('multiple_choice'), count: 2, isEmpty: false }];
    } else {
      this.manage_options = [
        { key: 2, text: this.translate.instant('short_answer'), count: 1, isEmpty: true },
        { key: 3, text: this.translate.instant('multiple_choice'), count: 2, isEmpty: false }
    ];
    }

    if (this.game && this.game.game_type == 1) {
      this.points_options_inbulk_edit.push('Random');
    }

    this.getGames();
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
  openMobileQuestionView(question, context) {
    if (question && (question.is_archived || question.is_shop_game)) {
      return;
    }
    if (this.isMobile) {
      if (context === COMPOSE_MODE.Add) {
        question.is_new = true;
      }
      this.mobileDialogRef = this.dialog.open(MobileQuestionComponent, {
        data: question,
        disableClose: true,
        maxWidth: '95vw',
        panelClass: 'mobile-view-question'
      });

      this.mobileDialogRef.componentInstance.timer_options = this.timer_options;
      this.mobileDialogRef.componentInstance.points_options = this.points_options;
      this.mobileDialogRef.componentInstance.imgInput = this.imageInput.nativeElement;
      this.mobileDialogRef.componentInstance.audioInput = this.audioInput.nativeElement;
      this.mobileDialogRef.componentInstance.isGame = this.isGame;
      this.mobileDialogRef.componentInstance.isfeedback = this.isfeedback;
      this.mobileDialogRef.componentInstance.manage_options = this.manage_options;
      this.mobileDialogRef.componentInstance.games = this.games;
      this.mobileDialogRef.componentInstance.isCheckClicked = this.isCheckClicked;
      this.mobileDialogRef.componentInstance.isAllCollapsed = this.isAllCollapsed;
      this.mobileDialogRef.componentInstance.selectedChip = this.selectedChip;
      this.mobileDialogRef.componentInstance.selectedQuestionsList = this.selectedQuestionsList;
      this.mobileDialogRef.componentInstance.category = this.category;
      this.mobileDialogRef.componentInstance.isEditingQuestion = this.isEditingQuestion;
      this.mobileDialogRef.componentInstance.isMobile = this.isMobile;


      // Assign outputs
      this.mobileDialogRef.componentInstance.saveQuestion.subscribe((que) => {
        this.saveQuestion(que);
      });
      this.mobileDialogRef.componentInstance.questionToggled.subscribe(() => {
        this.questionToggled();
      });

      this.mobileDialogRef.componentInstance.openImage.subscribe((que) => {
        this.openImage(que);
      });

      this.mobileDialogRef.componentInstance.playAudio.subscribe((que) => {
        this.playAudio(que);
      });
      this.mobileDialogRef.componentInstance.openTagsEditor.subscribe((que) => {
        this.openTagsEditor(que);
      });
      this.mobileDialogRef.componentInstance.cancelEditing.subscribe((que) => {
        this.cancelEditing(que);
      });
      this.mobileDialogRef.componentInstance.selectGame.subscribe((game) => {
        this.onGameSelection(game);
      });
      this.mobileDialogRef.componentInstance.questionCategory.subscribe((que) => {
        this.onCategorySelection(que);
      });
      this.mobileDialogRef.componentInstance.answerType.subscribe((ansType) => {
        this.selectedAnswerType = ansType;
      });
      this.mobileDialogRef.componentInstance.selectedQuestion.subscribe((que) => {
        this.selectedQuestion(que);
      });
      this.mobileDialogRef.componentInstance.cloneQuestion.subscribe((que) => {
        this.cloneQuestion(que);
      });
      this.mobileDialogRef.componentInstance.editQuestion.subscribe((que) => {
        this.enableEditingForQuestion(question);
      });
      this.enableEditingForQuestion(question);

      this.mobileDialogRef.componentInstance.closemobileDialog.subscribe((que) => {
        this.closemobileDialog(que);
      });
      return;
    }
  }
  onContextMenu(e: any, question = null): void {
    // console.log('context', question);
    if (question && question.is_shop_game) {
      return;
    }
    e.preventDefault();
    this.menuTrigger.closeMenu();
    const menu = this.triggerMenu.nativeElement;
    if (menu) {
      menu.style.left = e.pageX + 5 + 'px';
      menu.style.top = e.pageY + 5 + 'px';
    }
    this.menuTrigger.openMenu();
    if (question) {
      if (this.selectedQuestionsList.indexOf(question.question_id) > -1) {
        return;
      }
      this.selectedQuestionsList.length = 0;
      this.selectedQuestionsList.push(question.question_id);
      this.checkBoxAction.emit(this.selectedQuestionsList);
    }
    return;
  }

  toggleExpansion(shouldExpand) {
    this.isAllCollapsed = !shouldExpand;
    this.questions && this.questions.forEach(question => {
      question.isOpen = shouldExpand;
    });
  }

  categorySelected(context, value = null) {
    if (this.selectedQuestionsList) {
      let payload;
      if (context === 'category') {
        payload = {
          'question_list': this.selectedQuestionsList,
          'category_id': value,
          'action': this.questionAction
        };
      } else if (context === 'inactive') {
        payload = {
          'question_list': this.selectedQuestionsList,
          'action': this.questionAction
        };
      } else {
        payload = {
          'question_list': this.selectedQuestionsList,
          'action': this.questionAction,
          'pointOrTime': value
        };
      }
      this.moveCopyActionList.emit(payload);
    }
  }
  questionsCsv(value) {
    this.questionCsvAction.emit(value);
  }

  questionToggled() {
    const openQuestionsCount = this.questions.filter(question => {
      return question.isOpen;
    }).length;
    this.isAllCollapsed = openQuestionsCount !== this.questions.length;
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    console.log(changes.selectedLanguageObject)
    console.log(changes.languageSwitch)
    
   
    if (changes.languageSwitch && !changes.languageSwitch.firstChange) {
      this.clearQuestion();
    }
    if (changes.languageSwitch && !changes.languageSwitch.firstChange) {
      this.clearQuestion();
    }
    if (changes.clearUnsavedQuestion && !changes.clearUnsavedQuestion.firstChange) {
      this.clearQuestion();
    }
    if (changes.addQuestion && !changes.addQuestion.firstChange) {
      this.addNewQuestionRow();
    }
    if (changes.openCustomMenu && !changes.openCustomMenu.firstChange) {
      this.onContextMenu(this.openCustomMenu);
    }
    if (changes.questions && !changes.questions.firstChange) {
      if (changes.questions.previousValue && changes.questions.previousValue.length && changes.questions.previousValue[0].is_new) {
        this.questions.unshift(changes.questions.previousValue[0]);
        if (this.category) {
          this.questions[0]['category_id'] = this.category.question_category_id;
        }
      }
      if (this.category) {
        this.selectedCategoryIdForAddQuestion = this.category.question_category_id;
        this.checked = false;
        this.isEditingQuestion = false;
        this.selectedQuestionsList.length = 0;
      }
      this.questionToggled();
      if (this.isGame === false && this.selectedChip !== -2) {
        this.toggleExpansion(true);
      }
    }
    if (changes.selectedLanguageObject && changes.selectedLanguageObject.currentValue) {
      this.isEditingQuestion = false;
    }
    if (changes.copyMoveAction && changes.copyMoveAction.currentValue) {
      this.selectedQuestionsList.length = 0;
      this.checked = false;
      this.menuTrigger.closeMenu();
    }
    if (changes.statusAction && changes.statusAction.currentValue) {
      this.selectedQuestionsList.length = 0;
      this.checked = false;
    }
    if (this.isMobile) {
      this.toggleExpansion(false);
    }
  }




  getGames(callback = null) {
    const filters = '&only_som=true';
    this.gameService.getGames(this.companyId, 'game_name', 'asc', 0, 5000, filters).subscribe(res => {
      const response: any = res;
      this.games = response.data.game_list;
      if (response.success) {
        gameListForFilters = [];
        response.data.game_list.forEach(item => {
          const menuGame = new MenuGame();
          menuGame['id'] = item.game_id;
          menuGame['game_id'] = item.game_name;
          gameListForFilters.push(menuGame);
        });
      }
    });
  }


  openImage(question) {
    const dialogRef = this.dialog.open(ImagePreviewComponent, {
      data: null
    });
    dialogRef.componentInstance.image = (question && question.signedURL) ? question.signedURL : question.question_image;
    dialogRef.componentInstance.shouldAllowEditing = question && question.is_editing;
    dialogRef.componentInstance.isimageAssetsBase64 = question && question.isimageAssetsBase64;

    dialogRef.componentInstance.OnEdit.subscribe(result => {
      dialogRef.close();
     
      const el: HTMLElement = this.imageInput.nativeElement as HTMLElement;
      el.click();
    });

    dialogRef.componentInstance.OnDelete.subscribe(result => {
      const dialogReference = this.dialog.open(ConfirmActionComponent, {
        data: event
      });
      dialogReference.componentInstance.title = this.translate.instant('confirm_action');
      dialogReference.componentInstance.message = this.translate.instant('confirm_img_delete');
      dialogReference.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
      dialogReference.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
      dialogReference.componentInstance.onNegativeAction.subscribe(() => {
        dialogRef.close();
        question.question_image = null;
        question.blob = null;
      });
    });
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    const pathComponents = event.target.value.split('.');
    const type = pathComponents[pathComponents.length - 1].toLowerCase();
    if (type.indexOf('png') === -1 && type.indexOf('jpg') === -1 && type.indexOf('jpeg') === -1) {
      this.showAlertMessage(this.translate.instant('invalid_file_format'), this.translate.instant('valid_img_format_msg'), false,
        this.translate.instant('ok_uppercase'));
      return;
    }
    console.log(this.questionBeingEdited);
    if(this.questionBeingEdited.is_new){
      this.copyAssets = true;
    }
    // Pass picked image file to Crop Component
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result)
        console.log(this.questionBeingEdited);
        // Apply cropped image changes
        if(this.questionBeingEdited.signedURL){
          this.questionBeingEdited.signedURL = null;
        }
        this.questionBeingEdited.question_image = result.base64;
        this.questionBeingEdited.blob = result.blobedData;
        this.questionBeingEdited['isimageAssetsBase64'] = true;
        console.log(this.questionBeingEdited)
      }
    });
    dialogRef.componentInstance.maintainAspectRatio = false;
    dialogRef.componentInstance.title = this.translate.instant('select_que_img');

  }
  showAlertMessage(title, message, isMultiOption, positiveButtonText) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = isMultiOption;
    dialogReference.componentInstance.positiveButtonText = positiveButtonText;
  }

  audioPicked(event: any): void {
    const file = event.target.files[0];
    const pathComponents = event.target.value.split('.');
    const type = pathComponents[pathComponents.length - 1].toLowerCase();

    if (type.indexOf('mp3') === -1) {
      const dialogReference = this.dialog.open(ConfirmActionComponent, {
        data: event
      });
      dialogReference.componentInstance.title = this.translate.instant('invalid_file_format');
      dialogReference.componentInstance.message = this.translate.instant('select_mp3');
      dialogReference.componentInstance.isMultiOption = false;
      dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
      return;
    } else {
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadeddata', () => {
        let audioDuration;
        audioDuration = audio.duration;
        if (audioDuration > 60) {
          const dialogReference = this.dialog.open(ConfirmActionComponent, {
            data: event
          });
          dialogReference.componentInstance.title = this.translate.instant('invalid_file_duration');
          dialogReference.componentInstance.message = this.translate.instant('select_mp3_less_than_60s');
          dialogReference.componentInstance.isMultiOption = false;
          dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
          dialogReference.afterClosed().subscribe(result => {
            this.questionBeingEdited.question_audio_file = '';
            this.questionBeingEdited.question_audio = '';
          });
          return;
        }
      });

    }
    /////
    this.questionBeingEdited.question_audio_file = file;
    this.questionBeingEdited.question_audio = file;
    console.log(this.questionBeingEdited);

  }

  playAudio(question) {
    if (question.question_audio_file) {
      // Local file
      // const that = this;
      const fr = new FileReader();
      fr.onload = () => { // when file has loaded
        this.presentAudioPlayer(fr.result as string, question);
      };
      fr.readAsDataURL(question.question_audio_file);
    } else {
      this.presentAudioPlayer(question.question_audio, question);
    }
  }

  presentAudioPlayer(url, question) {
    const dialogReference = this.dialog.open(AudioPlayerComponent, {
      data: event
    });
    dialogReference.componentInstance.url = url;
    dialogReference.componentInstance.shouldAllowEditing = question.is_editing;
    dialogReference.componentInstance.OnEdit.subscribe(result => {
      dialogReference.close();
      const el: HTMLElement = this.audioInput.nativeElement as HTMLElement;
      el.click();
    });

    // Delete Audio Confirmation
    dialogReference.componentInstance.OnDelete.subscribe(result => {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        data: event
      });
      dialogRef.componentInstance.title = this.translate.instant('confirm_action');
      dialogRef.componentInstance.message = this.translate.instant('confirm_audio_delete');
      dialogRef.componentInstance.negativeButtonText = this.translate.instant('yes_uppercase');
      dialogRef.componentInstance.positiveButtonText = this.translate.instant('no_uppercase');
      dialogRef.componentInstance.onNegativeAction.subscribe(() => {
        dialogReference.close();
        this.questionBeingEdited.question_audio = null;
        this.questionBeingEdited.question_audio_file = null;
      });
    });
  }

  openTagsEditor(question) {
    const dialogReference = this.dialog.open(AddTagsComponent, {
      data: event
    });
    const tags = question.tag_keywords ? question.tag_keywords.split(',') : [];
    dialogReference.componentInstance.tags = tags;
    dialogReference.componentInstance.onTagsUpdated.subscribe((editedTags) => {
      question.tag_keywords = editedTags.join();
    });
  }

  editQuestion(question) {
    if (question.is_editing || this.isEditingQuestion) {
      return;
    }
    this.enableEditingForQuestion(question);
  }

  enableEditingForQuestion(question) {
    this.isEditingQuestion = true;
    // Cancel existing editing question if any
    if (this.questionBeingEdited) {
      this.questionBeingEdited.is_editing = false;
    }

    this.questionBeingEdited = question;
    this.questionBeingEdited.is_editing = true;
    this.copyOfQuestionBeingEdited = JSON.stringify(question);
    this.selectedGameIdForAddQuestion = question.game_id;
    this.gameService.getQuestionCategories(question.game_id).subscribe(res => {
      const response: any = res;
      if (response.success) {
        if (this.questionBeingEdited) {
          this.questionBeingEdited.categories = response.data.game_category_list;
        }
      }
    });
  }

  cloneQuestion(index) {
    this.addNewQuestionRow(12345, index);
    this.cdRef.detectChanges();
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

  addMore(question) {
    question.answer.options.push({});
    if (question.answer.options.length === 3) {
      question.answer.options.push({});
    }
  }

  saveQuestion(question) {
    console.log('saveQuestion',question);

    question.answer.options.forEach(option => {
      option.is_correct = option.is_correct === true ? true : false;
    });
    this.selectedCategoryIdForAddQuestion = question.category_id;
    if (this.validateQuestion(question)) {
      question.is_saving = true;
      this.isCheckClicked = true;
      this.save(question);
      this.closemobileDialog();
    } else {
      this.isEditingQuestion = true;
      this.isCheckClicked = false;
    }
  }
  closemobileDialog(question = null) {
    if (this.mobileDialogRef) {
      this.isCheckClicked = false;
      this.mobileDialogRef.close();
      this.toggleExpansion(false);
    }
  }
  save(question) {
    console.log('question',question);
    this.isCheckClicked = true;
    
    this.questionsService.saveQuestion(question,
      this.storageService.getCompanyId(),
      this.selectedGameIdForAddQuestion,
      this.selectedCategoryIdForAddQuestion).subscribe((res) => {
        const response: any = res;
        this.isCheckClicked = false;
        if (response.success) {
         
          this.isEditingQuestion = false;
          question.isimageAssetsBase64 = false;
          this.googleEventsAdd(question);

          if (question && (question.is_new || question.is_clone)) {
            console.log('hiiiii',this.copyAssets );
            question.question_id = response.data.question_id;
            question.card_number = response.data.card_number;
            question.category_name = this.category ? this.category.name : '';
            question.category_id = this.category ? this.category.question_category_id : '';
            question.copyAssets = this.copyAssets;
          }
          if (question.is_clone) {
            question.is_clone = false;
          }
          const willUpload = this.updateAssetsIfRequired(question);
          if (willUpload === false) {
            this.updateQuestionList.emit(question);
          }
          if(response.data.any_question_partially_updated){
            this.showAlertMessage(this.translate.instant('please_review'), this.translate.instant('answer_option_validation'), false,
            this.translate.instant('ok_uppercase'));
          }
        } else {
          if (response.message_code === 'CAT_VALIDATION') {
            this.globalService.showMessage(this.translate.instant('pls_select_que_category'));
          }
          this.isEditingQuestion = false;
        }
       
      });
  }

  googleEventsAdd(question) {
    if (question && question.is_new) {
      if (question.answer.options.length) {
        const keyName = `Questions_By_Add_Questions_With_${question.answer.options.length}_Answer_Options`;
        this.globalService.addAdminGoogleEvent(keyName);
        console.log(`Questions_By_Add_Questions_With_${question.answer.options.length}_Answer_Options`);
      }
    }
    if (question && question.is_new) {
      if (question.points) {
        const keyName = this.isGame ? `Questions_By_Add_Question_Points_${question.points}` :
          +question.game_type === 1 ? 'Add_Question_Manually_Single_Level_Points' : 'Add_Question_Manually_Multi_Player_Points';
        this.globalService.addAdminGoogleEvent(keyName);
      }
      if (question.time) {
        const keyName = this.isGame ? `Questions_By_Add_Question_Timer_${question.time}` :
          +question.game_type === 1 ? 'Add_Question_Manually_Single_Level_Timer' : 'Add_Question_Manually_Multi_Player_Timer';
        this.globalService.addAdminGoogleEvent(keyName);
      }
      if (question.question_image) {
        const keyName = this.isGame ? 'Questions_By_Question_Assets_Added_Image' :
          +question.game_type === 1 ? 'Add_Question_Manually_Single_Level_Image' : 'Add_Question_Manually_Multi_Player_Image';
        this.globalService.addAdminGoogleEvent(keyName);
      }
      if (question.question_audio) {
        const keyName = this.isGame ? 'Questions_By_Question_Assets_Added_Audio' :
          +question.game_type === 1 ? 'Add_Question_Manually_Single_Level_Audio' : 'Add_Question_Manually_Multi_Player_Audio';
        this.globalService.addAdminGoogleEvent(keyName);
      }
      if (question.tag_keywords) {
        this.globalService.addAdminGoogleEvent('Questions_By_Question_Tag_Added');
      }
    }

  }

  updateAssetsIfRequired(question) {
    // Check if image needs to be uploaded
    if (question.blob) {
      this.isCheckClicked = true;
      const that = this;
      this.uploaderService.upload(this.getAssetPath('image', '.jpg'), question.blob, function (err, data) {
        if (data) {
          console.log('data',data);
          question.question_image = data.Location;
          // that.imageUrlUpdated(data.Location,question);
          question.blob = null;
        }
        // Check for audio
        if (question.question_audio_file) {
          setTimeout(() => {
            that.uploadAudioAndSave(question);
          }, 2000);
          // that.uploadAudioAndSave(question);
        } else {
          that.isCheckClicked = false;
          if(question.is_new){
            question['copy_assets']=true;
          }
          that.save(question);
        }
      }, true, this.translate.instant('uploading_image'));
      return true;
    } else if (question.question_audio_file) {
      this.uploadAudioAndSave(question);
      return true;
    } else {
      question.is_editing = false;
      question.is_new = false;
      question.is_saving = false;
      this.questionBeingEdited = null;
      return false;
    }
  }

  uploadAudioAndSave(question) {
    this.isCheckClicked = true;
    const that = this;
    this.uploaderService.upload(this.getAssetPath('audio', '.mp3'), question.question_audio_file, function (err, data) {
      if (data) {
        question.question_audio = data.Location;
        question.question_audio_file = null;
      }

      that.isCheckClicked = false;
      if(question.is_new){
        question['copy_assets']=true;
      }
      that.save(question);
    }, true, this.translate.instant('uploading_audio'));
  }
  onGameSelection(game) {
    console.log('game',game);
    this.selectedGameIdForAddQuestion = game.game_id;
    if (this.questionBeingEdited) {
    if(game && game.default_lang_id){
      this.questionBeingEdited.lang_id = game.default_lang_id;
    }else{
      console.log('lang_id',game.lang_id);
      this.questionBeingEdited.lang_id = game.lang_id;
    }
  }
    this.gameService.getQuestionCategories(game.game_id).subscribe(res => {
      const response: any = res;
      if (response.success) {
        if (this.questionBeingEdited) {
          this.questionBeingEdited.categories = response.data.game_category_list;
        }
      }
    });
    this.isSinglePlayerGameSelected = game.game_type === 1;

  }

  onCategorySelection(category) {
    this.selectedCategoryIdForAddQuestion = category.question_category_id;
  }

  getAssetPath(suffix, extension) {
    console.log('this.game', this.game , this.questionBeingEdited);
    const company = this.storageService.getCompany();
    const company_name = company['company_name'];
    const company_identifier = company_name.replace(/\s/g, '');
    const path = environment.env_name + '/' + company_identifier + '/company/questions/' +
      this.questionBeingEdited.question_id + '_' + this.questionBeingEdited['language'].id+ '_' + suffix + extension;
    return path;
  }


  validateQuestion(question) {
    if (!question.question_title) {
      this.globalService.showMessage(this.translate.instant('pls_enter_que_title'));
      return false;
    }
    if (question.points_options) {
      return false;
    }
    if (!question.time) {
      this.globalService.showMessage(this.translate.instant('pls_select_que_time'));
      return false;
    }
    if (question.points == null) {
      this.globalService.showMessage(this.translate.instant('pls_select_que_pts'));
      return false;
    }
    if (!this.selectedGameIdForAddQuestion) {
      this.globalService.showMessage(this.translate.instant('pls_select_game'));
      return false;
    }
    if (!this.selectedCategoryIdForAddQuestion) {
      this.globalService.showMessage(this.translate.instant('pls_select_que_category'));
      return false;
    }

    // Validate empty answers
    const emptyAnswers = question.answer.options.filter((element) => {
      if (element.hasOwnProperty('option')) {
        console.log('element',element);
        return element.option === '';
      }
      return element;
    });
    this.emptyAnswersWithDelete = [];
    this.emptyAnswersWithDelete = emptyAnswers.filter((element) => {
      if (element.is_deleted) {
        return element;
      }
    });
    this.emptyAnswersWithoutDelete = question.answer.options.filter((element) => {
      if (!element.is_deleted) {
        return element;
      }
    });

  
    if (emptyAnswers && this.emptyAnswersWithDelete && (emptyAnswers.length == this.emptyAnswersWithDelete.length)) {
      // return true;
    } else if (emptyAnswers && emptyAnswers.length > 0 ) {
      this.globalService.showMessage(this.translate.instant('empty_ans_option'));
      return false;
    }
    console.log(this.emptyAnswersWithoutDelete.length);
    switch (this.emptyAnswersWithoutDelete.length) {
      case 1:
        if (question.answer.options[0].is_correct === false) {
          this.globalService.showMessage(this.translate.instant('pls_mark_ans_correct'));
          return false;
        }
        if(+question.game_type === 1){
          const correctAnswerCountFilter = question.answer.options.filter(
            (element) => !element.is_deleted
          );    
          console.log('correctAnswerCountFilter',correctAnswerCountFilter);
          console.log('correctAnswerCountFilter',correctAnswerCountFilter[0].option.length);
    
          const maxLength = 15; // replace with the maximum length you want to check against
          if (correctAnswerCountFilter[0].option.length > maxLength) {
            this.globalService.showMessage( this.translate.instant("max_15_char_error_and_note")  );
            return false;
          }
        }
        break;
      case 2:
        console.log('question.answer.options',question.answer.options);
        console.log('emptyAnswersWithoutDelete',this.emptyAnswersWithoutDelete);

        if ((this.emptyAnswersWithoutDelete[0].is_correct === false && this.emptyAnswersWithoutDelete[1].is_correct === false )) {
          this.globalService.showMessage(this.translate.instant('pls_mark_1ans_correct'));
          return false;
        } else if ((this.emptyAnswersWithoutDelete[0].is_correct && this.emptyAnswersWithoutDelete[1].is_correct && this.emptyAnswersWithDelete.length > 1)) {
          this.globalService.showMessage(this.translate.instant('only_1ans_correct'));
          return false;
        } 
        console.log('question.answer.options',question.answer.options);
        if (question.answer_option_type === answerOptionsType.SHORT_ANSWER && +question.game_type === 1) {
          const correctAnswerCount = question.answer.options.filter(
            (element) => {
              return element.is_correct === true && element.is_deleted === false;
            }
          );
          if (correctAnswerCount[0].option.length > 16) {
            this.globalService.showMessage(
              this.translate.instant("max_15_char_error_and_note")
            );
            return false;
          }
        }
        const correctAnswerCount = question.answer.options.filter((element) => {
          return element.is_correct === true && element.is_deleted === false;
        });
      
        if (question.answer_option_type === answerOptionsType.TWO_ANSWER_OPTION) {
          if (this.emptyAnswersWithoutDelete.length == correctAnswerCount.length) {
            this.globalService.showMessage(this.translate.instant("min_1_ans_incorrect"));
            return false;
          }
        }
        
        break;
      default: {
       
        
        const correctAnswerCount = question.answer.options.filter((element) => {
          return element.is_correct === true && element.is_deleted === false;
        });
      
        if (question.answer_option_type === answerOptionsType.TWO_ANSWER_OPTION) {
          console.log('correctAnswerCount',correctAnswerCount.length);
          console.log('emptyAnswersWithDelete',this.emptyAnswersWithoutDelete.length);
          if (this.emptyAnswersWithoutDelete.length == correctAnswerCount.length) {
            this.globalService.showMessage(this.translate.instant("min_1_ans_incorrect"));
            return false;
          }
        }
        if (correctAnswerCount.length === 0) {
          this.globalService.showMessage(this.translate.instant('pls_mark_1ans_correct'));
          return false;
        }else{
          if (question.answer_option_type === answerOptionsType.SHORT_ANSWER && +question.game_type === 1) {
          if((correctAnswerCount[0].option).length > 16 ){
            this.globalService.showMessage(this.translate.instant('max_15_char_error_and_note'));
            return false;
          }
        }
        }
        break;
      }
    }
    return true; // Feel triumphant!
  }
  checkShortAnswerValidation(question){
    // max_15_char_error
  }

  scrollListToTop() {
    const scrollToTop = document.getElementById('scrollToTop');
    if (scrollToTop) {
      scrollToTop.scrollIntoView(true);
    }
  }

  addNewQuestionRow(isDuplicate = null, index = 0) {

    // Disable if there was a question being edited
    this.scrollListToTop();
    if (this.questionBeingEdited) {
      this.cancelEditing(this.questionBeingEdited);
    }
    // New Question
    const data = this.questions || [];
    if (data && data.length > 0 && data[0].is_new === true) {
      return;
    }
    console.log('this.questions',this.questions);
    console.log('data',data);
    console.log('index',index);
    this.isEditingQuestion = true;
    let question: any = {};
    
    if (isDuplicate) {
      const abcd = JSON.parse(JSON.stringify(data[index]));
      console.log(abcd)
      
      const dupeQs = JSON.parse(JSON.stringify(data[index]));

      question = dupeQs;
      console.log('dupeQs',dupeQs);
      
      
      question.isDuplicate = isDuplicate;
      question = Object.assign(question, dupeQs);
      console.log('question',question);
      
      question.is_editing = true;
      question.is_clone = true;
      question.isOpen = true;
      question.card_number = null;
      // question['lang_id'] = data[0].lang_id;
      // question['language'] = data[0].language;
      
      
      data.splice(index, 0, question);
      // console.log('data',data[1]);
      
      console.log('question',question);
      console.log('this.questions',this.questions);

      this.questionBeingEdited = question;
      this.selectedGameIdForAddQuestion = question.game_id;
      this.selectedCategoryIdForAddQuestion = question.category_id;
      

      const payload = {
        game_id: question.game_id,
        game_type: question.game_type,
        lang_id:question.lang_id,
        language:question.language
      };
      this.onGameSelection(payload);
      return;
    }

    question.is_editable = true;
    question.is_new = true;
    question.isOpen = true;
    question.is_editing = true;
    question.is_answer_choice_required = true;
    question.answer = {};
    question.time = 15;
    question.game_type = this.game && this.game.game_type ? this.game.game_type : '';
    question.points = 0;
    question.game_id = this.game && this.game.game_id ? this.game.game_id : null;
    // question.lang_id = question.gameModeLanguage.lang_id;

    if (!this.isGame) {
      question.category_id = this.category ? this.category.question_category_id : '';
      question.category_name = this.category ? this.category.name : '';
    }
  
    question.answer.options = [];  
    data.splice(0, 0, question);
    this.questions = data;
    this.questionBeingEdited = question;
    if (this.game) {
      const payload = {
        game_id: this.game.game_id,
        game_type: this.game.game_type
      };
      this.onGameSelection(payload);
    }
    this.selectedGameIdForAddQuestion = question.game_id;
    if (this.isMobile) {
      this.openMobileQuestionView(question, COMPOSE_MODE.Add);
      return;
    }
  }

  updateQuestionsState(questionState, question = null) {
    const questionIdsToBeUpdated = [];
    let filterQuestionsToBeUpdated = [];
    if (question == null) {
      // Filter Questions which are converted to expected states.
      filterQuestionsToBeUpdated = this.selection.selected.filter(selectedQuestion => {
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
    const payload = { 'question_ids': questionIdsToBeUpdated, 'status': questionState ? 'activate' : 'deactivate' };
    this.questionsService.updateQuestionsState(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        this.globalService.showMessage(this.translate.instant(this.apiSerivce.getErrorMessage(response.message_code)));
        return;
      }
      if (question != null) {
        question.is_active = questionState;
      }
    });
  }

  cancelEditing(question, i = 0) {
    console.log(this.questions)
    console.log(question)
    const data = this.questions;
    this.isEditingQuestion = false;
    if (question && (question.is_new || question.is_clone)) {
      data.splice(i, 1);
    } else {
      const index = this.questions.indexOf(question);
      question = JSON.parse(this.copyOfQuestionBeingEdited);
      data[index] = question;
      this.copyOfQuestionBeingEdited = null;
    }
    this.questions = data;
    this.questionBeingEdited = null;
    question.is_editing = false;
  }
  getSelectedQuestionAll(event) {
    this.checked = event.checked;
    if (event.checked) {
      this.selectedQuestionsList = [];
      if (this.isfeedback) {
        for (let i = 0; i < this.questions.length; i++) {
          if (!this.questions[i].is_shop_game && !this.questions[i].is_archived) {
            this.selectedQuestionsList[i] = this.questions[i].question_feedback_id;
          }
        }
      } else {
        for (let i = 0; i < this.questions.length; i++) {
          if (!this.questions[i].is_shop_game && !this.questions[i].is_archived) {
            this.selectedQuestionsList[i] = this.questions[i].question_id;
          }
        }
      }
    } else {
      this.selectedQuestionsList = [];
    }
    this.checkBoxAction.emit(this.selectedQuestionsList);
  }
  selectedQuestion(question) {
    if (question.is_checked) {
      if (this.isfeedback) {
        this.selectedQuestionsList.push(question.question_feedback_id);
      } else {
        this.selectedQuestionsList.push(question.question_id);
      }
      this.checked = this.questions.length === this.selectedQuestionsList.length && true; 
    } else {
      if (this.isfeedback) {
        const unCheckedQuestion = [] = this.selectedQuestionsList.filter(selectedQuestion => {
          return question.question_feedback_id !== +selectedQuestion;
        });
        this.checked = false;
        this.selectedQuestionsList = unCheckedQuestion;
      } else {
        const unCheckedQuestion = [] = this.selectedQuestionsList.filter(selectedQuestion => {
          return question.question_id !== +selectedQuestion;
        });
        this.checked = false;
        this.selectedQuestionsList = unCheckedQuestion;
      }

    }
    this.checkBoxAction.emit(this.selectedQuestionsList);
  }

  clearQuestion() {
    if (this.questions && this.questions[0] && this.questions[0].is_new) {
      this.cancelEditing(this.questions[0]);
    }
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
  imageUrlUpdated(imageUrl,question){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    console.log(relativePath)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      console.log(data)   
      question.question_image = data;
      // that.marketplaceBannerImage = data;
    });  
  }


}