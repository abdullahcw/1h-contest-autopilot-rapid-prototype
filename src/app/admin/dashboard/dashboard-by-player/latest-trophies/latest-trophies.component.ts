import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { Constants } from 'src/app/services/network/api.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-latest-trophies',
  templateUrl: './latest-trophies.component.html',
  styleUrls: ['./latest-trophies.component.scss']
})
export class LatestTrophiesComponent implements OnInit {
  is_loading = false;
  trophies = [];
  @Input() appliedFilters = [];
  @Input() playerId;
  @Input() tabIndex;
  @Input() showPlayerGameplay = false;
  @Output() viewAllTrophies: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(public dashboardService: DashboardService,
    public globalService: GlobalService,
    public storageService: StorageService,) { }

  ngOnInit(): void {
    console.log('asdasdsad')
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);
    if ((changes.appliedFilters && changes.appliedFilters.currentValue) ||
      (changes.tabIndex && !changes.tabIndex.currentValue)) {
      if (this.appliedFilters.filter(appliedFilter => appliedFilter.filter == Constants.PLAYER_NAME).length || (this.showPlayerGameplay && this.tabIndex === 0)) {
        this.getTrophies();
      }
    }
  }

  getTrophies() {
    this.is_loading = true;
    let payload = {
      "company_id":this.storageService.getCompanyId(),
    }
  
    if (!this.showPlayerGameplay) {
      payload = this.globalService.filterApplied(payload, Constants.PLAYER_NAME, this.appliedFilters, 'player_id');
    } else {
      payload['player_id'] = this.playerId;
    }

    this.dashboardService.getLatestTrophies(payload).subscribe(res => {
      console.log(res)
      if (res.success) {
        this.trophies = res.data.trophies;
      }
      this.is_loading = false;
    });
  }

  viewAll() {
    this.viewAllTrophies.emit();
  }

}
