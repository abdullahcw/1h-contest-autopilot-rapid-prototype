import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { CompanyService, ACCOUNT_TYPE, AI_ASSIST_TYPE } from 'src/app/services/company/company.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators, NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { DeleteCompanyComponent } from '../delete-company/delete-company.component';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { CropImageComponent } from '../../shared/crop-image/crop-image.component';
import { GlobalService } from 'src/app/services/global/global.service';
import { Route } from 'src/app/services/login/login.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { LocationService } from 'src/app/services/location/location.service';
import { Location, DatePipe } from '@angular/common';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ApiService, ErrorCode } from 'src/app/services/network/api.service';
import { AlertComponent } from '../alert/alert.component';
import { CompanyQRCodeComponent } from '../company-qrcode/company-qrcode.component';
import { MatRadioChange } from '@angular/material/radio';

const defaultLogoUrl = '/assets/img/default.png';
@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})

export class AddCompanyComponent implements OnInit {
  currentDate = new Date();
  company = {
    'company_logo': '',
    'company_id': '',
    'company_name': '',
    'company_slug': '',
    'industry': '',
    'web_app_url': '',
    'send_monthly_report': false,
    'clock_mandatory': false,
    'ai_game_builder': false,
    'ai_type':'AI_ASSIST',
    'ip_whitelisting': false,
    'pathway_insights': false,
    'engagement_insights': false,
    'is_ethnicity': false,
    'paywall_status': '',
    'paywall_start_date': this.currentDate,
    'paywall_end_date': this.currentDate,
    'csr_name': '',
    'csr_email': '',
    'sdr_name': '',
    'sdr_email': '',
    'players_limit': null,
    'managers_limit': null,
    'games_limit': null,
    'ai_token_limit': null,
    'location_details': {
      'location_id': '',
      'location_name': '',
      'country_id': '',
      'country_name': '',
      'state_id': '',
      'state_name': '',
      'tz_id': '',
      'tz_name': '',
      'city': '',
      'department_list': null,
      'head_location': true,
    }
  };
  companyStastics = {
    'managers': 0,
    'players': 0,
    'games': 0,
    'ai_token_consumed': 0,
  };
  @ViewChild('companyForm', { static: true }) companyForm: NgForm;
  @ViewChild('imgInput') imgInput;
  @Output() addCompanyPageLoading = new EventEmitter();
  items = [{ id: 0, title: 'abc' },
  { id: 1, title: 'xyz' },
  { id: 2, title: 'pqr' },
  { id: 3, title: 'def' }];

  btn_text = '';
  logo = defaultLogoUrl;
  timeZoneList = [];
  statesList = [];
  countries = [];
  states = [];
  ai_token_limit_current_value;
  loader = false;
  countriesList = [];
  croppedImage = {
    'path': '',
    'blob': null
  };
  showInputAI = false;
  companyPermission: any = {};
  is_loading: boolean;
  show_ethinicity = true;
  country;
  state;
  timezone;
  companyId: any = 0;
  fetchingCountries = false;
  fetchingStates = false;
  fetchingTimezones = false;
  isActive = false;
  fullUrl: string;
  subUrl: string[];
  webAppUrl: string;
  nextpage = false;
  isDatePickerOpen = false;
  action = false;
  today;
  selectedAccountType;
  isRequired: boolean = false;
  accountType: typeof ACCOUNT_TYPE;
  aiAssistType: typeof AI_ASSIST_TYPE;
  role = Role;
  compnayObject;
  constructor(public activatedRoute: ActivatedRoute,
    public router: Router, public companyService: CompanyService, public permissionService: PermissionsService,
    public snackBar: MatSnackBar, public dialog: MatDialog, public translate: TranslateService, public locationService: LocationService,
    public globalService: GlobalService, private storageService: StorageService, public apiService: ApiService,
    public headerService: HeaderService, private location: Location, private datePipe: DatePipe
    , public breadcrumbService: BreadcrumbsService) {
    this.activatedRoute.queryParams.subscribe((res) => {
      this.companyId = res['id'];
    });

    this.accountType = ACCOUNT_TYPE;
    this.aiAssistType = AI_ASSIST_TYPE
  }

