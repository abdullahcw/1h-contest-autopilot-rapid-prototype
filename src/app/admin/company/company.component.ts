import { Component, OnInit, ViewChild, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { CompanyService } from '../../services/company/company.service';
import { Constants, PlaceholderText } from '../../services/network/api.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Route } from 'src/app/services/login/login.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';
import { GlobalService, Paginations } from 'src/app/services/global/global.service';
import { HeaderService } from 'src/app/services/header/header.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { LocationService } from 'src/app/services/location/location.service';
import { Location, DatePipe } from '@angular/common';
import { CustomDatepickerComponent } from '../custom-datepicker/custom-datepicker.component';
import { Range, DashboardService } from 'src/app/services/dashboard/dashboard.service';
import moment from 'moment-timezone';
import { ApiService } from 'src/app/services/network/api.service';

const DATE_FORMAT: any = 'YYYY-MM-DD';
@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})

export class CompanyComponent implements OnInit {
  visible = true;
  test = false;
  focus = false;
  is_loading = false;
  company_list = [];
  dataSource;
  appliedFilters = [];
  agreement_end_from = null;
  agreement_end_to = null;
  selectedRange;
  clearSelected = '';
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @Output() hideCompanySearch: EventEmitter<any> = new EventEmitter();
  displayedColumns: string[] = ['company_logo', 'company', 'csr', 'sdr', 'account_type', 'paywall_status', 'end_date', 'webapp','shop'];

  paywallStatus = [{ 'id': 'active', 'value': this.translate.instant('active') },
  { 'id': 'inactive', 'value': this.translate.instant('inactive') }];

