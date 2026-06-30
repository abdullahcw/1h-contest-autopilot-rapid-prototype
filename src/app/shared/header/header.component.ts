import { Component, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import { SidenavService } from '../../services/sidenav/sidenav.service';
import { TranslateService } from '@ngx-translate/core';
import { LoginService, Route } from '../../services/login/login.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Constants, ApiService } from '../../services/network/api.service';
import { CompanyService } from '../../services/company/company.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DelegateService } from '../../services/delegate/delegate.service';
import { PermissionsService, PermissionsKey, Role } from 'src/app/services/permissions/permissions.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { AddUserComponent } from 'src/app/admin/add-user/add-user.component';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { LocationService } from 'src/app/services/location/location.service';
import { TutorialVideoComponent } from 'src/app/admin/tutorial-video/tutorial-video.component';
import moment from 'moment-timezone';
import { DatePipe } from '@angular/common';
   
import { Platform } from '@angular/cdk/platform';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import firebase from 'firebase';
import { UserContextService } from 'src/app/services/feature-flags/user-context.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  searchKey = ''; // Default selected company
  user;
  breadcrumb;
  userDetails;
  filteredCompanies;
  filterCompany: FormControl;
  showCompanyFilter = false;
  isCompanyPage = false;
  companyPermission: any = {};
  userPersonalData;
  @ViewChild('searchInput', { static: true }) searchInput;
  @ViewChild('search', { read: MatAutocompleteTrigger }) autocomplete;
  @Output() toggleSidenav: EventEmitter<any> = new EventEmitter<any>();
  @Output() trialExpired: EventEmitter<any> = new EventEmitter<any>();
  public headerTitle: String = this.translate.instant('1huddle');
  selectedCompanyId: any;
  copyOfFilteredCompanies: any;
  companyLogoUrl: any;
  isPaywallAcivated = false;
  isPaywallAcivatedForPaid = false;
  countdownText;
  agreement_end_date;
  today;
  noOfDaysLeft;
  timezone;
  activatedRoute: any;

  constructor(private sidenavService: SidenavService, public translate: TranslateService,
    private loginService: LoginService, private router: Router, private activatedRouteSnapshot: ActivatedRoute,
    private storageService: StorageService,
    private locationService: LocationService,
    private companyService: CompanyService,
    private managerService: ManagerService,
    private getImageURLService: GetImageURLService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private userContextService: UserContextService,
    public platform: Platform,
    private delegateService: DelegateService, private permissionService: PermissionsService, private headerService: HeaderService,
    private snackBar: MatSnackBar, private globalService: GlobalService, private apiService: ApiService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects) {
        }
        // console.log('gtag', gtag);
      }
    });
    if (this.storageService.getAccessType() !== Role.ADMIN) {
      this.router.events.subscribe((ev) => {
        if (ev instanceof NavigationEnd) {
          this.getCompanyDetailsForPaywall();
        }
      });
    }

    this.addLocalStorageEventListener();
  }

  addLocalStorageEventListener() {
    window.addEventListener('storage', (event) => {
      if (event.storageArea === localStorage) {

        const token = localStorage.getItem(Constants.ACCESS_TOKEN);
        if (token === undefined) {
          this.router.navigate([`/${Route.LOGIN}`]);
        }

        // check if company has changed and propagate the changes if required
        const companyId = this.storageService.getCompanyId();
        if (this.filteredCompanies && companyId !== this.selectedCompanyId) {

          const storedCompany = this.storageService.getCompany();
          this.getCompanyDetailsForOneCompany(storedCompany,true);
          
          // Update user context for super admin when company changes via localStorage
          if (this.storageService.getAccessType() === Role.ADMIN && storedCompany && storedCompany.company_id) {
            this.userContextService.updateCompanyContext(storedCompany.company_id);
          }
        }
      }
    }, false);
  }


  openEmail() {
    // this.globalService.addGoogleEvent('Support_Contacted', 'Homescreen Header Bar', '', '');
    this.globalService.addAdminGoogleEvent('Homescreen_Header_Bar_By_Support_Contacted');
    const layoutsize = 'width=580, height=500, top=40%, left=150px';
    window.open('mailto:support@1huddle.co?Subject=Hello%201Huddle%20Team','noopener');

  }

  routeAll(route) {
    this.router.navigate([route]);
  }

  ngOnInit() {
    const userDetails = JSON.parse(this.storageService.getsetSSODetails());
    const idpUser = userDetails && userDetails.idp_user;
    const userDetailsSession = JSON.parse(this.storageService.getsetSSODetailsSessionStorage());
    const idpUserSession = userDetailsSession && userDetailsSession.idp_user;
    // Clear storage in case of SSO and allow_logout
    // In case of refresh sessionn needs to be persisit
    if (idpUser && idpUser.allow_logout && !idpUserSession) {
      this.storageService.clearLocalStorage();
      this.permissionService.resetPermissions();
      window.open(idpUser.logout_url + '?return_url=' + location.origin + '/login', '_self' ,'noopener');
    }


    this.userDetails = JSON.parse(this.storageService.getUser()) ? JSON.parse(this.storageService.getUser()) : '';
    console.log('userPersonalData',this.storageService.userPersonalData);
    this.userPersonalData = this.storageService.userPersonalData ? this.storageService.userPersonalData : '';
    if (!this.userDetails) {
      this.router.navigate([Route.LOGIN]);
    }
    // Fetch all companies list only for SupreAdmin and
    // Save logged in user company details to storage
    // We can not dependent on Permissions here because Header component load first
    // before permission loads, hence we are moving with user accessType
    if (this.storageService.getAccessType() === Role.ADMIN) {
      this.getCompanies(0, '', true);
    } else {
      this.getCompanyDetails();
    }

    this.sidenavService.updateHeaderTitle$.subscribe(title => {
      this.headerTitle = title;
    });

    this.filterCompany = new FormControl();
    this.filterCompany.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((res) => {
        this.filterCompanies(res);
      });

    this.headerService.showCompanyFilter$.subscribe(hide => {
      if (!hide) {
        this.showCompanyFilter = hide;
        this.isCompanyPage = true;
      } else {
        this.isCompanyPage = false;
        this.setPermissions();
      }
    });

    // Permission received Broadcast
    this.globalService.permissionReceived$.subscribe(res => {
      this.companyPermission = this.permissionService.getPermissions(PermissionsKey.COMPANY);
      this.setPermissions();
    });

    // Update company list when user Add / Update / Deleted a company
    this.companyService.notifyCompanyListUpdated.subscribe((deletedCompanyId) => {
      console.log(deletedCompanyId)
      if (deletedCompanyId !== 0) {
        this.filteredCompanies = this.filteredCompanies.filter((companyToBeDeleted) => {
          return companyToBeDeleted.company_id !== deletedCompanyId;
        });
      } else { // For Newly added / existing updated Company
        this.getCompanies(0, '', true);
      }
    });

    // Update logged in user details on update
    this.managerService.updateUserDetails.subscribe((res) => {
      this.userDetails = this.storageService.userPersonalData;
    });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      console.log('hiiiii',this.storageService.userPersonalData);
      this.userPersonalData = this.storageService.userPersonalData;
    }, 5000);
  }

  filterCompanies(name) {
    if (!this.copyOfFilteredCompanies) { return; }
    let filteredCompanies = (JSON.parse(JSON.stringify(this.copyOfFilteredCompanies)));
    filteredCompanies = filteredCompanies.filter((company) => {
      return company['company_name'].toLowerCase().indexOf(name.toLowerCase()) !== -1;
    });
    this.filteredCompanies = filteredCompanies;
  }

  changeCompany(company, shouldSave) {
    if (company && company['company_name']) {
      this.searchKey = `${company['company_name']}` || '';
    }
    // // If stored company and selected company is same return
      this.getCompanyDetailsForOneCompany(company,shouldSave)
  }

  setSelectedCompany(company, shouldSave) {
    if (company && company['company_name']) {
      this.searchKey = `${company['company_name']}` || '';
    }
    if (shouldSave) {
      this.storageService.setCompany(company);
      const companyId = company && company.company_id ? company.company_id : 0;
      this.storageService.setCompanyId(companyId);
      // Remove all filters from search filter to remove chip
      this.globalService.removeAllChips();
      // clear all filter from Local storage
      this.storageService.clearAllStoredFilter();
      // Reset all locations
      this.locationService.resetAllLocations();
      this.delegateService.companySelected(companyId);
    }

    if (this.filterCompany) {
      this.filterCompany.setValue('');
    }
    this.selectedCompanyId = company.company_id;
    this.companyLogoUrl = company && company.company_logo ? `${company.company_logo}?${Date.now()}` : '';
    this.delegateService.companyDetailsSet(company);

    // Load dynamic fields for company
    this.companyService.loadFields(company.company_id);

    // Load Custom fields for company
      this.companyService.loadCustomFields(company.company_id);
    // load company roles
    this.getCompanySetting(company.company_id);
    this.checkIfRouteAllowed();
  }

  // Companied with custom field not allow to redirect Location and Department
  checkIfRouteAllowed() {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      if (this.router.url.indexOf('departments') !== -1 || this.router.url.indexOf('locations') !== -1) {
        this.router.navigate([Route.DASHBOARD]);
      }
    }
    if (this.globalService.isSSOCompany()) {
      if (this.router.url.indexOf('vipcodes') !== -1) {
        this.router.navigate([Route.DASHBOARD]);
      }
    }
  }

  getCompanySetting(companyID) {
    this.loginService.getSettings(companyID).subscribe((res) => {
      const response = res;
      this.globalService.setCompanyRoles(response && response.data && response.data.settings && response.data.settings.role);
      this.globalService.setCompanySetting(response && response.data && response.data.settings && response.data.settings.permission);
      this.globalService.companySettingReceived();
    });
  }

  activateAutocomplete(evt, panel = null) {
    evt.stopPropagation();
    if (panel) {
      this.autocomplete.closePanel();
      return;
    }
    this.autocomplete.openPanel();
    this.searchInput.nativeElement.focus();
  }

  setPermissions() {
    if (this.permissionService.permissions) {
      const companyPermission = this.permissionService.getPermissions(PermissionsKey.COMPANY);
      if (!this.isCompanyPage && companyPermission) {
        this.showCompanyFilter = companyPermission.list_all;
      }
    }
  }

  openLinkTerms() {
    this.globalService.addAdminGoogleEvent('Homescreen_Header_Bar_By_Terms_Viewed');
    window.open('https://1huddle.co/terms-of-service/','noopener' );
  }
  openLinkForPrivacy() {
    this.globalService.addGoogleEvent('Privacy_Policy_Viewed', 'Homescreen Header Bar', '', '');
    window.open('https://1huddle.co/privacy/','noopener');
  }

  getCompanies(startLimit = 0, filters = '', isSet = false) {
    this.companyService.getCompanies(Constants.COMPANY_NAME, 'asc', startLimit, 2000, filters,false).subscribe((res) => {
      const response: any = res;
      if (response.data) {
        this.filteredCompanies = res.data.company_list;
        if (!JSON.stringify(this.filteredCompanies)) { return; }
        this.copyOfFilteredCompanies = (JSON.parse(JSON.stringify(this.filteredCompanies)));
        this.getCompanyDetailsForOneCompany();
      }
    });
  }

  getCompanyDetailsForOneCompany(company = null,shouldSave = null) {
    let compId;
    if(!company){
      compId = this.storageService.getCompanyId();
      if (!compId) {
        compId = JSON.parse(this.storageService.getUser()).company_id;
      }
    }else{
      compId = company.company_id;
    }
    
    this.companyService.getCompanyDetails(compId).subscribe((res) => {
      const response: any = res;
      if (response.success) {
        console.log(response)
        if(!company){
        this.storageService.setCompany(response.data.company_details);
        this.setSelectedCompany(response.data.company_details, false);
        }else if(company){
          this.setSelectedCompany(response.data.company_details, shouldSave);
          
          // Update user context for super admin company switching
          if (this.storageService.getAccessType() === Role.ADMIN) {
            this.userContextService.updateCompanyContext(compId);
          }
        }
      }
    });
  }

  getCompanyDetails() {
    let compId = this.storageService.getCompanyId();
    if (!compId) {
      compId = JSON.parse(this.storageService.getUser()).company_id;
    }
    this.companyService.getCompanyDetails(compId).subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.setSelectedCompany(response.data.company_details, true);
        this.checkPaywallStatus(response.data.company_details);
        this.showCounterTitle(response.data.company_details);
      }
    });
  }
  getCompanyDetailsForPaywall() {
    const compId = JSON.parse(this.storageService.getUser());
    if (compId) {
      this.companyService.getCompanyDetails(compId.company_id).subscribe((res) => {
        const response: any = res;
        if (response.success) {
          this.showCounterTitle(response.data.company_details);
        }
      });
    }
  }

  navigateToUserDetailsPage() {
    const userType = this.userDetails.access_type === Role.MANAGER || Role.MID_MANAGER || Role.TEAM_LEAD ? Constants.MANAGER : '';
    const dialogRef = this.dialog.open(AddUserComponent, {
      // JSON parse to break reference
      data: { 'userInfo': JSON.parse(JSON.stringify(this.userDetails)), 'userType': userType, 'profileType': this.userDetails.access_type }
    });
  }

  isAdmin() {
    return this.permissionService.isAdmin();
  }

  isTeamLead() {
    return this.userDetails && this.userDetails.access_type === Role.TEAM_LEAD;
  }

  getNameFirstChar(name) {
    if (name) {
      return name.slice(0, 1);
    }
  }

  toggleDrawable() {
    this.toggleSidenav.emit();
  }

  logout() {
     this.getImageURLService.deleteCache();
    this.globalService.addAdminGoogleEvent('Homescreen_Header_Bar_By_Logged_Out');
    this.loginService.logout().subscribe((res) => { });
    const userDetails = JSON.parse(this.storageService.getsetSSODetails());
    const idpUser = userDetails && userDetails.idp_user;
    this.delegateService.selectedCompany = '';
    this.storageService.clearLocalStorage();
    this.permissionService.resetPermissions();
    const analytics = firebase.analytics();
    firebase.analytics().setUserId(null);
    if (idpUser && idpUser.allow_logout) {
      window.open(idpUser.logout_url + '?return_url=' + location.origin + '/login', '_self');
    } else {
      this.dialog.closeAll();
      this.router.navigate([Route.LOGIN]);
    }
    this.userContextService.logoutUser();
  }

  showVideo() {
    this.globalService.addGoogleEvent('Video_Play', 'Homescreen Header Bar', 'Lets Get Started', '');
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { name: this.translate.instant('lets_get_started'), 
        url: this.globalService.tutorialVideo.GET_STARTED }
      });
  }
  checkPaywallStatus(companyDeatils) {
    if (companyDeatils.paywall_status === 'ACTIVE' && this.userDetails.access_type !== Role.ADMIN) {
      this.isPaywallAcivated = true;
      this.isPaywallAcivatedForPaid = companyDeatils.account_type === 'PAID' ? true : false;
    }
    // tslint:disable-next-line:max-line-length
    const data = { 'isPaywallAcivated': this.isPaywallAcivated, 'isPaywallAcivatedForPaid': this.isPaywallAcivatedForPaid, 'userDetails': this.storageService.userPersonalData, 'companyDeatils': companyDeatils };
    this.trialExpired.emit(data);

  }

  showCounterTitle(companyDetails) {
    this.timezone = companyDetails.location_details.tz_name;
    this.today = moment(new Date()).tz(this.timezone);
    this.agreement_end_date = moment(companyDetails.paywall_end_date).tz(this.timezone);
    this.noOfDaysLeft = this.agreement_end_date.diff(this.today, 'days', true);
    this.noOfDaysLeft = Math.ceil(this.noOfDaysLeft);
    if (companyDetails.paywall_status === 'ACTIVE' && this.userDetails.access_type !== Role.ADMIN) {
      this.countdownText = companyDetails.account_type === 'PAID' ?
        this.translate.instant('counter_title_expired_paid') :
        this.translate.instant('counter_title_expired_trial');
      if (companyDetails.account_type === 'PAID') {
        this.globalService.addAdminGoogleEvent('Paywall_By_Paid_Subscription_Expired');
      } else {
        this.globalService.addAdminGoogleEvent('Paywall_By_Trial_Expired');

      }

    } else {
      if (this.noOfDaysLeft <= 7 && this.noOfDaysLeft >= 0) {
        switch (companyDetails.account_type) {
          case 'PAID':
            return this.countdownText = this.noOfDaysLeft <= 1 ? this.translate.instant('counter_title_day_left_in_paid') :
              this.translate.instant('counter_title_days_left_in_paid');
          case 'TRIAL':
            return this.countdownText = this.noOfDaysLeft <= 1 ? this.translate.instant('counter_title_day_left_in_trial') :
              this.translate.instant('counter_title_days_left_in_trial');
        }
      }
    }
  }

  removeHubsportChatboxFormobile() {

    setTimeout(() => {
      if (this.isMobile()) {
        console.log('removed from header');
        window['unloadHelp']();
      }
    }, 2000);

  }


  isMobile() {

    if (this.platform.ANDROID || this.platform.IOS) {
      return true;
    } else {
      return false;
    }
  }
}
