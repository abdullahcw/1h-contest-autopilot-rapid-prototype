
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment-timezone';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { GlobalService, Paginations, Range } from 'src/app/services/global/global.service';
import { ApiService, Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatTableDataSource } from '@angular/material/table';
import { Route } from 'src/app/services/login/login.service';
import { MarketplaceService } from 'src/app/services/marketplace/marketplace.service';
import { Router } from '@angular/router';

const DATE_FORMAT: any = 'YYYY-MM-DD';

@Component({
  selector: 'app-shop-report',
  templateUrl: './shop-report.component.html',
  styleUrls: ['./shop-report.component.scss']
})
export class ShopReportComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  sort = {
    'sortBy': Constants.GAME_NAME,
    'order': 'asc'
  };
  companyId;
  is_loading = false;
  startLimit = 0;
  pageIndex = 0;
  totalCount = 0;
  noOfItemsPerPage: number;
  shopDataSource: any;
  menuList = [];
  appliedFilters = [];
  context = 'shop_report';
  allowMultiSelect = true;
  shopReportList;
  pageSizeOptions: number[];
  gameListForFilters = [];
  selectedRange;
  timeZone: string = null;
  startDate;
  endDate;
  range;
  displayedColumns: string[] = ['game', 'category', 'no_of_request', 'games_played', 'action'];
  delegateSubscription: any;
  
  constructor(private storageService: StorageService,
    private reportService: DashboardService,
    private globalService: GlobalService,
    private apiService: ApiService,
    public translate: TranslateService,
    private delegateService: DelegateService,
    public marketplaceService: MarketplaceService,
    public router: Router,
    private cdRef: ChangeDetectorRef) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      this.getShopReport();
    });

    this.range = Range;
  }

  ngOnInit(): void {
    this.setDateRange(true);
    this.getShopReport();
  }

  getShopReport() {
    this.is_loading = true;
    this.reportService.getShopReport(this.storageService.getCompanyId(), this.startDate, this.endDate, this.sort.sortBy, this.sort.order, this.startLimit,
    this.noOfItemsPerPage)
      .subscribe(res => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) {
          this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
          return;
        }
        this.shopReportList = [] = response.data.game_reports;
        this.totalCount = response.data.total_count;
        this.shopDataSource = new MatTableDataSource(this.shopReportList);
      });
    this.cdRef.detectChanges();
  }

  setDateRange(refreshQuestionReport) {
    const shopReportLocalSetting = this.getShopDateRangeFilter();
    this.selectedRange = shopReportLocalSetting && shopReportLocalSetting['range'] ? shopReportLocalSetting['range'] : Range.ALL_TIME;
    // Set this start and end date of month as default start date
    this.startDate = shopReportLocalSetting && shopReportLocalSetting['start_date'] ? shopReportLocalSetting['start_date'] : null;
    this.endDate = shopReportLocalSetting && shopReportLocalSetting['end_date'] ? shopReportLocalSetting['end_date'] : null;
      console.log(this.selectedRange, this.startDate, this.endDate);
    if (!this.startDate || !this.endDate) {
      this.setRange(this.selectedRange, refreshQuestionReport);
    }
  }

  setRange(value, shouldRefresh = true) {
    if (!this.timeZone) {
      const company = this.storageService.getCompany();
      this.timeZone = (company && company['location_details']) ? company['location_details']['tz_name'] : '';
    }
    switch (value) {
      case Range.ALL_TIME:
        this.startDate = null;
        this.endDate = null;
        this.globalService.addAdminGoogleEvent('Shop_Report_Shop_Game_All_Time_Selected');
        break;
      case Range.THIS_QT:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).startOf('quarter').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).endOf('quarter').format(DATE_FORMAT);
        }
       this.globalService.addAdminGoogleEvent('Shop_Report_Shop_Game_This_Quarter_Selected');
        break;
      case Range.LAST_QT:
        if (this.timeZone) {
          this.startDate = moment().tz(this.timeZone).subtract(1, 'quarter').startOf('quarter').format(DATE_FORMAT);
          this.endDate = moment().tz(this.timeZone).subtract(1, 'quarter').endOf('quarter').format(DATE_FORMAT);
        }
        this.globalService.addAdminGoogleEvent('Shop_Report_Shop_Game_Last_Quarter_Selected');
        break;
    }
    this.storeShopDateRangeFilter(value);
    if (shouldRefresh) {
      this.getShopReport();
    }
  }

  getShopDateRangeFilter() {
    return this.storageService.getObject('shop-report-filter');
  }

  storeShopDateRangeFilter(value) {
    const accuracyDateRangeFilter = {
      'range': value,
      'start_date': this.startDate,
      'end_date': this.endDate
    };
    this.storageService.setObject('shop-report-filter', accuracyDateRangeFilter);
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'game':
        this.sort.sortBy = Constants.GAME_NAME;
        break;
      case 'category':
        this.sort.sortBy = Constants.CATEGORY_NAME;
        break;
      case 'no_of_request':
        this.sort.sortBy = Constants.NO_OF_REQUEST;
        break;
      case 'games_played':
        this.sort.sortBy = Constants.GAMES_PLAY_COUNT;
        break;
    }
    this.sort.order = sort.direction;
    this.getShopReport();
  }

  navigateToShopGame(shopGame) {
    const shop = {
      category_id: shopGame.category_id,
      game_id: shopGame.game_id
    };
    console.log(shop);
    this.storageService.setObject('shop', shop);
    this.marketplaceService.shopGameBeingEdited = shopGame;
    this.router.navigate([Route.MARKETPLACE_GAME]);
    this.globalService.addAdminGoogleEvent('Shop_Report_Shop_Report_Add_To_Library_Clicked');
  }

  getShopReportOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getShopReport();
  }

  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
