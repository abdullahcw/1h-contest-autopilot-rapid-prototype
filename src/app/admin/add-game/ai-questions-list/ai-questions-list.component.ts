import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from 'src/app/services/games/games.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';
import { Question } from 'src/app/services/questions/questions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ai-questions-list',
  templateUrl: './ai-questions-list.component.html',
  styleUrls: ['./ai-questions-list.component.scss']
})
export class AiQuestionsListComponent implements OnInit {

  
  @Input() gameObj: any;
  @Input() aiAssist: any;
  @Input() questionList: any;
  @Input() generatedCategories: any;
  @Input() generatedQuestionPayload: any;
  @Output() goToAiForm: EventEmitter<any> = new EventEmitter();
  @Output() questionAddedToGame: EventEmitter<any> = new EventEmitter();
  is_loading = false;
  is_question_adding = false;
  is_addMoreAPICompleted = false;
  messageForMaxQuestionsGenerated = false;
  // stopPolling = false;
  categories = [];
  numberOfquestionTogenerate = 10;
  // gameInterval;
  messageForLoading;
  messageForLoadingCompletion;
  categoryColors = [
    '#FD6669',
    '#FF8533',
    '#19CAB0',
    '#0BA8DC',
    '#954AF4'
  ];
  showMoreWaitText =false;
  aiAddMoreQuestionsSubscription;
  isAddGenerateQuestionSuccess = false;
  selectedChip = -1;
  checked = true;
  selectCategory;  
  dataSource;
  compnayObject;
  aiAssist_type;
  displayedColumns = ['select', 'question' , 'answer'];
  selection = new SelectionModel<Question>(true, []);
  isMobile = false;
  @HostListener('window:resize', ['$event'])
  showRetryBox = false;
  noMoreQuestionToGenerate = false;
  maxQuestions = [
    {
    id: 1,
    title: "1"
    },
    {
      id: 2,
      title:"2"
    },{
      id: 3,
      title:"3"
    },{
      id: 4,
      title:"4"
    },{
      id: 5,
      title:"5"
    },{
      id: 6,
      title:"6"
    },{
      id: 7,
      title:"7"
    },{
      id: 8,
      title:"8"
    },{
      id: 9,
      title:"9"
    },{
      id: 10,
      title:"10"
    }      
  ]
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  constructor(public translate: TranslateService,
    public storageService: StorageService,
    public snackBar: MatSnackBar,
    public globalService: GlobalService,
    public dialogRef: MatDialogRef<any>,
    public apiService: ApiService,
    public dialog: MatDialog,
    private gamesService: GamesService) { 
    this.compnayObject = this.storageService.getCompany();
    this.aiAssist_type = this.compnayObject.ai_type;
    console.log('compnayObject',this.compnayObject)
    }
  ngOnInit(): void {
    console.log(this.gameObj);
    console.log(this.aiAssist);
    console.log(this.questionList);
    console.log(this.generatedCategories);
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
      if(this.gameObj.categories.length > this.aiAssist.categories_count){
        const categories = this.gameObj.categories; 
        this.categories = categories.slice(0, this.aiAssist.categories_count);
        this.generatedCategories = this.generatedCategories.slice(0, this.aiAssist.categories_count);
        let secondPart = categories.slice(this.aiAssist.categories_count); 
        // remove questions which are having categories from secondpart array in questionList
        secondPart.forEach((category) => {
          this.questionList = this.questionList.filter((question) => {
            return question.category !== category.name;
          });
        });        
      }else{
        this.categories = this.gameObj.categories // add here categories from API 
      }  
      this.dataSource = new MatTableDataSource(this.questionList);         
      this.toggleAllRows();
    // }
  }
  backToAIFormPopUp(){
    this.goToAiForm.emit(true);      
  }