  accountType = [{ 'id': 'paid', 'value': this.translate.instant('paid') }, { 'id': 'trial', 'value': this.translate.instant('trial') }];
  filter_options = [{
    'filter': Constants.COMPANY_NAME, value: this.translate.instant('company'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.COMPANY_NAME
  },
  {
    'filter': Constants.CITY, value: this.translate.instant('city'), 'is_text_search': true, 'is_list_search': false,
    'placeholder': PlaceholderText.CITY_NAME
  },
  {
    'filter': Constants.COUNTRY_ID, value: this.translate.instant('country'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.COUNTRY_NAME, 'is_generic_menu': true
  },
  {
    'filter': Constants.STATE_ID, value: this.translate.instant('state'), 'is_text_search': true, 'is_list_search': true,
    'dependent_on': Constants.COUNTRY_ID, 'placeholder': PlaceholderText.STATE_NAME, 'is_generic_menu': true
  },
  {
    'filter': Constants.ACCOUNT_TYPE, value: this.translate.instant('account_type'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.ACCOUNT_TYPE, 'is_generic_menu': true
  },
  {
    'filter': Constants.PAYWALL_STATUS, value: this.translate.instant('paywall_status'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.PAYWALL_STATUS, 'is_generic_menu': true
  }, {
    'filter': Constants.CSR_IDS, value: this.translate.instant('csr'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.CSR_NAME, 'is_multi_selection': true, 'is_generic_menu': true, 'custom_menu_Item': true
  },
  {
    'filter': Constants.SDR_IDS, value: this.translate.instant('sdr'), 'is_text_search': true, 'is_list_search': true,
    'placeholder': PlaceholderText.SDR_NAME, 'is_multi_selection': true, 'is_generic_menu': true, 'custom_menu_Item': true
  }
  ];

  sort = {
    'sortBy': Constants.COMPANY_NAME,
    'order': 'asc'
  };
  pageIndex = 0;
  startLimit = 0;
  totalCompanies = 0;
  noOfItemsPerPage: number;
  context = 'companies';
  pageSizeOptions: number[];
  parms: Params;
  menuList = [];
  csrList: any[];
  sdrList: any[];
  custom_agreement_end_to: string;
  custom_agreement_end_from: string;


  constructor(public translate: TranslateService, public permissionService: PermissionsService, public locationService: LocationService,
    public router: Router, public companyService: CompanyService, public matDialog: MatDialog, public delegateService: DelegateService,
    private apiService: ApiService, public storageService: StorageService, public globalService: GlobalService,
    public headerService: HeaderService, public activatedRoute: ActivatedRoute, private datePipe: DatePipe,
    private dashboardService: DashboardService, public location: Location, public cdRef: ChangeDetectorRef,
    private dialog: MatDialog) {

    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;

    this.activatedRoute.params.subscribe(params => {
      this.parms = params;
      this.pageIndex = params['pageIndex'];
      if (params['pageIndex'] && params['pageLimit']) {
        this.startLimit = params['pageIndex'] * params['pageLimit'];
        this.noOfItemsPerPage = params['pageLimit'];
      } else {
        this.noOfItemsPerPage = 20;
      }
    });
  }

  refreshListOnFilterChange(filters) {
    // Reset page index of paginator whenever there is a filter
    this.appliedFilters = filters;
    this.startLimit = 0;
    this.paginator.pageIndex = 0;
    const url = this.router.createUrlTree([Route.COMPANY_PAGE, 0, this.noOfItemsPerPage]).toString();
    this.location.go(url);
    this.storeFilters(filters);
  }

  ngOnInit() {
    // Hide Company Selection filter
    this.headerService.showCompanyFilter(false);

    if (!this.storageService.getFilterFromStroage(this.context)) {
      this.getCompanies();
    }
    this.getCountries();
  }
  onSelectionChanged(companyData) {
    this.shopForPlayersUpdated(companyData);
  }
  shopForPlayersUpdated(companyData){
    this.is_loading = true;
    const payload = {
      'status': companyData.shop_for_players,
      'company_id':companyData.company_id
    }
    this.companyService.updateShopForPlayers(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      if (!response.success) {
        return;
      }
      this.globalService.addAdminGoogleEvent(`Shop_Game_Turned_${companyData.shop_for_players}`); 
    });
  }
  getDateTime(date) {
    return date != '0000-00-00 00:00:00' ? this.datePipe.transform(date.replace(/ /g, 'T'), 'MM/dd/yyyy') : '---';
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    if (this.pageIndex) {
      this.paginator.pageIndex = this.pageIndex;
    }
    this.paginator.page.subscribe(page => {
      if (this.parms && this.parms['pageIndex'] && this.parms['pageLimit']) {
        this.startLimit = this.parms['pageIndex'] * this.parms['pageLimit'];
        this.noOfItemsPerPage = page['pageSize'];
      } else {
        this.noOfItemsPerPage = 20;
      }
      this.activatedRoute.queryParams.subscribe((res) => {
        let url;
        url = this.router.createUrlTree([Route.COMPANY_PAGE, page.pageIndex, this.noOfItemsPerPage]).toString();
        this.location.go(url);
      });
    });
    this.globalService.getFormattedPaginationLabel(this.paginator);
    this.cdRef.detectChanges();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Reset Company selectinn filter
    this.headerService.showCompanyFilter(true);
  }


  getDataSource(filter) {
    const filterName = filter['filter'];
    switch (filterName) {
      case Constants.COUNTRY_ID:
        this.getCountries();
        break;
      case Constants.STATE_ID:
        this.getStateList();
        break;
      case Constants.PAYWALL_STATUS:
        this.menuList = [] = this.paywallStatus;
        break;
      case Constants.ACCOUNT_TYPE:
        this.menuList = [] = this.accountType;
        break;
      case Constants.CSR_IDS:
        this.getCsr();
        break;
      case Constants.SDR_IDS:
        this.getSdr();
        break;
      default:
        break;
    }
  }

  getCompanies() {
    this.is_loading = true;
    let appliedFilters = this.storageService.getFilterFromStroage(this.context) || '';
    appliedFilters = this.dateRangeFilter(appliedFilters);
    // tslint:disable-next-line:max-line-length
    this.companyService.getCompanies(this.sort.sortBy, this.sort.order, this.startLimit, this.noOfItemsPerPage, appliedFilters).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        this.totalCompanies = response.data.total_companies;
        this.company_list = response['data']['company_list'];
        this.dataSource = new MatTableDataSource(this.company_list);
      }
    });
  }

  storeFilters(filters) {
    // Reset start limit and pageIndex on Filter
    this.storageService.setFilters(this.context, filters);
    this.getCompanies();
  }


  showAddCompanyDialog() {
    this.navigateToCompanyDetailsPage();
  }

  getCountries() {
    this.locationService.getCountries().subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      if (response.data) {
        const countries = response.data.countries;
        this.menuList = [];
        countries.forEach(country => {
          this.menuList.push({ id: country.country_id, value: country.country_name });
        });
      }
    });
  }

  getStateList() {
    const countryId = this.findCountryIdFromFilters();
    if (countryId === null) {
      return;
    }
    this.locationService.getStates(countryId).subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      if (response.data) {
        const states = response.data.states;
        this.menuList = [];
        states.forEach(state => {
          // HARDCODED, FIXME, REMOVE ONCE FIXED FROM BACKEND
          if (state.state_name !== 'No State') {
            this.menuList.push({ id: state.state_id, value: state.state_name });
          }
        });
      }
    });
  }

  findCountryIdFromFilters() {
    const countryFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['filter'] === Constants.COUNTRY_ID;
    });
    if (countryFilters && countryFilters.length > 0) {
      return countryFilters[0]['id'];
    }
    return null;
  }

  sortData(sort: Sort) {
    switch (sort.active) {
      case 'company':
        this.sort.sortBy = Constants.COMPANY_NAME;
        break;
      case 'country':
        this.sort.sortBy = Constants.COUNTRY_NAME;
        break;
      case 'state':
        this.sort.sortBy = Constants.STATE_NAME;
        break;
      case 'city':
        this.sort.sortBy = Constants.CITY;
        break;
      case 'paywall_status':
        this.sort.sortBy = Constants.PAYWALL_STATUS;
        break;
      case 'end_date':
        this.sort.sortBy = Constants.PAYWALL_END_DATE;
        break;
      case 'account_type':
        this.sort.sortBy = Constants.ACCOUNT_TYPE;
        break;
      case 'csr':
        this.sort.sortBy = Constants.CSR_NAME;
        break;
      case 'sdr':
        this.sort.sortBy = Constants.SDR_NAME;
        break;

      default:
        this.sort.sortBy = Constants.COMPANY_NAME;
        break;
    }
    this.sort.order = sort.direction;
    this.getCompanies();
  }

  navigateToCompanyDetailsPage(company = null) {
    this.companyService.setSelectedcompany(company);
    this.router.navigate([Route.COMPANY_DETAILS_PAGE], { queryParams: { 'id': company ? company.company_id : 0 } });
  }

  getCompaniesOverPagination(pageEvent) {
    this.noOfItemsPerPage = pageEvent.pageSize;
    this.startLimit = pageEvent.pageIndex * pageEvent.pageSize;
    this.getCompanies();
  }

  getGenericDateRange(data) {
    this.agreement_end_from = data.startDate;
    this.agreement_end_to = data.endDate;
    this.selectedRange = data.selectedRange;
    this.storeDashboardFilter(this.selectedRange);
    if (this.selectedRange !== Range.CUSTOM) {
      this.getCompanies();
    }
  }

  getCustomDateRange(value) {
    this.getCustomDate();
  }

  getCustomDate() {
    const userEmail = this.storageService.getObject('user').email;
    const dialogRef = this.dialog.open(CustomDatepickerComponent, {
      data: {
        disableEmail: true,
        isCompany: true,
        startDate: this.custom_agreement_end_from || '',
        endDate: this.custom_agreement_end_to || '',
        selectedRange: this.selectedRange
      }
    });
    dialogRef.componentInstance.dateRangePicked.subscribe((data) => {
      this.agreement_end_from = moment(data.startDate).format(DATE_FORMAT);
      this.agreement_end_to = moment(data.endDate).format(DATE_FORMAT);
      this.custom_agreement_end_from = moment(data.startDate).format(DATE_FORMAT);
      this.custom_agreement_end_to = moment(data.endDate).format(DATE_FORMAT);
      this.selectedRange = data.selectedRange;
      this.storeDashboardFilter(Range.CUSTOM);
      this.getCompanies();
    });
    dialogRef.componentInstance.dateRangeCancel.subscribe((data) => {
      this.storageService.$defaultSetAsClear.next(Range.CLEAR);
      this.agreement_end_from = null;
      this.agreement_end_to = null;
      this.custom_agreement_end_from = null;
      this.custom_agreement_end_to = null;
      this.selectedRange = Range.CLEAR;
      this.getCompanies();
    });
  }

  storeDashboardFilter(value = null) {
    let companyFilter;
    if (value && value === Range.CLEAR) {
      companyFilter = {
        'range': this.selectedRange,
        'agreement_end_from': '',
        'agreement_end_to': ''
      };
    } else {
      companyFilter = {
        'range': this.selectedRange,
        'agreement_end_from': this.agreement_end_from,
        'agreement_end_to': this.agreement_end_to
      };
    }
    this.storageService.setObject('companies', companyFilter);
  }

  // temporary fixed need to changes in future
  dateRangeFilter(filter) {
    if (this.selectedRange === Range.CLEAR) {
      this.storageService.$defaultSetAsClear.next(Range.CLEAR);
      return filter;
    } else {
      const rangeObj = this.storageService.getObject(this.context);
      if (!rangeObj) {
        return;
      }
      if (filter) {
        return `${filter}&agreement_end_from=${rangeObj.agreement_end_from}&agreement_end_to=${rangeObj.agreement_end_to}`;
      } else {
        return `agreement_end_from=${rangeObj.agreement_end_from}&agreement_end_to=${rangeObj.agreement_end_to}`;
      }
    }

  }


  getCsr() {
    this.companyService.getCSR().subscribe((res) => {
      const response: any = res;
      let csr_list = [];
      const csrList = [];
      if (!response.success) { return; }
      if (response.data) {
        csr_list = response.data.csr_list;
      }
      csr_list.forEach((csr) => {
        csrList.push({
          id: csr.csr_id,
          value: csr.csr_name,
        });
      });
      const filterInfo = { 'filter_name': Constants.CSR_IDS, 'searching_in': this.translate.instant('csr')};
      this.csrList = this.globalService.prepareSelectionList(csrList, filterInfo, this.appliedFilters);
      this.menuList = this.csrList;
      this.cdRef.detectChanges();
    });
  }
  getSdr() {
    this.companyService.getSDR().subscribe((res) => {
      const response: any = res;
      let sdr_list = [];
      const sdrList = [];
      if (!response.success) { return; }
      if (response.data) {
        sdr_list = response.data.sdr_list;
      }
      sdr_list.forEach((sdr) => {
        sdrList.push({
          id: sdr.sdr_id,
          value: sdr.sdr_name,
        });
      });
      const filterInfo = { 'filter_name': Constants.SDR_IDS, 'searching_in': this.translate.instant('sdr') };
      this.sdrList = this.globalService.prepareSelectionList(sdrList, filterInfo, this.appliedFilters);
      this.menuList = this.sdrList;
      this.cdRef.detectChanges();
    });

  }
}
