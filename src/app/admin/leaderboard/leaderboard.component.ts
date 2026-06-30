import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from 'src/app/services/global/global.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { LeaderboardService } from 'src/app/services/leaderboard/leaderboard.service';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { Router } from '@angular/router';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { TranslateService } from '@ngx-translate/core';
import { PermissionsService, PermissionsKey } from 'src/app/services/permissions/permissions.service';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, OnDestroy {

  company = {
    'companyLogo': 'https://sh-devhuddle.s3.us-west-2.amazonaws.com/development/1HUDDLE/company/logo/1HUDDLE.jpg',
    'companyName': '1huddle',
    'tzName': '',
    'tzNameAbbr': ''
  };
  leaderboardSettings = {
    'lastReset': new Date,
    'nextReset': null,
    'frequency': 0,
    'repeat': 'never',
    'groupBy': 'byPlayer',
    'leaderboards': []
  };
  isDatePickerOpen = false;
  is_loading = false;
  persisitLastReset;
  persisitNextReset;
  leaderboardPermission;
  // datePlaceHolder;
  delegateSubscription: any;
  repeatOptions = ['never', 'daily', 'weekly', 'monthly'];
  frequencies = [];
  footerTextFrequency = '';
  footerTextDate = '';
  today;
  tomorrow;
  customfields1;
  customfields2;
  isChanged = false;
  hasSameName = false;
  isLastResetDateSelected = true;
  isNextResetDateSelected = true;
  isRepeatOptionSelected = true;
  isFrequencySelected = true;
  leaderboardPayload;
  nextResetCleared = true;
  frequencyCleared = true;
  @ViewChild('resetLeaderboardForm', { static: true }) resetLeaderboardForm: NgForm;

  constructor(private storageService: StorageService, private globalService: GlobalService,
    private router: Router, public translate: TranslateService,
    private datePipe: DatePipe,
    private permissionService: PermissionsService,
    private leaderboardService: LeaderboardService,
    private delegateService: DelegateService,
    private dialog: MatDialog) {


    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      if (this.router.url.indexOf('leaderboard') !== -1) {
        this.resetLeaderboardSettings();
        this.getLeaderboardSettings();
      }
    });

    for (let i = 1; i <= 12; i++) {
      this.frequencies.push(i);
    }
  }

  ngOnInit() {
    // this.datePlaceHolder = this.translate.instant('date_format_mmddyyyy');
    this.today = this.globalService.getCurrentDate();
    const todaysDate = new Date();
    todaysDate.setDate(todaysDate.getDate() + 1);
    this.tomorrow = todaysDate;
    this.setleaderboardPermission();
    this.globalService.permissionReceived$.subscribe(res => {
      this.setleaderboardPermission();
    });
    this.getLeaderboardSettings();
  }

  getCustomFields() {
    this.is_loading = true;
    this.leaderboardService.getLeaderBoardCustomFields(this.storageService.getCompanyId(), true).subscribe(res => {
      this.is_loading = false;
      if (res.success) {
        this.prepareList(res.data.fields);
      }
    });
  }

  getCapitalized(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  setleaderboardPermission() {
    this.leaderboardPermission = this.permissionService.getPermissions(PermissionsKey.LEADERBOARD);
  }

  getLeaderboardSettings() {
    this.is_loading = true;
    this.leaderboardService.getLeaderboardSettings(this.storageService.getCompanyId()).subscribe((res) => {
      const response = res;
      this.is_loading = false;
      if (!response.success) {
        return;
      }
      const leaderboardSettings = response.data.leaderboard_settings;
      if (leaderboardSettings) {
        const lastReset = this.globalService.formatDate(leaderboardSettings.last_reset);
        const nextReset = leaderboardSettings.next_reset ? this.globalService.formatDate(leaderboardSettings.next_reset) : '';
        this.persisitLastReset = lastReset;
        this.persisitNextReset = nextReset;
        this.leaderboardSettings.lastReset = lastReset;
        this.leaderboardSettings.nextReset = nextReset;
        this.leaderboardSettings.repeat = leaderboardSettings.repeat ? leaderboardSettings.repeat.toLowerCase() : 'never';
        this.leaderboardSettings.groupBy = leaderboardSettings.group_by;
        this.leaderboardSettings.frequency = leaderboardSettings.frequency ? leaderboardSettings.frequency : 1;
      }
      this.leaderboardSettings.leaderboards = response.data.leaderboards;
      this.company.tzName = response.data.company_details.tz_name;
      this.company.tzNameAbbr = response.data.company_details.tz_short_name;
      this.updateFooter();
      this.getCustomFields();
    });
  }

  clearNextReset() {
    this.nextResetCleared = false;
    this.frequencyCleared = false;
    this.resetFlagsForSelection();
    this.leaderboardSettings.nextReset = '';
    this.resetLeaderboardSettings(false);
    this.resetLeaderboardForm.form.markAsDirty();
  }

  resetLeaderboardSettings(resetAll = true) {
    if (resetAll) {
      this.leaderboardSettings.lastReset = new Date;
      this.leaderboardSettings.groupBy = 'byPlayer';
    }
    this.leaderboardSettings.frequency = 1;
    this.leaderboardSettings.nextReset = '';
    this.leaderboardSettings.repeat = 'never';
    setTimeout(() => {
      this.nextResetCleared = true;
      this.frequencyCleared = true;
    }, 0);
    // this.resetLeaderboardForm.form.markAsPristine();
    console.log('this.leaderboardSettings', this.leaderboardSettings);
  }

  updateSettings() {
    console.log('m here', this.leaderboardSettings);
    this.updateFooter();
  }

  updateFooter() {
    this.footerTextFrequency = this.getRepeatText();
    this.footerTextDate = this.getOrdinalDate();
  }

  getOrdinalDate() {
    let format = 'MMM dd, yyyy';
    return this.datePipe.transform(this.leaderboardSettings.nextReset, format);
  }

  getRepeatText() {
    this.globalService.addAdminGoogleEvent( 'Leaderboard_By_Repeat_Edited');
    const frequency = this.leaderboardSettings.frequency;
    const isSingle = frequency === 1;
    if (this.leaderboardSettings.repeat === 'daily') {
      return isSingle ? `everyday` : `every ${frequency} days`;
    } else if (this.leaderboardSettings.repeat === 'weekly') {
      const day = this.datePipe.transform(this.leaderboardSettings.nextReset, 'EEEE');
      return isSingle ? `every ${day}` : `every ${frequency} weeks on ${day}s`;
    } else if (this.leaderboardSettings.repeat === 'monthly') {
      let monthStr = isSingle ? 'every month' : `every ${frequency} months`;
      return monthStr;
    }
  }

  getPeriodText(frequency) {
    const isSingle = frequency === 1;
    if (this.leaderboardSettings.repeat === 'daily') {
      return isSingle ? ` Day` : ` Days`;
    } else if (this.leaderboardSettings.repeat === 'weekly') {
      return isSingle ? ` Week` : ` Weeks`;
    } else if (this.leaderboardSettings.repeat === 'monthly') {
      return isSingle ? ` Month` : ` Months`;
    }
    return 'Never';
  }

  getOrdinalNumber(i) {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return i + 'st';
    }
    if (j === 2 && k !== 12) {
      return i + 'nd';
    }
    if (j === 3 && k !== 13) {
      return i + 'rd';
    }
    return i + 'th';
  }

  confirmChange() {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: this.leaderboardSettings.nextReset
    });
    dialogRef.componentInstance.message = this.translate.instant('save_your_changes');
    dialogRef.componentInstance.negativeButtonText = this.translate.instant('no_uppercase');
    dialogRef.componentInstance.positiveButtonText = this.translate.instant('yes_uppercase');
    dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      dialogRef.close();
    });
    dialogRef.componentInstance.onPositiveAction.subscribe(() => {
      this.updateLeaderboardSettings();
      this.globalService.addAdminGoogleEvent('Leaderboard_By_Leaderboard_Saved');
      dialogRef.close();
    });
    
  }

  leaderboardTypeChanged(value) {
    this.resetLeaderboardForm.form.markAsDirty();
    this.leaderboardSettings.groupBy = value;
    if(this.leaderboardSettings.groupBy === 'byGroupName') {
    this.globalService.addAdminGoogleEvent('Leaderboard_By_Leaderboard_Settings_By_Group');
      
    }
    if(this.leaderboardSettings.groupBy === 'byPlayer') {
   this.globalService.addAdminGoogleEvent('Leaderboard_By_Leaderboard_Settings_By_Player');
      
    }
  }

  updateLeaderboardSettings() {
    this.is_loading = true;
    this.leaderboardPayload = this.createLeaderboardPayload();
    this.leaderboardService.updateLeaderboardSettings(this.leaderboardPayload).subscribe((res) => {
      const response = res;
      if (!response.success) {
        this.is_loading = false;
        this.showAlert(this.translate.instant('unable_to_update'), this.translate.instant('unable_to_update_leaderboard_settings'));
        return;
      }
      this.globalService.addAdminGoogleEvent('Leaderboard_By_Leaderboard_Saved');
      this.resetLeaderboardForm.form.markAsPristine();
      this.is_loading = false;
    });
  }

  showAlert(title, message) {
    const dialogReference = this.dialog.open(ConfirmActionComponent, {
      data: event
    });
    dialogReference.componentInstance.title = title;
    dialogReference.componentInstance.message = message;
    dialogReference.componentInstance.isMultiOption = false;
    dialogReference.componentInstance.positiveButtonText = this.translate.instant('ok_uppercase');
  }

  createLeaderboardPayload() {
    const payload = {
      'company_id': this.storageService.getCompanyId(),
      'leaderboard_settings': {
        'last_reset': this.globalService.formatDateForPayload(this.leaderboardSettings.lastReset),
        'next_reset': this.leaderboardSettings.nextReset ? this.globalService.formatDateForPayload(this.leaderboardSettings.nextReset) : '',
        'type': this.leaderboardSettings.groupBy,
        'repeat': this.leaderboardSettings.repeat,
        'frequency': (!this.leaderboardSettings.nextReset || this.leaderboardSettings.repeat === 'never') ? 0
          : this.leaderboardSettings.frequency
      },
      'leaderboards': this.prepareLeaderboards(),
      'created_by': this.storageService.getLoginUserID()
    };
    if (this.leaderboardSettings.lastReset) {
      this.globalService.addAdminGoogleEvent('Leaderboard_By_Start_Date_Edited');
    }
    if (this.leaderboardSettings.nextReset) {
      this.globalService.addAdminGoogleEvent(`Leaderboard_By_Next_Reset_Edited_${this.leaderboardSettings.lastReset}`);
    }
    if (this.leaderboardSettings.groupBy) {
      if ('byGroupName') {
        this.globalService.addAdminGoogleEvent('Leaderboard_By_Leaderboard_Settings_By_Group');
      }
      if ('byPlayer') {
        this.globalService.addAdminGoogleEvent('Leaderboard_By_Leaderboard_Settings_By_Player');
      }
      if (this.leaderboardSettings.repeat) {
        if (this.leaderboardSettings.repeat === 'daily') {
          this.globalService.addAdminGoogleEvent('Leaderboard_By_Repeat_Edited_daily');
        }
        if (this.leaderboardSettings.repeat === 'weekly') {
          this.globalService.addAdminGoogleEvent('Leaderboard_By_Repeat_Edited_weekly');
        }
        if (this.leaderboardSettings.repeat === 'monthly') {
          this.globalService.addAdminGoogleEvent('Leaderboard_By_Repeat_Edited_monthly');
        }
        if (this.leaderboardSettings.repeat === 'never') {
          this.globalService.addAdminGoogleEvent('Leaderboard_By_Repeat_Edited_never');
        }
      }
    }

    return payload;
  }

  clearLeaderboard(index) {
    this.leaderboardSettings.leaderboards.forEach((leaderboard, idx) => {
      if (idx == index) {
        leaderboard.key = '';
        leaderboard.text = '';
        leaderboard.option = '';
        leaderboard.hasInvalidName = false;
        leaderboard.hasInvalidOption = false;
      }
    });
    this.filterList('', 2);
    this.resetLeaderboardForm.form.markAsDirty();
  }

  filterList(leaderboardOption, index) {
    this.checkLeaderboardName();
    const newCustomFields = this.customfields1 && JSON.parse(JSON.stringify(this.customfields1));
    
    let leaderboards = [];
    leaderboards = this.leaderboardSettings.leaderboards;
    if (leaderboards) {
      leaderboards[index].option = leaderboardOption;
      leaderboards[index].fields.forEach(field => {
        if (field.option == leaderboardOption) {
          leaderboards[index].key = field.key;
        }
      });
    }

    if (newCustomFields) {
      newCustomFields.forEach(customfield => {
        if (customfield.option == leaderboardOption) {
          customfield.selected = false;
        } else {
          customfield.selected = true;
        }
      });
    }

    if (index == 1) {
      leaderboards[index + 1].fields = newCustomFields;
    } else {
      leaderboards[index - 1].fields = newCustomFields;
    }
  }

  shouldDisable() {
    let isEmpty = false;
    this.leaderboardSettings.leaderboards.forEach(leaderboard => {
      if (isEmpty) return;
      if ((!leaderboard.text && leaderboard.option) || leaderboard.hasInvalidName || (leaderboard.text && !leaderboard.option)) {
        isEmpty = true;
      } else {
        isEmpty = false;
      }
    });
    return isEmpty;
  }

  checkLeaderboardName() {
    console.log('leaderboard', this.leaderboardSettings.leaderboards);
    let leaderboards = [];
    leaderboards = this.leaderboardSettings.leaderboards;
    const leaderboardName1 = leaderboards[1].text.replace(/^\s+/g, '')
    const leaderboardName2 = leaderboards[2].text.replace(/^\s+/g, '')
    console.log('name', leaderboardName1, leaderboardName2)
    if (!leaderboardName1.length && leaderboards[1].option) {
      leaderboards[1].hasInvalidName = true;
    } else {
      leaderboards[1].hasInvalidName = false;
    }
    if (!leaderboardName2.length && leaderboards[2].option) {
      leaderboards[2].hasInvalidName = true;
    } else {
      leaderboards[2].hasInvalidName = false;
    }
    if (leaderboardName1.length || leaderboardName2.length) {
      if (leaderboards[1].text.trim().toLowerCase() == leaderboards[2].text.trim().toLowerCase()) {
        leaderboards[1].hasInvalidName = true;
        leaderboards[2].hasInvalidName = true;
      } else {
        if (leaderboards[0].text.trim().toLowerCase() == leaderboards[2].text.trim().toLowerCase()) {
          leaderboards[2].hasInvalidName = true;
        }
        if (leaderboards[0].text.trim().toLowerCase() == leaderboards[1].text.trim().toLowerCase()) {
          leaderboards[1].hasInvalidName = true;
        }
      }
    }
  }

  prepareList(fields) {
    if (this.leaderboardSettings.leaderboards && this.leaderboardSettings.leaderboards.length < 3) {
      this.leaderboardSettings.leaderboards.push({ key: "", text: "", option: "", fields: []})
    }
    if (fields) {
      this.customfields1 = fields.map(field => {
        return { 'key': field.filter_key, 'text': field.title, 'option': field.title, 'selected': true };
      });
      this.customfields2 = fields.map(field => {
        return { 'key': field.filter_key, 'text': field.title, 'option': field.title, 'selected': true };
      });
      this.leaderboardSettings.leaderboards[1]['fields'] = this.customfields1;
      this.leaderboardSettings.leaderboards[1]['hasInvalidName'] = false;
      this.leaderboardSettings.leaderboards[1]['hasInvalidOption'] = false;
      this.leaderboardSettings.leaderboards[2]['fields'] = this.customfields2;
      this.leaderboardSettings.leaderboards[2]['hasInvalidName'] = false;
      this.leaderboardSettings.leaderboards[2]['hasInvalidOption'] = false;
      this.leaderboardSettings.leaderboards.forEach((leaderboard, index) => {
        if (index != 0) {
          leaderboard.fields.forEach(field => {
            if (leaderboard.key == field.key) {
              leaderboard.option = field.option;
            }
          });
        } else {
          leaderboard.option = 'All';
        }
      });
      this.prepareFields();
    }
  }

  prepareLeaderboards() {
    const payload = [];
    this.leaderboardSettings.leaderboards.forEach(leaderboard => {
      if (leaderboard.option && leaderboard.text) {
        const leaderboards = {
          key: '',
          text: ''
        };
        if (leaderboard.option == 'All') {
          leaderboards.key = 'all';
          leaderboards.text = 'All';
        } else {
          leaderboards.key = leaderboard.key;
          leaderboards.text = leaderboard.text;
        }
        payload.push(leaderboards);
      }
    });
    return payload;
  }

  prepareFields() {
    let leaderboards = [];
    leaderboards = this.leaderboardSettings.leaderboards;
    console.log('leaderboards', leaderboards)
    leaderboards[2].fields.forEach((field, index) => {
      if (field.option == leaderboards[1].option) {
        leaderboards[2].fields[index].selected = false;
      }
      if (leaderboards[2].option && field.option == leaderboards[2].option) {
        leaderboards[1].fields[index].selected = false;
      }
    });
  }

  isLastDateSelected() {
    this.isLastResetDateSelected = !this.isLastResetDateSelected;
  }
  
  isNextDateSelected() {
    this.isNextResetDateSelected = !this.isNextResetDateSelected;
  }

  isRepeatSelected() {
    this.isRepeatOptionSelected = !this.isRepeatOptionSelected
  }

  isFrequencyOptionSelected() {
    this.isFrequencySelected = !this.isFrequencySelected
  }

  noSpace(event = null) {
    const charCode = (event.which) ? event.which : event.keyCode;
    let leaderboards = [];
    leaderboards = this.leaderboardSettings.leaderboards;
    console.log('checkspace', leaderboards, charCode);
    if (charCode === 32 && !leaderboards[1].text.trim().length && !leaderboards[2].text.trim().length) {
      return false;
    }
    // if (charCode === 32 ) {
    //   return false;
    // }
  }

  resetFlagsForSelection() {
    this.isLastResetDateSelected = true;
    this.isNextResetDateSelected = true;
    this.isRepeatOptionSelected = true;
    this.isFrequencySelected = true;
  }

  leaderboardEvent() {
    this.globalService.addAdminGoogleEvent('Leaderboard_Leaderboard_Layout_Updated');
  }
  
  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }
}
