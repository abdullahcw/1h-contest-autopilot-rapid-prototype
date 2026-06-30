import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-total-gameplay-by-contest',
  templateUrl: './total-gameplay-by-contest.component.html',
  styleUrls: ['./total-gameplay-by-contest.component.scss']
})
export class TotalGameplayByContestComponent implements OnInit {

  @Input() showContestGameplay = false;
  @Input() playerId;
  @Input() contestId;
  @Input() companyId;
  @Input() contestState;
  @Input() selectedTab;
  appliedFilters = [];
  player:any;
  isLoading = false;
  context = 'dashboard';
  totalCount = 0;
  dashboard: any;
  completionObj;
  constructor(
    public globalService: GlobalService,
    public storageService: StorageService,
    private dashboardService: DashboardService,
    public translate: TranslateService,
    public dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if (this.selectedTab == 0) {
      this.getPlayerDashboard();
    }
  }

  getPlayerDashboard() {
    this.getPlayerDashboardDetails();
  }

  getPlayerDashboardDetails() {
    let payload = {
      'company_id': this.companyId,
      'contest_id': this.contestId,
      'player_id': this.playerId,
      "is_custom": !!this.globalService.isCompanyBelongsToCustomField(),
      "is_company_with_custom_fields": !!this.globalService.isCompanyWithCustomField(),
    };

    this.isLoading = true;
    this.dashboardService.getContestPlayerDashboard(payload).subscribe(res => {
      const response:any = res;
      this.isLoading = false;
      if (!response.success) {
        return;
      }
      console.log(response.data);
      this.player = response.data;
      const value = 100 - this.player.completion;
      this.completionObj = {
        completion : this.player.completion,
        completion_values:[this.player.completion, value]
      };
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
