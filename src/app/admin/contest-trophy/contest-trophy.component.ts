import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ContestService } from 'src/app/services/contest/contest.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contest-trophy',
  templateUrl: './contest-trophy.component.html',
  styleUrls: ['./contest-trophy.component.scss']
})
export class ContestTrophyComponent implements OnInit {
  trophyDetails = {
    contest_id: null,
    description: '',
    img_url: '',
    name: ''
  };
  is_loading = false;
  constructor(public translate: TranslateService, private storageService: StorageService,
    public contestService: ContestService, public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = true; }

  ngOnInit() {
    this.trophyDetails = this.data.contestTrophy;
  }

  save() {
    this.cancel();
  }
  cancel() {
    this.dialogRef.close();
  }
}
