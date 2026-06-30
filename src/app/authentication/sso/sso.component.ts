import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/network/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService, Route } from '../../services/login/login.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { SsoMessageComponent } from './sso-message/sso-message.component';
import { UserContextService } from 'src/app/services/feature-flags/user-context.service';

@Component({
  selector: 'app-sso',
  templateUrl: './sso.component.html',
  styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {

  user;
  idpUser;
  is_loading = false;

  constructor(public activatedRoute: ActivatedRoute, public router: Router, public globalService: GlobalService,
    public dialog: MatDialog, private translateService: TranslateService,
    public loginService: LoginService, public snackBar: MatSnackBar, public storageService: StorageService, public apiService: ApiService,
    private userContextService: UserContextService) {
    this.is_loading = true;

    this.activatedRoute.queryParams.subscribe((res) => {
      const response: any = res;
      if (!response.success || !response.saml_token) {
        this.is_loading = false;
        this.router.navigate([Route.LOGIN]);
        return;
      }

      // Validate saml_token
      loginService.loginSSOUser(res.saml_token).subscribe((resp) => {
        const ssoResponse: any = resp;
        this.is_loading = false;
        if (!ssoResponse.success) {
          this.showAlert(this.translateService.instant('error'), this.apiService.getErrorMessage(ssoResponse.message_code))
            .subscribe((res) => {
              this.router.navigate([Route.LOGIN]);
            });
          return;
        }
        if (!this.user) { return; }
        // Adding company id default
        this.globalService.addAdminGoogleEvent('Login_By_SSO_Login');
        const company = { 'company_id': this.user.company_id };
        this.storageService.setDateForCache();
        this.storageService.setCompany(company);
        this.storageService.setPostLogin(true);
        this.storageService.setPostLoginForCustomField(true);
        this.storageService.setUser(ssoResponse.data.manager);
        this.storageService.setAccessType(ssoResponse.data.manager.access_type);
        this.storageService.setAccessToken(ssoResponse.data.authentication.onehuddletoken);
        this.router.navigate([Route.DASHBOARD]);
        this.userContextService.loginUser(this.user.manager_id, this.user.company_id);
      });
    });
  }

  ngOnInit() {
    this.user = JSON.parse(this.storageService.getUser());
    this.idpUser = this.user && this.user.idp_user;
  }

  openSnackBar(msg) {
    this.snackBar.openFromComponent(msg, {
      duration: 2000,
    });
  }
  showAlert(title, message) {
    const dialogReference = this.dialog.open(SsoMessageComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = 'OK';
    return dialogReference.afterClosed();
  }
}
