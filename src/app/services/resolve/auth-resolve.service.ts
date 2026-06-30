import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { Route } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})

export class AuthResolveService implements Resolve<any> {

  constructor(public router: Router, public authService: StorageService) { }

  resolve(route: ActivatedRouteSnapshot) {
    if (this.authService.getAccessToken()) {
      this.router.navigate([Route.DASHBOARD]);
    }
  }
}
