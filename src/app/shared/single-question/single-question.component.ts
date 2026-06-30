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
  selector: "[app-single-question]",
  templateUrl: "./single-question.component.html",
  styleUrls: ["./single-question.component.scss"],
})
export class SingleQuestionComponent implements OnInit, OnChanges {
  customQuestion = "";
  customQuestionPlaceholder = "";
  customCategory: any;
  selectedAnswerType: number;
  hideSingleChoice = false;
  isRowHover = false;
  @Input() isMobile;
  @Input() isCheckClicked;
  @Input() question;
  @Input() timer_options;
  // @Input() answer_options_type;
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
  // @Input() gameModeLanguage;
  @Output() questionToggled: EventEmitter<any> = new EventEmitter<any>();
  @Output() editQuestion: EventEmitter<any> = new EventEmitter<any>();
  @Output() cloneQuestion: EventEmitter<any> = new EventEmitter<any>();
  @Output() openImage: EventEmitter<any> = new EventEmitter<any>();
  @Output() openImagePicker: EventEmitter<any> = new EventEmitter<any>();
  @Output() playAudio: EventEmitter<any> = new EventEmitter<any>();
  @Output() openTagsEditor: EventEmitter<any> = new EventEmitter<any>();
  @Output() saveQuestion: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelEditing: EventEmitter<any> = new EventEmitter<any>();
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
      const selectedLanguage = this.storageService.getGameLanguage();
      this.setQuestionLanguage(selectedLanguage);
      this.question['answer_option_type'] = 'RANDOM';
    } else {
      this.onAnswerOptionTypeSelection(this.question,this.question.answer_option_type);
      this.setQuestionLanguage(this.question.lang_id);
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
      // this.question.game_type && +this.question.game_type === 2 ? false : true;
    this.question.points =
      this.question && this.question.points && this.hideSingleChoice ? this.question.points
        : this.question && this.question.points ? this.question.points : !this.hideSingleChoice ? 100 : 0;

    // if (this.hideSingleChoice && this.question.is_new) {
    //   this.activateAnswers(this.question, 3, 2);
    // } else if (+this.question.game_type === 2 && this.question.is_new) {
    //   this.activateAnswers(this.question, 2, 1);
    // }

    if(this.question.is_new) {
    this.activateAnswers(this.question, 2, 1);
    }
    this.checkOptionLength(this.question);
  }
  ngOnChanges(changes: SimpleChanges) {
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
    // if (question.answer.options.length === 3) {
    // if (answerOption.length === 3) {
    //   question.answer.options[2]["is_deleted"] = true;
    // }
    question["question_type"] = this.findQuestionType();
    question["category_id"] = this.customCategory.question_category_id;
    question["category_name"] = this.customCategory.name;
    question["lang_id"] =
      question.game_type === 1 ? this.gameModeLanguage.lang_id : 1;

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
    console.log(length);
    // const length = this.question.answer.options.length;
    const question_type = length > 2 ? 1 : length === 2 ? 3 : 2;
    console.log(question_type);
    return question_type;
  }

  cancel(question) {
    this.cancelEditing.emit(question);
  }

  isSelected(index) {
    console.log(index);
    // if (this.question.answer.options.length === 2 || this.question.answer.options.length === 3) {
    if ((this.question && this.question.answer_option_type === this.answer_option_type.SHORT_ANSWER)){
      this.removeSelection(index);
    }
  }

  removeSelection(index = null) {
    console.log(this.question.answer.options);
    console.log(index);
    this.question.answer.options.forEach((option, i) => {
      if (i !== index) {
        this.question.answer.options[i].is_correct = false;
      }
    });
  }

  activateAnswers(question, answerType, count) {
    console.log("question, answerType, count", question, answerType, count);
    const newAnswers = [];
    for (let i = 0; i < count; i++) {
      const emptyOption = {
        is_new: false,
        is_deleted: false,
        option_old: "",
      };
      // emptyOption['id'] = question.answer.options.length + 1
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
        console.log(selectedLangObject.length)
        console.log(optionType)
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
    console.log(' this.question.answer.options', this.question.answer.options);
    this.checkOptionLength(question);
    this.setRandomAnswerOptionRemoved();
  }
  setRandomAnswerOptionRemoved() {
    console.log(this.question && this.question.answer_option_type);
    console.log(this.questionAnswerOptionLength);
    const type = this.question.answer_option_type;
    switch (type) {
      case answerOptionsType.TWO_ANSWER_OPTION:
        if (this.questionAnswerOptionLength === 1){
          this.question['answer_option_type'] = 'RANDOM';
        }
        break;
      case answerOptionsType.THREE_ANSWER_OPTION:
        if (this.questionAnswerOptionLength === 2){
          this.question['answer_option_type'] = 'RANDOM';
        }
        break;
      case answerOptionsType.FOUR_ANSWER_OPTION:
        if (this.questionAnswerOptionLength === 3){
        this.question['answer_option_type'] = 'RANDOM';
        }
        break;
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
    console.log("event");
    this.setQuestionLanguage(event.default_lang_id);
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
    this.gameModeLanguage = selectedLangObject && selectedLangObject[0];
    this.question["language"] = this.gameModeLanguage;
  }
  checkOptionLength(question) {
    if (this.isfeedback) {
      let selectedLangObject = question.actual_question_answer.options.filter(
        (x) => {
          return x.is_deleted == false;
        }
      );
      this.actualQuestionAnswerOptionLength = selectedLangObject.length;
    }

    let answerOption = question.answer.options.filter((x) => {
      return x.is_deleted == false;
    });
    this.questionAnswerOptionLength = answerOption.length;
  }
  onAnswerOptionTypeSelection(question, event){
    console.log(event)
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
    console.log(this.questionAnswerOptionLength);
    console.log(optionType);
    this.googleEventForAnswerOptionType(event);
    question.answer_option_type = event;
   if(optionType != 0){
     this.addMore(question, optionType);
   }
  }
  checkValidation(){
    this.optionNotValid = true;
  }
  count(question,i){
    let answerOption = question.answer.options.filter((x) => {
      return x.is_deleted == false;
    });
    console.log(answerOption)
    return answerOption.length - i;
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
}