  company_name = new FormControl('', [Validators.required, Validators.pattern('/^[A-Za-z0-9\-]*')]);

  ngOnInit() {
    if (!this.companyId) {
      this.companyId = this.storageService.getCompanyId();
    }
    this.compnayObject = this.storageService.getCompany();

    // tslint:disable-next-line:triple-equals
    if (this.companyId && this.companyId != 0) {
      this.fetchCompanyDetails();
      this.fetchCompnayStatistics();
    } else {
      this.getTimeZone();
      this.getCountries();
      this.company.location_details.location_name = 'HEADQUARTERS';
      // Update breadcrumbs
      this.breadcrumbService.updateBreadcrumbLabel(this.translate.instant('add_new'));
      this.defaultStartDate();
      this.company['ai_token_limit'] =this.compnayObject.default_ai_token_limit;
    }

    // Hide Company search from Header
    this.headerService.showCompanyFilter(false);
    this.setCompanyPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setCompanyPermission();
    });
  }
  defaultStartDate() {
    this.today = new Date();
    this.company.paywall_start_date = this.today;
    this.company.paywall_end_date = null;
  }
  gotonextpage() {
    this.nextpage = true;
  }
  gotopreviouspage() {
    this.nextpage = false;
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset company search filter visibility
    this.headerService.showCompanyFilter(true);
    this.companyService.selectedCompany = null;
  }
  markedasTouchedForDate(key) {
    this.companyForm.controls[key].markAsTouched();
  }
  markedasTouched(key) {
    this.companyForm.controls[key].markAsTouched();
  }
  getErrorMessage() {
    return this.company_name.hasError('company_name') ? this.translate.instant('invalid_email') :
      this.company_name.hasError('required') ? this.translate.instant('invalid_name') : this.translate.instant('no_specialchar_allowed');
  }

  setCompanyPermission() {
    this.companyPermission = this.permissionService.getPermissions(PermissionsKey.COMPANY);
  }
  fetchCompnayStatistics() {
    this.is_loading = true;
    this.companyService.getCompnayStatistics(this.companyId).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;

      if (!response.success) {
        this.showMessage(this.translate.instant('problem_fetching_company_stastics'));
        return;
      }
      this.companyStastics = response.data.company_paywall_statistics;
    });
  }

  fetchCompanyDetails() {
    this.is_loading = true;
    this.companyService.getCompanyDetails(this.companyId).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.showMessage(this.translate.instant('problem_fetching_company_details'));
        return;
      }
      const locationDetails = this.company.location_details;
      this.company = response.data.company_details;
      this.company.location_details = this.company.location_details ? this.company.location_details : locationDetails;
      this.company.paywall_start_date = this.checkDateEmpty(response.data.company_details.paywall_start_date);
      this.company.paywall_end_date = this.checkDateEmpty(response.data.company_details.paywall_end_date);
      this.company.managers_limit = this.checkForEmpty(response.data.company_details.managers_limit);
      this.company.players_limit = this.checkForEmpty(response.data.company_details.players_limit);
      this.company.games_limit = this.checkForEmpty(response.data.company_details.games_limit);
      
      if(response.data.company_details.ai_token_limit == -1)
      {
        this.company.ai_token_limit = this.compnayObject.default_ai_token_limit;
        this.ai_token_limit_current_value = this.compnayObject.default_ai_token_limit;
      }else{
        this.ai_token_limit_current_value = response.data.company_details.ai_token_limit;
        this.company.ai_token_limit = this.checkForEmpty(response.data.company_details.ai_token_limit);
      }
      this.company.clock_mandatory = response.data.company_details.clock_mandatory;
      this.company.ai_game_builder = response.data.company_details.ai_game_builder;
      this.company.ip_whitelisting = response.data.company_details.ip_whitelisting;
      this.company.pathway_insights = response.data.company_details.pathway_insights;
      this.company.engagement_insights = response.data.company_details.engagement_insights;
      this.action = response.data.company_details.paywall_status === 'ACTIVE' ? true : false;
      this.selectedAccountType = response.data.company_details.account_type;
      this.company.ai_type = response.data.company_details.ai_type;
      this.logo = this.company.company_logo;
      this.show_ethinicity = this.company.is_ethnicity;
      this.getTimeZone();
      this.getCountries();
      if (this.company.location_details.country_id) {
        this.getStates(this.company.location_details.country_id);
      }
      // Update breadcrumbs
      this.breadcrumbService.updateBreadcrumbLabel(this.company.company_name);
    });
  }
  checkDateEmpty(p_date) {
    return (p_date != '0000-00-00 00:00:00') ? this.globalService.convertDateForRangeSlider(p_date) : null;
  }
  checkForEmpty(val) {
    return val === -1 ? null : val;
  }

  addCompany() {
    this.is_loading = true;
    if (this.croppedImage.path) {
      const that = this;
      this.companyService.uploadCompanyLogo(this.croppedImage, function (this, path) {
        if (!path) {
          that.showMessage(this.translate.instant('problem_with_uploading_company_logo'));
          return;
        }
        that.company.company_logo = path;
        that.addCompanyDetails();
      });
    } else {
      this.addCompanyDetails();
    }
  }

  addCompanyDetails() {
    if (!this.selectedAccountType) {
      this.isRequired = true;
      this.is_loading = false;
      return;
    }
    const companyPayload = this.createCompanyPayload();
    this.companyService.addCompany(companyPayload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (ErrorCode[response.message_code]) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        } else {
          this.showMessage(this.translate.instant('failed_to_add_company'));
        }
        return;
      }
      this.companyService.notifiyCompanySearchModule();
      this.showMessage(this.translate.instant('company_added'));
      this.navigateToCompanyList();
    });
  }

  createCompanyPayload() {
    let companyPayload = {
      'company_id': this.company.company_id,
      'company_name': this.company.company_name,
      'company_slug': this.company.company_slug,
      'logo_url': this.company.company_logo,
      'country_id': this.company.location_details.country_id,
      'state_id': this.company.location_details.state_id || 0,
      'city': this.company.location_details.city,
      'location_id': this.company.location_details.location_id,
      'location_name': this.company.location_details.location_name,
      'tz_id': this.company.location_details.tz_id,
      'industry': this.company.industry,
      'send_monthly_report': this.company.send_monthly_report,
      'clock_mandatory': this.company.clock_mandatory,
      'ai_game_builder': this.company.ai_game_builder,
      'pathway_insights': this.company.pathway_insights,
      'ai_type': this.company.ai_type,
      'ip_whitelisting': this.company.ip_whitelisting,
      'engagement_insights': this.company.engagement_insights,
      'is_ethnicity': this.company.is_ethnicity,
      'paywall_status': this.action ? 'active' : 'inactive',
      'paywall_start_date': this.checkDateNull(this.company.paywall_start_date),
      'paywall_end_date': this.checkDateNull(this.company.paywall_end_date),
      'account_type': this.selectedAccountType,
      'csr_name': this.company.csr_name,
      'csr_email': this.company.csr_email,
      'sdr_name': this.company.sdr_name,
      'sdr_email': this.company.sdr_email,
      'managers_limit': this.checkEmpty(this.company.managers_limit),
      'players_limit': this.checkEmpty(this.company.players_limit),
      'games_limit': this.checkEmpty(this.company.games_limit),
      'ai_token_limit': this.checkEmpty(this.company.ai_token_limit),
    };
    return companyPayload = this.companyService.removeEmptyFields(companyPayload);
  }

  checkDateNull(paywallDate) {
    return (paywallDate != null) ? this.globalService.formatDateForPayload(new Date(paywallDate)) : null;
  }
  checkEmpty(num) {
    return (num == null || num === '') ? -1 : typeof num === 'string' ? +(num.replace(/,/g, '')) : num;
  }

  updateCompany() {
    this.is_loading = true;
    if (this.croppedImage.path) {
      const that = this;
      this.companyService.uploadCompanyLogo(this.croppedImage, function (this, path) {
        if (!path) {
          that.showMessage(this.translate.instant('problem_with_uploading_company_logo'));
          return;
        }
        that.company.company_logo = path;
        that.updateCompanyDetails();
      });
    } else {
      this.updateCompanyDetails();
    }
    


  }
  valueChange(event) {
    if (!this.company.company_id) {
      this.company.company_slug = event.replace(/\s/g, '');
    }
  }
  slugValueChange(event) {
    this.fullUrl = this.company.web_app_url;
    this.subUrl = this.fullUrl.split('/');
    this.company.company_slug = event.replace(/\s/g, '');
    this.webAppUrl = `${this.subUrl[2]}/${event}`;    
    if (this.subUrl[3] == event) {
      this.isActive = false;
    } else {
      this.isActive = true;
    }
  }
  updateCompanyDetails() {
    if (!this.selectedAccountType) {
      this.isRequired = true;
      this.is_loading = false;
      return;
    }
    const companyPayload = this.createCompanyPayload();
    this.companyService.updateCompany(companyPayload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'COMPANY_METRICS_LIMIT_EXCEEDED') {
          const dialogRef = this.dialog.open(AlertComponent, {
            data: event
          });
          dialogRef.componentInstance.message = this.apiService.getErrorMessage(response.message_code);
          dialogRef.componentInstance.title = this.translate.instant('error');
        } else if (ErrorCode[response.message_code]) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        } else {
          this.showMessage(this.translate.instant('failed_to_update_company_details'));
        }
        return;
      } else {
        this.globalService.showMessage(this.translate.instant('company_account_details_updated_msg'), 'right', 'bottom');
      }
      this.companyForm.form.markAsPristine();
      this.companyService.notifiyCompanySearchModule();
      // only for admin navigate to company page
      if (this.isAdmin()) {
        this.router.navigate([Route.COMPANY_PAGE]);
      }
    });
  }
  changedCheckbox(event, key) {
    console.log(event.checked, key);
    // if(key == 'ai_game_builder'){
    //   if(!this.company.ai_game_builder){
    //     this.company.ai_type = this.aiAssistType.AI_ASSIST;
    //   }
    // }
    if(event.checked){
      switch (key) {
        case 'clock_mandatory':
          this.globalService.addAdminGoogleEvent('Enable_Clock_Policy_true');
          break;
        case 'ai_game_builder':
          this.globalService.addAdminGoogleEvent('Change_AI_Assist_true');
          break;
        case 'ip_whitelisting':
          this.globalService.addAdminGoogleEvent('Change_IP_Configration_true');
          break;
        default:
          break;
      }
    }else if(!event.checked){
      switch (key) {
        case 'clock_mandatory':
          this.globalService.addAdminGoogleEvent('Enable_Clock_Policy_false');
          break;
        case 'ai_game_builder':
          this.globalService.addAdminGoogleEvent('Change_AI_Assist_false');
          break;
        case 'ip_whitelisting':
          this.globalService.addAdminGoogleEvent('Change_IP_Configration_false');
          break;
        default:
          break;
      }
    
    }

  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  chackEmptyValue(event, keyName) {
    if (keyName === 'ai_token_limit') {
      event === '' ? this.company.ai_token_limit = null : this.company.ai_token_limit = event;
    }else if (keyName === 'players_limit') {
      event === '' ? this.company.players_limit = null : this.company.players_limit = event;
    } else {
      event === '' ? this.company.games_limit = null : this.company.games_limit = event;
    }
  }

  chackEmptyValueForAI(event, keyName) {
    console.log(keyName,event)
    if (keyName === 'ai_token_limit') {
      this.showInputAI = true;
      if(event == 0 || event == '' || event == null){
        this.company.ai_token_limit = this.ai_token_limit_current_value;
      }      
      else{
        event === '' ? this.company.ai_token_limit = null : this.company.ai_token_limit = event;
      }      
      setTimeout(() =>{
        this.showInputAI = false;
      })
    }
  }

  formatNumberAi(number) {
    if (number) {
      return number.toLocaleString('en-US');
    }
    return number;
  }

  commaSeparatedNumbersOnly(event, company, key) {
    const val = event.replace(/,/g, '');
    if (!(/^\d+$/.test(val))) {
      return false;
    }
    key === 'players_limit' ? this.company.players_limit = +val.toLocaleString('en-US')      
      : key === 'ai_token_limit' ?  this.company.ai_token_limit = +val.toLocaleString('en-US') 
      : this.company.games_limit = +val.toLocaleString('en-US');

    return true;
  }
  isAdmin() {
    return this.permissionService.isAdmin();
  }

  cancelCompany() {
    this.navigateToCompanyList();
  }

  navigateToCompanyList() {
    this.router.navigate([Route.COMPANY_PAGE]);
  }

  presentDeleteCompanyPopup(event) {
    const dialogRef = this.dialog.open(DeleteCompanyComponent, {
      data: event
    });
    dialogRef.componentInstance.onDeleteConfirmation.subscribe(() => {
      this.deleteCompany();
    });
  }

  deleteCompany() {
    if (this.company.company_id) {
      this.is_loading = true;
      this.companyService.deleteCompany(this.company.company_id).subscribe((res) => {
        this.is_loading = false;
        const response: any = res;
        if (!response.success) {
          this.showMessage(this.translate.instant('delete_company_error'));
          return;
        }
        this.companyService.notifiyCompanySearchModule(+this.company.company_id);
        this.navigateToCompanyList();
      });
    }
  }

  getCountries() {
    this.fetchingCountries = true;
    this.locationService.getCountries().subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.countries = response.data.countries;
        this.countriesList = [];
        this.countries.forEach(element => {
          this.countriesList.push({ id: element.country_id, title: element.country_name });
        });
        this.company.location_details.country_name = this.countries.filter((country) => {
          return country.country_id === this.company.location_details.country_id;
        })[0] || '';
      }
      this.fetchingCountries = false;
      this.is_loading = false;
    });
  }

  getTimeZone() {
    this.fetchingTimezones = true;
    this.locationService.getTimeZone().subscribe((res) => {
      const response: any = res;
      if (response.success) {
        const timezones = response.data.timezone_list;
        this.timeZoneList = [];
        timezones.forEach(timezone => {
          this.timeZoneList.push({ id: timezone.tz_id, title: timezone.tz_name, subtitle: timezone.tz_unit });
        });
        this.company.location_details.tz_name = this.timeZoneList.filter((timezone) => {
          return timezone.tz_id === this.company.location_details.tz_id;
        })[0] || '';
      }
      this.fetchingTimezones = false;
    });
  }

  getStates(countryId) {
    this.fetchingStates = true;
    this.locationService.getStates(countryId).subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.states = response.data.states;
        if (this.states && !this.company.location_details.state_id) {
          this.company.location_details.state_id = '';
          this.company.location_details.state_name = '';
        }
        this.statesList = [];
        this.states.forEach(element => {
          this.statesList.push({ id: element.state_id, title: element.state_name });
        });

        this.company.location_details.state_name = this.states.filter((timezone) => {
          return timezone.state_id === this.company.location_details.state_id;
        })[0] || '';
      }
      this.fetchingStates = false;
      this.is_loading = false;
    });
  }

  onCountrySelectionChanged(countryId) {
    if (countryId) {
      this.company.location_details.country_id = countryId;
      this.companyForm.form.markAsDirty();
      // Reset state id on Country selection change
      this.company.location_details.state_id = '';
      this.getStates(countryId);
    }
  }

  onStateSelectionChanged(stateId) {
    this.company.location_details.state_id = stateId;
    this.companyForm.form.markAsDirty();
  }

  onTimeZoneSelectionChanged(timezoneId) {
    this.company.location_details.tz_id = timezoneId;
    this.companyForm.form.markAsDirty();
  }

  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    const pathComponents = event.target.value.split('.');
    const type = pathComponents[pathComponents.length - 1].toLowerCase();
    if (type.indexOf('png') === -1 && type.indexOf('jpg') === -1 && type.indexOf('jpeg') === -1) {
      this.showAlert(this.translate.instant('invalid_file_format'), this.translate.instant('valid_img_format_msg'));
      return;
    }
    const that = this;
    const fr = new FileReader();
    fr.onload = () => { // when file has loaded
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          this.showAlert(this.translate.instant('img_too_small'), this.translate.instant('valid_img_size_msg_100x100'));
        } else {
          that.openCropper(event);
        }
      };
      img.src = fr.result as string; // This is the data URL
    };
    fr.readAsDataURL(file);
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

  openCropper(event) {
    // Pass picked image file to Crop Component
    const dialogRef = this.dialog.open(CropImageComponent, {
      data: event
    });
    dialogRef.componentInstance.maxHeight = 1024;
    dialogRef.componentInstance.maxWidth = 1024;
    dialogRef.componentInstance.title = this.translate.instant('edit_company_logo');
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Apply cropped image changes
        this.logo = result.base64;
        const company_identifier = this.company.company_name.replace(/\s/g, '').toLowerCase();
        const path = environment.env_name + '/' + company_identifier + '/company/logo/' +
          company_identifier + '.' + result.blobedData.type.split('/')[1];
        this.croppedImage.path = path;
        this.croppedImage.blob = result.blobedData;
        this.companyForm.form.markAsDirty();
      }
    });
  }
  deleteLogo() {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = this.translate.instant('confirm_action');
    dialogReference.componentInstance.message = this.translate.instant('confirm_delete_asset');
    dialogReference.componentInstance.negativeButtonText = 'YES';
    dialogReference.componentInstance.positiveButtonText = 'NO';
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.croppedImage.blob = '';
      this.croppedImage.path = '';
      this.company.company_logo = '';
      this.logo = defaultLogoUrl;
      this.companyForm.form.markAsDirty();
    });
  }
  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }

  confirmModeChange() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.message = this.translate.instant('paywall_deactivate_msg');
    dialogRef.componentInstance.title = this.translate.instant('confirm_action');
    dialogRef.componentInstance.negativeButtonText = 'NO';
    dialogRef.componentInstance.positiveButtonText = 'YES';
    dialogRef.componentInstance.isMultiOption = true;
    dialogRef.componentInstance.isCheckbox = false;
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.action = !this.action;
    });
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      this.action = true;
    });
  }

  getURL(web_app_url,company_slug) {
    return `${web_app_url}/launch-app?contains=company-code&company-code=${company_slug}`  
  }

  openQRCode(company){
    console.log(company)
    const URL = this.getURL(company.web_app_url,company.company_slug);
    console.log(URL)    
    const dialogRef = this.dialog.open(CompanyQRCodeComponent, {
      data: URL
    });   
    dialogRef.componentInstance.qrData = {
      slug: company.company_slug,
      isFromCompany: true,
      companyLogo: company.company_logo
    }   
  }

  radioChange($event: MatRadioChange) {
    console.log($event.value);
    if($event.value == 'AI_ASSIST_PLUS'){
      this.globalService.addGoogleEvent('AI_Assist_PLUS' , 'AI_Assist', 'AI Assist+', '');  
      
    }else if($event.value == 'AI_ASSIST'){      
      this.globalService.addGoogleEvent('AI_Assist' , 'AI_Assist', 'AI Assist', '');  
    }
  }

}
