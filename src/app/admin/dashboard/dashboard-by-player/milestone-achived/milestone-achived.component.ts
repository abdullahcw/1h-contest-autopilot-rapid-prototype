import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-milestone-achived',
  templateUrl: './milestone-achived.component.html',
  styleUrls: ['./milestone-achived.component.scss']
})
export class MilestoneAchivedComponent implements OnInit {
  is_loading = false;
  levels = [];
  @Input() appliedFilters = [];
  @Input() playerId;
  @Input() tabIndex;
  @Input() showPlayerGameplay = false;
  constructor(public dashboardService: DashboardService,
    public globalService: GlobalService,
    public storageService: StorageService,) { }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue)) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.PLAYER_NAME).length || (this.showPlayerGameplay && this.tabIndex === 0)) {
        this.getLevels();
      }
    }
  }

  getLevels() {
    this.is_loading = true;
    let payload = {
      player_id: 0
    };
    if (!this.showPlayerGameplay) {
      payload = this.globalService.filterApplied(payload, Constants.PLAYER_NAME, this.appliedFilters, 'player_id');
    } else {
      payload['player_id'] = this.playerId;
    }
    this.dashboardService.getLevels(payload.player_id).subscribe(res => {
      if (res.success) {
        this.levels = res.data.levels;
      }
      this.is_loading = false;
    });
  }

}
