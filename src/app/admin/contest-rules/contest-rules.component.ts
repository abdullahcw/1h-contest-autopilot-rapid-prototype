import { Component, OnInit, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ContestService } from 'src/app/services/contest/contest.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contest-rules',
  templateUrl: './contest-rules.component.html',
  styleUrls: ['./contest-rules.component.scss']
})
export class ContestRulesComponent implements OnInit {

  constructor(public translate: TranslateService, private storageService: StorageService,
    public contestService: ContestService, public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = true; }
  is_updating = false;
  rules = '';
  ngOnInit() {
    this.rules = this.data.contestRule === 'NOT_AVAILABLE' ? this.translate.instant('all_games_are_mandatory') : this.data.contestRule;
  }
  saveRules() {
    this.updateContestDetails('contest_rule', this.rules);
  }

  updateContestDetails(key = null, value = null) {
    this.is_updating = true;
    const company_id = this.storageService.getCompanyId();
    const contest = JSON.parse(this.storageService.getContest());
    const payload = {
      'company_id': company_id,
      'contest_id': contest.contest_id,
    };
    payload[key] = value;
    this.contestService.updateContestDetails(payload).subscribe(res => {
      const response: any = res;
      if (response.success) {
        this.is_updating = false;
        this.cancel();
      }
    });
  }
  cancel() {
    this.dialogRef.close();
  }
}
