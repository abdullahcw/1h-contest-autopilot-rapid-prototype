import { Component, OnInit, Inject, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CropperComponent, ImageCropperResult } from 'angular-cropperjs';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss']
})
export class CropImageComponent implements OnInit {
  @Input() aspectRatio = 1;
  @Input() maintainAspectRatio = true;
  @ViewChild('angularCropper', { static: true }) public angularCropper: CropperComponent;
  title = 'Edit Image';
  config: any = {zoomable: true,
    viewMode: 0,
    zoomOnWheel: false,
    minCropBoxWidth: 50,
    minWidth: 1024,
    minHeight: 1024,
    minCropBoxHeight: 50,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'};
  cropedImg = { blobedData: null, base64: null};
  croppedBase64Image: any = '';
  croppedBlobImage: any = '';
  isFixedWidth: any = false;
  maxHeight: any = 1024;
  maxWidth: any = 1024;
  is_from_Shop = false;
  fromAlertBaner = false;
  resultImage: any;

  constructor(public translate: TranslateService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public imageChangedEvent: any) { }

  ngOnInit() {
    console.log(this.imageChangedEvent)
    if (this.maintainAspectRatio) {
      this.config.aspectRatio = this.aspectRatio;
    }
    if(this.fromAlertBaner && this.imageChangedEvent){
      const reader = new FileReader();
      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.angularCropper.imageUrl = event.target.result;
      };
      reader.readAsDataURL(this.imageChangedEvent); // read file as data url

    }else if (this.imageChangedEvent.target.files && this.imageChangedEvent.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.angularCropper.imageUrl = event.target.result;
      };
      reader.readAsDataURL(this.imageChangedEvent.target.files[0]); // read file as data url
    }
  }

  goToEditProfile() {
    if (this.is_from_Shop) {
      this.dialogRef.close(false);
    } else {
      this.dialogRef.close();
    }
  }

  saveCroppedImg(ev) {
    const config: any = {
      fillColor: '#fff',
      maxHeight: this.maxHeight
    };
    if (this.isFixedWidth) {
      config.width = this.maxWidth;
    } else {
      config.maxWidth = this.maxWidth;
    }
    this.angularCropper.cropper.getCroppedCanvas(config).toBlob((blob) => {
      this.cropedImg.blobedData = blob;
      const reader = new FileReader();
      const that = this;
      console.log(blob, reader);
      reader.onloadend = function() {
        const base64data = reader.result;
        that.cropedImg.base64 = base64data;
        that.dialogRef.close(that.cropedImg);
      };
      reader.readAsDataURL(blob);
    });
    setTimeout(() => {
      console.log('Event triggered');
      if (document.getElementById('doneBtn')) {
        document.getElementById('doneBtn').click();
      }
    }, 350);
  }

  zoomIn() {
    this.angularCropper.cropper.zoom(0.1);
  }

  zoomOut() {
    this.angularCropper.cropper.zoom(-0.1);
  }

  rotateRight() {
    this.angularCropper.cropper.rotate(90);
  }

  restoreZoom() {
    this.angularCropper.cropper.reset();
  }
}
