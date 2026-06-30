import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PDFProgressData } from 'ng2-pdf-viewer';
import { TranslateService } from '@ngx-translate/core';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.scss']
})
export class PdfPreviewComponent implements OnInit {
  pdfDataSource: any;
  is_loading = false;
  constructor(public translate: TranslateService,
    public getImageURLService:GetImageURLService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }
  ngOnInit() {
    this.is_loading = true;
    this.imageUrlUpdated(this.data.document_url);
  }
  onProgress(progressData: PDFProgressData) {
    this.is_loading = (progressData.loaded !== progressData.total);
  }
  pdfClicked(event) {
    event.preventDefault();
    if (event.target.href) {
      window.open(event.target.href, 'blank');
    }
  }
  close() {
    this.dialogRef.close();
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const ignoreCache = true;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl, ignoreCache)
    console.log(relativePath)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      console.log(data)        
      that.pdfDataSource = data;
    });  
  }
}