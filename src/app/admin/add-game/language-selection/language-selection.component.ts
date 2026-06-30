import { Component, OnInit, ViewChild, Input, EventEmitter, Output, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GlobalService } from 'src/app/services/global/global.service';
import { GamesService } from 'src/app/services/games/games.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionComponent } from '../../confirm-action/confirm-action.component';
import { TranslationsErrorPopupComponent } from '../translations-error-popup/translations-error-popup.component';

@Component({
  selector: 'app-language-selection',
  templateUrl: './language-selection.component.html',
  styleUrls: ['./language-selection.component.scss']
})
export class LanguageSelectionComponent implements OnInit , OnChanges {
  searchKey;
  @Input() items = [];
  @Input() selectedId;
  @Input() defaultLangId;
  @Input() isRequired = false;
  @Input() gameStatus = false;
  @Input() langDialog = false;
  @Input() placeholderText = this.translate.instant('language');
  @Input() disabled = false;
  @Input() disabledArrow = false;
  @Input() shouldAllowSearch = true;
  @Input() game_id;
  @Output() change: EventEmitter<any> = new EventEmitter();
  @ViewChild('search', { read: MatAutocompleteTrigger, static: true }) autocomplete;
  filterControl: FormControl;
  selectedItem: any = { text: '', id: -1 };
  allItems = [];
  constructor(public translate: TranslateService,
    public globalService: GlobalService,
    public storageService: StorageService,
    public gameService: GamesService,
    public dialog: MatDialog,
    ) { }

  scroll = (event: any): void => {
    if (event.srcElement.className.indexOf('mat-tab-body-content') !== -1) { // angular class
      this.autocomplete.closePanel();
    }
  }
// isMobile
  ngOnInit() {   
     setTimeout(() => {
       this.findSelectedItem();
     }, 1000);
  }

  findSelectedItem() {
    
    this.selectedItem = { text: '', id: -1 };
    if (this.selectedId && this.items && this.items.length) {
      const filteredArray = this.items.filter(element => {
        return element.id === this.selectedId;
      });
      if (filteredArray.length) {
        this.selectedItem = filteredArray[0];
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('changes.items',changes);
    if (changes.items) {
      this.items = changes.items.currentValue;
      this.findSelectedItem();
    }
    if (changes.selectedId) {
      this.selectedId = changes.selectedId.currentValue;
      this.findSelectedItem();
    }
  }



  getTranslationProgress(item) {
    // this.is_loading = true;
    const company_id = this.storageService.getCompanyId();
    this.gameService.getTranslationProgress(this.game_id,company_id)
    // this.gameService.getTranslationProgress(64576,4)
    .subscribe(res => {
      const response: any = res;
      // this.is_loading = false;
      if (!response.success) {
        // this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      console.log(response.data)
      const status = response.data;
      // status.translation_status = 'FAILED'
      if(status.translation_status == 'COMPLETED'){
        this.switchToAnotherLang(item);
      }else if(status.translation_status == 'IN_PROGRESS'){
        this.promptForSchedule('AITranslationErrorTitle1','AITranslationErrorMessage1');
      }else if(status.translation_status == 'FAILED'){
      this.promptForSchedule('AITranslationErrorTitle2','AITranslationErrorMessage2',true);
      }
      
     
    });
  }
  callToRetry(){
    const company_id = this.storageService.getCompanyId();
    this.gameService.retryTranslation(this.game_id,company_id)
    // this.gameService.getTranslationProgress(64576,4)
    .subscribe(res => {
      const response: any = res;
      // this.is_loading = false;
      if (!response.success) {
        // this.globalService.showMessage(this.apiService.getErrorMessage(response.message_code));
        return;
      }
      // console.log(response.data)               
    });
  }

  switchToAnotherLang(item){
    this.selectedItem = item;
    this.selectedId = item.id;
    this.change.emit(this.selectedId);
    this.searchKey = '';
    if(this.langDialog){
      this.globalService.addGoogleEvent('Default_Language_Changed' , 'Game Builder-Single level', item.code , '');
    }else{
      this.globalService.addGoogleEvent('Game_Builder_View_Changed' , 'Game Builder-Single level', item.code , '');
    }
  }
 
  promptForSchedule(title,message,showRetry = false) {
      const dialogRef = this.dialog.open(TranslationsErrorPopupComponent);
      dialogRef.componentInstance.title = this.translate.instant(title);
      dialogRef.componentInstance.message = this.translate.instant(message);
      dialogRef.componentInstance.positiveButtonText = showRetry == true ? 'RETRY': 'OK';
      if(showRetry == true ){
        dialogRef.componentInstance.negativeButtonText = 'OK';
      }
      dialogRef.componentInstance.onPositiveAction.subscribe(() => {
        // this.moveToReady();
        if(showRetry == true ){
          console.log('retry');
          this.callToRetry();
        }
      });
      // dialogRef.componentInstance.onNegativeAction.subscribe(() => {
      //   // this.redirectToGames();
      // });
    }
  itemClicked(item) {
    this.getTranslationProgress(item);
    // this.promptForSchedule('AITranslationErrorTitle1','AITranslationErrorMessage1');
    // this.promptForSchedule('AITranslationErrorTitle2','AITranslationErrorMessage2',true);
    // return
    // this.selectedItem = item;
    // this.selectedId = item.id;
    // this.change.emit(this.selectedId);
    // this.searchKey = '';
    // if(this.langDialog){
    //   this.globalService.addGoogleEvent('Default_Language_Changed' , 'Game Builder-Single level', item.code , '');
    // }else{
    //   this.globalService.addGoogleEvent('Game_Builder_View_Changed' , 'Game Builder-Single level', item.code , '');
    // }

  }

  activateAutocomplete(panel) {
    if (panel) {
      this.autocomplete.closePanel();
      return;
    }
  }
  

}





