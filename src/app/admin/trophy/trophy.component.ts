import { Component, OnInit, HostListener, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TrophyService } from 'src/app/services/trophy/trophy.service';
import { Constants, PlaceholderText } from '../../services/network/api.service';
import { StorageService } from '../../services/storage/storage.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { Router } from '@angular/router';
import { Route } from '../../services/login/login.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { CreateGameTrophyComponent } from '../create-game-trophy/create-game-trophy.component';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { TutorialVideoComponent } from '../tutorial-video/tutorial-video.component';
import { TranslateService } from '@ngx-translate/core';

const mode = [
  { id: "true", value: "All Games" },
  { id: "false", value: "Active Games" },
];
@Component({
  selector: 'app-trophy',
  templateUrl: './trophy.component.html',
  styleUrls: ['./trophy.component.scss']
})
export class TrophyComponent implements OnInit, OnDestroy {

  trophyType = 'general';
  trophiesData;
  trophies: any;
  gameTrophy = '';
  breakpoint = 4;
  startLimit = 0;
  totalTrophies;
  noOfItemsPerPage;
  is_loading = false;
  activateLocal = false;
  trophy_info: any = {
    title: '',
    description: '',
    trophy_type: 1
  };
  title = '';
  menuList = [];
  defaultFilters = [];
  filter_options = [{
    'filter': Constants.TROPHY_NAME, value: this.translate.instant('trophy'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.TROPHY_NAME
  },
  {
  'filter': Constants.INCLUDE_DELETED, 'value': this.translate.instant('game_mode'), 'is_list_search': true,
      'placeholder': '',  'is_generic_menu': true, 'is_default': true
  }
];
 
  // menuList = [];
  trophyPermission: any;
  appliedFilters: any;
  context: String = 'trophy';
  pageSizeOptions;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('trophyDetails', { static: true }) trophyDetails;
  delegateSubscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.calculateBreakpoint();
  }
  constructor(public trophyService: TrophyService,
    public delegateService: DelegateService,
    public globalService: GlobalService,
    public router: Router,
    public dialog: MatDialog,
    public permissionService: PermissionsService,
    public storageService: StorageService,
    public translate: TranslateService,
    private cdRef: ChangeDetectorRef,
  ) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('trophy') !== -1) {
        console.log('trophy1')
        this.getTrophies();
      }
    });
  }

  ngOnInit() {
    this.setTrophyPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setTrophyPermission();
    });
    this.removeModeFilter(); // need get review from yogesh
    this.getTrophies();
    this.calculateBreakpoint();
    this.activateLocal = this.trophyType === 'general' ? true : false;
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  setTrophyPermission() {
    this.trophyPermission = this.permissionService.getPermissions(PermissionsKey.TROPHY);
  }

  calculateBreakpoint() {
    this.breakpoint = window.innerWidth / 400;
    if (this.breakpoint <= 1.8 && this.breakpoint > 1.2) {
      this.breakpoint = 1.4;
    }
  }


  getTrophies() {
    console.log('appliedFilters',this.appliedFilters);
    console.log('this.storageService.getFilterFromStroage(this.context);',this.storageService.getFilterFromStroage(this.context));
    this.is_loading = true;
    this.appliedFilters = this.storageService.getFilterFromStroage(this.context);
    console.log('applied filters: ' + JSON.stringify(this.appliedFilters));

    if(!this.appliedFilters){ // code is patch need to remove this when yogesh is back
      this.appliedFilters = "include_deleted=false"
    }
    const companyId = this.storageService.getCompanyId();
    this.trophyService.getTrophiesBy(companyId, false, this.trophyType, null, 'asc', this.appliedFilters, this.startLimit,
      this.noOfItemsPerPage).subscribe(res => {
        const response: any = res;
        if (!response.success) {
          return;
        }
        this.totalTrophies = response.data.trophies_count;
        this.is_loading = false;
        if (response.data.trophies.length) {
          this.trophiesData = response.data.trophies;
        } else {
          this.trophiesData = '';
        }
      });
  }
  trophyTypeChanged(event) {
    console.log('trophyTypeChanged');
    console.log(event);
    this.trophyDetails.nativeElement.scrollTop = 0;
    let type;
    type = event === 0 ? 'general' : 'game';
    this.trophy_info.trophy_type = type === 'general' ? 1 : 2;
    this.trophyType = type === 'general' ? 'general' : 'game';
    this.activateLocal = type === 'general' ? true : false;
    if(event === 0){
      this.removeModeFilter();
      this.storeFilters();
      this.getTrophies();
    }else{
      this.addDefaultFilter();

    }
  }

  openCreateGameTrophy() {
    const dialogRef = this.dialog.open(CreateGameTrophyComponent, {
      data: this.gameTrophy,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getTrophies();
      }
    });

  }

  refreshListOnFilterChange(filters) {
    this.appliedFilters = filters;
    // this.storageService.setFilters(this.context, filters);
    // this.startLimit = 0;
    // if (this.paginator) {
    //   this.paginator.pageIndex = 0;
    // }
    this.storeFilters();
    this.getTrophies();
  }
  storeFilters() {
    this.storageService.setFilters(this.context, this.appliedFilters);
    this.startLimit = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }
  editGameTrophy(game, previewMode) {
    if (!previewMode) {
      game.preview_mode = false;
      game.trophy_type = this.trophy_info.trophy_type;
      this.gameTrophy = game;
      this.openCreateGameTrophy();
      this.gameTrophy = '';
    } else {
      game.preview_mode = true;
      game.trophy_type = this.trophy_info.trophy_type;
      this.gameTrophy = game;
      this.addEvent();
      this.openCreateGameTrophy();
      this.gameTrophy = '';
    }
  }
  addEvent() {
    const keyName = this.trophyType === 'general' ? 'Trophies_General_Trophy_Preview' : 'Trophies_Game_Trophy_Preview';
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }
  viewReport(trophy) {
    const queryParams = {
      trophyType: this.trophyType,
      id: trophy.trophy_id,
      gameId: trophy.game_id,
      trophyName: this.trophy_info.trophy_type === 1 ? trophy.trophies_name : trophy.game_name
    };
    this.router.navigate([Route.TROPHYREPORT], {
      queryParams: queryParams
    });
  }

  getTrophiesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getTrophies();
  }

  showVideo() {
    this.globalService.addAdminGoogleEvent('Trophies_Video_Play');
    const dialogRef = this.dialog.open(TutorialVideoComponent,
      {
        disableClose: true,
        data: { name: this.translate.instant('how_to_add_trophies'), 
        url: this.globalService.tutorialVideo.ADD_TROPHIES }
      });
  }
  filterOptionUpdated(filter) {
    if (!filter) { return; }
    const keyName = this.trophyType === 'general' ? `Trophies_General_${filter.filter}` : `Trophies_Game_${filter.filter}`;
    this.globalService.addAdminGoogleEvent(keyName);
    return;
  }

  removeModeFilter() {
    this.defaultFilters = [];
    this.appliedFilters = [];
    this.storeFilters();

    // this.appliedFilters = this.defaultFilters;
    // console.log(this.context);
    // // console.log(this.storageService.getFilterArray(this.context)  );
    // console.log(this.appliedFilters);
    // const index = this.appliedFilters && this.appliedFilters.map(function (e) { return e.filter; }).indexOf(Constants.INCLUDE_DELETED);
    // console.log('index',index);

    // if (index && index !== -1) {
    //   this.appliedFilters.splice(index, 1);
    // }
  }
  
  getDataSource(filterName) {
    console.log('filterName', filterName);
    switch (filterName) {
      case Constants.INCLUDE_DELETED: 
        console.log('filterName', filterName);
        this.menuList = mode; 
        this.cdRef.detectChanges();
        break;
    }
  }
  addDefaultFilter() {
    this.defaultFilters = [];
    this.storeFilters();

    // const trophyFilters = this.storageService.getFilterArray(this.context);
    // console.log(trophyFilters);

    // if (trophyFilters && trophyFilters.length) { return; }
    const item = {
      'filter': Constants.INCLUDE_DELETED,
      'searchingIn': this.translate.instant('game_mode'),
      'value': this.translate.instant('active_games'),
      'id': 'false',
      'additionalFilter': false,
      'dependentOn': '',
      'isDefault': true
    };
   
    this.defaultFilters.push(item);
    this.appliedFilters = this.defaultFilters;
    this.storageService.setFilters(this.context, item);
    this.getTrophies();
  }
 
  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
