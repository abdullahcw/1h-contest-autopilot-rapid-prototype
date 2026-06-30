import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CompanyService } from 'src/app/services/company/company.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UploaderService } from 'src/app/services/uploader/uploader.service';
import { CropImageComponent } from 'src/app/shared/crop-image/crop-image.component';
import { FileHandle } from 'src/app/util/drag-drop/drag-drop.directive';
import { environment } from 'src/environments/environment';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { NotificationsService } from 'src/app/services/notifications/notifications.service';
import { GlobalService } from 'src/app/services/global/global.service';
const DATE_FORMAT: any = 'yyyy-MM-dd';
import { DatePipe } from '@angular/common';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import moment from 'moment-timezone';
@Component({
  selector: 'app-add-edit-alert',
  templateUrl: './add-edit-alert.component.html',
  styleUrls: ['./add-edit-alert.component.scss']
})
export class AddEditAlertComponent implements OnInit {

  ALERT_TYPE = {
    GAME: 'GAME_ALERT',
    GENERAL: 'GENERAL_ALERT',    
  }
  croppedImage = {
    'path': '',
    'blob': null
  };
  is_loading = false
  currentDate = new Date();
  companiesToBeDisplayed = [];
  actionList = [];
  fetchingCompanies = false;
  fetchingTypeAlerts = false;
  isDatePickerOpen = false;
  today = new Date();
  is_image_changed = false;
  alert = {
    alert_id : null,
    selectedAlertType : this.ALERT_TYPE.GAME,
    selectedActionId : '',
    start_date:this.currentDate,
    end_date:this.currentDate,
    header_text:'',
    body_text:'',
    callToActionBtnTxt:'',
    push_notification : 1,
    companies:[],
    // files: null,
    // fileName: null,
    action_title: null,
    imageSrc: null,
    imageURL: null,
    is_all: true,
    is_processed: false,
    
  }
  // @Input() alertData: any;
  @Output() redirectToAlerts: EventEmitter<any> = new EventEmitter();
  showCompanies = false;
  endDateText;
  constructor(public translate: TranslateService,
    private notificationService: NotificationsService,
    private dialog: MatDialog,
    private globalService: GlobalService,
    private uploaderService: UploaderService,
    public storageService: StorageService,
    public apiService: ApiService,
    private datePipe: DatePipe,
    public getImageURLService:GetImageURLService,
    private companyService: CompanyService) { 

      const company = this.storageService.getCompany();
      this.showCompanies = company.is_1huddle_company;
    }
  ngOnInit(): void {
    
    if(this.notificationService.alert_id){
      // console.log(this.alertData)
      this.getAlertDetails(this.notificationService.alert_id);                    
    }else{
      this.getCompanyList();
      this.getCallToActionForGame();
    }
    
    this.endDateText = this.translate.instant('endDateText').replace('%d', moment(this.alert.end_date).format('MM/DD/YYYY'));
    // console.log(this.endDateText)
  }

  getAlertDetails(alert_id){
    this.is_loading = true;
    this.notificationService.getAlertsDetails(alert_id).subscribe((res) => {  
      
      const response: any = res;
      if (!response.success) {       
        return;
      }      
      this.alert.alert_id  = response.data.alert_details.alert_id;        
      this.alert.selectedAlertType  = response.data.alert_details.alert_type;        
      this.alert.start_date = new Date(response.data.alert_details.start_date);
      this.alert.end_date = new Date(response.data.alert_details.end_date);        
      this.alert.header_text = response.data.alert_details.header_text;        
      this.alert.body_text = response.data.alert_details.body_text;        
      this.alert.callToActionBtnTxt = response.data.alert_details.call_to_action_button_text;        
      this.alert.push_notification = response.data.alert_details.push_notification;        
      this.alert.is_all = response.data.alert_details.is_all;        
      const companies = response.data.alert_details.companies;   
   
      this.alert.is_processed = response.data.alert_details.is_processed;
      this.alert.action_title = response.data.alert_details.call_to_action;
      
      this.endDateText = this.translate.instant('endDateText').replace('%d', moment(this.alert.end_date).format('MM/DD/YYYY'));
      if(response.data.alert_details.game_banner){
        this.imageUrlUpdated(response.data.alert_details.game_banner);     
      }else{
        this.is_loading = false;  
      }
      this.is_loading = false;
      if(this.alert.selectedAlertType == 'GENERAL_ALERT'){
          this.getCallToAction(response.data.alert_details.action_id); 
      }else{
        this.getCallToActionForGame(response.data.alert_details.game_id);
      }
      this.getCompanyList(companies);     
      // console.log(response)
    });
  }
  onActionSelectionChanged(action) {
    // console.log(action)
    this.alert.selectedActionId = action;
    // console.log(this.alert.selectedActionId)
    this.actionList.forEach(element => {
      if(element.id == action){
        this.alert.action_title = element.title;
      }
    }) 
    if(this.alert.selectedAlertType == 'GENERAL_ALERT'){
      this.getCompanyList();   
    }   
  }
  onCompanySelectionUpdated(selectedCompanies) {
    // console.log(selectedCompanies)
    this.alert.companies = selectedCompanies;
  }


