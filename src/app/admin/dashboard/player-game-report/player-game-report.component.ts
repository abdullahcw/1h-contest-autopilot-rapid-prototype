import { Component, OnInit } from '@angular/core';
import { DashboardService, Dashboard } from '../../../services/dashboard/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from 'src/app/services/login/login.service';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BreadcrumbsService } from '../../../services/breadcrumbs/breadcrumbs.service';
import { GlobalService } from '../../../services/global/global.service';
import { DatePipe } from '@angular/common';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { StorageService } from '../../../services/storage/storage.service';
import { ApiService } from '../../../services/network/api.service';
import { HeaderService } from '../../../services/header/header.service';
import { TranslateService } from '@ngx-translate/core';

const DATE_FORMAT: any = 'yyyy-MM-dd';
@Component({
  selector: 'app-player-game-report',
  templateUrl: './player-game-report.component.html',
  styleUrls: ['./player-game-report.component.scss']
})
export class PlayerGameReportComponent implements OnInit {
  is_loading = false;
  reportId;
  companyId;
  gameType;
  playerId;
  gameName;
  playerName;
  totalPoints;
  totalTime;
  playedOn;
  result;
  winPoints;
  team;
  gameId;
  timezone;
  startDate;
  endDate;
  displayedColumns: string[] = ['card_number', 'question', 'points', 'time'];
  questions;
  dataSource: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private breadcrumbService: BreadcrumbsService,
    private globalService: GlobalService,
    public dialog: MatDialog,
    public headerService: HeaderService,
    public storageService: StorageService,
    public apiService: ApiService,
    public translate: TranslateService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    // Hide Company Selection filter
    this.headerService.showCompanyFilter(false);
    this.route.queryParams.subscribe(queryParams => {
      if (this.parseQueryParams(queryParams)) {
        this.loadData();
      } else {
        this.router.navigate([Route.PLAYER_REPORT]);
      }
      this.updatePreviousBreadcrumb(queryParams);
    });
  }

  parseQueryParams(queryParams) {
    this.reportId = +queryParams.reportId;
    this.companyId = +queryParams.companyId;
    this.gameType = +queryParams.gameType;
    this.playerId = +queryParams.playerId;
    this.gameId = +queryParams.gameId;
    this.timezone = queryParams.timezone;
    this.startDate = queryParams.startDate;
    this.endDate = queryParams.endDate;
    return this.reportId && this.companyId && this.gameType && this.playerId;
  }

  updatePreviousBreadcrumb(queryParams) {
    const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
    const previousIndex = breadcrumbs.length - 2;
    if (breadcrumbs.length >= previousIndex) {
      const previousBreadcrumb = breadcrumbs[previousIndex];
      previousBreadcrumb.queryParams = queryParams;
    }
    const firstBreadCrumb = breadcrumbs[0];
    firstBreadCrumb.queryParams = { selectedTab: 1 };
  }

  loadData() {
    if (this.gameType === 1) {
      this.displayedColumns.splice(0, 0, 'is_correct_answer');
      this.getSPGameSessionDetails();
    } else {
      this.getMPGameSessionDetails();
    }
  }

  getSPGameSessionDetails() {
    this.is_loading = true;
    this.dashboardService.getSinglePlayerGameSessionDetails(this.companyId, this.reportId,
      this.playerId, this.timezone, this.gameId).subscribe(res => {
        if (res.success) {
          this.processResponse(res);
        }
        this.is_loading = false;
      });
  }

  processResponse(res) {
    const data = res.data;
    this.questions = data.question_list;
    this.dataSource = new MatTableDataSource(this.questions);
    this.gameName = data.game_name;
    this.playerName = `${data.first_name} ${data.last_name}`;
    this.playedOn = this.datePipe.transform(this.globalService.formatDate(data.played_on), 'MM/dd/yyyy');

    if (this.gameType === 2 || this.gameType === 3) {
      this.team = data.team_name;
      this.result = data.is_winner ? this.translate.instant('won') : this.translate.instant('lost');
      if (data.win_points) {
        this.winPoints = data.win_points;
      }
    }

    this.questions.forEach(question => {
      question.pointsFormatted = this.globalService.formatNumber(question.points);
      question.timeFormatted = this.globalService.secondsToHms(question.time);
    });
    console.log(this.questions);
    this.calculateTotalPoints();
    this.calculateTotalTime();
    this.updateBreadcrumbs();
  }

  calculateTotalPoints() {
    let totalPoints = 0;
    this.questions.forEach(element => {
      if ((this.gameType === 1 && element.is_correct_answer) || (this.gameType === 2) || (this.gameType === 3)) {
        totalPoints += element.points;
      }
    });
    this.totalPoints = totalPoints;
    console.log(this.totalPoints);
  }

  getFormattedDate(date) {
    return this.datePipe.transform(date, DATE_FORMAT);
  }

  showAlert(message) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogRef.componentInstance.isMultiOption = false;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  sortData(sort: Sort) {
    this.questions = this.questions.sort((t1, t2) => {
      let val1 = t1[sort.active];
      let val2 = t2[sort.active];
      const isAsc = sort.direction === 'asc';
      const type = typeof (val1);
      if (type === 'string') {
        val1 = val1.toLowerCase();
        val2 = val2.toLowerCase();
        if (val1 > val2) { return isAsc ? 1 : -1; }
        if (val1 < val2) { return isAsc ? -1 : 1; }
        return 0;
      } else if (type === 'number') {
        return isAsc ? val1 - val2 : val2 - val1;
      } else {
        if (isAsc) { return (val2 === val1) ? 0 : val2 ? -1 : 1; }
        return (val1 === val2) ? 0 : val1 ? -1 : 1;
      }
    });
    this.dataSource = new MatTableDataSource(this.questions);
  }

  calculateTotalTime() {
    let totalTime = 0;
    this.questions.forEach(element => {
      totalTime += element.time;
    });
    this.totalTime = this.globalService.secondsToHms(totalTime);
  }

  updateBreadcrumbs() {
    const breadcrumbs = this.breadcrumbService.getBreadcrumbs();
    breadcrumbs[1].key = this.playerName;
    breadcrumbs[2].key = this.gameName;
  }

  getMPGameSessionDetails() {
    this.is_loading = true;
    this.dashboardService.getMultiplayerGameSessionDetails(this.companyId, this.reportId,
      this.playerId, this.timezone, this.gameId).subscribe(res => {
        if (res.success) {
          this.processResponse(res);
        }
        this.is_loading = false;
      });
  }

  downloadReport() {
    switch (this.gameType) {
      case 1:
        this.dashboardService.downloadSPGameSessionDetails(this.companyId, this.reportId,
          this.playerId, this.timezone, this.gameId).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        break;
      case 2:
        this.dashboardService.downloadMPGameSessionDetails(this.companyId, this.reportId,
          this.playerId, this.timezone, this.gameId).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        break;
      case 3:
        if (this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER || this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) {
          this.dashboardService.downloadMPGameSessionDetails(this.companyId, this.reportId,
            this.playerId, this.timezone, this.gameId).subscribe((res) => {
            this.processDownloadResponse(res);
          });
        } 
        break;
    }
  }

  processDownloadResponse(res) {
    const response: any = res;
    if (!response.success) { return; }
    // Download file
    if (response.data && response.data.url) {
      window.location.assign(response.data.url);
      this.globalService.showMessage(this.translate.instant('downloading_reports'));
    }
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    // Show Company Selection filter
    this.headerService.showCompanyFilter(true);
  }
}
