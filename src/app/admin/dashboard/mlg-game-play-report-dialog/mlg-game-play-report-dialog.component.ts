
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import Chart from 'chart.js';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';

@Component({
  selector: 'app-mlg-game-play-report-dialog',
  templateUrl: './mlg-game-play-report-dialog.component.html',
  styleUrls: ['./mlg-game-play-report-dialog.component.scss']
})
export class MlgGamePlayReportDialogComponent implements OnInit {
  @ViewChild('circleChartPopup') circleChartPopup: ElementRef;
  is_loading: boolean = false;
  mlgDetails: any;
  mlgProgressDetails: any;
  type;
  isMobile = false;
  displayedColumns: string[] = ['level', 'game_logo','game', 'high_score', 'completion'];
  mlgDetailsPlayers: any;
  totalCount: any;
  playerMlgDetails: any;
  playerDetails: any;
  mlgGameplayDetails: MatTableDataSource<unknown>;
  circleData;
  mlg_name;
  mlg_id;
  showPlayerMlg = false;
  appliedFilters = [];

  constructor( public dashboardService:DashboardService,
    public globalService: GlobalService,
    public storageService: StorageService,
    private cdRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>)  {
    this.showPlayerMlg = this.data.showPlayerMLG;
    }
  

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  ngOnInit(): void {
    console.log('data',this.data);
    this.getMlgReport();
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
    
  }

  ngAfterViewInit() { // wait for the view to init before using the element
  }

  getMlgReport(){
    let payload = {
      "company_id": this.data.company_id,
      "mlg_id": this.mlg_id,
      "player_id":this.data.player_id,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
    }

    if (this.appliedFilters && this.appliedFilters.length) {
      payload = this.globalService.filterApplied(payload, Constants.MLG_NAME, this.appliedFilters, 'mlg_id');
      payload = this.globalService.filterApplied(payload, Constants.IS_ACTIVE, this.appliedFilters, 'player_status');
      payload = this.globalService.filterApplied(payload, Constants.MLG_COMPLETENESS, this.appliedFilters);
      this.prepareFilters(payload);
    }

    this.is_loading = true;
    this.dashboardService.getMlgPlayerReport(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      console.log(response);
      if (!response.success) {
        return;
      }
      this.mlgDetails = response.data.mlg_details;
      this.mlgProgressDetails = response.data.player_mlg_report.progress
      this.playerDetails = response.data.player_details;
      this.playerMlgDetails = response.data.player_mlg_report;

      if(this.mlgProgressDetails == 100){
        this.circleData = [this.mlgProgressDetails,0]
      }else{
        const low = 100 - this.mlgProgressDetails
        this.circleData = [this.mlgProgressDetails, low]
      }
      setTimeout(() => {
        this.generateCricleChart();
      })
      this.mlgGameplayDetails = new MatTableDataSource(this.mlgDetails);
    });
  }
  convertToHHMMSS(seconds) {
    let hours, minutes: any;
    hours = Math.floor(seconds / 3600);
    minutes = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = seconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }
    if (seconds < 10) { seconds = '0' + seconds; }
    const time = hours + ':' + minutes + ':' + seconds;
    return time;
  }
  close(){
    this.dialogRef.close();
  }
  scrollTop() {
    if (document.getElementById('wrapper')) {
      document.getElementById('wrapper').scrollTop = 0;
    }
    this.cdRef.detectChanges();
  }

  generateCricleChart(){
    console.log(this.circleChartPopup);
    if (this.circleChartPopup) {
      let context: CanvasRenderingContext2D =
        this.circleChartPopup.nativeElement.getContext("2d");
      var myDoughnutChart = new Chart(context, {
        type: "doughnut",
        data: {
          labels: ["Won", "In-progress"],
          datasets: [
            {
              data: this.circleData,
              backgroundColor: ["#3F55CA", "#9C9C9C"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },

          tooltips: { enabled: false },
          hover: { mode: null },
          cutoutPercentage: 70,
          responsive: true,
          maintainAspectRatio: true,
        },
      });
    }
  }

  prepareFilters(payload) {

    payload = this.globalService.filtersApplied(payload, Constants.GROUP_NAME, this.appliedFilters, 'group_ids');
    
    // Handle location and department filters (these are standard filters, not custom)
    payload = this.globalService.filtersApplied(payload, Constants.LOCATION_IDS, this.appliedFilters);
    payload = this.globalService.filtersApplied(payload, Constants.DEPARTMENT_IDS, this.appliedFilters);

    const customFilters = this.appliedFilters.filter(appliedFilter => {
      return appliedFilter['customFilterKey'] && appliedFilter['customFilterKey'] !== 'undefined';
    });

    if (customFilters.length) {
      customFilters.forEach(customFilter => {
        if (customFilter['additionalFilter']) {
          payload = this.globalService.filtersApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        } else {
          payload = this.globalService.filterApplied(payload, customFilter.filter, customFilters, customFilter['customFilterKey']);
        }
      });
    }
  }
}