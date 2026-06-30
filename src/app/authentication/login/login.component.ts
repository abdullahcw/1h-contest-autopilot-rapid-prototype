import { Component, OnInit, ViewContainerRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavigationEnd, Router, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ForgotPasswordComponent } from 'src/app/authentication/forgot-password/forgot-password.component';
import { LoginService, User, Route } from '../../services/login/login.service';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ApiService } from 'src/app/services/network/api.service';
import { GameListModule } from '../../admin/game-list/game-list.module';
import { GlobalService } from 'src/app/services/global/global.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { BlockerPopupComponent } from 'src/app/admin/blocker-popup/blocker-popup.component';
import { UserContextService } from 'src/app/services/feature-flags/user-context.service';
import { FeatureFlagsService } from 'src/app/services/feature-flags/feature-flags.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  user: any = {};
  idpUser: any = {};
  constructor(public router: Router,
    public loginService: LoginService,
    vRef: ViewContainerRef,
    public translate: TranslateService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public apiService: ApiService,
    private globalService: GlobalService,
    public permissionService: PermissionsService,
    public storageService: StorageService,
    private userContextService: UserContextService) {

  }

  @ViewChild('login_email', { static: true }) login_email;
  @ViewChild('login_password') login_password;
  is_loading = false;
  enablePassword = false;
  subHeaderTitle = 'Login';
  isError = false;
  ssoLogin = false;
  errorMessage: any = '';
  slug;
  loginUSer: User;
  env_path = environment.env_path;
  currentYear = new Date().getFullYear();

  ngOnInit() {
    this.user = {
      'email': '',
      'password': ''
    };
    this.idpUser = {
      'idp_name': '',
      'saml_url': '',
      'saml_token': '',
      'call_back_url': '',
      'allow_logout': '',
      'logout_url': ''

    };
    this.login_email.nativeElement.focus();
    setTimeout(() => {
      window['unloadHelp']();
    }, 3000);
  }

  ngAfterViewInit() {
    if (this.dialog) {
      this.dialog.closeAll();
    }
    setTimeout(() => {
      window['unloadHelp']();
    }, 2000);
  }
  validateUser(loginForm) {
    if (this.ssoLogin) {
      this.verifySlug();
      return;
    }
    if (!this.enablePassword && loginForm.form.valid) {
      this.is_loading = true;
      this.verifyEmail();
      return;
    } else if (!this.enablePassword && !loginForm.form.valid) {
      return;
    }
    this.is_loading = true;
    this.login();
  }

  verifySlug() {
    // verifyCompany
    this.loginService.verifyCompany(this.slug).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.showError(this.apiService.getErrorMessage(response.message_code), false);
        return;
      }
      if (response.data && response.data.sso_details) {
        this.storageService.setSSOUser(response.data.sso_details);
        this.storageService.setSSODetails(response.data.sso_details);
        this.is_loading = false;
        this.idpUser = response && response.data && response.data.sso_details && response.data.sso_details.idp_user;
        this.enablePassword = false;
        this.isError = false;
        this.errorMessage = '';
        window.open(this.idpUser.saml_url + '&source=admin&company_name=' + this.idpUser.idp_name, '_self');
        return;
      } else {
        this.showMessage(this.translate.instant('could_not_recognize_company_identifier'));
        return;
      }
    });
  }
  ssoLoginView(ssologin) {
    this.isError = false;
    return ssologin ? this.ssoLogin = false : this.ssoLogin = true;
  }
  verifyEmail() {
    this.loginService.verifyEmail(this.user.email).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.showError(this.apiService.getErrorMessage(response.message_code), false);
        return;
      }
      this.storageService.setUser(response.data);
      this.is_loading = false;
      this.isError = false;
      this.enablePassword = true;
      setTimeout(() => { // this will make the execution after the above boolean has changed
        this.login_password.nativeElement.focus();
      }, 100);
      this.errorMessage = '';
    }, () => {
      this.showError(this.apiService.getErrorMessage(0), false);
    });
  }

  login() {
    this.loginService.login(this.user).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        this.is_loading = false;
        this.showError(this.apiService.getErrorMessage(response.message_code), true);
        return;
      }
      this.isError = false;
      this.user = response.data.manager;
      this.storageService.setPostLogin(true);
      this.storageService.setPostLoginForCustomField(true);
      this.storageService.setUserDetails(this.user, response.data.authentication.onehuddletoken, this.user.access_type);
      const company = { 'company_id': this.user.company_id };
      this.storageService.setCompany(company);
      this.globalService.addAdminGoogleEvent('Login_By_Regular_Login');
      this.getCompanySetting(this.user.company_id);
      this.fetchAWSTokens();
      this.navigateNext();
      this.userContextService.loginUser(this.user.manager_id, this.user.company_id);
    }, () => {
      this.is_loading = false;
      this.showError('invalid_pwd', true);
    });
  }
  fetchAWSTokens() {
    this.permissionService.getUploadTokens().subscribe(res => {
      const response: any = res;
      if (!response.success ) {
        if (response.message_code === 'CONFIG_ADMIN_DOWN') {
        const dialogRef = this.dialog.open(BlockerPopupComponent, { disableClose: true});
        }
      return;
      }
      // Broadcast received permission
    });
  }
  getCompanySetting(companyID) {
    this.loginService.getSettings(companyID).subscribe((res) => {
      const response = res;
      this.globalService.setCompanyRoles(response && response.data && response.data.settings && response.data.settings.role);
      this.globalService.setCompanySetting(response && response.data && response.data.settings && response.data.settings.permission);
      this.globalService.companySettingReceived();

    });
  }
  navigateNext() {
    this.storageService.setDateForCache();
    // FIXME, HARCODED , Remove timeout once cloudfront is enabled
    if (GameListModule.isLoaded) {
      this.router.navigate([Route.DASHBOARD]);
    } else {
      setTimeout(() => {
        this.navigateNext();
      }, 1000);
    }
  }

  isIDPUser(response) {
    return response.data.idp_user ? true : false;
  }

  forgotPassword() {
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      width: '500',

    });
  }

  passwordChanged() {
    this.isError = false;
  }

  emailChanged() {
    this.enablePassword = false;
    this.isError = false;
  }

  showError(err, keepPwdFieldEnable) {
    this.is_loading = false;
    this.isError = true;
    this.enablePassword = keepPwdFieldEnable;
    if (keepPwdFieldEnable && this.login_password) {
      setTimeout(() => { // this will make the execution after the above boolean has changed
        this.login_password.nativeElement.focus();
      }, 100);
    }
    this.errorMessage = this.translate.instant(err);
  }
  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }
}
