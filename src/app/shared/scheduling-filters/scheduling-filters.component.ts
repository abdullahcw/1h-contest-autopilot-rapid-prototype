import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-scheduling-filters',
  templateUrl: './scheduling-filters.component.html',
  styleUrls: ['./scheduling-filters.component.scss']
})
export class SchedulingFiltersComponent implements OnInit {

  @Input() radioBtnValue;
  @Input() isCustomAudianceFilterApplied;
  @Input() state;
  @Input() isEditable = true;
  @Output() scheduling_filters_value = new EventEmitter();
  selectedAccountType = '1';
  constructor() { }

  ngOnInit(): void {
    if(this.radioBtnValue){
      this.selectedAccountType = '0'; 
    }else{
      this.selectedAccountType = '1'; 
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    console.log("value changed",changes);
    if(changes.radioBtnValue){      
      if(changes.radioBtnValue.currentValue){
        this.selectedAccountType = '0'; 
      }else{
        this.selectedAccountType = '1'; 
      }
    }
    if(changes.isCustomAudianceFilterApplied){      
      if(changes.isCustomAudianceFilterApplied.currentValue){
        this.selectedAccountType = '0'; 
        this.isEditable = false;
      }else if(this.state == 'LIVE' || this.state == 'READY'){
        this.isEditable = false;
      }
      else if(this.state != 'LIVE'){
        this.isEditable = true;
      }
      
    }
  }


  radioChange($event: MatRadioChange) {
    if($event.value == '0'){
      console.log($event.source.name, typeof $event.value);
      this.scheduling_filters_value.emit(true);
    }else if($event.value == '1'){      
      console.log($event.source.name, typeof $event.value);
      this.scheduling_filters_value.emit(false);
    }

}
}
