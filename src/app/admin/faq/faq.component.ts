import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { HelpService } from '../../services/help/help.service';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { CompanyService } from 'src/app/services/company/company.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { Constants } from '../../services/network/api.service';
import { MatDialog, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  isCancel = true;
  faq_list = [];
  general_faq_list = [];
  startLimit = 0;
  endLimit = 0;
  faqs_of_tab = [];
  index = 0;
  is_loading = false;
  faqPermission: any = {};

  contenteditable: any;
  status: string;
  pageSizeOptions: number[];
  noOfItemsPerPage: number;
  totalFaqs = 0;
  dataSource: any;
  context = 'faqs';
  appliedFilters = '';
  filter_options = [{ 'filter': Constants.FAQ_QUESTION, value: 'Question', 'is_text_search': true, 'is_list_search': false }];
  sort = {
    'order': 'asc'
  };
  addFaqPayload = {
    'question': '',
    'answer': '',
    'status': 'active',
    'help_section_id': this.index,
    'isNew': true
  };
  tabs = ['General', 'Single Player', 'Multiplayer', 'Admin Panel'];

  constructor(public storageService: StorageService, public helpService: HelpService, public companyService: CompanyService,
    public permissionService: PermissionsService, private cdRef: ChangeDetectorRef, public headerService: HeaderService,
    public globalService: GlobalService, public snackBar: MatSnackBar) {
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
  }

  ngOnInit() {
    this.getFaqs(this.index); // By default load General category Questions
    this.headerService.showCompanyFilter(false);
    this.globalService.permissionReceived$.subscribe(res => {
      this.setCompanyPermission();
    });
  }

  setCompanyPermission(shouldReturn = false) {
    this.faqPermission = this.permissionService.getPermissions(PermissionsKey.FAQ);
    if (shouldReturn) {
      return this.faqPermission;
    }
  }
  toggleContenteditable() {
    this.contenteditable = !this.contenteditable;
  }
  getFaqs(index) {
    this.is_loading = true;
    this.faqs_of_tab = [];
    this.index = index + 1;
    this.appliedFilters = this.storageService.getFilterFromStroage(this.context);
    let key = this.appliedFilters.split('=')[1];
    key = key || '';
    this.status = this.status || '';
    this.helpService.getFaqs(this.startLimit, this.noOfItemsPerPage, this.index, this.status, this.sort.order, key)
      .subscribe((res) => {
        const response: any = res;
        if (!response.success) {
          this.is_loading = false;
          return;
        }
        this.is_loading = false;
        if (response.data) {
          this.faq_list = res.data.faq_list;
          this.totalFaqs = response.data.total_faqs;
          this.dataSource = this.faq_list;
          this.faqs_of_tab = this.dataSource.filter((general_faq_list) => {
            return general_faq_list.help_section_id === this.index;
          });
        }
      }, (err) => {
      });
    this.cdRef.detectChanges();
  }

  refreshListOnFilterChange(filters) {
    this.storageService.setFilters(this.context, filters);
    const index = this.index - 1;
    this.getFaqs(index);
  }

  addEmptyFaq() {
    this.addFaqPayload = {
      'question': '',
      'answer': '',
      'status': 'active',
      'help_section_id': this.index,
      'isNew': true
    };

    this.faqs_of_tab.unshift(this.addFaqPayload);
  }

  addFaq(faq) {
    const payload = {
      'question': faq.question,
      'answer': faq.answer,
      'status': faq.status,
      'help_section_id': this.index,
    };

    this.helpService.addFaq(payload).subscribe((res) => {
      // console.log(res);
      const response = res;
      if (!response.success) {
        // console.log(response);
        return;
      }

    }, (err) => {
      // console.log(err);
    });
    const index = this.index - 1;
    this.getFaqs(index);
  }

  updateFaq(faq) {

    if (!this.isCancel) {
      return;
    }

    const payload = {
      'question': faq.question,
      'answer': faq.answer,
      'status': faq.status,
      'help_section_id': this.index,
      'faq_id': faq.faq_id

    };
    this.helpService.updateFaq(payload).subscribe((res) => {
      // console.log(res);
      const response = res;
      if (!response.success) {
        // console.log(response);
        return;
      }
      this.isCancel = true;

    }, (err) => {
      // console.log(err);
    });
  }

  deleteFaq(faq_id) {
    const payload = { 'faq_id': faq_id };
    this.helpService.deleteFaq(payload).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }

    }, (err) => {
      // console.log(err);

    });

    const index = this.index - 1;
    this.getFaqs(index);

  }


  getFaqsOverPagination(pageEvent) {
    this.index = this.index - 1;
    this.noOfItemsPerPage = pageEvent.pageSize;
    const nextLimit = pageEvent.pageSize;
    // const startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getFaqs(this.index);
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.headerService.showCompanyFilter(true);

  }

}
