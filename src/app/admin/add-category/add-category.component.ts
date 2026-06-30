import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { GameCategoryService, Category } from 'src/app/services/game-category/game-category.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';



@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.component.html',
  styleUrls: ['./add-category.component.scss']
})
export class AddCategoryComponent implements OnInit {
  is_loading: boolean;
  onSuccess = new EventEmitter();
  @Output() refreshPlayerList: EventEmitter<any> = new EventEmitter();
  category: Category = new Category();
  titleToBeDisplayed: any;
  categoryExist: boolean = false;
  editMode: any = false;
  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService,
    public authService: StorageService,
    public globalService: GlobalService,
    public apiService: ApiService,
    public gameCategoryService: GameCategoryService,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public categorypDetails: any) { }

  ngOnInit() {
    // tslint:disable-next-line:max-line-length
    this.category.category_name = this.categorypDetails && this.categorypDetails['category'] && this.categorypDetails['category'].category_name || '';
    this.category.category_id = this.categorypDetails && this.categorypDetails['category'] && this.categorypDetails['category'].game_cat_id;
    this.titleToBeDisplayed = this.categorypDetails['title'];
    this.editMode = this.categorypDetails['editableItems'];
  }

  cancel() {
    this.dialogRef.close();
  }
  addCategory() {
    this.is_loading = true;
    const company_id = this.authService.getCompanyId();
    this.gameCategoryService.addGameCategory(company_id, this.category.category_name).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        if (response.message_code === 'CATEGORY_ALREDY_EXIST') {
          this.categoryExist = true;
        } else {
          this.dialogRef.close();
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
      } else {
        this.globalService.showMessage(this.translate.instant('game_categoty_added'), 'right', 'bottom');
        this.dialogRef.close();
        this.onSuccess.emit();
      }
    });
  }
  categoryChanged() {
    this.categoryExist = false;
  }
  updateCategory(category) {
    const company_id = this.authService.getCompanyId();
    const updateCategoryPayload = {
      'category_id': category.category_id,
      'category_name': category.category_name,
      'company_id': company_id,

    };
    this.is_loading = true;
    this.gameCategoryService.updateGameCategory(updateCategoryPayload).subscribe(res => {
      this.is_loading = false;
      const response: any = res;
      if (!response.success) {
        if (response.message_code === 'CATEGORY_ALREDY_EXIST') {
          this.categoryExist = true;
        } else {
          this.dialogRef.close();
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
      } else {
        this.globalService.showMessage(this.translate.instant('game_categoty_edited'), 'right', 'bottom');
        this.onSuccess.emit();
        this.refreshPlayerList.emit();
        this.dialogRef.close();
      }
    });
  }

}
