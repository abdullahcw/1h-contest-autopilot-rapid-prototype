import {
  Component, OnInit, ViewChild, Output, EventEmitter, ViewChildren, QueryList, HostListener, Input,
  OnChanges, SimpleChanges, OnDestroy
} from '@angular/core';
import { SidenavService } from '../../services/sidenav/sidenav.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { LoginService, User, Route } from 'src/app/services/login/login.service';
import { Role, PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { MatDialog } from '@angular/material/dialog';
import { SelectGameTypeComponent } from '../../admin/select-game-type/select-game-type.component';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { CreateContestComponent } from 'src/app/admin/create-contest/create-contest.component';
import { FeatureFlagsService } from 'src/app/services/feature-flags/feature-flags.service';
@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})



export class SidenavComponent implements OnInit, OnChanges, OnDestroy {

  companyChangeSubscription: any;
  contestElement: any;
  gameSchedulerPath: any;
  currentYear = new Date().getFullYear();
  companySettingPermissionForPinnedGames: any;
  companySettingPermissionForAddLimitsMlg: any;
  companySettingPermissionForShopGames: any;
  accountPermission: any;
  

  constructor(private sidenavService: SidenavService, public translate: TranslateService,
    private routeModule: RouterModule,
    private loginService: LoginService, public storageService: StorageService,
    private dialog: MatDialog, private delegateService: DelegateService,
    private authService: StorageService, private globalService: GlobalService,
    private router: Router, private permissionService: PermissionsService,
    private featureFlagsService : FeatureFlagsService,
    private activatedRoute: ActivatedRoute) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.currentRoute = this.router.url;
      }
    });

    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.modal && queryParams.modal === 'add-game') {
        console.log('add-game');
        this.presentGameSelectionDialog();
      }
      if (queryParams.modal && queryParams.modal === 'create-contest') {
        this.presentCreateContestDialog();
      }
    });

    this.companyChangeSubscription = this.delegateService.companyDetailsUpdated.subscribe((company) => {
      this.gameSchedulerPath = `/${Route.SCHEDULE_GAME}`;
      if (this.contestElement) {
        this.addContestsChildren(this.contestElement);
      }
      this.setPermissions();
    });
  }

  toggleDrawer = false;
  isHovered = false;
  isFixed = false;
  loggedInUser: User;
  smallDevice = false;
  showShortcuts = false;
  allowAccess = true;
  currentRoute;
  noRouteChild = ['build_game'];
  contestChild = ['create_contest'];
  @Input() isToggled;
  @Input() isToggleFixed;
  @ViewChildren('panel') expansionPanel: QueryList<any>;
  @Output() sidenavtoggle: EventEmitter<any> = new EventEmitter<any>();
  @Output() isSmall: EventEmitter<any> = new EventEmitter<any>();

  public matListItems: Array<Object> = [
    { name: 'dashboard', icon: 'dashboard', path: '/admin/dashboard', key: 'Dashboard', shortcut: 'I', canHaveChild: false },
    { name: 'the_shop', icon: 'storefront', path: '/admin/shop', key: 'The Shop', canHaveChild: false },
    { name: 'manage_games', icon: 'videogame_asset', path: 'game', key: 'Game Management', canHaveChild: true },
    { name: 'contests', icon: 'card_giftcard', path: 'contests', key: 'Contests', canHaveChild: true },
    { name: 'alerts', icon: '', path: 'contests', key: 'Contests', canHaveChild: true },
    { name: 'reports', icon: 'assessment', path: 'reports', key: 'Reports', canHaveChild: true },
    { name: 'users', icon: 'group_add', path: 'users', key: 'Users', canHaveChild: true },
    { name: 'settings', icon: 'build', path: 'wip', key: 'Settings', canHaveChild: true }
  ];

  @HostListener('mouseover') onMouseOver() {
    if (!this.isFixed && !this.isHovered && !this.smallDevice) {
      this.toggleDrawer = true;
      this.isHovered = true;
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (!this.isFixed && this.isHovered && !this.smallDevice) {
      this.toggleDrawer = false;
      this.isHovered = false;
    }
  }

  isCurrentRouteSelected(item) {
    return this.currentRoute.indexOf(item.path) !== -1;
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setSidenavStyle();
    this.setScrollableDivHeight();
    if (event.target.innerWidth <= 1024) {
      this.smallDevice = true;
      this.toggleDrawer = true;
      this.isSmall.emit(this.smallDevice);
    } else if (event.target.innerWidth >= 1024) {
      this.smallDevice = false;
      this.toggleDrawer = this.isFixed;
      this.isSmall.emit(this.smallDevice);
    }
  }

  ngOnInit() {
    if (window.innerWidth <= 1024) {
      this.smallDevice = true;
      this.toggleDrawer = true;
      this.isSmall.emit(this.smallDevice);
    } else if (window.innerWidth >= 1024) {
      this.smallDevice = false;
      this.toggleDrawer = this.isFixed;
      this.isSmall.emit(this.smallDevice);
    }
    this.currentRoute = this.router.url;

    // tslint:disable-next-line:no-shadowed-variable
    this.loginService.loginUser$.subscribe(user => {
      this.loggedInUser = user;
    });

    // Permission received Broadcast
    this.globalService.permissionReceived$.subscribe(res => {
      this.setPermissions();
    });

    // Local dev: bootstrap nav immediately (backend won't fire permissionReceived$)
    setTimeout(() => {
      this.setPermissions();
      this.globalService.companySettingReceived$.next({});
    }, 0);

    // // Permission received Broadcast
    this.globalService.companySettingReceived$.subscribe(res => {
     setTimeout(() => {
      const accessType = this.authService.getAccessType();
      this.matListItems.forEach(element => {
        switch (element['name']) {
          case 'settings':
            if (accessType === Role.ADMIN) {
              this.addSettingsChildren(element, 'all_companies', '/admin/company', 0);
            } 
            break;         
        }
      });
     }, 1000);

    });



  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && (changes.isToggleFixed) && !changes.isToggleFixed.firstChange) {
      this.toggleDrawerEvent();
    }
  }

  setSidenavStyle() {
    const setHeight = window.innerHeight - 55;
    const styles = {
      'width': (this.toggleDrawer || this.isToggled) ? '275px' : '70px', 'left': (this.isToggled || !this.smallDevice) ? '0px' : '-275px',
      'height': this.globalService.platform.IOS ? `${setHeight}px` :
        (this.toggleDrawer || this.isToggled) ? 'calc(100vh - 68px)' : 'calc(100vh - 68px)'
    };
    return styles;
  }

  setScrollableDivHeight() {
    const setHeight = window.innerHeight - 98;
    const styles = {
      'height': this.globalService.platform.IOS ? `${setHeight}px` : ''
    };
    return styles;
  }

  redirectToRoute(event, listItem) {
    if (listItem.queryParams && listItem.queryParams.modal === 'add-game') {
      this.presentGameSelectionDialog();
    }
    if (listItem.queryParams && listItem.queryParams.modal === 'create-contest') {
      this.presentCreateContestDialog();
    }
    if (event.ctrlKey || event.metaKey) {
      // open new tab but prevent in current tab
      return true;
    }
    if (this.isBuildGameClicked(listItem) || this.isCreateContestClicked(listItem)) {
    } else {
      if (listItem && listItem.queryParams) {
        console.log('listItem',listItem);

        this.router.navigate([listItem.path], { queryParams: { id: listItem.queryParams } });
      } else {
        console.log('listItem',listItem);
        this.router.navigate([listItem.path]);
      }
    }
    if (listItem.name === 'the_shop') {
      this.globalService.addAdminGoogleEvent('Marketplace_Page_Views');
    }
    if (listItem.name === 'locations') {
      this.globalService.addAdminGoogleEvent('Locations_By_Location_Page_Viewed');
    }
    if (listItem.name === 'lead_settings') {
      this.globalService.addAdminGoogleEvent('Leaderboard_By_Leaderboard_Settings_Viewed');
    }
    if (listItem.name === 'vipcodes') {
      this.globalService.addAdminGoogleEvent('VIP_Code_By_VIP_Code_Viewed');
    }
    if (listItem.name === 'contest_library') {
      this.globalService.addAdminGoogleEvent('Contests_Library_Viewed');
    }
    if (listItem.name === 'company') {
      this.globalService.addAdminGoogleEvent('Company_By_Company_Page');
    }
    if (listItem.name === 'custom_audiences') {
      this.globalService.addAdminGoogleEvent('Custom_Audience_Custom_Audience_menu_clicked');
    }
    if (listItem.name === 'shop_report') {
      this.globalService.addAdminGoogleEvent('Shop_Report_Shop_Report_Tab_Clicked');
    }
    if (listItem.name === 'layout') {
      this.globalService.addAdminGoogleEvent('Layout_Tab_Clicked');
    }
    if (listItem.name === 'pathway') {
      this.globalService.addAdminGoogleEvent('Pathway_Icon_Clicked');
    }
    
    // console.log('listItem.name',listItem.name);
    this.closeMenuOnClick();
  }

  presentGameSelectionDialog() {
    const dialogRef = this.dialog.open(SelectGameTypeComponent, {
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.router.navigate([], { queryParams: { modal: null }, queryParamsHandling: 'merge' });
    });

  }
  presentCreateContestDialog() {
    const dialogRef = this.dialog.open(CreateContestComponent, {
    });
    dialogRef.afterClosed().subscribe((res) => {
      this.router.navigate([], { queryParams: { modal: null }, queryParamsHandling: 'merge' });
    });
  }

  isBuildGameClicked(child) {
    return this.noRouteChild.indexOf(child.name) !== -1;
  }

  isCreateContestClicked(child) {
    return this.contestChild.indexOf(child.name) !== -1;
  }

  closeMenuOnClick() {
    if (!this.isFixed && this.isHovered && !this.smallDevice) {
      setTimeout(() => {
        this.toggleDrawer = false;
        this.isHovered = false;
      });
    }
    if (this.smallDevice) {
      setTimeout(() => {
        this.isSmall.emit(this.smallDevice);
      });
    }
  }

  setPermissions() {
    const accessType = this.authService.getAccessType();
    this.addSidenavElements();
    this.matListItems.forEach(element => {

      // console.log(element)
      switch (element['name']) {
        case 'settings':
          if (accessType === Role.ADMIN) {
            this.addSettingsChildren(element, 'all_companies', '/admin/company', 0);
          } else {
            const companyId = this.storageService.getCompanyId();
            this.addSettingsChildren(element, 'company', `/admin/company-details`, companyId);
          }
          break;
        case 'manage_games':
          this.addGamesChildren(element);
          break;
        case 'contests':
          this.addContestsChildren(element);
          break;
        case 'alerts':
          this.addAlertsChildren(element);
          break;
        case 'reports':
          this.addReportsChildren(element);          
          break;
        case 'users':
          this.addPlayersChildren(element);
          break;
      }
    });
  }

  addSidenavElements() {
    const shopPermissions = this.permissionService.getPermissions(PermissionsKey.SHOP);
    if (shopPermissions && !shopPermissions.view) { this.deleteElement('the_shop'); }
  }

  childernCount(childerns) {
    return childerns && childerns.filter(item => {
      return item.allow_access === true;
    }).length;
  }

  addGamesChildren(element) {
    const gamePermissions = this.permissionService.getPermissions(PermissionsKey.GAME);
    const questionPermissions = this.permissionService.getPermissions(PermissionsKey.QUESTION);
    const trophyPermissions = this.permissionService.getPermissions(PermissionsKey.TROPHY);
    const gameAttempts = this.permissionService.getPermissions(PermissionsKey.GAME_ATTEMPTS);

    if (!gamePermissions || !questionPermissions || !trophyPermissions) {
      return;
    }
    element['children'] = [
      {
        name: 'build_game', icon: 'games', path: null, key: this.translate.instant('build_game'), shortcut: '',
        allow_access: gamePermissions.add, queryParams: { modal: 'add-game' }
      },
      {
        name: 'game_library', icon: 'dns', path: '/admin/games', key: this.translate.instant('game_library'), shortcut: 'G',
        allow_access: gamePermissions.show_games

      },
      {
        name: 'questions', icon: 'question_answer', path: '/admin/questions', key: this.translate.instant('questions'), shortcut: 'X',
        allow_access: questionPermissions.show_questions
      },
      {
        name: 'schedule_game', icon: 'calendar_today', path: this.gameSchedulerPath,
        key: this.translate.instant('schedule_game'), allow_access: gamePermissions.show_schedules
      },
      {
        name: 'attempts', icon: 'control_point', path: '/admin/player-attempts',
        key: this.translate.instant('add_attempts'), allow_access: gameAttempts.show_attempts
      },
      {
        name: 'player_feedback', icon: 'feedback', path: '/admin/player-feedback', key: this.translate.instant('player_feedback'),
        shortcut: 'F',
        allow_access: questionPermissions.show_questions

      },
      {
        name: 'trophies', icon: '', path: '/admin/trophy', key: this.translate.instant('fixed_trophies'), shortcut: 'T',
        allow_access: trophyPermissions.show_trophies
      }
    ];
  }

  getShowManagersPermissionAsPerRoleAndFeatureFlag(show_managers){
    if(this.storageService.getAccessType() === Role.TEAM_LEAD){
      return this.featureFlagsService.isMidManagerScopeEnhancementEnabled();
    }

    return show_managers;
  }

  addPlayersChildren(element) {
    const playerPermissions = this.permissionService.getPermissions(PermissionsKey.PLAYER);
    const managerPermissions = this.permissionService.getPermissions(PermissionsKey.MANAGER);
    if (!(playerPermissions || managerPermissions)) { return; }
    element['children'] = [
      {
        name: 'players', icon: 'people', path: '/admin/players', key: this.translate.instant('players'), shortcut: 'P',
        allow_access: playerPermissions.show_players
      },
      {
        name: 'managers', icon: 'people_outline', path: '/admin/managers', key: this.translate.instant('managers'), shortcut: 'M',
        allow_access: this.getShowManagersPermissionAsPerRoleAndFeatureFlag(managerPermissions.show_managers)
      }
    ];
  }

  addReportsChildren(element) {
    const report = this.permissionService.getPermissions(PermissionsKey.REPORT);
    const incompleteSessions = this.permissionService.getPermissions(PermissionsKey.INCOMPLETE_SESSIONS);
    const companyDeatils = this.storageService.getCompany();
    const shopReport = companyDeatils && companyDeatils.permission && companyDeatils.permission.shop_settings && companyDeatils.permission.shop_settings.show_shop;
    this.globalService.companySettingReceived$.subscribe(res => {
      this.companySettingPermissionForShopGames = this.globalService.getCompanySetting(PermissionsKey.SHOP_GAMES);      
      this.storageService.setObject('manager-first-shop-game', this.companySettingPermissionForShopGames.has_manager_shopped);
    });

    if (!(report || incompleteSessions)) { return; }
    element['children'] = [
      {
        name: 'accuracy', icon: '', path: '/admin/reports/questions-report', key: this.translate.instant('accuracy'), shortcut: 'T',
        allow_access: report.show_reports
      },
      {
        name: 'shop_report', icon: 'summarize', path: '/admin/reports/shop-report', key: this.translate.instant('shop_report'),
        allow_access: shopReport
      },
      {
        name: 'trophy_report', icon: '', path: '/admin/reports/trophy-list', key: this.translate.instant('trophy_report'), shortcut: 'T',
        allow_access: report.show_reports
      },
      {
        name: 'live_sessions', icon: 'block', path: '/admin/live-sessions',
        key: this.translate.instant('live_sessions'), allow_access: incompleteSessions.show_incomplete_sessions
      },
      {
        name: 'monthly_email', icon: 'mail', path: '/admin/tips', key: this.translate.instant('monthly_email'), shortcut: 'M',
        allow_access: this.permissionService.isAdmin()
      },
      {
        name: 'more_reports', icon: '', path: '/admin/more-reports',
        key: this.translate.instant('more_reports'), allow_access: true
      }
    ];
  }

  addContestsChildren(element) {
    this.contestElement = element;
    const contestPermissions = this.permissionService.getPermissions(PermissionsKey.CONTEST);
    if (!contestPermissions) { return; }
    element['children'] = [
      {
        name: 'create_contest', icon: 'games', path: null, key: this.translate.instant('create_contest'), shortcut: '',
        allow_access: contestPermissions.add, queryParams: { modal: 'create-contest' }
      },
      {
        name: 'contest_library', icon: 'dns', path: '/admin/contests',
        key: this.translate.instant('contest_library'), allow_access: contestPermissions.show_contest
      },
    ];
  }

  addAlertsChildren(element) {
    this.contestElement = element;
    const contestPermissions = this.permissionService.getPermissions(PermissionsKey.CONTEST);
    const notification = this.permissionService.getPermissions(PermissionsKey.NOTIFICATION);
    if (!contestPermissions) { return; }
    element['children'] = [
      {
        name: 'notifications', icon: 'notifications', path: '/admin/notifications',
        key: this.translate.instant('notification_settings'), shortcut: 'N', allow_access: notification.show_notifications
      },
      {
        name: 'popup_alerts', icon: 'campaign', path: '/admin/popup-alerts',
        key: this.translate.instant('popup_alerts'), allow_access: this.storageService.getAccessType() === Role.ADMIN
      },
    ];
  }

  addSettingsChildren(element, companyOptionText, routePath, companyId) {
   
    const companyPermission = this.permissionService.getPermissions(PermissionsKey.COMPANY);
    const reorder_gamesPermission = this.permissionService.getPermissions(PermissionsKey.REORDER_GAMES);
    const locationPermission = this.permissionService.getPermissions(PermissionsKey.LOCATION);
    const departmentPermission = this.permissionService.getPermissions(PermissionsKey.DEPARTMENT);
    const groupPermission = this.permissionService.getPermissions(PermissionsKey.GROUP);
    const companyDeatils = this.storageService.getCompany();
    const show_vip_codes = companyDeatils && companyDeatils.permission && companyDeatils.permission.vip_code && companyDeatils.permission.vip_code.show_vip_codes;

    let companySettingPermission = this.globalService.getCompanySetting(PermissionsKey.VIP_CODE);
    this.globalService.companySettingReceived$.subscribe(res => {
      companySettingPermission = this.globalService.getCompanySetting(PermissionsKey.VIP_CODE);
      this.companySettingPermissionForPinnedGames = this.globalService.getCompanySetting(PermissionsKey.GAMES);
      this.companySettingPermissionForAddLimitsMlg = this.globalService.getCompanySetting(PermissionsKey.MULTILEVEL_GAMES);
      this.accountPermission = this.globalService.getCompanySetting(PermissionsKey.ACCOUNTS);
      this.storageService.setKeyForFirstManagerLogin('manager-first-pin-game', this.companySettingPermissionForPinnedGames.has_manager_pinned);
      this.storageService.setKeyForFirstManagerLogin('manager-first-set-limit', this.companySettingPermissionForAddLimitsMlg.has_manager_set_limits);
      this.storageService.setObject('show-csm-account', this.accountPermission && this.accountPermission.show_accounts);
    });
    const customAudience = this.permissionService.getPermissions(PermissionsKey.CUSTOM_AUDIENCE);
    const leaderboard = this.permissionService.getPermissions(PermissionsKey.LEADERBOARD);
    const reorder_games = this.permissionService.getPermissions(PermissionsKey.REORDER_GAMES);
    const gameCategory = this.permissionService.getPermissions(PermissionsKey.GAME_CATEGORY);
    const layoutPermission = this.permissionService.getPermissions(PermissionsKey.LIVE_GAME_POSITION);
    let account = false;
    setTimeout(() => {
      account = true;
      console.log('account',account);
    }, 4000);

    if (!companyPermission || !locationPermission || !departmentPermission) {
      return;
    }
    const dynamicChildList = [
      {
        name: companyOptionText, icon: 'info', queryParams: companyId,
        path: routePath, key: this.translate.instant('company_details'), shortcut: 'C',
        allow_access: companyPermission.show_company, custom_menu_Item: false
      },
   
      {
        name: 'accounts', icon: '', path: '/admin/accounts',
        key: this.translate.instant('accounts'), allow_access: this.storageService.getObject('show-csm-account'),
      },
      {
        name: 'layout', icon: '', path: '/admin/game-layout',
        key: this.translate.instant('layout'), allow_access: layoutPermission.show_position, custom_menu_Item: false
      },
      {
        name: 'lead_settings', icon: 'trending_up', path: '/admin/leaderboard',
        key: this.translate.instant('lead_settings'), shortcut: 'S', allow_access: leaderboard.show_leaderboard
      },
      {
        name: 'locations', icon: 'location_on', path: '/admin/locations', key: this.translate.instant('locations'), shortcut: 'L',
        allow_access: locationPermission.show_locations, custom_menu_Item: true
      },
      {
        name: 'departments', icon: 'category', path: '/admin/departments', key: this.translate.instant('departments'),
        shortcut: 'D', allow_access: departmentPermission.show_departments, custom_menu_Item: true
      },
      {
        name: 'custom_audiences', icon: 'groups', path: '/admin/custom-audience', key: this.translate.instant('custom_audiences'),
        allow_access: customAudience.show_audience, custom_menu_Item: false
      },
      {
        name: 'groups', icon: 'group_work', path: '/admin/groups', key: this.translate.instant('groups'), shortcut: 'B',
        allow_access: groupPermission.show_groups, custom_menu_Item: false
      },
      {
        name: 'ip_configuration', icon: 'wifi_proxy', path: '/admin/ip-configuration', key: this.translate.instant('ip_configuration'),
        allow_access: companyDeatils.ip_whitelisting && this.storageService.getAccessType() === Role.ADMIN, custom_menu_Item: false
      },
      {
        name: 'game_categories', icon: '', path: '/admin/game-categories', key: this.translate.instant('game_categories'),
        allow_access: gameCategory.show_category, custom_menu_Item: false
      },
      {
        name: 'pathway', icon: '', path: '/admin/game-pathways', key: this.translate.instant('pathway'),
        allow_access: gameCategory.show_category, custom_menu_Item: false
      },
      {
        name: 'vipcodes', icon: 'local_activity', path: '/admin/vipcodes', key: this.translate.instant('vip_code'),
        allow_access: companyDeatils.is_sso_company ? !companyDeatils.is_sso_company : show_vip_codes
      },
      {
        name: 'branding', icon: 'color_lens', path: '/admin/branding', key: this.translate.instant('branding'), shortcut: 'B',
        allow_access: companyPermission.show_brandings, custom_menu_Item: false
      }
    ];
    element['children'] = this.filterCustomElements(dynamicChildList);
  }

  filterCustomElements(elements) {
    if (this.globalService.isCompanyBelongsToCustomField()) {
      elements = elements.filter(function (obj) {
        return !obj.custom_menu_Item;
      });
    }
    return elements;
  }
  deleteElement(elementName: String) {
    this.matListItems = this.matListItems.filter(element => element['name'] !== elementName);
  }

  routeShortcutRedirection(key) {
    switch (key) {
      case 'KeyI':
        this.router.navigate([Route.DASHBOARD]);
        break;
      case 'KeyC':
        const user = JSON.parse(this.authService.getUser());
        if (user.access_type === Role.TEAM_LEAD) {
          return;
        }
        const path = user.access_type === Role.MANAGER ? Route.MANAGER_COMPANY_DETAILS_PAGE : Route.COMPANY_PAGE;
        this.router.navigate([path]);
        break;
      case 'KeyL':
        this.router.navigate([Route.LOCATIONS]);
        break;
      case 'KeyD':
        this.router.navigate([Route.DEPARTEMENT]);
        break;
      case 'KeyG':
        this.router.navigate([Route.GAMES]);
        break;
      case 'KeyA':
        break;
      case 'KeyT':
        this.router.navigate([Route.TROPHY]);
        break;
      case 'KeyB':
        this.router.navigate([Route.GROUPS]);
        break;
      case 'KeyP':
        this.router.navigate([Route.PLAYERS]);
        break;
      case 'KeyM':
        this.router.navigate([Route.MANAGERS]);
        break;
      case 'KeyU':
        this.router.navigate([Route.WIP]);
        break;
      case 'KeyS':
        this.router.navigate([Route.WIP]);
        break;
      case 'KeyN':
        this.router.navigate([Route.NOTIFICATIONS]);
        break;
      case 'KeyA':
        this.router.navigate([Route.WIP]);
        break;
      case 'KeyX':
        this.router.navigate([Route.QUESTIONS]);
        break;
    }
  }

  toggleDrawerEvent() {
    this.isFixed = !this.isFixed;
    this.toggleDrawer = this.isFixed;
    this.sidenavtoggle.emit(this.isFixed);
  }

  closeDrawble() {
    this.sidenavtoggle.emit();
  }

  closePanel() {
    const panel = this.expansionPanel.toArray();
    for (const elem of panel) {
      if (elem) {
        elem.close();
      }

    }
  }

  ngOnDestroy(): void {
    if (this.companyChangeSubscription) {
      this.companyChangeSubscription.unsubscribe();
    }
  }
}


