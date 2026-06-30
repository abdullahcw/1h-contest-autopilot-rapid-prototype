import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { IpConfigurationService, IpList } from 'src/app/services/ip-configuration/ip-configuration.service';
import { GlobalService } from 'src/app/services/global/global.service';

@Component({
  selector: 'app-add-ip',
  templateUrl: './add-ip.component.html',
  styleUrls: ['./add-ip.component.scss']
})
export class AddIpComponent implements OnInit {
 
  ips: IpList = new IpList();
  is_loading: boolean=false;
  ipExist: boolean=false;
  addSeries: boolean=false;
  onSuccess: any;

 

  constructor(   
     public ipConfigurationService: IpConfigurationService,
     public storageService: StorageService,
     public translate: TranslateService,
     public globalService: GlobalService,
     public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public ipDetails: any
    
    ) { }

  ngOnInit(): void {
    console.log('ipDetails',this.ipDetails);
    this.ips.ip_address = this.ipDetails.ip_address || '';
    this.ips.ip_desc = this.ipDetails.ip_desc || '';  
    this.ips.ip_id = this.ipDetails.ip_id;
  }
  cancel() {
    this.dialogRef.close(null);     
  }
 
  nextScreen(ips){
      this.is_loading = true;
      const payload = {
        'company_id': this.storageService.getCompanyId(),
        // 'ip': [ips.ip_address]
        'ip': {
          'ip_desc': ips.ip_desc,
          'ip_address': ips.ip_address
        }
      };
      this.ipConfigurationService.addIp(payload).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) { return; }
        console.log('response',response);
        this.dialogRef.close(response.data); 
        this.globalService.addAdminGoogleEvent('Save_IP_Configration');
      });
  }
  updateSeries(ips){
      this.is_loading = true;
      const payload = {
        'company_id': this.storageService.getCompanyId(),
        'ip': {
          'ip_id': ips.ip_id,
          'ip_desc': ips.ip_desc,
          'ip_address': ips.ip_address
        }
      };
      this.ipConfigurationService.updateIp(payload).subscribe((res) => {
        const response: any = res;
        this.is_loading = false;
        if (!response.success) { return; }
          this.dialogRef.close(true);
      });
  }

}
