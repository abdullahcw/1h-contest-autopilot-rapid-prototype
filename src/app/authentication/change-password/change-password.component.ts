import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, ErrorCode } from 'src/app/services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  confirmPassword = '';
  confirmNewPassword = '';
  isChanged = false;
  userId = '';
  resetToken = '';
  userType = '';
  errorMessage = '';
  isError = false;
  is_loading = false;

  constructor(public activatedRoute: ActivatedRoute, public loginService: LoginService, public apiService: ApiService,
    public snackBar: MatSnackBar, public storageService: StorageService,
    public router: Router, public translate: TranslateService) {
      this.activatedRoute.queryParams.subscribe((res) => {
        const response: any = res;
        if (!response.id || !response.token || !response.type) {
        return;
        }
        this.userId = response.id;
        this.resetToken = response.token;
        this.userType = response.type;
      });
    }

  ngOnInit() {}

  updatePassword() {
      this.errorMessage = '';
      this.isError = false;
  }

  resetPassword() {
    if (this.confirmPassword !== this.confirmNewPassword) {
      this.isError = true;
      this.errorMessage = this.apiService.getErrorMessage(ErrorCode[300008]);
      return;
    }
    const payload = {
      'user_id': this.userId,
      'user_type': this.userType,
      'password_reset_token': this.resetToken,
      'new_password': this.confirmPassword
    };
    this.is_loading = true;
    this.loginService.updatePassword(payload).subscribe((res) => {
      this.is_loading = false;
      if (!res.success) {
        this.showMessage(this.apiService.getErrorMessage(res.message_code));
        return;
      }
      this.showMessage(this.translate.instant('password_updated_successfully'));
      this.redirectToLogin();
    }, (err) => {
      err = err.json() ? err.json() : err;
      this.showMessage(err.message);
    });
  }

  redirectToLogin() {
    this.storageService.clearLocalStorage();
    this.router.navigate(['./login']);
  }

  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }

}
