import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

import { GamePathwayService, Pathway } from 'src/app/services/game-pathway/game-pathway.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-add-pathway',
  templateUrl: './add-pathway.component.html',
  styleUrls: ['./add-pathway.component.scss']
})
export class AddPathwayComponent implements OnInit {
  is_loading: boolean;
  onSuccess = new EventEmitter();
  // @Output() refreshPlayerList: EventEmitter<any> = new EventEmitter();
  // category: Category = new Category();
  pathway: Pathway = new Pathway();

  titleToBeDisplayed: any;
  pathwayExist: boolean = false;
  editMode: any = false;
  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService,
    public authService: StorageService,
    public globalService: GlobalService,
    public apiService: ApiService,
    public gamePathwayService: GamePathwayService,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public pathwayDetails: any) { }

  
    ngOnInit() {
      // tslint:disable-next-line:max-line-length
      this.pathway.pathway_name = this.pathwayDetails && this.pathwayDetails['pathway'] && this.pathwayDetails['pathway'].pathway_name || '';
      this.pathway.pathway_id = this.pathwayDetails && this.pathwayDetails['pathway'] && this.pathwayDetails['pathway'].pathway_id;
      // this.titleToBeDisplayed = this.translate.instant('add_pathway');
      this.titleToBeDisplayed = this.pathwayDetails['title'];    
      this.editMode = this.pathwayDetails['editableItems'];
    }
  
    cancel() {
      this.dialogRef.close();
    }
    addPathway() {
      this.is_loading = true;
      const company_id = this.authService.getCompanyId();
      // const category = this.authService.getCompanyId();
      this.globalService.addAdminGoogleEvent('Pathway_Saved');
      this.gamePathwayService.addGamePathway(company_id, this.pathway.pathway_name.trim()).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          if (response.message_code === 'PATHWAY_ALREDY_EXIST') {
            this.pathwayExist = true;
          } else {
            this.dialogRef.close();
            this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
            return;
          }
        } else {
          this.globalService.showMessage(this.translate.instant('game_pathway_added'), 'right', 'bottom');
          this.onSuccess.emit();
          this.dialogRef.close();
        }
        // }
      });
    }
    pathwayChanged() {
      this.pathwayExist = false;
    }
    updatePathway(pathway) {
      console.log('updateCategory', pathway);
      this.globalService.addAdminGoogleEvent('Pathway_Saved');
      const company_id = this.authService.getCompanyId();
      const updateCategoryPayload = {
        'pathway_id': pathway.pathway_id,
        'pathway_name': pathway.pathway_name,
        'company_id': company_id,
  
      };
      this.is_loading = true;
      this.gamePathwayService.updatePathway(updateCategoryPayload).subscribe(res => {
        this.is_loading = false;
        const response: any = res;
        if (!response.success) {
          if (response.message_code === 'UPDATE_PATHWAY_ALREDY_EXIST') {
            this.pathwayExist = true;
          } else {
            this.dialogRef.close();
            this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
            return;
          }
          // return;
        } else {
          this.globalService.showMessage(this.translate.instant('game_pathway_edited'), 'right', 'bottom');
          this.onSuccess.emit();
          // this.refreshPlayerList.emit();
          this.dialogRef.close();
        }
      });
    }

}
