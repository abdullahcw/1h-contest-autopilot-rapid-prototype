import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { DashboardService } from "src/app/services/dashboard/dashboard.service";
import Chart from "chart.js";
import { GlobalService } from "src/app/services/global/global.service";
import { StorageService } from "src/app/services/storage/storage.service";
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "src/app/services/network/api.service";
@Component({
  selector: "app-game-play-report-popup",
  templateUrl: "./game-play-report-popup.component.html",
  styleUrls: ["./game-play-report-popup.component.scss"],
})
export class GamePlayReportPopupComponent implements OnInit {
  @ViewChild("circleChartPopup") circleChartPopup: ElementRef;
  is_loading: boolean = false;
  mlgDetails: any;
  type;
  isMobile = false;
  displayedColumns: string[] = ["rank", "player_logo", "player", "points"];
  mlgDetailsPlayers: any;
  totalCount: any;
  circleData;
  mlg_id;
  mlg_name;
  players = [];
  appliedFilters = [];
  isMenuOpened = false;
  constructor(
    public dashboardService: DashboardService,
    private cdRef: ChangeDetectorRef,
    public globalService: GlobalService,
    public storageService: StorageService,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>
  ) {}

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }
  ngOnInit(): void {
    this.type = this.data.type;
    if (this.type !== this.translate.instant("won")) {
      this.displayedColumns.push("current_level");
    }
    console.log("data", this.data);
    this.getMlgReport();
    if (window.innerWidth <= 768) {
      this.isMobile = true;
    }
    console.log("mlg", this.mlgDetails);
  }

  ngAfterViewInit() {
    // wait for the view to init before using the element
  }

  setType(value) {
    console.log("value", value);
    this.isMenuOpened = false;
    this.type = value;
    if (this.type !== this.translate.instant("won")) {
      if (this.displayedColumns.indexOf("current_level") === -1) {
        this.displayedColumns.push("current_level");
      }
      this.globalService.addAdminGoogleEvent(
        "Dashboard_Report_Inprogress_report_selected"
      );
    } else {
      if (this.displayedColumns.indexOf("current_level") !== -1) {
        this.displayedColumns.splice(
          this.displayedColumns.indexOf("current_level"),
          1
        );
      }
      this.globalService.addAdminGoogleEvent(
        "Dashboard_Report_Won_report_selected"
      );
    }
    this.getMlgReport();
  }
  showAll() {
    const redirect = {
      tabIndex: 1,
    };
    this.dialogRef.close(redirect);
  }
  getMlgReport() {
    let payload = {
      company_id: this.storageService.getCompanyId(),
      mlg_id: this.mlg_id,
      is_mlg_achieved: this.type == "In Progress" ? false : true,
      is_custom: !!this.globalService.isCompanyBelongsToCustomField(),
      is_company_with_custom_fields:
        !!this.globalService.isCompanyWithCustomField(),
      limit_offset: 0,
      limit_perpage: 50,
    };

    payload = this.globalService.filterApplied(
      payload,
      Constants.MLG_NAME,
      this.appliedFilters,
      "mlg_id"
    );
    payload = this.globalService.filterApplied(
      payload,
      Constants.IS_ACTIVE,
      this.appliedFilters,
      "player_status"
    );
    payload = this.globalService.filterApplied(
      payload,
      Constants.MLG_COMPLETENESS,
      this.appliedFilters
    );
    this.prepareFilters(payload);
    this.is_loading = true;
    this.dashboardService.getMlgDetailReport(payload).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      console.log(response);
      if (!response.success) {
        return;
      }

      this.mlgDetails = response.data;
      this.players = response.data.players;
      this.mlgDetails.type = this.type;
      if (this.mlgDetails.progress == 100) {
        this.circleData = [this.mlgDetails.progress, 0];
      } else {
        const low = 100 - this.mlgDetails.progress;
        this.circleData = [this.mlgDetails.progress, low];
      }
      setTimeout(() => {
        this.generateCricleChart();
      });
      console.log(this.circleData);
      this.mlgDetailsPlayers = new MatTableDataSource(this.players);
      console.log(this.mlgDetailsPlayers);
    });
  }
  convertToHHMMSS(seconds) {
    let hours, minutes: any;
    hours = Math.floor(seconds / 3600);
    minutes = Math.floor((seconds - hours * 3600) / 60);
    seconds = seconds - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    const time = hours + ":" + minutes + ":" + seconds;
    return time;
  }
  close() {
    this.dialogRef.close();
  }
  scrollTop() {
    if (document.getElementById("wrapper")) {
      document.getElementById("wrapper").scrollTop = 0;
    }
    this.cdRef.detectChanges();
  }

  generateCricleChart() {
    console.log(
      this.circleChartPopup,
      document.getElementById("circleChartPopup")
    );
    if (this.circleChartPopup) {
      let context: CanvasRenderingContext2D =
        this.circleChartPopup.nativeElement.getContext("2d");
      var myDoughnutChart = new Chart(context, {
        type: "doughnut",
        data: {
          labels: ["Won", "In-progress"],
          datasets: [
            {
              // label: 'My First Dataset',
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

  menuOpened() {
    this.isMenuOpened = true;
  }

  menuClosed() {
    this.isMenuOpened = false;
  }

  prepareFilters(payload) {
    payload = this.globalService.filtersApplied(
      payload,
      Constants.GROUP_NAME,
      this.appliedFilters,
      "group_ids"
    );

    const customFilters = this.appliedFilters.filter((appliedFilter) => {
      return (
        appliedFilter["customFilterKey"] &&
        appliedFilter["customFilterKey"] !== "undefined"
      );
    });

    if (customFilters.length) {
      customFilters.forEach((customFilter) => {
        if (customFilter["additionalFilter"]) {
          payload = this.globalService.filtersApplied(
            payload,
            customFilter.filter,
            customFilters,
            customFilter["customFilterKey"]
          );
        } else {
          payload = this.globalService.filterApplied(
            payload,
            customFilter.filter,
            customFilters,
            customFilter["customFilterKey"]
          );
        }
      });
    }
  }
}
