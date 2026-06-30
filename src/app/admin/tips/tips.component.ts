import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TipsService } from 'src/app/services/tips/tips.service';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss']
})
export class TipsComponent implements OnInit {
  public Editor = ClassicEditor;
  tips = {
    manager_tips: '',
    player_tips: ''
  };
  isFirstLoad = true;
  data;
  copyOfManagerTips = '';
  copyOfPlayerTips = '';
  managerTipsChange = false;
  playerTipsChange = false;
  isSaving = false;
  constructor(private tipsService: TipsService,
    public cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getTips();
  }

  getTips() {
    this.tipsService.getTips().subscribe((res) => {
      const response: any = res;
      if (!response.success) {
        return;
      }
      this.data = response.data;
      this.tips.manager_tips = this.data.manager_tips || '';
      this.tips.player_tips = this.data.player_tips || '';
      // make copy
      this.copyOfManagerTips = this.data.manager_tips;
      this.copyOfPlayerTips = this.data.player_tips;
      this.managerTipsChange = false;
      this.playerTipsChange = false;
    });
  }

  saveManagerTips(manager_tips) {
    this.isSaving = true;
    this.tips.manager_tips = manager_tips;
    this.tips.player_tips = this.copyOfPlayerTips;
    this.tipsService.updateTips(this.tips).subscribe((res) => {
      const response: any = res;
      this.isSaving = false;
      this.managerTipsChange = false;
      if (!response.success) {
        return;
      }
      this.getTips();
    });
  }

  savePlayerTips(player_tips) {
    this.isSaving = true;
    this.tips.player_tips = player_tips;
    this.tips.manager_tips = this.copyOfManagerTips;
    this.tipsService.updateTips(this.tips).subscribe((res) => {
      const response: any = res;
      this.isSaving = false;
      this.playerTipsChange = false;
      if (!response.success) {
        return;
      }
      this.getTips();
    });
  }
}
