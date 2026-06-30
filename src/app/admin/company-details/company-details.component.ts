import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '../../services/company/company.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {

  constructor(public activatedRoute: ActivatedRoute, public companyService: CompanyService, public storageService: StorageService,
    public router: Router, private cdRef: ChangeDetectorRef, private location: Location) {
    this.activatedRoute.params.subscribe((res) => { });
  }

  ngOnInit() { }

  navigateToCompanyPage() {
    this.location.back();
  }
  pageLoading(isPageLoaded) {
    this.cdRef.detectChanges();
  }
}
