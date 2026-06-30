import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DelegateService {
  selectedCompany: any;
  selectedHeaderCompany = new Subject<any>();
  companyDetailsUpdated = new Subject<any>();
  constructor() { }

  companySelected(company) {
    if (company !== this.selectedCompany) {
      this.selectedCompany = company;
      this.selectedHeaderCompany.next(company);
    }
  }

  // Update game scheduling route according to custom fields flag 
  companyDetailsSet(company) {
    this.companyDetailsUpdated.next(company);
  }
}
