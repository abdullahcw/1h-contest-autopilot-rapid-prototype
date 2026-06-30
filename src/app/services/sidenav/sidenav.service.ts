import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidenavService {

  public updateHeaderTitle$ = new Subject<any>();

  constructor() { }

  updateHeaderTitle(title) {
    this.updateHeaderTitle$.next(title);
  }
}
