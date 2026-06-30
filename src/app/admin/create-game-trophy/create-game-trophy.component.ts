import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TrophyService } from 'src/app/services/trophy/trophy.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-create-game-trophy',
  templateUrl: './create-game-trophy.component.html',
  styleUrls: ['./create-game-trophy.component.scss']
})
export class CreateGameTrophyComponent implements OnInit, AfterViewChecked {

  previewShowHide = false;
  higScoreValue = [];
  games;
  is_loading = false;
  gameTrophy = {
    game_name: '',
    company_id: '',
    game_id: '',
    game_points: '',
    high_score: '',
    attempts: '',
    trophy_description: '',
    game_logo_url: '',
    is_trophy: '',
    preview_mode: ''
  };
  trophyDetailsCopy: any;
  @ViewChild('trophy') trophy: NgForm;


  constructor(
    public storageService: StorageService,
    public dialogRef: MatDialogRef<any>,
    public globalService: GlobalService,
    private cdRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public editGameTrophy: any,
    public trophyService: TrophyService) { }

  ngOnInit() {
    this.trophyDetailsCopy = JSON.parse(JSON.stringify(this.editGameTrophy));
    this.gameTrophy.game_name = this.editGameTrophy.game_name;
    this.gameTrophy.game_id = this.editGameTrophy.game_id;
    this.gameTrophy.game_logo_url = this.editGameTrophy.game_logo_url;
    this.gameTrophy.preview_mode = this.editGameTrophy.preview_mode;
    this.previewShowHide = this.editGameTrophy.preview_mode;
    for (let i = 50; i <= 100; i++) {
      this.higScoreValue.push(i);
    }
    if (this.editGameTrophy.is_trophy) {
      this.gameTrophy = Object.assign({}, this.editGameTrophy);
    }
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  getGames() {
    this.is_loading = true;
    const companyId = this.storageService.getCompanyId();
    this.trophyService.getGames(companyId).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.data) {
        console.log('response', response.data)
        this.games = response.data.game_list;
      }
    });
  }


  restrictAlphabets(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }



  saveTrophy() {
    console.log('dasdasda', this.gameTrophy);
    this.gameTrophy.company_id = this.storageService.getCompanyId();
    this.is_loading = true;
    this.trophyService.addGameTrophy(this.gameTrophy).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.success) {
        console.log('response', response.data)
        this.dialogRef.close(true);
      }
    });
  }


  updateTrophy() {

    this.is_loading = true;
    this.gameTrophy.company_id = this.storageService.getCompanyId();
    this.trophyService.updateGameTrophy(this.gameTrophy).subscribe((res) => {
      const response: any = res;
      this.is_loading = false;
      if (response.success) {
        this.addEvent(this.gameTrophy);
        this.dialogRef.close(true);

      }
    });
  }
  addEvent(gameTrophy) {
    const diffrance = this.getObjectDiff(gameTrophy, this.trophyDetailsCopy);
    diffrance.forEach(element => {
      this.globalService.addAdminGoogleEvent(`Trophies_Game_Trophy_Edit_${element}`);
    });
  }
  showPreview() {
    this.previewShowHide = true;
  }
  cancel() {
    this.dialogRef.close(false);
  }
  getObjectDiff(obj1, obj2) {
    const diff = Object.keys(obj1).reduce((result, key) => {
      if (!obj2.hasOwnProperty(key)) {
        result.push(key);
      } else if (obj1[key] === obj2[key]) {
        const resultKeyIndex = result.indexOf(key);
        result.splice(resultKeyIndex, 1);
      }
      return result;
    }, Object.keys(obj2));
    return diff;
  }
  closePopUp() {
    if (!this.gameTrophy.preview_mode) {
      this.previewShowHide = false;
    } else {
      this.dialogRef.close(false);
    }
  }

  shouldDisable() {
    if (+this.gameTrophy.game_points % 100 !== 0) {
      this.trophy.form.controls['Points'].setErrors({'incorrect': true});
      return true;
    }
    if (!this.gameTrophy.trophy_description.trim().length) {
      this.trophy.form.controls['Description'].setErrors({'incorrect': true});
      return true;
    }
  }

}
