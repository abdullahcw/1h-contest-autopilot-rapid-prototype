import { Component, ElementRef, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DelegateService } from 'src/app/services/delegate/delegate.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import html2canvas from 'html2canvas';
import { GlobalService } from 'src/app/services/global/global.service';
@Component({
  selector: 'app-company-qrcode',
  templateUrl: './company-qrcode.component.html',
  styleUrls: ['./company-qrcode.component.scss']
})
export class CompanyQRCodeComponent implements OnInit {
  company = this.storageService.getCompany();
  companyID;
  delegateSubscription: any;
  qrData = {
    slug: '',
    isFromCompany: null,
    companyLogo: ''
  }
  @ViewChild('parent', { static: true }) parent: ElementRef;
  delegateService: DelegateService
  constructor(public injector: Injector,
    public globalService: GlobalService,
    private dialogRef: MatDialogRef<any>,
    public storageService: StorageService,
    @Inject(MAT_DIALOG_DATA) public dataToDisplay: any
    ) { 
    this.delegateService = injector.get<DelegateService>(DelegateService);

    this.delegateSubscription = this.delegateService.selectedHeaderCompany.subscribe((companyID) => {
      // isMultilevelTab
      console.log(this.storageService.getCompany())
      console.log(companyID)
      const company = this.storageService.getCompany();
      this.companyID = company.company_name;
    });

  }

  ngOnInit(): void {
    this.companyID = this.company.company_name;
    if(this.qrData.isFromCompany){
      this.globalService.addAdminGoogleEvent('Company_QR_Scanner_Opened');
    }else{
      this.globalService.addAdminGoogleEvent('VIP_QR_Scanner_Opened');
    }
  }

  saveAsImage() {

    if(this.qrData.isFromCompany){
      this.globalService.addAdminGoogleEvent('Company_QR_Scanner_Downloaded');
    }else{
      this.globalService.addAdminGoogleEvent('VIP_QR_Scanner_Downloaded');
    }

    html2canvas(this.parent.nativeElement, {
      proxy: this.qrData.companyLogo,
      scale: 2,      
      ignoreElements: function (node) {
        return node.nodeName === 'IFRAME';
      }
    }).then(function (canvas) {
      var a = document.createElement('a');
      a.href = canvas.toDataURL("image/jpeg");
      a.download = `1Huddle.jpeg`;
      a.click();
    });
       
  }

  private convertBase64ToBlob(Base64Image: string) {
    const parts = Base64Image.split(";base64,")
    const imageType = parts[0].split(":")[1]
    // decode base64 string
    const decodedData = window.atob(parts[1])
    // create unit8array of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length)
    // insert all character code into uint8array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i)
    }
    // return blob image after conversion
    return new Blob([uInt8Array], { type: imageType })
  }



  ngOnDestroy() {
    if (this.delegateSubscription) {
      this.delegateSubscription.unsubscribe();
    }
  }

  close(){
    this.dialogRef.close();
  }
}
