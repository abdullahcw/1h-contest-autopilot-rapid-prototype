import { Injectable } from '@angular/core';
import { CanLoad, CanActivate, Router, Route, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { Role } from '../permissions/permissions.service';
import { Route as CUSTOM_ROUTE, LoginService } from '../login/login.service';
import { GlobalService } from '../global/global.service';

@Injectable(
  {
    providedIn: 'root'
  }
)
export class SessionValidatorService implements CanActivate, CanLoad {
  url;
  sessionValidation: string = this.storageService.getAccessToken();

  constructor(public router: Router, public storageService: StorageService,
    public loginService: LoginService, public globalService: GlobalService) {
    router.events.subscribe((res) => {
      this.url = res['url'];
    });
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.url = state.url;
    const accessType = this.storageService.getAccessType();
    if (!this.sessionValidation) {
      this.router.navigate([CUSTOM_ROUTE.LOGIN]);
      return false;
    }
    switch (accessType) {
      case Role.ADMIN:
        switch (this.url) {
          case `/${CUSTOM_ROUTE.MANAGER_COMPANY_DETAILS_PAGE}`:
            this.router.navigate([CUSTOM_ROUTE.COMPANY_PAGE]);
            return true;
          default:
            return true;
        }
      case Role.MANAGER:
        switch (this.url) {
          case `/${CUSTOM_ROUTE.COMPANY_PAGE}`:
          case `/${CUSTOM_ROUTE.COMPANY_DETAILS_PAGE}`:
            this.router.navigate([CUSTOM_ROUTE.MANAGER_COMPANY_DETAILS_PAGE]);
            break;
          case `/${CUSTOM_ROUTE.TIPS}`:
            this.router.navigate([CUSTOM_ROUTE.DASHBOARD]);
            return true;
          default:
            return true;
        }
        break;
      case Role.MID_MANAGER:
        switch (this.url) {
          case `/${CUSTOM_ROUTE.COMPANY_PAGE}`:
          case `/${CUSTOM_ROUTE.COMPANY_DETAILS_PAGE}`:
            this.router.navigate([CUSTOM_ROUTE.MANAGER_COMPANY_DETAILS_PAGE]);
            break;
          case `/${CUSTOM_ROUTE.BRANDING}`:
          case `/${CUSTOM_ROUTE.TIPS}`:
            this.router.navigate([CUSTOM_ROUTE.DASHBOARD]);
            return true;
          default:
            return true;
        }
        break;
      case Role.TEAM_LEAD:
        switch (this.url) {
          case `/${CUSTOM_ROUTE.COMPANY_PAGE}`:
          case `/${CUSTOM_ROUTE.COMPANY_DETAILS_PAGE}`:
          case `/${CUSTOM_ROUTE.MANAGER_COMPANY_DETAILS_PAGE}`:
          case `/${CUSTOM_ROUTE.DEPARTEMENT}`:
          case `/${CUSTOM_ROUTE.LOCATIONS}`:
          case `/${CUSTOM_ROUTE.GROUPS}`:
          case `/${CUSTOM_ROUTE.GAMES}`:
          case `/${CUSTOM_ROUTE.FAQ}`:
          case `/${CUSTOM_ROUTE.TUTORIAL_VIDEO}`:
          case `/${CUSTOM_ROUTE.BRANDING}`:
          case `/${CUSTOM_ROUTE.TIPS}`:
          case `/${CUSTOM_ROUTE.SCHEDULE_GAME}`:
          case `/${CUSTOM_ROUTE.ADD_ATTEMPTS}`:
          case `/${CUSTOM_ROUTE.LIVE_ATTEMPTS}`:
          case `/${CUSTOM_ROUTE.LEADERBOARD}`:
          case `/${CUSTOM_ROUTE.NOTIFICATIONS}`:
            this.router.navigate([CUSTOM_ROUTE.DASHBOARD]);
            return true;
          default:
            return true;
        }
      default:
        return true;
    }
  }

  canLoad(route: Route): boolean {
    const accessType = this.storageService.getAccessType();
    if (!this.sessionValidation) {
      this.router.navigate([CUSTOM_ROUTE.LOGIN]);
      return false;
    }
    switch (accessType) {
      case Role.ADMIN:
        switch (this.url) {
          case `/${CUSTOM_ROUTE.MANAGER_COMPANY_DETAILS_PAGE}`:
            this.router.navigate([CUSTOM_ROUTE.COMPANY_PAGE]);
            return true;
          default:
            return true;
        }
      case Role.MANAGER:
      case Role.MID_MANAGER:
        switch (this.url) {
          case `/${CUSTOM_ROUTE.COMPANY_PAGE}`:
          case `/${CUSTOM_ROUTE.COMPANY_DETAILS_PAGE}`:
            this.router.navigate([CUSTOM_ROUTE.MANAGER_COMPANY_DETAILS_PAGE]);
            return true;
          default:
            return true;
        }
      case Role.TEAM_LEAD:
        switch (this.url) {
          case `/${CUSTOM_ROUTE.COMPANY_PAGE}`:
          case `/${CUSTOM_ROUTE.COMPANY_DETAILS_PAGE}`:
          case `/${CUSTOM_ROUTE.MANAGER_COMPANY_DETAILS_PAGE}`:
          case `/${CUSTOM_ROUTE.DEPARTEMENT}`:
          case `/${CUSTOM_ROUTE.LOCATIONS}`:
          case `/${CUSTOM_ROUTE.GROUPS}`:
          case `/${CUSTOM_ROUTE.GAMES}`:
          case `/${CUSTOM_ROUTE.FAQ}`:
          case `/${CUSTOM_ROUTE.TUTORIAL_VIDEO}`:
          case `/${CUSTOM_ROUTE.BRANDING}`:
            this.router.navigate([CUSTOM_ROUTE.DASHBOARD]);
            return true;
          default:
            return true;
        }
      default:
        return true;
    }
  }
}
