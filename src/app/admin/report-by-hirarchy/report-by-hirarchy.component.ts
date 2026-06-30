import { Component, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Paginations, GlobalService } from 'src/app/services/global/global.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { ApiService } from 'src/app/services/network/api.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-report-by-hirarchy',
  templateUrl: './report-by-hirarchy.component.html',
  styleUrls: ['./report-by-hirarchy.component.scss']
})
export class ReportByHirarchyComponent implements OnInit, OnChanges {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() hierarchyReportPayload;
  @Output() updateFilters = new EventEmitter();
  @Output() addDefaultFilter = new EventEmitter();
  dataSource = new MatTableDataSource();
  dashboardFilter;
  pageSizeOptions: number[];
  noOfItemsPerPage: number;
  displayedColumns;
  is_loading = false;
  messageToDisplay = this.translate.instant('no_records_found');
  isDefaultApplied = false;
  managerId = '';
  defaultManager = '';
  constructor(
    public dashboardService: DashboardService,
    private globalService: GlobalService,
    private apiService: ApiService,
    public translate: TranslateService,
    public storageService: StorageService
  ) {
    // Set Default items per page and number of items per page
    this.pageSizeOptions = Paginations.PAGE_SIZE_OPTIONS;
    this.noOfItemsPerPage = Paginations.DEFAULT_ITEM_PER_PAGE;
  }

  ngOnInit() {
  }

  ngOnChanges() {
    this.defaultManager = this.storageService.getLoginUserID();
    this.dataSource = null;
    this.getDashboardFilter();
    this.prepareDisplayedColumns();
    this.checkAppliedManager();
    this.getHirarchyreport();
  }

  ngAfterViewInit() {
    this.globalService.getFormattedPaginationLabel(this.paginator);
  }

  checkAppliedManager() {
    const appliedFilters = this.storageService.getObject('allFilters');
    appliedFilters.forEach(filter => {
      if (filter.key === 'dashboard') {
        const reporteeList = filter.value.filter((item) => item.isHierarchy);
        this.managerId = reporteeList && reporteeList.length ? reporteeList[reporteeList.length - 1].id : this.defaultManager;
      }
    });
  }

  getDashboardFilter() {
    this.dashboardFilter = this.storageService.getObject('dashboard-filter');
  }

  prepareDisplayedColumns() {
    this.displayedColumns = [
      'profile_image_url',
      'first_name',
      'is_manager',
      'org_name',
      'position_title',
      'games_played',
      'trophies_achieved',
      'participation'
    ];

  }

  getHirarchyreport() {
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    const payload = this.prepareHierarchyPayload();

    payload['manager_id'] = this.managerId ? this.managerId : this.defaultManager;
    if (payload && payload['contest_id'] === '') {
      this.is_loading = false;
      this.messageToDisplay = this.translate.instant('pls_add_filter');
      return;
    }
    this.dashboardService.getHierarchyReport(payload).subscribe(res => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        this.is_loading = false;
        this.globalService.showMessage(this.apiService.getErrorMessage('something_went_wrong'));
        return;
      }
      if (!response.data && response.data.reportee.login_manager_info) {
        return;
      }
      if (response && response.data && response.data.reportee) {
        this.dataSource = new MatTableDataSource(this.combineReporteeData(response.data.reportee));
        if (!this.isDefaultApplied) {
          this.isDefaultApplied = true;
          this.addDefaultFilter.emit(response.data.reportee.login_manager_info);
        }
        this.dashboardService.reportUpdated(this.dataSource.data);
      }
    });

  }

  prepareHierarchyPayload() {
    if (!this.hierarchyReportPayload) { return; }
    return {
      'company_id': this.hierarchyReportPayload.company_id,
      'is_custom': this.hierarchyReportPayload.is_custom,
      'start_date': this.hierarchyReportPayload.start_date,
      'end_date': this.hierarchyReportPayload.end_date,
      'manager_id': this.hierarchyReportPayload.manager_id,
      'player_status': this.hierarchyReportPayload.player_status
    };
  }

  combineReporteeData(data) {
    if (data) {
      const combined1 = [].concat(data.login_manager_info, data.reportee_manager_hierarchy_list, data.reportee_player_list);
      return combined1;
    }
  }

  updateReportee(data) {
    if (!data.have_reportee) { return; }
    this.managerId = data.id;
    this.getHirarchyreport();
    this.updateFilters.emit(data);
  }

}
