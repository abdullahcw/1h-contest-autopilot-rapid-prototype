import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }

  public showCompanyFilter$ = new Subject<any>();

  showCompanyFilter(hide) {
    this.showCompanyFilter$.next(hide);
  }
}
