import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PinnedGameOnDashboardComponent } from '../pinned-game-on-dashboard/pinned-game-on-dashboard.component';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-global-pinned-games',
  templateUrl: './global-pinned-games.component.html',
  styleUrls: ['./global-pinned-games.component.scss']
})
export class GlobalPinnedGamesComponent implements OnInit {
  @Input() pinnedGamesList;
  @Input() selectedDashboardType;
  @Input() totalCount;
  @Input() notScrolly;
  @Input() notEmpty;
  @Input() pinnedGames  
  @Output() getPinnedGames: EventEmitter<any> = new EventEmitter<any>();
  noOfItemsPerPage: number;
  isMobile = false;
  displayedColumns: string[] = ['no', 'game_logo', 'game_name', 'win_rate'];
  isScrolled = false;
  constructor(private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private globalService: GlobalService,
  ) {
    this.noOfItemsPerPage = 10;
  }

  ngOnInit(): void {    
  }

  edit(){
    this.globalService.addAdminGoogleEvent('Global_Pinned_Games_Edit_Clicked');
    const dialogRef = this.dialog.open(PinnedGameOnDashboardComponent,{
      data: [...this.pinnedGamesList],
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getPinnedGames.emit();
      }
    });
  }
}
