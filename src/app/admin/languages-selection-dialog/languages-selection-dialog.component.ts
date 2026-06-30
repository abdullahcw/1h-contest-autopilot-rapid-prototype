import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-languages-selection-dialog',
  templateUrl: './languages-selection-dialog.component.html',
  styleUrls: ['./languages-selection-dialog.component.scss']
})
export class LanguagesSelectionDialogComponent implements OnInit {
  onPositiveAction: EventEmitter<any> = new EventEmitter();
  onNegativeAction: EventEmitter<any> = new EventEmitter();
  constructor(public dialogRef: MatDialogRef<any>,
    public translate: TranslateService,
    public globalService: GlobalService,
    private cdf: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public languageSelectionDialogData: any) { }
    allowMultiSelect = true;
    allLanguage = JSON.parse(JSON.stringify(this.languageSelectionDialogData.allLanguage));
    gameStatus;
    selectedLang = [];
    allLang = [];
    game_id = this.languageSelectionDialogData.game_id;
    defaultSelectedLang = [];
    defaultSelectedLangId;
    selection = new SelectionModel(this.allowMultiSelect, []);
  
  ngOnInit(): void {
    console.log('allLang',this.allLanguage);
   

    // this.selectedLang  = this.allLanguage.selected_language.filter(item => item.checked);
    const selectedLanguage = JSON.parse(JSON.stringify(this.allLanguage.selected_language));
    //  this.selectedLanguageFilter(this.allLanguage.selected_language);
    this.selectedLang  = this.selectedLanguageFilter(selectedLanguage);
    this.allLang = JSON.parse(JSON.stringify(this.allLanguage.selected_language)); 
    this.defaultSelectedLang = this.allLanguage.default_language;
    this.defaultSelectedLangId = this.allLanguage.default_language.id;
    console.log('this.selectedLang',this.selectedLang);
  }
  cancel() {
    this.selectedLang = [];
    this.allLanguage = [];
    this.allLang = [];
    this.defaultSelectedLang = [];
    this.defaultSelectedLangId = [];
    this.dialogRef.close();
  }
  actionConfirmed() {
    this.defaultSelectedLang  = this.allLanguage.selected_language.filter(item => 
      item.id === this.defaultSelectedLangId );
    // console.log(this.selectedLang);
    // this.selectedLang = this.selectedLanguageFilter
    const selection = {
      'selected_language':this.selectedLang,
      'default_language':this.defaultSelectedLang[0],
    }
    // console.log('this.selection',selection);
    this.onPositiveAction.emit(selection);
    this.dialogRef.close();
  }
  onItemClick(selectedLanguage){
    // console.log('selectedLanguage',selectedLanguage);
    // console.log(this.selectedLang);

      this.allLang.map(item=>{
      if (item.id === selectedLanguage.id) {
        // item = selectedLanguage;
        if(selectedLanguage.checked){
          // console.log(this.selectedLang);

          // Language_Selected
          // this.globalService.addAdminGoogleEvent('SLG_Language_Preference_Clicked');
          this.globalService.addGoogleEvent('Language_Selected' , 'Game Builder-Single level', selectedLanguage?.code , '');
          this.selectedLang.push(selectedLanguage);
          this.selectedLang.sort((a, b) => parseFloat(a.id) - parseFloat(b.id));

        }else{
          this.globalService.addGoogleEvent('Language_Unselected' , 'Game Builder-Single level', selectedLanguage.code , '');
          // const index = this.selectedLang.indexOf(item);
          // this.selectedLang.splice(index,1);
          const index = this.selectedLang.findIndex(e => e.id == selectedLanguage.id);
          this.selectedLang.splice(index,1);
          console.log(this.selectedLang);
         
        }
      }
     });

     console.log(this.selectedLang);
     console.log('defaultSelectedLangId',this.defaultSelectedLangId);
     const defaultKey = this.selectedLang.findIndex(e => e.id == this.defaultSelectedLangId);
     console.log(defaultKey);

     if(this.selectedLang.length === 1 || defaultKey === -1){
      // this.defaultSelectedLangId = [];
      this.defaultSelectedLang = this.selectedLang[0];
      this.defaultSelectedLangId = this.selectedLang[0].id;
     }
     console.log('selectedLang',this.selectedLang);
     this.cdf.detectChanges();

  }
  onLangChange(defaultLang){
    // console.log('defaultLang',defaultLang);
    this.defaultSelectedLangId = defaultLang;
    // this.cdf.detectChanges();
  }
 
  selectedLanguageFilter(items){
    return items.filter(item => item.checked);
  }
}
