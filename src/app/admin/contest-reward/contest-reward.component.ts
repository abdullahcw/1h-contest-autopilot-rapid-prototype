import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContestService } from 'src/app/services/contest/contest.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-contest-reward',
  templateUrl: './contest-reward.component.html',
  styleUrls: ['./contest-reward.component.scss']
})
export class ContestRewardComponent implements OnInit {
  rewardCategoryList: any[] = [];
  rewardList: any[] = [];
  is_updating = false;
  fetchCategory = false;
  fetchReward = false;
  categories = [];
  rewards = [];
  contestReward: any = {
    category_id: null,
    reward_id: null,
    reward_desc: ''
  };
  rewardId;
  companyId;
  contest;
  constructor(public translate: TranslateService, private cdRef: ChangeDetectorRef, private storageService: StorageService,
    public dialogRef: MatDialogRef<any>, public contestService: ContestService,
    @Inject(MAT_DIALOG_DATA) public data: any) { dialogRef.disableClose = true; }


  ngOnInit() {
    this.companyId = this.storageService.getCompanyId();
    this.contest = JSON.parse(this.storageService.getContest());
    this.contestReward = this.data && this.data.contestReward ? this.data.contestReward : {};
    this.getContestRewardCategory();
  }

  getContestRewardCategory() {
    this.fetchCategory = true;
    this.contestService.getContestRewardCategory().subscribe((res) => {
      const response = res;
      if (!res.success) { return; }
      this.categories = [];
      this.categories = response.data.categories;
      this.prepareCategoryListForSearchSelectComponent();
      this.getRewardsByCategory();
    });
  }

  prepareCategoryListForSearchSelectComponent() {
    this.rewardCategoryList = [];
    this.categories.forEach(category => {
      this.rewardCategoryList.push({ id: category.category_id, title: category.category_name });
    });
    this.fetchCategory = false;
  }

  onCategoryChange(category) {
    this.rewardId = '';
    this.contestReward.reward_id = '';
    this.contestReward.reward_desc = '';
    this.contestReward.category_id = category;
    this.getRewardsByCategory();
  }
  getRewardsByCategory() {
    this.fetchReward = true;
    this.contestService.getContestRewards(this.contestReward.category_id).subscribe((res) => {
      const response = res;
      this.fetchReward = false;
      if (!response.success) { return; }
      this.rewards = [];
      this.rewards = response.data.rewards;
      this.rewardId = this.data.contestReward ? this.data.contestReward.reward_id : '';
      this.prepareRewardListForSearchSelectComponent();
    });
  }

  prepareRewardListForSearchSelectComponent() {
    this.rewardList = [];
    this.rewards.forEach(reward => {
      this.rewardList.push({ id: reward.reward_id, title: reward.reward_name, description: reward.reward_desc });
    });
  }
  onRewardChange(rewardId) {
    this.contestReward.reward_desc = '';
    this.contestReward.reward_id = rewardId;
    this.rewardId = rewardId;
    this.rewardList.filter(reward => {
      if (reward.id === this.contestReward.reward_id) {
        this.contestReward.reward_desc = reward.description;
      }
    });
  }

  updateContestReward() {
    this.is_updating = true;
    const payload = {
      'company_id': this.companyId,
      'contest_id': this.contest.contest_id,
      'rewards': {
        'category_id': this.contestReward.category_id,
        'reward_id': this.contestReward.reward_id,
        'reward_desc': this.contestReward.reward_desc
      }
    };
    this.contestService.updateContestDetails(payload).subscribe((res) => {
      const response = res;
      if (!response.success) { return; }
      this.is_updating = false;
      this.cancel();
    });
  }
  cancel() {
    this.dialogRef.close();
  }
}