  closePopUp() {
    if (this.dialogRef) {
      // if(this.gameInterval){
      //   clearInterval(this.gameInterval)
      // }
      this.dialogRef.close();
    }
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  addToGame(){
    // console.log(this.selection.selected);
    // this.gameObj.questions = this.selection.selected;
    // this.closePopUp();
    this.globalService.addAdminGoogleEvent('AI_Add_To_Game_Clicked');
    this.addQuestions();
  }

  getQuestionCount(category = null) {    
    category = category && category.length ? category[0] : category;
    if (category && this.questionList && this.questionList.length > 0) {      
      // const questionCount = this.questionList.filter((categoryData) => {        
      //   return categoryData.category === category.name;
      // });
      const questionCount = this.selection.selected.filter((categoryData:any) => {        
        return categoryData.category === category.name;
      });
      return questionCount.length;
    } else {
      return this.questionList.length;
    }
  }

  filterQuestionList(i){
    
    this.selectedChip = i;
    if(i === -1){
      this.dataSource = new MatTableDataSource(this.questionList);
    }else{
      const category = this.gameObj.categories[i];
      console.log(category)
      const dataSource = this.questionList.filter((question) => {
        return question.category === category.name;
      });
      console.log(dataSource)
      this.dataSource = new MatTableDataSource(dataSource);
    }
  }

  setSelectCategory(cat,index = null){
    this.globalService.addAdminGoogleEvent('AI_Category_Changed');
    if(cat){
      this.selectCategory = cat;
      this.selectCategory['index'] = index;
    }else{
      this.selectCategory = cat;
    }
  }

  addQuestions() {
    // this.loading = true;
    this.is_question_adding = true;  
    const payload = {
      game_type: 1,
      company_id: this.storageService.getCompanyId(),
      game_id:this.gameObj.game.game_id,           
      lang_id :this.gameObj.game.lang_id
    };    
    console.log(this.selection.selected)
    if(this.aiAssist.categories_count == -2){
      payload['categories'] = [this.selectCategory.name];
      this.selection.selected.filter((question) => {    
        question['category'] = this.selectCategory.name;
      });
      payload['questions'] = this.selection.selected;
      
    }else{
      payload['categories'] = this.generatedCategories;
      payload['questions'] = this.selection.selected;
    }
    // console.log(this.selection.selected)
    // console.log(payload)   
    if(this.selection.selected.length){
      this.globalService.addGoogleEvent('AI_Selected_Questions_count' , 'AI Assist', this.selection.selected.length, '');   
    }
    if(this.selection.selected.length){      
      const deselectedCount = this.questionList.length - this.selection.selected.length;
      if(deselectedCount){
        this.globalService.addGoogleEvent('AI_Dselected_Questions_count' , 'AI Assist', this.selection.selected.length, '');   
      }
    }
    this.gamesService.aiAddQuestions(payload).subscribe(res => {

      this.is_question_adding = false;
      if (!res.success) {
        return;
      }
      if (res.success) {  
        const object = {
          success: true,
          questionCount: this.selection.selected.length,
          categoriesCount: this.generatedCategories.length
        }                              
        this.questionAddedToGame.emit(object);        
      } 
      
    });
  }
  menuOpened() {
    this.globalService.addAdminGoogleEvent('AI_select_question_counttobe_generated');
  }

  addMoreQuestion(){
    this.noMoreQuestionToGenerate = false;
    this.showMoreWaitText = false;
    this.messageForLoading = '';
    console.log('generatedQuestionPayload',this.generatedQuestionPayload)
    this.globalService.addAdminGoogleEvent('AI_Add_More_Questions');    
    // remove name from this.categories into array    
    if(this.numberOfquestionTogenerate == 1){
      this.messageForLoading = this.translate.instant('messageForLoadingSingleText').replace('%d', this.numberOfquestionTogenerate);
      this.messageForLoadingCompletion = this.translate.instant('messageForLoadingSingleCompletion').replace('%d', this.numberOfquestionTogenerate);
    }else{
      this.messageForLoading = this.translate.instant('messageForLoadingText').replace('%d', this.numberOfquestionTogenerate);
      this.messageForLoadingCompletion = this.translate.instant('messageForLoadingCompletion').replace('%d', this.numberOfquestionTogenerate);
    }

    if(this.aiAssist.categories_count == -2){
      this. messageForLoading = this.messageForLoading.replace('each','selected');      
      this. messageForLoadingCompletion = this.messageForLoadingCompletion.replace('each','selected');      
    }
    this.generatedQuestionPayload.max_question = this.numberOfquestionTogenerate;
    const categories = this.categories.map((category) => {
      return category.name;
    });
    console.log('categories',categories)
    console.log('generatedQuestionPayload',this.generatedQuestionPayload)
    this.generatedQuestionPayload['categories'] = categories;
    this.is_loading = true;
    const payload = {
      "companyId":this.generatedQuestionPayload.companyId,
      "managerId":this.generatedQuestionPayload.managerId,
      "gameId":this.generatedQuestionPayload.gameId,
      "topic":this.generatedQuestionPayload.topic,
      "maxQuestion":this.generatedQuestionPayload.max_question,
      "categoriesCount":this.generatedQuestionPayload.categoriesCount,
      "threadId": this.generatedQuestionPayload.threadId,
      "categories":this.generatedQuestionPayload.categoriesCount == -1 ? [] : this.generatedQuestionPayload.categories
      }

  this.stopCurrentRequest();
  // return;
   this.aiAddMoreQuestionsSubscription = this.gamesService.aiGenerateAddQuestions(payload).subscribe(res => {
    this.isAddGenerateQuestionSuccess = true;
      if (!res.success) {   
        this.is_loading = false;
        // this.dialogRef.close();
        if (res.message_code === 'AI_NOT_ENABLE_ERROR') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_NOT_ENABLE_ERROR'));    
        }else if (res.message_code === 'AI_TOKEN_NOT_SET_ERROR') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_TOKEN_NOT_SET_ERROR'));    
        }else if (res.message_code === 'AI_TOKEN_EXHAUSTED_ERROR') {
          this.globalService.showAlert(this.translate.instant('No_More_Credits'), this.apiService.getErrorMessage('AI_TOKEN_EXHAUSTED_ERROR'));    
        }else if (res.message_code === 'AI_LESS_CONTENT_TOGENERATE') { 
          // log error for ai assist error AI_LESS_CONTENT_TOGENERATE cases. 
          this.logAiAssistError(res?.data?.recommendation);

          const errorTitle = this.translate.instant("somethingWentWrongTitle")
          const errorDescription = res?.data?.reason ? res?.data?.reason : this.apiService.getErrorMessage('AI_LESS_CONTENT_TOGENERATE');
          this.globalService.showAlert(errorTitle, errorDescription);
        }else if (res.message_code === 'AI_INVALID_RES') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_INVALID_RES'));
        }
        else if (res.message_code === 'AI_REQUEST_TIMEOUT') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_REQUEST_TIMEOUT'));              
          this.aiAddMoreQuestionsSubscription.unsubscribe();
          this.aiAddMoreQuestionsSubscription = null;
        } 
        else if (res.message_code === 'AI_REQUEST_RUN_ERROR') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_REQUEST_RUN_ERROR'));              
          this.aiAddMoreQuestionsSubscription.unsubscribe();
          this.aiAddMoreQuestionsSubscription = null;
        } else if (res.message_code === 'AI_MAX_QUESTIONS_GENERATED'){
          this.messageForMaxQuestionsGenerated = true;          
          this.messageForLoadingCompletion = this.translate.instant('messageForMaxQuestionsGenerated');
          setTimeout(() => {
            this.messageForMaxQuestionsGenerated = false;
            this.messageForLoadingCompletion = '';
          },2000);
        }
        else{
          // if(this.gameInterval){
          //   clearInterval(this.gameInterval)
          // }
          // this.dialogRef.close();
        }
      }else if(res.success){  
        this.is_loading = false;
        this.is_addMoreAPICompleted = true;
          setTimeout(() => {
            this.is_addMoreAPICompleted = false;
          },2000);          
          this.appendQuestionToList(res.data);
        // this.stopPolling = false;
        // this.generateQuestionPolling(res.data.polling_identifier)
      } 

      this.aiAddMoreQuestionsSubscription.unsubscribe();
      this.aiAddMoreQuestionsSubscription = null;
      
    });

  }

  stopCurrentRequest(){

    setTimeout(() => {
      this.showMoreWaitText = true;
      this.messageForLoading = this.translate.instant('moreWaitText')
    },45000)
    // },5000)

    setTimeout(() => {     
      console.log('time',this.aiAddMoreQuestionsSubscription) 
      if(this.aiAddMoreQuestionsSubscription && !this.isAddGenerateQuestionSuccess){
        console.log('time12',this.aiAddMoreQuestionsSubscription)
        this.showRetryBox = true;
        this.is_loading = false;
        this.aiAddMoreQuestionsSubscription.unsubscribe();
        this.aiAddMoreQuestionsSubscription = null;
      }
    },90000);
    // },5000);
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  stopGeneratingAPI(){
    
      // if(this.aiAddMoreQuestionsSubscription && !this.isAddGenerateQuestionSuccess){
      if(this.aiAddMoreQuestionsSubscription){
        // console.log('time12',this.aiAddMoreQuestionsSubscription)
        // this.showRetryBox = true;
        // this.is_loading = false;
        this.aiAddMoreQuestionsSubscription.unsubscribe();
        this.aiAddMoreQuestionsSubscription = null;
      }    
    // },5000);
  }

  retryBtn(){
    this.showRetryBox = false;
    this.isAddGenerateQuestionSuccess = false;
    this.addMoreQuestion();
  }

  closeRetry(){
    this.showRetryBox = false;
    this.isAddGenerateQuestionSuccess = false;
  }
  
  closeError(){
    this.noMoreQuestionToGenerate = false;
  }
  
  appendQuestionToList(response) {
    const addedQuestionsList = response.questions;
        // const response = res.data;
        console.log('dadasd',this.aiAssist.categories_count)
        if(this.aiAssist.categories_count == -2){
          console.log('in hereeeee')
          addedQuestionsList.forEach((question) => {
            this.questionList.push(question);
            
          })
          this.dataSource.data = this.questionList;
        }else{
          addedQuestionsList.forEach((question) => {
            this.categories.forEach(item =>{
                if(item.name === question.category){
                  this.questionList.push(question);
                }
            })
          });
          this.dataSource.data = this.questionList;
        }
        // this.toggleAllRows();
        addedQuestionsList.forEach((question) => {          
          this.selection.select(question);
        });                        
  }


  stopGenerating(){
    this.is_loading = false;
    this.stopGeneratingAPI();
    // this.stopPolling = true;
    // clearInterval(this.gameInterval);  
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = 'OK';
  }
  
  addQuestionSelected(question){
    console.log(question)
    this.numberOfquestionTogenerate = question.id
  }

  disableButton(){    
    if(this.is_loading){
      return true;
    } else if(this.selection && this.selection.selected.length == 0){
    return true;
  }
    
  }

  disableButtonNoCategory(){    
    if(this.is_loading){
      return true;
    } else if(!this.selectCategory || this.selection && this.selection.selected.length == 0){
    return true;
  }
    
  }

  isAddMoreQuestionDisabled(): boolean {
    return this.is_loading;
  }

  private logAiAssistError(recommendation: any): void {
    const eventName = recommendation 
      ? 'AI_Assist_Insufficient_Content' 
      : 'AI_Assist_topic_mismatch';
    this.globalService.addAdminGoogleEvent(eventName);
  }
}
