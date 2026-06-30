import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ChangeGamePositionComponent } from '../../../admin/change-game-position/change-game-position.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GlobalService } from 'src/app/services/global/global.service';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';


@Component({
  selector: 'app-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.scss']
})
export class ReorderComponent implements OnInit, OnChanges {
  @Input() gameDataSource: any;
  @Input() gameCount: any;
  @Input() gameType: any;
  @Input() multilevelGameData: any;
  @Output() positionChanged: EventEmitter<any> = new EventEmitter<any>();
  displayedColumns: string[] = ['position', 'game_logo', 'game_name', 'game_owner', 'action'];
  dataSource = new MatTableDataSource();
  layoutPermission: any;
  constructor(
    public dialog: MatDialog,
    public globalService: GlobalService,
    public permissionService: PermissionsService,
  ) { }

  ngOnChanges() {
    console.log(this.gameDataSource);
    this.dataSource = new MatTableDataSource(this.gameDataSource);
  }

  ngOnInit() {
    console.log(this.gameType);
    this.dataSource = new MatTableDataSource(this.gameDataSource);
    this.setLayoutPermission();
    // Fetch permissions on-Refresh, Broadcast get's trigger on Permission received
    this.globalService.permissionReceived$.subscribe(res => {
      this.setLayoutPermission();
    });
  }

  setLayoutPermission() {
    this.layoutPermission = this.permissionService.getPermissions(PermissionsKey.LIVE_GAME_POSITION);
  }

  changePosition(item) {
    console.log(item);
    const dialogRef = this.dialog.open(ChangeGamePositionComponent, {
      data: item
    });
    dialogRef.componentInstance.total_count = this.gameCount;
    dialogRef.componentInstance.reorderingGames = true;

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.positionChanged) {
        const positionData = {
          'positionChanged': result.positionChanged,
          'gameType': item.game_type,
        };
        this.positionChanged.emit(positionData);
      }
    });
  }
}
