import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Constants, ApiService } from '../../services/network/api.service';
import { LoginService } from '../../services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global/global.service';
   
import { Router } from '@angular/router';



@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  user;
  email = '';
  isSent = false;
  is_loading = false;
  isError = false;
  errorMessage = '';
  @HostListener('window:keydown', ['$event']) test(e) {
    if (this.isSent && e.keyCode === 13) {
      this.closeModal(false);
    }
  }
  constructor(public dialogRef: MatDialogRef<any>,
    public loginService: LoginService,
    public apiService: ApiService,
    public snackBar: MatSnackBar,
    public translate: TranslateService,
    private globalService: GlobalService,
     
    public router: Router,
    public authService: StorageService) {

  }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.email = JSON.parse(this.user).email;
  }

  closeModal(reason = null) {
    this.dialogRef.close(reason);
  }

  emailChanged() {
    this.isError = false;
    this.errorMessage = '';
  }

  resetPasswordRequest() {
    this.globalService.addAdminGoogleEvent('Login_By_Forgot_Passward');
    this.is_loading = true;
    this.loginService.forgotPassword(this.email).subscribe((res) => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        this.isSent = false;
        this.isError = true;
        this.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      this.errorMessage = '';
      this.isSent = true;
    });
  }

  showMessage(message) {
    this.errorMessage = this.translate.instant(message);
  }
}
