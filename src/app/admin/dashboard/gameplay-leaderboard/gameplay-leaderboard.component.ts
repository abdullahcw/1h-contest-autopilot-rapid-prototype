import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-gameplay-leaderboard',
  templateUrl: './gameplay-leaderboard.component.html',
  styleUrls: ['./gameplay-leaderboard.component.scss']
})

export class GameplayLeaderboardComponent implements OnInit {
  @Input() gamePlay: any = [];
  @Input() selectedDashboardType;
  @Input() totalCount;
  @Input() notScrolly;
  @Input() notEmpty;
  @Output() switchTab: EventEmitter<any> = new EventEmitter<any>();
  @Output() getLeaderboard: EventEmitter<any> = new EventEmitter<any>();

  noOfItemsPerPage: number;
  isMobile = false;
  displayedColumns: string[] = ['rank', 'player_logo', 'player', 'points', 'games'];
  isScrolled = false;
  constructor(private cdRef: ChangeDetectorRef) {
    this.noOfItemsPerPage = 10;
  }

  ngOnInit() {
  }

  onScroll() {}

  viewAll() {
    const tabIndex = 1;
    this.switchTab.emit(tabIndex);
  }
}
