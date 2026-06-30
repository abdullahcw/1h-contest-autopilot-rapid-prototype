import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CustomAudienceService, Audience } from 'src/app/services/custom-audience/custom-audience.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-add-audience',
  templateUrl: './add-audience.component.html',
  styleUrls: ['./add-audience.component.scss']
})
export class AddAudienceComponent implements OnInit {
  @ViewChild('addAudience', { static: true }) addAudience: NgForm;
  is_loading: boolean;
  audience: Audience = new Audience();
  titleToBeDisplayed: any;
  audienceExist: boolean = false;
  editMode: any = false;
  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService,
    public authService: StorageService,
    public globalService: GlobalService,
    public apiService: ApiService,
    public customAudienceService: CustomAudienceService,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public audienceDetails: any) { }

  ngOnInit() {
   
    // tslint:disable-next-line:max-line-length
    this.audience.audience_name = this.audienceDetails && this.audienceDetails['audience'] && this.audienceDetails['audience'].audience_name || '';
    this.audience.audience_id = this.audienceDetails && this.audienceDetails['audience'] && this.audienceDetails['audience'].audience_id;
    this.titleToBeDisplayed = this.audienceDetails['title'];
    this.editMode = this.audienceDetails['editableItems'];
    if (this.editMode && this.audience.audience_name) {
      this.addAudience.form.markAsDirty();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  validateAudience() {
    this.is_loading = true;
    const validateAudiencePayload = {
      'company_id': this.authService.getCompanyId(),
      'audience_name': this.audience.audience_name,
      'manager_id': this.authService.getLoginUserID(),
    };
    this.customAudienceService.addAudience(validateAudiencePayload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        this.audienceExist = response.data.is_exist;
      } else {
        this.audienceExist = response.data.is_exist;
        this.audience.audience_id = response.data.audience_id
        const audiencePayload = {
          'audience_name': this.audience.audience_name,
          'audience_id': response.data.audience_id,
          'editMode': this.editMode
        };
        this.globalService.addAdminGoogleEvent('Custom_Audience_New_Custom_Audience_created');
        this.dialogRef.close(audiencePayload);     
      }
    });
  }

  audienceChanged() {
    if (!this.audience.audience_name.trim().length) {
      this.addAudience.form.markAsPristine();
      this.addAudience.form.controls['audience_name'].setErrors({'incorrect': true});
    }
    this.audienceExist = false;
  } 
}