  prepareCompanies(companies, forceSelected = false) {
    this.companiesToBeDisplayed = [];
    companies.forEach(company => {
      this.companiesToBeDisplayed.push({ id: company.company_id, title: company.company_name, isSelected: forceSelected });
    });
    this.fetchingCompanies = false;
    if(forceSelected){
      this.alert.companies = this.companiesToBeDisplayed;
    }
  }

  filesDropped(files: FileHandle[]): void {
    // console.log(files);
    // this.files = files[0].file;
    // console.log(this.files)
    // this.fileName =  this.files.name;
    // const file = event.target.files[0];


    this.validateFile(files[0].file);
  }

  fileChangeEvent(event) {
    // console.log(event);
    // console.log(event.target.files);
    // console.log(event.target.files[0]);
    // // this.files = event.target.files[0];    
    // // this.fileName =  this.files.name;
    this.validateFile(event.target.files[0]);
  }

  validateFile(files){
    // console.log(files)    
    if (files.type.indexOf('png') === -1 && files.type.indexOf('jpg') === -1 && files.type.indexOf('jpeg') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('valid_img_format_msg'));
      return;
    }
    this.is_image_changed = true;
    const that = this;
    const fr = new FileReader();
    fr.onload = () => { // when file has loaded
      const img = new Image();
      img.onload = () => {        
        that.openCropper(files);
      };
      img.src = fr.result as string; // This is the data URL
    };
    fr.readAsDataURL(files);


    // this.isInvalidFileSize = false;
    // const reader = new FileReader();
    // reader.onload = e => this.alert.imageSrc = reader.result;
    // reader.readAsDataURL(files);

