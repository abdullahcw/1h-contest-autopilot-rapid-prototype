import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SingleQuestionComponent } from 'src/app/shared/single-question/single-question.component';
import { DatePipe } from '@angular/common';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-mobile-question',
  templateUrl: './mobile-question.component.html',
  styleUrls: ['./mobile-question.component.scss']
})
export class MobileQuestionComponent extends SingleQuestionComponent {

  @Output() openImage: EventEmitter<any> = new EventEmitter<any>();
  @Output() closemobileDialog: EventEmitter<any> = new EventEmitter<any>();

  constructor(public datePipe: DatePipe,
    public dialog: MatDialog,
    public permissionService: PermissionsService,
    public globalService: GlobalService,
    public translate: TranslateService,
    public storageService: StorageService,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public questionDetails: any) {
    super(datePipe, dialog, translate, permissionService, globalService ,storageService);
    this.question = questionDetails;
    this.questionDetails.is_editing = true;
    this.questionDetails.isOpen = true;
    super.edit(this.questionDetails);
  }

  cancel(question = null) {
    this.questionDetails.is_editing = false;
    this.cancelEditing.emit(question);
    this.questionDetails.isOpen = false;
    this.closemobileDialog.emit(question);
  }

  mobileCancelEditing(data) { }
  onCategorySelection(data) { }
  mobileOpenImage(question): void {
    this.openImage.emit(question);
  }
  mobilePlayAudio(question): void {
    this.playAudio.emit(question);
  }
  mobileOpenTagsEditor(question): void {
    this.openTagsEditor.emit(question);
  }
  save(question = null) {
    super.save(this.questionDetails);
  }

}
