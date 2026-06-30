import { Component, Input, OnInit } from '@angular/core';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';

@Component({
  selector: 'app-custom-images-table',
  templateUrl: './custom-images-table.component.html',
  styleUrls: ['./custom-images-table.component.scss']
})
export class CustomImagesTableComponent implements OnInit {

  constructor(
    public getImageURLService:GetImageURLService,
    public permissionsService:PermissionsService,
  ) {   }
  @Input() ImageSrc;
  @Input() ImageSrc1;
  @Input() ImageSrc2;

  @Input() className;
  @Input() mobileClass;
  @Input() imageWithBorder = true;
  @Input() isMLG = false;
  imageUrl;
  ngOnInit() {
    this.imageUrl='/assets/img/default.png';
    this.imageSignedURL(this.ImageSrc);
  }
  imageSignedURL(imgURL){
    const that = this;
    if(imgURL){
    const relativePath = this.getImageURLService.trimmedURLValue(imgURL);
    if(relativePath){
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.imageUrl = data;
    });  
  }
}
}
imageSignedURLMLG(imgURL,imageUrl){
}
}
