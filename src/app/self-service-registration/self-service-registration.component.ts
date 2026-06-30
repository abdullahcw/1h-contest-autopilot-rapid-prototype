import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
   
import { GameListModule } from '../admin/game-list/game-list.module';
import { GlobalService } from '../services/global/global.service';
import { LoginService, Route } from '../services/login/login.service';
import { ApiService } from '../services/network/api.service';
import { SelfServiceRegistrationService } from '../services/self-service-registration/self-service-registration.service';
import { StorageService } from '../services/storage/storage.service';
import { UserContextService } from '../services/feature-flags/user-context.service';

@Component({
  selector: 'app-self-service-registration',
  templateUrl: './self-service-registration.component.html',
  styleUrls: ['./self-service-registration.component.scss']
})
export class SelfServiceRegistrationComponent implements OnInit {

  constructor(
    public selfserviceregistration: SelfServiceRegistrationService,
    public snackBar: MatSnackBar,
    public apiService: ApiService,
    public translate: TranslateService,
    public router: Router,
    public loginService: LoginService,
    public activatedRoute: ActivatedRoute,
    private globalService: GlobalService,
    private userContextService: UserContextService,
    public storageService: StorageService
  ) {
    this.activatedRoute.queryParams.subscribe((res) => {
      this.userDetails.registration_token = res['token'];
    });
  }
  user: any = {};
  isCaptchaValid = false;
  is_company_setup = false;
  isError = false;
  isErrorMisMatch = false;
  isPasswordNotMatch = true;
  maxCatSelection = false;
  first = false;
  access_types = {
    signup: true,
    setup: false,
    selectCat: false
  };
  userDetails = {
    first_name: '',
    last_name: '',
    password: '',
    registration_token: '',
    preferred_category_ids: [],
    company_name: '',
    company_size: '',
  };

  is_loading = false;
  @ViewChild('signupForm') signupForm: NgForm;
  @ViewChild('setupForm') setupForm: NgForm;
  @ViewChild('selectCatForm') selectCatForm: NgForm;
  notSelected = [];
  selected_index = [];
  category_length;
  selected_categories = [];
  notSelected_id;
  cat_list = [];
  passwordErrorMsg;

