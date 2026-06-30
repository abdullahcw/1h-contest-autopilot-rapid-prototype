import {
    Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, ViewChildren, QueryList, SimpleChanges,
    OnChanges
  } from '@angular/core';
  import { DatePipe } from '@angular/common';
  
  import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
  import { GlobalService,answerOptionsType} from 'src/app/services/global/global.service';
  import { TranslateService } from '@ngx-translate/core';
  import { MatDialog } from '@angular/material/dialog';
  import { StorageService } from 'src/app/services/storage/storage.service';
  
  
  @Component({
    // tslint:disable-next-line:component-selector
    selector: 'app-single-que-game-builder',
    templateUrl: "./single-que-game-builder.component.html",
    styleUrls: ["./single-que-game-builder.component.scss"],
  })
  export class SingleQueGameBuilderComponent implements OnInit, OnChanges {
    customQuestion = "";
    customQuestionPlaceholder = "";
    customCategory: any;
    selectedAnswerType: number;
    hideSingleChoice = false;
    isRowHover = false;
    @Input() isMobile;
    @Input() isCheckClicked;
    @Input() question;
    @Input() questionLocal;
    @Input() timer_options;
    @Input() points_options;
    @Input() imgInput;
    @Input() audioInput;
    @Input() manage_options;
    @Input() games;
    @Input() isCategory;
    @Input() isGame;
    @Input() isfeedback;
    @Input() category;
    @Input() selectedQuestionsList;
    @Input() selectedChip;
    @Input() isEditingQuestion;
    @Input() index;
    @Input() cloneKey;
    @Input() isAllCollapsed;
    @Input() hideEdit;
    @Input() allLanguage;
    @Output() questionToggled: EventEmitter<any> = new EventEmitter<any>();
    @Output() editQuestion: EventEmitter<any> = new EventEmitter<any>();
    @Output() cloneQuestion: EventEmitter<any> = new EventEmitter<any>();
    @Output() openImage: EventEmitter<any> = new EventEmitter<any>();
    @Output() openImagePicker: EventEmitter<any> = new EventEmitter<any>();
    @Output() playAudio: EventEmitter<any> = new EventEmitter<any>();
    @Output() openTagsEditor: EventEmitter<any> = new EventEmitter<any>();
    @Output() saveQuestion: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancelEditing: EventEmitter<any> = new EventEmitter<{make: object, name: string}>();
    @Output() selectGame: EventEmitter<any> = new EventEmitter<any>();
    @Output() questionCategory: EventEmitter<any> = new EventEmitter<any>();
    @Output() answerType: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectedQuestion: EventEmitter<any> = new EventEmitter<any>();
    
    isAbsoluteRequired = false;
  
    @ViewChild("quesImage", { static: false }) questionImage: ElementRef;
    @ViewChild("questionTitle") questionTitle: ElementRef;
    @ViewChild("questionTitleDefault") questionTitleDefault: ElementRef;
    @ViewChild("questionImg") questionImg: ElementRef;
    @ViewChild("ansOptionOne") ansOptionOne: ElementRef;
    @ViewChildren("ansOptionFour") ansOptionFour: QueryList<any>;
    @ViewChild("ansOptionOneDefuault") ansOptionOneDefuault: ElementRef;
    @ViewChildren("ansOptionFourDefault") ansOptionFourDefault: QueryList<any>;
  
    titleHeight: number;
    ansOptionHeight: number;
    feedbackTab = true;
    tabIndex = true;
    feedbackTabIndex = 0;
    questionPermission: any;
    showExtraClass = true;
    gameModeLanguage;
    actualQuestionAnswerOption: any;
    questionAnswerOption: any;
    actualQuestionAnswerOptionLength: any;
    questionAnswerOptionLength: any;
    optionNotValid: boolean = false;
    answer_option_type;
    constructor(
      public datePipe: DatePipe,
      public dialog: MatDialog,
      public translate: TranslateService,
      public permissionService: PermissionsService,
      public globalService: GlobalService,
      public storageService: StorageService
    ) {
      this.answer_option_type = answerOptionsType;
    }
  
    ngOnInit() {
      this.allLanguage = this.storageService.getAllLanguage();
      const langID = this.storageService.getGameLanguage();
      this.checkOptionLength(this.question);
      
      if (this.question?.is_new) {
        this.question['answer_option_type'] = 'RANDOM';
      } else {
        this.onAnswerOptionTypeSelection(this.question,this.question.answer_option_type);
      }
  
      if (this.question.is_system_generated) {
        this.question.question_title = "";
        this.question.answer.options.forEach((item) => {
          item.option = "";
        });
      }
      this.setQuestionPermission();
      // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
      this.globalService.permissionReceived$.subscribe((res) => {
        this.setQuestionPermission();
      });
      this.customCategory = {
        question_category_id: this.question.category_id,
        name: this.question.category_name,
      };
      if (this.isGame) {
        this.customQuestionPlaceholder = this.question.game_name;
      }
      if (+this.question.game_type === 2 ) {
      this.hideSingleChoice = false;
      }else{
        this.hideSingleChoice = true;
      }
      this.question.points =
        this.question && this.question.points && this.hideSingleChoice ? this.question.points
          : this.question && this.question.points ? this.question.points : !this.hideSingleChoice ? 100 : 0;
  
      if(this.question.is_new) {
        this.activateAnswers(this.question, 2, 1);
      }
      this.checkOptionLength(this.question);
    }
    ngOnChanges(changes: SimpleChanges) {
      console.log('changes',changes); 
      if(this.question.is_new ) {
      }
      if (
        !(
          changes &&
          changes.isAllCollapsed &&
          changes.isAllCollapsed.currentValue
        )
      ) {
        this.toggleExpansion();
      }
    }
    getSelectedLanguagae(id) {
      return this.allLanguage.filter((x) => x.id === id);
    }
    setQuestionPermission() {
      this.questionPermission = this.permissionService.getPermissions(
        PermissionsKey.GAME
      );
    }
    feedbackTabChange(event) {
      this.feedbackTab = event === 0 ? true : false;
      // tslint:disable-next-line:max-line-length
      event === 0
        ? this.globalService.addAdminGoogleEvent(
            "Player_Feedback_Player_Feedback_Status_Viewed_Modified"
          )
        : this.globalService.addAdminGoogleEvent(
            "Player_Feedback_Player_Feedback_Status_Viewed_Original"
          );
    }
  
    toggleExpansion(isTemplateCall = false, $event = null) {
      if (this.isMobile) {
        return;
      }
      if (isTemplateCall) {
        this.question.isOpen = !this.question.isOpen;
        this.questionToggled.emit();
        this.feedbackTabIndex = 0;
        this.feedbackTabChange(this.feedbackTabIndex);
        if (this.isEditingQuestion) {
          if ($event) {
            $event.stopPropagation();
          }
        }
      }
      setTimeout(() => {
        if (this.questionTitle) {
          this.titleHeight = this.questionTitle.nativeElement.offsetHeight;
        }
        if (this.ansOptionOne) {
          this.ansOptionHeight = this.ansOptionOne.nativeElement.offsetHeight;
        }
        if (this.ansOptionFour) {
          if (
            this.ansOptionFour.first &&
            this.ansOptionFour.first.nativeElement &&
            this.ansOptionFour.first.nativeElement.childElementCount > 4
          ) {
            this.ansOptionHeight =
              this.ansOptionFour.first.nativeElement.offsetHeight;
            this.ansOptionHeight = this.ansOptionHeight - 25;
          }
        }
        if (
          this.titleHeight &&
          this.ansOptionHeight &&
          this.titleHeight < this.ansOptionHeight
        ) {
          this.isAbsoluteRequired = true;
        } else {
          this.isAbsoluteRequired = false;
        }
      }, 500);
  
      if (this.isfeedback) {
        this.globalService.addAdminGoogleEvent(
          "Player_Feedback_Player_Feedback_Status_Viewed_Modified"
        );
      }
    }
  
    edit(question) {
      this.selectGame.emit(question);
      this.editQuestion.emit(question);
      this.categorySelection(this.customCategory);
      this.toggleExpansion();
    }
  
    clone() {
      this.cloneQuestion.emit(this.index);
  
    }
  
    image(question) {
      if (this.questionImage && this.questionImage.nativeElement.src) {
        question.signedURL = this.questionImage.nativeElement.src;
      }
      this.openImage.emit(question);
    }
    audio(question) {
      this.playAudio.emit(question);
    }
    tags(question) {
      this.openTagsEditor.emit(question);
    }
  
    save(question) {
      let answerOption = question.answer.options.filter((x) => {
        return x.is_deleted == false;
      });
  
      if (answerOption.length === 1) {
        question.answer.options[0].is_correct = true;
      }
      question["question_type"] = this.findQuestionType();
      question["category_id"] = this.customCategory.question_category_id;
      question["category_name"] = this.customCategory.name;
      question["lang_id"] =
        question.game_type === 1 ? this.question.language.lang_id : 1;
  
      if (this.customQuestion) {
        question.game_id = this.customQuestion["game_id"];
      }
      this.saveQuestion.emit(question);
      this.toggleExpansion();
    }
  
    findQuestionType() {
      let answerOption = this.question.answer.options.filter((x) => {
        return x.is_deleted == false;
      });
      const length = answerOption.length;
      const question_type = length > 2 ? 1 : length === 2 ? 3 : 2;
      return question_type;
    }
  
    cancel(question) {
      question.is_editing = false
      this.cancelEditing.emit(question);
    }
  
    isSelected(index) {
      if (this.question && this.question.answer_option_type === this.answer_option_type.SHORT_ANSWER) {
        this.removeSelection(index);
      }
    }
  
    removeSelection(index = null) {
      this.question.answer.options.forEach((option, i) => {
        option.is_correct = (i === index);
      });
    }
  
    activateAnswers(question, answerType, count) {
      const newAnswers = [];
      for (let i = 0; i < count; i++) {
        const emptyOption = {
          is_new: false,
          is_deleted: false,
          option_old: "",
        };
        if (i < question.answer.options.length) {
          newAnswers.push(question.answer.options[i].emptyOption);
        } else {
          newAnswers.push(emptyOption);
        }
      }
      for (let i = 0; i < newAnswers.length; i++) {
        newAnswers[i]["id"] = i + 1;
      }
      question.answer.options = newAnswers;
      this.selectedAnswerType = answerType;
      question.question_type = this.selectedAnswerType;
      question.is_answer_choice_required = false;
      this.answerType.emit(answerType);
    }
    // The original function, now simplified
    createNewAnswers(count: number, question: any) {
      const emptyOption = {
        is_new: false,
        is_deleted: false,
        option_old: "",
      };
    
      return Array.from({ length: count }, (_, i) => 
        i < question.answer.options.length ? question.answer.options[i].emptyOption : { ...emptyOption, id: i + 1 }
      );
    }
    
    updateQuestion(question: any, newAnswers: any[], answerType: any) {
      question.answer.options = newAnswers;
      question.question_type = answerType;
      question.is_answer_choice_required = false;
    }
      
    getSelectedQuestion(question, event) {
      question.is_checked = event.checked;
      this.selectedQuestion.emit(question);
    }
  
    addMore(question,optionType = null) {
      if(!optionType){
        question.answer.options.push(
          {id: question.answer.options.length + 1,
          is_new: true,
          is_deleted: false,
          option_old: "", }
        );
      }
      if (optionType) {
        let selectedLangObject = question.answer.options.filter((x) => {
          return x.is_deleted == false;
        });
        for(let i = selectedLangObject.length; i < optionType; i++) {
          question.answer.options.push({
            id: question.answer.options.length + 1,
            is_new: true,
            is_deleted: false,
            option_old: "",
          });
        }
      }
   
      this.toggleExpansion();
      this.checkOptionLength(question);
    }
    removeAnswer(index, option, question) {
      option["is_deleted"] = true;
      this.checkOptionLength(question);
      this.question.answer.options.sort((a, b) => a.is_deleted - b.is_deleted);
      this.checkOptionLength(question);
      this.setRandomAnswerOptionRemoved();
    }
    setRandomAnswerOptionRemoved() {
      const type = this.question.answer_option_type;
      if (type === answerOptionsType.TWO_ANSWER_OPTION && this.questionAnswerOptionLength === 1) {
        this.question['answer_option_type'] = 'RANDOM';
      } else if (type === answerOptionsType.THREE_ANSWER_OPTION && this.questionAnswerOptionLength === 2) {
        this.question['answer_option_type'] = 'RANDOM';
      } else if (type === answerOptionsType.FOUR_ANSWER_OPTION && this.questionAnswerOptionLength === 3) {
        this.question['answer_option_type'] = 'RANDOM';
      }
    }
  
    getDate(dateStr, shouldProvideTime = false) {
      if (!dateStr) {
        return this.translate.instant("not_available");
      }
      const format = shouldProvideTime ? "MM/dd/yyyy hh:mm a" : "MM/dd/yyyy";
      return this.datePipe.transform(dateStr.replace(/ /g, "T"), format);
    }
  
    categorySelection($event) {
      this.customCategory = $event;
      this.questionCategory.emit($event);
    }
  
    onGameSelection(event) {
      this.customCategory.question_category_id = null;
      this.customCategory.name = null;
      this.customQuestion = event;
      this.selectGame.emit(event);
      if (+event.game_type === 2) {
        this.question.points = 100;
        this.hideSingleChoice = false;
        return;
      }
      this.question.points = 0;
      if (
        this.question &&
        this.question.options &&
        this.question.options.length === 1
      ) {
        this.addMore(this.question);
      }
      this.hideSingleChoice = true;
    }
    setQuestionLanguage(langID) {
      const selectedLangObject =
        this.allLanguage &&
        this.allLanguage.selected_language.filter((x) => x.id == langID);
      this.gameModeLanguage = selectedLangObject[0];
      this.question["language"] = this.gameModeLanguage;
    }
    checkOptionLength(question) {
      if (this.isfeedback) {
        const selectedLangObject = question.actual_question_answer.options.filter(x => !x.is_deleted);
        this.actualQuestionAnswerOptionLength = selectedLangObject.length;
      }
  
      const answerOption = question.answer.options.filter(x => !x.is_deleted);
      this.questionAnswerOptionLength = answerOption.length;
    }
    onAnswerOptionTypeSelection(question, event){
      let optionType = event;
      switch (event) {
        case answerOptionsType.SHORT_ANSWER:
          this.checkValidation();
          break;
        case answerOptionsType.TWO_ANSWER_OPTION:
          optionType = 2;
          this.optionNotValid = false;
          break;
        case answerOptionsType.THREE_ANSWER_OPTION:
          optionType = 3;
          this.optionNotValid = false;
          break;
        case answerOptionsType.FOUR_ANSWER_OPTION:
          optionType = 4;
          this.optionNotValid = false;
          break;
      
        default:
          optionType = 0;
          this.optionNotValid = false;
          break;
      }
      this.googleEventForAnswerOptionType(event);
      question.answer_option_type = event;
     if(optionType != 0){
       this.addMore(question, optionType);
     }
    }
    checkValidation(){
      let isCorrectAns = this.question.answer.options.filter((x) => {
        return x.is_correct == true;
      });
      if(isCorrectAns && isCorrectAns.length > 1){
        this.question.answer.options.forEach((option) => {
          option.is_correct = false;
        });
      }
      this.optionNotValid = true;
    }

    getAnswerOptionType(value){
      const data = value;
      const newLocal = 'data';
    return answerOptionsType[newLocal];
    }
    googleEventForAnswerOptionType(value){
      switch (value) {
        case answerOptionsType.RANDOM:
          this.globalService.addAdminGoogleEvent("Answer_Option_Tab_Clicked_Random");
          break;
        case answerOptionsType.SHORT_ANSWER:
          this.globalService.addAdminGoogleEvent("Answer_Option_Tab_Clicked_Short");
          break;
        case answerOptionsType.TWO_ANSWER_OPTION:
          this.globalService.addAdminGoogleEvent("Answer_Option_Tab_Clicked_2");
          break;
        case answerOptionsType.THREE_ANSWER_OPTION:
          this.globalService.addAdminGoogleEvent("Answer_Option_Tab_Clicked_3");
          break;
        case answerOptionsType.FOUR_ANSWER_OPTION:
          this.globalService.addAdminGoogleEvent("Answer_Option_Tab_Clicked_4");
          break;
      }
    }
    isSelectedQuestion(question: any) {
        return this.selectedQuestionsList?.includes(question?.question_id);
      }
  }
  