    // this.alert.files = files;
    // console.log(this.alert.files)
    // this.fileName =  this.files.name;
    // this.alert.fileName = this.alert.files.name;
    // this.uploadPdfEvent(this.alert.files)

  }

  startDateChange(){
    this.globalService.addAdminGoogleEvent('Start_Date_Selected');
  }
  endDateChange(){
    this.endDateText = this.translate.instant('endDateText').replace('%d', moment(this.alert.end_date).format('MM/DD/YYYY'));
    this.globalService.addAdminGoogleEvent('End_Date_Selected');
  }
  toggleChange(){
    this.globalService.addAdminGoogleEvent('Push_Notification_Changed');
  }
  openCropper(event) {
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event
    });
    dialogRef.componentInstance.aspectRatio = 16 / 9;
    dialogRef.componentInstance.maintainAspectRatio = true;
    dialogRef.componentInstance.fromAlertBaner = true;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log(result)
        this.alert.imageSrc = result.base64;
        // this.alert.fileName = this.alert.files.name;

        // this.contest_img = result.base64;
        // this.contest.contest_image_url = result.base64;        
        const imageName = `${this.storageService.getLoginUserID()}_${Date.now()}`;
        const companyIdentifier = this.storageService.getCompany().company_name.replace(/\s/g, '');
        const path = environment.env_name + '/' + companyIdentifier + `/company/alerts/${imageName}.jpg`;
        // console.log(path)
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        this.globalService.addAdminGoogleEvent('Game_Banner_selected');
        // this.uploadAsset();        
      }
    });
    dialogRef.componentInstance.title = this.translate.instant('add_alert_banner');
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

  clearFiles(){
    this.alert.imageSrc = null;
    // this.isInvalidFileSize = false;
    // this.isTextAreaNeeded = true
  }

  uploadAsset() {
    if (this.croppedImage.path) {
      const that = this;
      this.uploaderService.upload(this.croppedImage.path, this.croppedImage.blob, function (err, data) {
        if (!data) {
          // that.globalService.showMessage(that.translate.instant('problem_with_uploading_player_profile'));
          return;
        }
        // that.contest.contest_image_url = data.Location;
        const URL = `${data.Location}?t=${Date.now()}`;
        that.alert.imageURL = URL;                
        that.createAlert();        
      });
    }
  }

  getCompanyList(companies = null) {  
    this.fetchingCompanies = true;
    let isAllCompanies = false;
    // console.log(this.alert.selectedActionId)
    if(this.alert.selectedAlertType == 'GENERAL_ALERT'){
      if(+this.alert.selectedActionId == 3 ){
        isAllCompanies = true;
      }else{
        isAllCompanies = false;
      }
    }else {
      isAllCompanies = true;
    }
    this.companyService.getCompaniesListDetails(isAllCompanies).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.fetchingCompanies = false;
        return;
      }
      if (response.data) {
        this.prepareCompanies(res.data.company,this.alert?.is_all);
        if(this.alert?.alert_id && !this.alert.is_all){
          this.showSelectedCompaniesIDs(companies);          
        }        
      }
    });
  }

  showSelectedCompaniesIDs(companies){
    const selectedCompaniesObj = [];
    this.companiesToBeDisplayed.forEach(company => {
      companies.forEach(selectedCompany => {        
        if(company.id == selectedCompany){
          company.isSelected = true;
          selectedCompaniesObj.push(company);
        }
      });
    }
    );
    this.alert.companies = selectedCompaniesObj;

  }
  deleteImg(){    
    this.alert.imageSrc = null;
    this.alert.imageURL = null;
    this.is_image_changed = false;
  }

  getCallToAction(action_id = null) {  
    this.fetchingTypeAlerts = true;
    // const type = this.alert.selectedAlertType == this.ALERT_TYPE.GAME ? 'game' : 'general';
    // const type = this.alert.selectedAlertType == this.ALERT_TYPE.GAME ? 'game' : 'general';
    this.notificationService.getCallToAction('general').subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.fetchingTypeAlerts = false;
        return;
      }
      this.fetchingTypeAlerts = false;
      const callToactions = response.data.general_alerts;
      this.actionList = [];
      callToactions.forEach(element => {
        this.actionList.push({ id: element.id, title: element.alerts , subtitle : element.message  });
      });      
      if(this.alert.selectedAlertType == 'GENERAL_ALERT' && this.notificationService.alert_id && action_id){
        this.alert.selectedActionId = action_id;
      }

    });
  }


  getCallToActionForGame(game_id = null) {  
    this.fetchingTypeAlerts = true;    
    this.notificationService.getMarketplaceGames(17).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.fetchingTypeAlerts = false;
        return;
      }
      this.fetchingTypeAlerts = false;
      const callToactions = response.data.game_list;
      this.actionList = [];
      callToactions.forEach(element => {
        this.actionList.push({ id: element.game_id, title: element.game_name });
      });
      if(this.alert.selectedAlertType == 'GAME_ALERT' && this.notificationService.alert_id && game_id){
        this.alert.selectedActionId = game_id;
      }

    });
  }

  closePopUp() {
    this.globalService.addAdminGoogleEvent('Game_Alert_Cancel_Tab_Clicked');
    this.redirectToAlerts.emit();
  }
  navigateToCreateAlert(alert) {
    // console.log(alert)
    this.is_loading = true;
    if(this.is_image_changed){      
      this.uploadAsset();    
    }else{
      this.createAlert();
    }

  }

  playersRadioButtonCliked() {      
    // console.log(this.alert.selectedAlertType)
    this.alert.selectedActionId = null;
    if(this.alert.selectedAlertType == 'GAME_ALERT'){
      this.alert.is_all = true;
      this.globalService.addAdminGoogleEvent('Game_Alert_Radio_Button_Selected');
      this.getCallToActionForGame(); 
    }else if(this.alert.selectedAlertType == 'GENERAL_ALERT'){
      this.alert.is_all = false;
      this.globalService.addAdminGoogleEvent('General_Alert_Radio_Button_Selected');
      this.getCallToAction(); 
    }
    this.getCompanyList();
  }

  createAlert(){
    
    // console.log('in here',this.alert.alert_id)
    this.globalService.addAdminGoogleEvent('Game_Alert_Update_Tab_Clicked');
    if(this.alert.alert_id){
      this.updateAlert();
      return;
    }

    const payload = this.preparePayload();
    
    // console.log(payload)    
    this.notificationService.createAlert(payload).subscribe((res) => {     
      const response = res;     
      // console.log(response)
      this.is_loading = false
      if (!response.success) { 
        if (response.message_code == "ALERTS_DATE_ERROR") {
          this.globalService.showMessage(this.apiService.getErrorMessage('ALERTS_DATE_ERROR'));          
        }else if(response.message_code == "SHOP_DISABLE_ERROR") {
          this.globalService.showMessage(this.apiService.getErrorMessage('SHOP_DISABLE_ERROR'));          
        }
        return;
      }            
      if(response.message_code == 654752){
        this.globalService.showMessage(this.apiService.getErrorMessage('ALERTS_CREATED'));
        this.redirectToAlerts.emit();
      }
    });

  }

  updateAlert(){
    const payload = this.preparePayload();    
    if(this.alert.alert_id){
      payload['alert_id'] = this.alert.alert_id;
    }
    // console.log(payload)    
    this.notificationService.updateAlert(payload).subscribe((res) => {     
      const response = res;     
      // console.log(response)
      this.is_loading = false
      if (!response.success) {        
        if (response.message_code == 'ALERTS_DATE_ERROR') {
          this.globalService.showMessage(this.apiService.getErrorMessage('ALERTS_DATE_ERROR'));          
        }else if(response.message_code == "SHOP_DISABLE_ERROR") {
          this.globalService.showMessage(this.apiService.getErrorMessage('SHOP_DISABLE_ERROR'));          
        }
        return;
      }            
      if(response.message_code == 654753){
        this.globalService.showMessage(this.apiService.getErrorMessage('ALERTS_UPDATED'));
        this.redirectToAlerts.emit();
      }
    });

  }
  shouldDisableAction() {
    if(this.showCompanies == false){
      if(!this.alert.selectedActionId){
        return true;
      }
    } else if (!this.alert.selectedActionId || !this.alert.companies.length) {
      return true;
    }
    return false;
  }

  preparePayload(){
    // console.log(this.companiesToBeDisplayed)
    let isAll = false;
    let companies = [];
    if(this.showCompanies){
      isAll =  this.alert.companies.length === this.companiesToBeDisplayed.length ? true : false; 
    }
    
    if(this.showCompanies == false){
      const company_id = this.storageService.getCompanyId();
      companies.push(company_id);
    }else if(!isAll){
      companies = this.alert.companies.map(company => company.id);      
    }

    
    const loginUser = JSON.parse(this.storageService.getUser());
    const payload = {
      start_date: `${this.globalService.formatDateForPayload(new Date(this.alert.start_date))} 00:00:00`,
      end_date: `${this.globalService.formatDateForPayload(new Date(this.alert.end_date))} 23:59:59`,
      header: this.alert.header_text,
      body: this.alert.body_text.trim(),
      alert_type : this.alert.selectedAlertType == this.ALERT_TYPE.GAME ? 'GAME_ALERT' : 'GENERAL_ALERT',      
      banner_url: this.alert.imageURL,
      action_id : this.alert.selectedAlertType == 'GENERAL_ALERT' ? this.alert.selectedActionId : null,  
      title : this.alert.action_title,
      company_ids: isAll ? [] : companies,    
      is_all: isAll,
      created_by : loginUser.manager_id,
      game_id : this.alert.selectedAlertType == 'GAME_ALERT' ? this.alert.selectedActionId : null,
      push_notification_enable : this.alert.push_notification,
      action_button_text : this.alert.callToActionBtnTxt,
      company_id : this.storageService.getCompanyId()      
    }

    if(this.alert.selectedAlertType == this.ALERT_TYPE.GAME ){
      payload['category_id'] = 17;
    }
    // console.log(payload)
    return payload;
  }

  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    // console.log(relativePath)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      // console.log(data)        
      // that.contest.contest_image_url  = data;
      that.alert.imageURL = data;
      that.alert.imageSrc= data;      
    });  
  }
}
