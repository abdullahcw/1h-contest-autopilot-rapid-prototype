import { Component, OnInit, Input, Output, ViewChild, EventEmitter, OnChanges, ElementRef } from '@angular/core';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmActionComponent } from 'src/app/admin/confirm-action/confirm-action.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { HelpService } from 'src/app/services/help/help.service';
import { GlobalService } from 'src/app/services/global/global.service';


@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss']
})
export class TextEditorComponent implements OnInit, OnChanges {

  text = {};
  status;
  @Input() faq;
  @Input() addFaqPayload;
  @Input() isNew;

  @ViewChild(MatExpansionPanel, { static: true }) faqs;
  @Output() deleteFAQ: EventEmitter<any> = new EventEmitter<any>();
  @Output() addFAQ: EventEmitter<any> = new EventEmitter<any>();

  @Output() isCancel: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateFAQ: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatExpansionPanel, { static: true }) expansionPanel: MatExpansionPanel;
  @ViewChild('editor') contentEditor: ElementRef;
  faqPermission: any = {};

  toggle = false;
  contenteditable = false;
  dataSource;
  faq_list;
  icon = false;
  panelOpenState = false;

  public Editor = ClassicEditor;

  constructor(public storageService: StorageService, public snackBar: MatSnackBar, public globalService: GlobalService,
    public permissionService: PermissionsService, public helpService: HelpService, public dialog: MatDialog) { }



  ngOnInit() {
    this.status = this.faq.status === 'active' ? true : false;
    this.faqs.closed.subscribe((res) => {
      this.contenteditable = false;
      this.panelOpenState = false;
    });
    // this.companyService.showCompanySearch(false); // to remove the search from header
    this.setCompanyPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setCompanyPermission();
    });

  }
  setCompanyPermission() {
    this.faqPermission = this.permissionService.getPermissions(PermissionsKey.FAQ);
  }
  invokeCkEditor() {
    // console.log('This is initiated');
    // console.log(document.querySelector('#editor'));
    // console.log(this.contentEditor);

  }

  ngOnChanges() {
    if (this.faq && this.faq.isNew) {
      this.contenteditable = true;
      this.expansionPanel.open();
    }
  }

  handleSpacebar(ev) {
    if (ev.keyCode === 32) {
      ev.stopPropagation();
    }
    if (ev.keyCode === 9) {
      ev.stopPropagation();
    }
  }

  toggleContenteditable() {
    this.contenteditable = !this.contenteditable;
    this.isCancel.emit(this.contenteditable);
  }


  addFaq(faq) {
    let message = '';
    if (faq.question === '' || faq.answer === '') {
      message = faq.question === '' ? 'Question cannot be empty' : 'Answer cannot be empty';
      this.showMessage(message);
    } else {
      this.addFAQ.emit(faq);
      this.toggleContenteditable();
    }
  }

  deleteDialog(faq_id) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: faq_id
    });
    dialogReference.componentInstance.title = 'Confirm';

    dialogReference.componentInstance.message = 'Are you sure you want to delete this item?';
    dialogReference.componentInstance.negativeButtonText = 'YES';
    dialogReference.componentInstance.positiveButtonText = 'NO';
    dialogReference.componentInstance.onNegativeAction.subscribe(() => {
      this.deleteFAQ.emit(faq_id);

    });
  }

  updateFaq(faq) {
    if (faq.faq_id) {
      if (!this.contenteditable) {
        return;
      }
      setTimeout(() => {

        this.updateFAQ.emit(faq);
      }, 1000);
    }

  }

  changeStatus(faq) {
    if (faq.faq_id) {
      this.faq.status = this.status ? 'active' : 'inactive';
      this.updateFAQ.emit(faq);
    }
  }
  showMessage(message) {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'top'
    });
  }
}
