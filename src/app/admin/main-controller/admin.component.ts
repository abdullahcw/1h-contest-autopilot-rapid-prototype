import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { ChangeDetectorRef } from '@angular/core';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { ApiService } from 'src/app/services/network/api.service';
   
import { Platform } from '@angular/cdk/platform';

import {
  Event as RouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouteConfigLoadEnd,
  RouteConfigLoadStart
} from '@angular/router';
import { UserRestrictDialogComponent } from '../user-restrict-dialog/user-restrict-dialog.component';
import { StorageService } from 'src/app/services/storage/storage.service';
import { datadogRum } from '@datadog/browser-rum';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  isShowingRouteLoadIndicator: boolean;
  constructor(private cdRef: ChangeDetectorRef, 
    public permissionService: PermissionsService,
    private dialog: MatDialog,
    public platform: Platform, public storageService: StorageService,
    public globalService: GlobalService, public apiService: ApiService,   public router: Router) {
    this.isShowingRouteLoadIndicator = false;
    let asyncLoadCount = 0;
    let navigationCount = 0;
    // this.globalService.InitilizeApp()

    router.events.subscribe(
      (event: RouterEvent): void => {
        if (event instanceof RouteConfigLoadStart) {
          asyncLoadCount++;
        } else if (event instanceof RouteConfigLoadEnd) {
          asyncLoadCount--;
        } else if (event instanceof NavigationStart) {
          navigationCount++;
        } else if ((event instanceof NavigationError) ||
          (event instanceof NavigationCancel)) {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (event instanceof NavigationEnd) {
          navigationCount--;
        }
        this.isShowingRouteLoadIndicator = navigationCount > 0 && asyncLoadCount > 0;
      });
      const userDetails = JSON.parse(this.storageService.getUser());
      if(userDetails?.manager_id && environment.env_name === 'production'){
        datadogRum.setUser({
          id: userDetails?.manager_id,
          appType: 'Admin',          
      });
      }
  }

  toggleDrawer = false;
  isSmall = false;
  isToggled = false;
  isToggleFixed = false;
  disableAdminPage = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.isMobile()) {
      window['unloadHelp']();
    } else {
      if (event.target.innerWidth >= 600 && !this.isMobile()) {
        window['loadHelp']();
      }
    }
  }
  ngOnInit() {
    // const abc = window.screen.orientation;
    // console.log('window.screen.orientation', window.screen.orientation.type);
    // // if (window.screen.orientation.type === 'landscape-primary') {
    // // window.screen.orientation.lock('portrait-primary');
    // screen.orientation.lock('portrait-primary');
    // }

    this.fetchUserPersonalData();
    this.fetchPermissions();
    this.fetchTutorialVideo();
    
    
    if (this.isMobile()) {
      window['unloadHelp']();
    } else {
      if (window.innerWidth >= 600 && !this.isMobile()) {
        window['loadHelp']();
      }
    }
  }

  isMobile() {

    if (this.platform.ANDROID || this.platform.IOS) {
      return true;
    } else {
      return false;
    }
  }
  ngAfterViewInit() {
    // window['unloadHelpshow']();
    // screen.orientation.addEventListener('change', function (e) {
    //   if (window.screen.orientation.type == 'landscape-primary' && window.screen.orientation.angle == 90) {
    //     // window.screen.orientation.lock('portrait-primary');
    //     screen.orientation.lock('portrait-primary');
    //     //  window.screen.lockOrientation('portrait-primary');
    //     console.log('window.screen.orientation', window.screen.orientation);
    //   }
    // }, false);

    // const lockFunction = window.screen.orientation.lock;
    // if (lockFunction.call(window.screen.orientation.type, 'landscape-primary')) {
    //   console.log('Orientation locked');
    // } else {
    //   console.error('There was a problem in locking the orientation');
    // }
  }
  isSmallDevice($event) {
    this.isSmall = $event;
    if (this.isSmall) {
      this.isToggled = false;
    }
    this.cdRef.detectChanges();
  }

  closeSidenav() {
    this.isToggled = false;
  }

  toggleSidenavHeader() {
    if (this.isSmall) {
      this.isToggled = !this.isToggled;
      return;
    }
    this.isToggleFixed = !this.isToggleFixed;
  }
  toggleDrawerContent(event) {
    this.toggleDrawer = !this.toggleDrawer;
  }

  // fetchAWSTokens() {
  //   this.permissionService.getUploadTokens().subscribe(res => {
  //     const response: any = res;
  //     if (!response.success) {
  //       this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
  //       return;
  //     }
  //     // Broadcast received permission
  //     // this.globalService.receivedPermissions();
  //   });
  // }

  fetchUserPersonalData() {
    this.permissionService.userPersonalData().subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      const userPersonalData = {
        'first_name': res.data.first_name,
        'last_name': res.data.last_name,
        'name':res.data.name,
        'email':res.data.email,
        'profile_image_url': res.data.profile_image_url
      }
      this.storageService.userPersonalData = userPersonalData;
      let userData = this.storageService.getObject('user');
      userData['first_name']= '';
      userData['last_name']=  '';
      userData['name'] = '';
      userData['profile_image_url'] =  '';
      userData['email'] =  '';      
      this.storageService.setObject('user',userData);
      // Broadcast received permission
      // this.globalService.receivedPermissions();
    });
  }
  fetchPermissions() {
    this.permissionService.fetchPermissions().subscribe(res => {
      const response: any = res;
      if (!response.success) {
        this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      // Broadcast received permission
      this.globalService.receivedPermissions();
    });
  }
  fetchTutorialVideo() {
          this.globalService.fetchTutorialVideo();

  }

  disablePage(data) {
    this.disableAdminPage = data.isPaywallAcivated;
    if (this.disableAdminPage) {
      const dialogReference = this.dialog.open(UserRestrictDialogComponent, {
        disableClose: true,
        data: event,
        hasBackdrop: false
      });
      dialogReference.componentInstance.accountTypePaid = data.isPaywallAcivatedForPaid;
      dialogReference.componentInstance.message = 'message';
      dialogReference.componentInstance.managerName = data.userDetails.first_name + ' ' + data.userDetails.last_name;
      dialogReference.componentInstance.date = data.companyDeatils.paywall_end_date;
    }
  }

  ngOnDestroy() {
    window['unloadHelp']();
  }
}
