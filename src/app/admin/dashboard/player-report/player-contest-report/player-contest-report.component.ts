import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import Chart from 'chart.js';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-player-contest-report',
  templateUrl: './player-contest-report.component.html',
  styleUrls: ['./player-contest-report.component.scss']
})
export class PlayerContestReportComponent implements OnInit {

  @ViewChild('circleChartPopup') circleChartPopup: ElementRef;
  is_loading: boolean = false;
  contestDetails: any;
  contestProgressDetails: any;
  isMobile = false;
  displayedColumns: string[] = ['level', 'game_logo','game', 'high_score'];
  contestDetailsPlayers: any;
  totalCount: any;
  playerContestDetails: any;
  playerDetails: any;
  contestGameplayDetails: MatTableDataSource<unknown>;
  circleData;
  contest_name;
  appliedFilters = [];

  constructor( public dashboardService:DashboardService,
    public globalService: GlobalService,
    public storageService: StorageService,
    private cdRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,)  { 
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
    this.getContestReport();
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
    
  }

  ngAfterViewInit() { // wait for the view to init before using the element
  }

  getContestReport(){
    let payload = {
      "company_id": this.data.company_id,
      "player_id":this.data.player_id,
      "contest_id": this.data.contest_id,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      'is_company_with_custom_fields': !!this.globalService.isCompanyWithCustomField(),
    }

    this.is_loading = true;
    this.dashboardService.getPlayerContestReport(payload).subscribe(res => {
      const response: any = res;
      this.is_loading = false;
      console.log(response);
      if (!response.success) {
        return;
      }
      this.contestDetails = response.data.contest_details;
      this.contestProgressDetails = response.data.player_contest_report.completion
      this.playerDetails = response.data.player_details;
      this.playerContestDetails = response.data.player_contest_report;
      this.contest_name = response.data.contest_name;

      if(this.contestProgressDetails == 100){
        this.circleData = [this.contestProgressDetails,0]
      }else{
        const low = 100 - this.contestProgressDetails
        this.circleData = [this.contestProgressDetails, low]
      }
      setTimeout(() => {
        this.generateCricleChart();
      })
      this.contestGameplayDetails = new MatTableDataSource(this.contestDetails);
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
          // rotation:-1 * Math.PI
        },
      });
    }
  }

  getOrdinalNumber(i) {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  }
}
