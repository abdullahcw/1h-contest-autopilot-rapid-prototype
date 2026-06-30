import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { GameSeriesService, Series } from 'src/app/services/game-series/game-series.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-create-series',
  templateUrl: './create-series.component.html',
  styleUrls: ['./create-series.component.scss']
})
export class CreateSeriesComponent implements OnInit {
  series: Series = new Series();
  is_loading: boolean=false;
  seriesExist: boolean=false;

  constructor(   
     public gameSeriesService: GameSeriesService,
     public storageService: StorageService,
     public translate: TranslateService,
     public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public seriesDetails: any
    
    ) { }

  ngOnInit(): void {
    this.series.series_name = this.seriesDetails.series_name || '';
    this.series.series_id = this.seriesDetails.series_id;
  }
  cancel() {
    this.dialogRef.close(null);     
  }
 
  nextScreen(isSave: boolean = false){
      this.is_loading = true;
      const validateAudiencePayload = {
        'company_id': this.storageService.getCompanyId(),
        'series_name': this.series.series_name,
      };
      this.gameSeriesService.addSeries(validateAudiencePayload).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) { return; }
        console.log('response',response);
        if(!isSave){
          this.dialogRef.close(response.data);  
        }else{
          this.dialogRef.close(true);
        }
      });
  }
  updateSeries(){
      this.is_loading = true;
      const validateAudiencePayload = {
        'company_id': this.storageService.getCompanyId(),
        'series_id': this.series.series_id,
        'series_name': this.series.series_name,
      };
      this.gameSeriesService.updateGameSeries(validateAudiencePayload).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) { return; }
        console.log('response',response);
          this.dialogRef.close(true);
      });
  }

  seriesChanged(){  
    console.log('seriesChanged');
  }
  
}
