import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { REPORTS } from 'src/app/services/reports/report.service';
import { GameAccuracyReportComponent } from '../game-accuracy-report/game-accuracy-report.component';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { PermissionsService, Role } from 'src/app/services/permissions/permissions.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-more-report',
  templateUrl: './more-report.component.html',
  styleUrls: ['./more-report.component.scss']
})
export class MoreReportComponent implements OnInit, OnDestroy, AfterViewInit {

  selectedReport;
  reports;
  gameReportObj = { id: 1, title: this.translate.instant('game_accuracy_report') };
  masterReportObj = { id: 2, title: this.translate.instant('master_report') };
  winrateReportObj = { id: 4, title: this.translate.instant('winrate_report') };
  playerWinRateReportObj = { id: 6, title: this.translate.instant('winrate_historical_report') };
  totalGamesReportObj = { id: 5, title: this.translate.instant('totalGames_report') };
  companyGameReportObj = { id: 3, title: this.translate.instant('company_game_play_report') };
  // listOfReports = [this.gameReportObj, this.masterReportObj ,this.winrateReportObj,this.totalGamesReportObj];
  listOfReports = [this.gameReportObj ,this.winrateReportObj,this.playerWinRateReportObj,this.totalGamesReportObj];
  companyChangeSubscription: any;

  @ViewChild('childReport', { static: true }) childReport: GameAccuracyReportComponent;

  constructor(private delegateService: DelegateService, private permissionService: PermissionsService,
    private globalService: GlobalService, private storageService: StorageService, public translate: TranslateService) {
    this.reports = REPORTS;

    this.companyChangeSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.childReport) {
        this.childReport.changeSelectedReport(this.selectedReport, true);
        this.listOfReports = [this.gameReportObj ,this.winrateReportObj,this.totalGamesReportObj,this.playerWinRateReportObj];
        this.presentReportOptionsForFossil();
        if (this.storageService.getAccessType() === Role.ADMIN) {        
          this.listOfReports.splice(1, 0, this.masterReportObj);            
          const result = this.listOfReports.filter(item => {
            return item.id == this.companyGameReportObj['id'];
          });
          if(!result.length){
            this.listOfReports.push(this.companyGameReportObj);
          }
        }
      }
    });
  }

  ngOnInit() {
    // default report type Game accuracy report
    this.selectedReport = REPORTS.GAME_ACCURACY_REPORT; // Game accuracy report
    // Permission received Broadcast, after refreshing to update report options
    this.globalService.permissionReceived$.subscribe(res => { });
    if (this.storageService.getAccessType() === Role.ADMIN) {
      this.listOfReports.push(this.companyGameReportObj);
      this.listOfReports.splice(1, 0, this.masterReportObj);
    }
  }

  ngAfterViewInit() {
    // this.presentReportOptions();
    this.presentReportOptionsForFossil();
  }

  presentReportOptionsForFossil() {    
    if (this.globalService.isCompanyBelongsToCustomField()) {
      let reports;
      reports = this.listOfReports.filter(item => {
        return item.id !== this.winrateReportObj['id'];
      });
      this.listOfReports = reports;
      reports = this.listOfReports.filter(item => {
        return item.id !== this.playerWinRateReportObj['id'];
      });
      this.listOfReports = reports;
      reports = this.listOfReports.filter(item => {
        return item.id !== this.totalGamesReportObj['id'];
      });
      this.listOfReports = reports;
    } 
  }
  // presentReportOptions() {
  //   if (this.storageService.getAccessType() !== Role.ADMIN) {
  //     const reports = this.listOfReports.filter(item => {
  //       return item.id !== this.masterReportObj['id'];
  //     });
  //     this.listOfReports = reports;
  //   }
  // }

  onReportSelectionChange(selectedReportId) {
    this.selectedReport = selectedReportId;
    this.childReport.changeSelectedReport(this.selectedReport);
  }

  ngOnDestroy(): void {
    if (this.companyChangeSubscription) {
      this.companyChangeSubscription.unsubscribe();
    }
  }

}
