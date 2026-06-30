import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GamesService } from 'src/app/services/games/games.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService, ErrorCode } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { FileHandle } from 'src/app/util/drag-drop/drag-drop.directive';
import { environment } from 'src/environments/environment';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { AnimationOptions } from 'ngx-lottie';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval,Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { PDFDocument } from 'pdf-lib';
import { FeatureFlagsService } from 'src/app/services/feature-flags/feature-flags.service';

@Component({
  selector: 'app-ai-assist',
  templateUrl: './ai-assist.component.html',
  styleUrls: ['./ai-assist.component.scss']
})
export class AiAssistComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  options: AnimationOptions = {
    path: '/assets/animation_json/aiAssistLoading.json',
    loop: true
  };
  
  is_loading = false;
  aiGenerateQuestionsSubscription;
  isGenerateQuestionSuccess = false;
  showRetryBox = false;
  textShowingPermission = true;
  showMoreWaitText = false;
  showPDFProcessing = false;
  private timerSubscription: Subscription | null = null;  
  selectedCateoryID;
  pdfProcessingInProgress = false;
  categoryColors = [
    '#FD6669',
    '#FF8533',
    '#19CAB0',
    '#0BA8DC',
    '#954AF4'
  ];
  isMobile = false;
  isTextAreaNeeded = true;
  pdfNameWithText;
  threadId = null;
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
  loading = false;
  categoryCountList = [];
  showAIAssistPlusBaner = false;
  isInvalidFileSize = false
  fileMoreThan2mb = false;
  // gameInterval;
  compnayObject;
  aiAssist_type;
  // file_id;
  noteDescription;
  pdfProcessSuccess = false;
  pdfProcessFailed = false;
  duration: number = 180; // Default duration in seconds
  remainingTime: number = 0;
  processPDFFileSubscription;
  @Input() gameObj: any;
  @Input() aiAssist: any;
  @ViewChild('aiAssistDetails', { static: true }) aiAssistDetails: NgForm;
  @Output() goToQuestions: EventEmitter<any> = new EventEmitter();
  @Output() questionObj: EventEmitter<any> = new EventEmitter();
  @Output() changePopUpTitle: EventEmitter<any> = new EventEmitter();
  // constructor(@Inject(MAT_DIALOG_DATA) public gameObj: any,  
  constructor(  
  public uploaderService: UploaderService,
  public globalService: GlobalService,
  public translate: TranslateService,
  public storageService: StorageService,
  private gamesService: GamesService,
  public apiService: ApiService,
  public dialog: MatDialog,
  public snackBar: MatSnackBar,
  private featureFlagsService: FeatureFlagsService,
  public dialogRef: MatDialogRef<any>) { 

    this.compnayObject = this.storageService.getCompany();
    this.aiAssist_type = this.compnayObject.ai_type;
    console.log('compnayObject',this.compnayObject ,this.aiAssist_type)
    if(this.aiAssist_type == 'AI_ASSIST_PLUS'){
      this.noteDescription = this.translate.instant('noteDescription').replace('%s', 'AI Assist+');
    }else{
      this.noteDescription = this.translate.instant('noteDescription').replace('%s', 'AI Assist');
    }
  }

  ngOnInit(): void {
    console.log(this.gameObj)
    this.prepareCategoryCountList();

    if(this.aiAssist.pdf_url){
      this.isTextAreaNeeded = false;
    }

    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
  }
  
  filesDropped(files: FileHandle[]): void {
    // console.log(files[0].file);
    const type = files[0].file.type;
    // console.log(this.files)
    // this.fileName =  this.files.name;
    if (type.indexOf('pdf') === -1 ) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('select_pdf'));
      return;
    }
    this.validateFile(files[0].file);
  }

  fileChangeEvent(event) {
    // console.log(event);
    console.log(event.target.files);
    // console.log(event.target.files[0]);
    // // this.files = event.target.files[0];    
    // // this.fileName =  this.files.name;
    const type = event.target.files[0].type;
    if (type.indexOf('pdf') === -1 ) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('select_pdf'));
      return;
    }
    this.validateFile(event.target.files[0]);
  }


  pdfFileReading(file): Promise<number> {
    return new Promise((resolve, reject) => {
      // const file: File = event.target.files[0];
  
      if (!file) {
        reject(new Error('No file selected.'));
        return;
      }
  
      const fileReader = new FileReader();
  
      fileReader.onload = async () => {
        try {
          // Load the PDF
          const pdfDoc = await PDFDocument.load(fileReader.result as ArrayBuffer,{ ignoreEncryption: true });
  
          // Get number of pages
          const totalPages = pdfDoc.getPageCount();
          // if(totalPages < 50){
          //   this.duration = 60;
          // }else{
          //   this.duration = 90;
          // }
          resolve(totalPages);
        } catch (error) {
          reject(error);
        }
      };
  
      fileReader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };
  
      fileReader.readAsArrayBuffer(file);
    });
  }
  validateFile(files){
    const imageSize = files.size / 1024 / 1024;    
    if (imageSize && imageSize > 2 && this.aiAssist_type == 'AI_ASSIST') {
      this.isInvalidFileSize = true;
      this.showAIAssistPlusBaner = true;
      this.fileMoreThan2mb = true;      
      this.changePopUpTitle.emit(true);
      this.globalService.addAdminGoogleEvent('AI_PDF_Morethan_2MB');
      // this.globalService.showMessage(this.translate.instant('failedToUploadFile'));        
      // console.log('file is bigger than 2 MB');
      return;
    }else if(imageSize && imageSize > 10 && this.aiAssist_type == 'AI_ASSIST_PLUS'){
      this.isInvalidFileSize = true
      // console.log('file is bigger than 10 MB');
      return;
    }else {
      this.is_loading = true;
      this.pdfFileReading(files)
    .then((totalPages) => {
      console.log(`Total number of pages: ${totalPages}`);      
      this.globalService.addAdminGoogleEvent('AI_PDF_Pages_Count');
      this.is_loading = false;
      if(totalPages > 100){
        this.globalService.showAlert(this.translate.instant('pdfErrorTitle'), this.apiService.getErrorMessage('AI_PDF_PAGES_LIMIT'));    
        return;
      }else{
        this.callToUploadFunction(files);
      }
    })
    .catch((error) => {
      console.error('Error reading PDF:', error.message);
      this.callToUploadFunction(files);
    });
      
    }
    // this.fileMoreThan2mb = false;
    // this.isInvalidFileSize = false;
    // this.aiAssist.files = files;
    // console.log(this.aiAssist.files)
    // // this.fileName =  this.files.name;
    // this.aiAssist.fileName = this.aiAssist.files.name;
    // this.uploadPdfEvent(this.aiAssist.files)

  }

  callToUploadFunction(files){
    this.fileMoreThan2mb = false;
    this.isInvalidFileSize = false;
    this.aiAssist.files = files;
    this.aiAssist.fileName = this.aiAssist.files.name;
    this.uploadPdfEvent(this.aiAssist.files)
  }
  
  preparePremiumCategoryList(count){
    switch(count){
      case 1:
          for(let i = 1; i <= count; i++){
              this.categoryCountList.push({
                id: i,
                title: i.toString(),
                is_premium : true,
              })
            }
        return;
      case 2:
          for(let i = 1; i <= count; i++){
              this.categoryCountList.push({
                id: i,
                title: i.toString(),
                is_premium : true,
              })
            }
        return;
      case 3:
        for(let i = 1; i <= count; i++){            
                this.categoryCountList.push({
                  id: i,
                  title: i.toString(),
                  is_premium : i == 1 ? false : true,
                })
              }      
        return;
      case 4:
        for(let i = 1; i <= count; i++){            
              this.categoryCountList.push({
                id: i,
                title: i.toString(),
                is_premium : i == 1 ? false : i == 2 ? false : true,
              })
            }
        return;
      case 5:
        for(let i = 1; i <= count; i++){            
              this.categoryCountList.push({
                id: i,
                title: i.toString(),
                is_premium : i == 1 ? false : i == 2 ? false : i == 3 ? false : true,
              })
            }
        return;
    }
  }
  prepareCategoryCountList(){
    let count = 5;
    if(this.gameObj.currentCategories.length){
      count = 5 - this.gameObj.currentCategories.length; 
    }
      // if(count > 0){
      //   for(let i = 1; i <= count; i++){
      //     this.categoryCountList.push({
      //       id: i,
      //       title: i.toString()
      //     })
      //   }
      // }
      console.log(count)
      this.categoryCountList = [];
      this.preparePremiumCategoryList(count);    
      console.log(this.categoryCountList);
      // this.categoryCountList.push({ id: -1, title: "None" });
      // code to add element to star of the arry
      this.categoryCountList.unshift({ id: -2, title: "None" });  
    
      if(this.categoryCountList.length == 6){
        this.aiAssist.categories_count = 1;
        this.aiAssist.categories_count_value = 1;
      }
    
  }

  backPopUp() {
    // clearInterval(this.gameInterval)
    this.loading = false;
    this.textShowingPermission = true;
    this.showRetryBox = false;
  }

  closePopUp() {
    // clearInterval(this.gameInterval)
    this.textShowingPermission = true;
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
  generateQuiz(aiAssist){
    console.log(aiAssist)
    this.textShowingPermission = false;
    // this.goToQuestions.emit(true);
    this.globalService.addAdminGoogleEvent('AI_Generate_Button_Clicked');
    console.log(this.aiGenerateQuestionsSubscription)    
    this.generateQuestions(aiAssist)
    
  } 

  

  onMaxQuestionChange(id) {
    if (id) {
      const foundObject = this.maxQuestions.find(obj => obj.id === id);      
      this.aiAssist.max_question = id;    
      this.aiAssist.max_question_value = +foundObject.title;       
      this.globalService.addGoogleEvent('AI_Categories_Selected' , 'AI Assist', +foundObject.title, '');  
    }
  }

  categoryCountSelected(category,index){
    if(this.categoryCountList.length == 6 && index == 0){
      return;
    }
    if(category){
      console.log(category)
      this.aiAssist.categories_count = category.id;  
      const foundObject = this.categoryCountList.find(obj => obj.id === category.id);
      console.log(foundObject)
      console.log(this.categoryCountList)      
      if(category.id > 0){
        this.aiAssist.categories_count_value = +foundObject.title;    
        this.globalService.addGoogleEvent('AI_Questions_Selected' , 'AI Assist', +foundObject.title, '');  
      }else{
        this.globalService.addGoogleEvent('AI_Questions_Selected' , 'AI Assist', 'none', '');  
        this.aiAssist.categories_count_value = "none";
      }
      
    }
  }  


  clearFiles(){
    this.aiAssist.files = null;
    this.aiAssist.pdf_url = null;
    this.isInvalidFileSize = false;
    this.isTextAreaNeeded = true;
    this.threadId = null;
  }

  stopProcessing(){
    this.globalService.addAdminGoogleEvent('AI_PDF_Processing_close');
    if(this.processPDFFileSubscription ){      
      this.processPDFFileSubscription.unsubscribe();
      this.processPDFFileSubscription = null;
    }
    this.showPDFProcessing = false;
    this.pdfProcessingInProgress = false;
    this.clearTimer();
    this.aiAssist.files = null;
    this.aiAssist.pdf_url = null;
    this.isInvalidFileSize = false;
    this.isTextAreaNeeded = true;
    this.threadId = null;
    this.pdfProcessSuccess = false;
    this.pdfProcessFailed= false;
  }


  uploadPdfEvent(file, selectedProfile = null) {
    this.pdfProcessingInProgress = true;
    const that = this
    const company = this.storageService.getCompany();
    const company_name = company['company_name'];
    const company_identifier = company_name.replace(/\s/g, '');
    const path = environment.env_name + '/' + company_identifier + '/company/' + this.gameObj.game.game_id + '/'
      + Date.now() + '.pdf';
    
    this.uploaderService.upload(path, file, function (err, data) {
      if (err) {
        this.pdfProcessingInProgress = false;
        return;
      }
      if (data) {
        const url = data.Location;
        console.log(url)
        that.aiAssist.pdf_url = url;   
        that.isTextAreaNeeded = false;
        that.showPDFProcessing = true;
        that.pdfNameWithText = that.translate.instant('pdfNameWithText').replace('%s', that.aiAssist.fileName);        
        that.startCountdown();
        that.processPDFFile(that.aiAssist.fileName);
      }else{
        this.pdfProcessingInProgress = false;
      }
    }, true, this.translate.instant('uploading'), 'application/pdf');
  }


  startCountdown() {
    this.remainingTime = this.duration;
    if (!this.timerSubscription) {
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.remainingTime > 0))
      .subscribe(() => this.remainingTime--);
    }
  }
  private clearTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
      this.remainingTime = 0;
    }
  }

  get formattedTime(): string {
    // const minutes = Math.floor(this.remainingTime / 60);
    // const seconds = this.remainingTime % 60;
    // return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    return `${minutes}m ${seconds}s`;
  }

  // private padZero(value: number): string {
  //   return value < 10 ? `0${value}` : value.toString();
  // }
  
  processPDFFile(documentName = null){
    this.pdfProcessSuccess = false;
    this.pdfProcessFailed = false;    
    this.pdfProcessingInProgress = true; 
    const pdfUrl = this.aiAssist.pdf_url ? this.aiAssist.pdf_url.split(`${environment.env_name}/`)[1] : '';
      const url = pdfUrl ? `${environment.env_name}/${pdfUrl}` : ''; 
      console.log('url',url);
    const payload = {
    
      filePath: url,
      // categoriesCount: this.aiAssist.categories_count ? this.aiAssist.categories_count : '',
      // topic: this.aiAssist.topic ? this.aiAssist.topic : '',
      companyId: this.storageService.getCompanyId(),
      documentName: documentName.replace('.pdf', '').substring(0, 70),
    };
    console.log(payload);    
    // return;
    this.processPDFFileSubscription = this.gamesService.processPDFFile(payload).subscribe(res => {
      // this.is_loading = false;       
      this.pdfProcessingInProgress = false;
      this.clearTimer();
      if (!res.success) {   
        if (res.message_code === 'AI_PDF_CONTENT_LONG') {          
          this.pdfProcessFailed = true;        
          this.pdfNameWithText = this.translate.instant('pdfContentIsTooLong');
          }else{

            this.pdfProcessFailed = true;        
            this.pdfNameWithText = this.translate.instant('pdfNameWithTextFailed').replace('%s', this.aiAssist.fileName);
          }
       return;
      }else if(res.success){     
        this.threadId = res.data.threadId;
        this.aiAssist.pdfId = res.data.pdfId;
        this.pdfProcessSuccess = true;        
        this.pdfNameWithText = this.translate.instant('pdfNameWithTextSuceess').replace('%s', this.aiAssist.fileName);        
      } 

      // setTimeout(() => {   
      //   this.showPDFProcessing = false; 
      //  },2000)
      
    });
  }
  generateQuestions(aiAssist) {
    this.loading = true;
    this.showMoreWaitText = false;
     let totalQuestions = 0;
      if(aiAssist.categories_count > 0){
          totalQuestions = aiAssist.max_question * aiAssist.categories_count;
      }else{
            totalQuestions = aiAssist.max_question;
      }
      
    // return;
    this.stopCurrentRequest();  
    // return;    
    // const payload = {
    //   topic: aiAssist.topic,
    //   text: aiAssist.detailedText,
    //   path: aiAssist.pdf_url,
    //   max_question: aiAssist.max_question_value,
    //   categories_count:aiAssist.categories_count < 0 ? -1 : aiAssist.categories_count_value,
    //   company_id: this.storageService.getCompanyId(),
    //   manager_id: this.storageService.getLoginUserID(),
    //   game_id:this.gameObj.game.game_id,
    //   file_id : this.file_id ? this.file_id : null 
    // };
      // const categoriesCount = this.categoryCountList.length == 6 ? 
      console.log('this.aiAssist',this.aiAssist)
      const pdfUrl = aiAssist.pdf_url ? aiAssist.pdf_url.split(`${environment.env_name}/`)[1] : '';
      const url = pdfUrl ? `${environment.env_name}/${pdfUrl}` : ''; 
      console.log('url',url);
      const payload = {
      // topic: aiAssist.topic,
      // text: aiAssist.detailedText,
      // path: aiAssist.pdf_url,
      // company_id: this.storageService.getCompanyId(),
      // manager_id: this.storageService.getLoginUserID(),
      // game_id:this.gameObj.game.game_id,
      // file_id : this.file_id ? this.file_id : null,
      
      gameId:this.gameObj.game.game_id,
      companyId: this.storageService.getCompanyId(),
      managerId: this.storageService.getLoginUserID(),
      topic: aiAssist.topic,
      text: aiAssist.detailedText,
      filePath: url,
      maxQuestion: aiAssist.max_question_value,
      categoriesCount:aiAssist.categories_count < 0 ? -1 : aiAssist.categories_count_value,
    }; 
    if(aiAssist.pdf_url){
      this.globalService.addAdminGoogleEvent('AI_Upload_PDF');
      payload['threadId'] = this.threadId
      payload['pdfId'] = this.aiAssist.pdfId
    }
    
    console.log(payload)    
    this.aiGenerateQuestionsSubscription = this.gamesService.aiGenerateQuestions(payload).subscribe(res => {      
      this.isGenerateQuestionSuccess = true;
      if (!res.success) {   
        this.loading = false;
        
        if (res.message_code === 'AI_NOT_ENABLE_ERROR') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_NOT_ENABLE_ERROR'));    
        }else if (res.message_code === 'AI_TOKEN_NOT_SET_ERROR') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_TOKEN_NOT_SET_ERROR'));    
        }else if (res.message_code === 'AI_TOKEN_EXHAUSTED_ERROR') {
          this.globalService.showAlert(this.translate.instant('No_More_Credits'), this.apiService.getErrorMessage('AI_TOKEN_EXHAUSTED_ERROR'));    
        }else if (res.message_code === 'AI_PDF_PAGES_LIMIT') {          
          this.globalService.showAlert(this.translate.instant('pdfErrorTitle'), this.apiService.getErrorMessage('AI_PDF_PAGES_LIMIT'));    
        
        }
        else if (res.message_code === 'AI_LESS_CONTENT_TOGENERATE') {
          // log event for ai assist error AI_LESS_CONTENT_TOGENERATE cases. 
          this.logAiAssistError(res?.data?.recommendation);

          const errorTitle = this.translate.instant("somethingWentWrongTitle")
          const errorDescription = res?.data?.reason ? res?.data?.reason : this.apiService.getErrorMessage('AI_LESS_CONTENT_TOGENERATE');
          this.globalService.showAlert(errorTitle, errorDescription);
          
        }
        else if (res.message_code === 'AI_PDF_IS_BLANK') {          
        this.globalService.showAlert(this.translate.instant('pdfErrorTitle'), this.apiService.getErrorMessage('AI_PDF_IS_BLANK'));    
        }
        else if (res.message_code === 'AI_INVALID_RES') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_INVALID_RES'));
        }
        else if (res.message_code === 'AI_REQUEST_TIMEOUT') {
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_REQUEST_TIMEOUT'));              
        }else if(res.message_code == 'AI_REQUEST_RUN_ERROR'){
          this.showAlert(this.translate.instant('error'), this.apiService.getErrorMessage('AI_REQUEST_RUN_ERROR'));    
          
        }
        else{
          // this.dialogRef.close();
        }
      }else if(res.success){     
        console.log(res.data)
        
        // payload['thread_id'] = res.data.thread_id;
        // response['generateQuestionPayload'] = payload;
        // this.goToQuestions.emit(true);
        // this.questionObj.emit(response);
        
              payload['threadId'] = res.data.threadId;
              res.data['generateQuestionPayload'] = payload;
              this.goToQuestions.emit(true);
              this.questionObj.emit(res.data);
        // this.generateQuestionPolling(res.data.polling_identifier,payload,totalQuestions)
      } 
      
    });
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }


  retryBtn(){
    this.showRetryBox = false;
    this.isGenerateQuestionSuccess = false;
    this.generateQuestions(this.aiAssist)
  }

  stopCurrentRequest(){
    setTimeout(() => {
      this.showMoreWaitText = true;
    },45000)
    // },5000)
    setTimeout(() => {
      if(this.aiGenerateQuestionsSubscription && !this.isGenerateQuestionSuccess){
        this.showRetryBox = true;
        this.loading = false;
        this.aiGenerateQuestionsSubscription.unsubscribe();
        this.aiGenerateQuestionsSubscription = null;
      }
    },90000)
    // },5000)
  }

  // generateQuestionPolling(pollingID,payload,totalQuestions) {
  //   let that;
  //   that = this;
  //   this.gameInterval = setInterval(function () {
  //     that.gamesService.aiGenerateQuestionsPolling(pollingID).subscribe((res) => {
  //       const response = res;
  //       if(!response.success){          
  //         if (response.message_code == 'CHATGPT_TIMEOUT'){            
  //           that.loading = false;
  //           clearInterval(that.gameInterval);  
  //           that.globalService.showMessage(that.apiService.getErrorMessage(response.message_code));        
  //         }else if(response.message_code == 'CHATGPT__POLLING_TIMEOUT'){
  //           that.loading = false;
  //           clearInterval(that.gameInterval);  
  //           that.globalService.showMessage(that.apiService.getErrorMessage(response.message_code));  
  //         }
  //         return;
  //       }
  //        if (response && response.data && response.data.polling_status === "COMPLETED") {
  //         that.loading = false;
  //         clearInterval(that.gameInterval);
  //           // that.goToQuestions.emit(true);
  //           // that.questionObj.emit(res.data);
  //           console.log('payload',payload);
  //           that.progressBarValue = 100;
  //           that.percentageCompletion = 100;
            
  //           setTimeout(() => {
  //             payload['thread_id'] = res.data.thread_id;
  //             response.data['generateQuestionPayload'] = payload;
  //             that.goToQuestions.emit(true);
  //             that.questionObj.emit(response.data);
  //           })
            
  //       }else{          
  //         const generatedQuestionCount = response && response.data && response.data.count;          
  //         const progressBarValue = (generatedQuestionCount * 100)/ totalQuestions;          
  //         that.progressBarValue = progressBarValue > 100 ? 100 : progressBarValue;
  //         that.percentageCompletion = Math.ceil(progressBarValue)          
  //       }
  //     });
  //   }, 5000);    
  // }
  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = 'OK';
  }

  showAIAssistPlusBanerInfo(clickFrom = null){  
    this.globalService.addAdminGoogleEvent('Locked_Category_Clicked');
    if(clickFrom == 'fromCat'){
      this.changePopUpTitle.emit('changePopupForCategory');
    }else{
      this.changePopUpTitle.emit(false);
    }
    this.fileMoreThan2mb = false;
    this.showAIAssistPlusBaner = !this.showAIAssistPlusBaner;
  }

  openRequest(){
    this.globalService.addAdminGoogleEvent('Request_Info');
    const layoutsize = 'width=580, height=500, top=40%, left=150px';
    window.open('mailto:support@1huddle.co?Subject=Hello%201Huddle%20Team');
  }
  complete(event) {
    // console.log(event);
    // this.hide = true;
    // this.cdRef.detectChanges()
  }

  // case 1 : insufficient content --> recommendation object will not null.
  // case 2 : topic mismatch --> recommendation object will null.
  private logAiAssistError(recommendation: any): void {
    const eventName = recommendation 
      ? 'AI_Assist_Insufficient_Content' 
      : 'AI_Assist_topic_mismatch';
    this.globalService.addAdminGoogleEvent(eventName);
  }
}
