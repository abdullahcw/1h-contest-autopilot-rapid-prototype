import { Component, HostListener, Input, OnInit, SimpleChanges } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Dashboard, DashboardService } from "src/app/services/dashboard/dashboard.service";
import { GlobalService, MediaBreakpoint } from "src/app/services/global/global.service";
import { StorageService } from "src/app/services/storage/storage.service";
import { TrophyDetailsComponent } from "src/app/shared/trophy-details/trophy-details.component";

@Component({
  selector: "app-player-achivements",
  templateUrl: "./player-achivements.component.html",
  styleUrls: ["./player-achivements.component.scss"],
})
export class PlayerAchivementsComponent implements OnInit {
  @Input() selectedTab;
  breakpoint = 5;
  is_loading = false;
  totalCount = 0;
  contestTrophies = [];
  fix_trophies = [];
  game_trophies = [];
  mlg_trophy = [];
  player_achivement;
  dashboard;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    console.log("in here");
    this.calculateBreakpoint();
  }

  calculateBreakpoint() {
    console.log("in here1");
    if (window.innerWidth <= MediaBreakpoint.XS) {
      // code review
      this.breakpoint = window.innerWidth / 400;
    } else {
      this.breakpoint = window.innerWidth / 300;
    }
  }

  constructor(
    public dashboardService: DashboardService,
    public dialog: MatDialog,
    public storageService: StorageService,
    public globalService: GlobalService
  ) {
    this.dashboard = Dashboard;
  }
  @Input() playerId: any;
  ngOnInit(): void {
    this.calculateBreakpoint();
    if(this.getDashboardFilter()['dashboard_by'] === this.dashboard.BY_PLAYER){      
      this.globalService.addAdminGoogleEvent('Achievement_Player_Report_Viewed');
    }else{
      this.globalService.addAdminGoogleEvent('By_Team_Achievement_Report');
    } 
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes, this.selectedTab, this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_GAME);
    if ((this.selectedTab === 6 && this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_PLAYER)
      || (this.selectedTab === 6 && this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_TEAM) 
      || (this.selectedTab === 3 && this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_GAME)
      || (this.selectedTab === 2 && this.getDashboardFilter()['dashboard_by'] === Dashboard.BY_CONTEST)) {
        console.log('m here');
      this.getAchivements();
    }
  }

  getAchivements() {
    this.is_loading = true;
    const payload = {
      player_id: this.playerId,
      company_id: this.storageService.getCompanyId(),
      is_custom: false,
      is_company_with_custom_fields: false,
    };
    this.dashboardService.getPlayerAchivements(payload).subscribe((res) => {
      const response = res.data;
      if (res.success) {
        this.totalCount = response.total_trophies;
        this.player_achivement = response.player_details;
        response.contest_reward.filter(item =>{
          item.isReward = true;
        })

        response.contest_trophy.filter(item =>{
          item.isReward = false;
        })
        this.contestTrophies = [
          ...response.contest_trophy,
          ...response.contest_reward,
        ];
        this.fix_trophies = response.fix_trophies;        
        this.game_trophies = response.game_trophies;
        this.mlg_trophy = response.mlg_trophy;
        console.log(res.success);
      }
      this.is_loading = false;
    });
    this.globalService.addAdminGoogleEvent('Detailed_Report_Achievement_trophy_viewed');
  }

  openDetails(trophy, trophyType) {
    if (trophyType == "gameTrophy") {
      trophy.isGameTrophy = true;
    }
    if (trophyType == "mlgTrophy") {
      trophy.isMLGTrophy = true;
    }
    const dialogRef = this.dialog.open(TrophyDetailsComponent, {
      data: {
        trophy: trophy,
        player_info: this.player_achivement,
      },
    });
  }

  getDashboardFilter() {
    return this.storageService.getObject('dashboard-filter');
  }
}