  ngOnInit() {

  }
  getCategory() {
    this.selfserviceregistration.getGategory(this.userDetails.registration_token).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        this.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.cat_list = response.data.category_list;
    });

  }
  resolved(captchaResponse: string) {
    if (captchaResponse) {
      this.isCaptchaValid = true;
    } else {
      this.isCaptchaValid = false;
    }
    console.log('Resolved captcha with response', captchaResponse);
  }

  signup() {
    this.selfserviceregistration.signupFormSubmit(this.userDetails).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        this.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      this.globalService.addAdminGoogleEvent('SSR_User_setup_done');
      this.access_types = {
        signup: false,
        setup: true,
        selectCat: false
      };
    });
  }
  submitCategoryDetails() {
    this.selected_categories.forEach(element => {
      this.userDetails.preferred_category_ids.push(element.game_category_id);
    });
    this.selfserviceregistration.submitCategoryDetails(this.userDetails).subscribe((res) => {
      const response: any = res;
      this.userDetails.preferred_category_ids = [];
      if (!response.success) {
        this.is_loading = false;
        this.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      this.globalService.addAdminGoogleEvent('SSR_Company_created');
      this.userOnboard();
    });
  }
  userOnboard() {
    this.is_company_setup = true;
    this.selfserviceregistration.userOnboard(this.userDetails.registration_token).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_company_setup = false;
        this.is_loading = false;
        this.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      this.userDetails['email'] = response.data.email;
      this.login(this.userDetails);
    });
  }
  checkPassword(event) {
    const confirm_new_password = this.userDetails['confirmNewPassword'];
    const password = event.target.value;
    if (confirm_new_password !== undefined) {
      if (confirm_new_password !== password) {
        this.isPasswordNotMatch = true;
        this.isError = true;
        if (password.length < 4) {
          this.passwordErrorMsg = this.translate.instant('password_length_check_msg');
        } else {
          this.isErrorMisMatch = true;
          this.passwordErrorMsg = this.translate.instant('password_match_check_msg');
        }
      } else {
        if (password.length < 4) {
          this.isError = true;
          this.isErrorMisMatch = false;
          this.passwordErrorMsg = this.translate.instant('password_length_check_msg');
        } else {
          this.isError = false;
          this.isPasswordNotMatch = false;
        }
      }
    } else {
      if (password.length < 4) {
        this.isPasswordNotMatch = true;
        this.isError = true;
        this.passwordErrorMsg = this.translate.instant('password_length_check_msg');
      } else {
        this.isError = false;
        this.isPasswordNotMatch = false;
      }
    }
  }
  checkConfirmPassword(event) {
    const password = this.userDetails.password;
    const confirm_new_password = event.target.value;
    if (password !== undefined) {
      if (confirm_new_password !== password) {
        this.isError = true;
        this.isPasswordNotMatch = true;
        this.isErrorMisMatch = true;
        this.passwordErrorMsg = this.translate.instant('password_match_check_msg');
      } else {
        if (confirm_new_password.length < 4) {
          this.isError = true;
          this.isErrorMisMatch = false;
          this.passwordErrorMsg = this.translate.instant('password_length_check_msg');
        } else {
          this.isPasswordNotMatch = false;
          this.isError = false;
        }
      }
    } else {
      if (confirm_new_password.length < 4) {
        this.isPasswordNotMatch = true;
        this.isError = true;
        this.passwordErrorMsg = this.translate.instant('password_length_check_msg');
      } else {
        this.isError = false;
        this.isPasswordNotMatch = false;
      }
    }
  }
  confirmPasswordChanged() {
    this.isError = false;
  }

  onCompanySizeSelect(size) {
    this.userDetails.company_size = size;
  }

  setupCompany() {
    this.selfserviceregistration.companySetupFormSubmit(this.userDetails).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        this.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      this.globalService.addAdminGoogleEvent('SSR_Company_setup_done');
      this.access_types = {
        signup: false,
        setup: false,
        selectCat: true
      };
      this.getCategory();
    });
  }
  selectCat(item, index) {
    this.maxCatSelection = false;
    const categories: any = this.selected_categories.filter(cat => {
      if (cat.game_category_id === item.game_category_id) {
        this.notSelected_id = null;
        const curr_index = this.selected_categories.indexOf(cat);
        this.selected_categories.splice(curr_index, 1);
        return true;
      }
      return false;
    });
    if (categories == false && this.selected_categories.length < 3) {
      this.notSelected_id = null;
      this.selected_categories.push(item);
    } else if (this.selected_categories.length >= 3) {
      if (this.notSelected_id === item.game_category_id) {
        this.maxCatSelection = false;
        this.notSelected_id = null;
        return;
      } else {
        this.notSelected_id = item.game_category_id;
      }
      this.maxCatSelection = true;
    }
  }
  login(userDetails) {
    this.loginService.login(userDetails).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        this.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.is_company_setup = true;
      this.isError = false;
      this.user = response.data.manager;
      this.storageService.setPostLogin(true);
      this.storageService.setPostLoginForCustomField(true);
      this.storageService.setUserDetails(this.user, response.data.authentication.onehuddletoken, this.user.access_type);
      const company = { 'company_id': this.user.company_id };
      this.storageService.setCompany(company);
      this.globalService.addAdminGoogleEvent('Login_By_Regular_Login');
      this.getCompanySetting(this.user.company_id);
      localStorage.setItem('show_ssr_dialog', 'true');
      this.navigateNext();
      this.userContextService.loginUser(this.user.manager_id, this.user.company_id);
    }, () => {
      this.is_loading = false;
      this.showMessage('invalid_pwd');
    });
  }

  getCompanySetting(companyID) {
    this.loginService.getSettings(companyID).subscribe((res) => {
      const response = res;
      console.log('response', response);
      this.globalService.setCompanyRoles(response.data.settings.role);
    });
  }
  navigateNext() {
    console.log('is loaded', GameListModule.isLoaded);
    // FIXME, HARCODED , Remove timeout once cloudfront is enabled
    if (GameListModule.isLoaded) {
      this.router.navigate([Route.GAMES]);
    } else {
      setTimeout(() => {
        this.navigateNext();
      }, 1000);
    }
  }
  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
