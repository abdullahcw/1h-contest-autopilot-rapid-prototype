import { Component, Input, OnInit } from '@angular/core';

import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import { PermissionsService } from 'src/app/services/permissions/permissions.service';

@Component({
  selector: 'app-custom-images-table-static',
  templateUrl: './custom-images-table-static.component.html',
  styleUrls: ['./custom-images-table-static.component.scss']
})
export class CustomImagesTableStaticComponent implements OnInit {

  constructor(
    public getImageURLService:GetImageURLService,
    public permissionsService:PermissionsService,
  ) {  }
  @Input() ImageSrc;
  @Input() className;
  @Input() imageWithBorder = true;
  @Input() isMLG = false;
  
  imageUrl;
  
  ngOnInit() {
    if(this.ImageSrc){
      this.imageUrl = this.ImageSrc;
    }else{
      this.imageUrl  ='/assets/img/default.png';

    }
  }
}
