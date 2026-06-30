import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-ai-game-builder',
  templateUrl: './ai-game-builder.component.html',
  styleUrls: ['./ai-game-builder.component.scss']
})
export class AiGameBuilderComponent implements OnInit {

  showAiFormUI = true;
  showQuestionListUI = false;
  aiAssist_title;
  aiAssistObj = {
    topic : "",
    detailedText : "",
    max_question:5,
    max_question_value:5,
    categories_count:-2,
    categories_count_value: 'none',
    pdf_url:null,
    pdfId:null,
    fileName:null,
    files:null,
  }
  is_loading = false;
  generatedQuestions;
  generatedCategoryList;
  generatedQuestionPayload;
  constructor(@Inject(MAT_DIALOG_DATA) public currentGameObj: any,
  public globalService: GlobalService,
  public storageService: StorageService,
  public translate: TranslateService,public dialogRef: MatDialogRef<any>,  ) { 

    const compnayObject = this.storageService.getCompany();
    const aiAssist_type = compnayObject.ai_type;
    this.aiAssist_title = aiAssist_type == 'AI_ASSIST' ? this.translate.instant('aiAssist_title') : this.translate.instant('ai_assist_plus');  
  }

  ngOnInit(): void {
  }

  changeQuestionList(event){
    this.showAiFormUI = false; 
    this.showQuestionListUI = true;
    this.aiAssist_title = this.translate.instant('aiAssist_review_title');
    
  }
  changeAiFormUI(event){
    console.log(this.aiAssistObj)
    this.aiAssist_title = this.translate.instant('aiAssist_title');
    this.showAiFormUI = true; 
    this.showQuestionListUI = false;
  }

  questionsFromAI(response){
    console.log(response)
    const categories = []
    if(response.categories.length){
      response.categories.forEach(element => {
        const cat = {
          game_id : this.currentGameObj.game.game_id,
          name:element,
          question_category_id : null
        }
        categories.push(cat)
      });
      
    }
    if(this.aiAssistObj.categories_count > 0){
      this.currentGameObj.categories = categories;
    }
    this.generatedQuestions = response.questions;
    this.generatedCategoryList = response?.categories;
    this.generatedQuestionPayload = response?.generateQuestionPayload;
    console.log(this.generatedQuestionPayload)
  }

  questionsAdded(obj){
    console.log(obj);
    let message;

    const text1 = obj.questionCount == 1 ? `${obj.questionCount} question` : `${obj.questionCount} questions`;
    const text2 = obj.categoriesCount == 1 ? `${obj.categoriesCount} category` : `${obj.categoriesCount} categories`;
    if(obj.categoriesCount == 0){
      message = this.translate.instant('aiQuestionAddedMessage2').replace('%d', obj.questionCount);
    }else{
      message = this.translate.instant('aiQuestionAddedMessage1').replace('%d', text1).replace('%s', text2);
    }
    this.globalService.showMessage(message);
    this.dialogRef.close(true);
  }

  changePopupTitleText(event){
    if(event == 'changePopupForCategory'){
      this.aiAssist_title = this.translate.instant('ai_upgrade_title_3');  
    }
    else if(event){
      this.aiAssist_title = this.translate.instant('FileTooLargeTitle');  
    }else{
      this.aiAssist_title = this.translate.instant('aiAssist_title');  
    }
  }
}
