import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GamesService } from 'src/app/services/games/games.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-game-progress-dialog',
  templateUrl: './game-progress-dialog.component.html',
  styleUrls: ['./game-progress-dialog.component.scss']
})
export class GameProgressDialogComponent implements OnInit {
  quesData;
  is_loading: boolean = false;
  @Output() progressUpdated = new EventEmitter<number>();

  constructor(    
   private gamesService: GamesService,
   private storageService: StorageService,
   public dialogRef: MatDialogRef<any>,
   @Inject(MAT_DIALOG_DATA) public data: any) { }


 ngOnInit(): void {
this.getProgressDetails(this.data);
}
cancel() {
   this.dialogRef.close();
 }
getProgressDetails(game){
   this.is_loading = true;
   const companyId = this.storageService.getCompanyId();
   this.gamesService.getLocalizationProgress(companyId,game.game_id).subscribe(res => {
      this.is_loading = false;
      if (res.success) {
        this.quesData = res.data;
        this.progressUpdated.emit(res.data.completed);
      }
    });
  }
}