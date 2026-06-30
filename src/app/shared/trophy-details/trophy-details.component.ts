import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import * as moment from 'moment-timezone';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';
import { GlobalService } from 'src/app/services/global/global.service';
@Component({
  selector: 'app-trophy-details',
  templateUrl: './trophy-details.component.html',
  styleUrls: ['./trophy-details.component.scss']
})
export class TrophyDetailsComponent implements OnInit {
  @ViewChild('capture') capture;
  @ViewChild('downloadLink') downloadLink: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  imageToDownload;
  trophy;
  player_info;
  img;
  @ViewChild('gmaelogoImg') gmaelogoImg: ElementRef;
  constructor(
    public dialogRef: MatDialogRef<any>,
    private globalService: GlobalService,
    private getImageURLService: GetImageURLService,
    @Inject(MAT_DIALOG_DATA) public trophy_details: any
  ) { }

  ngOnInit() {
    // console.log(this.trophy_details)
    this.trophy = this.trophy_details.trophy;
    if (this.trophy.isMLGTrophy) {
      // this.imageUrlUpdated(this.trophy.image_url);
    } else {
      this.imageUrlUpdated(this.trophy.game_logo_url);
    }
    this.player_info = this.trophy_details.player_info;
    // console.log('data', this.trophy)
    // console.log('data', this.player_info)

    this.trophy['achived_date'] = moment(this.trophy.achieved_on).format("LL"); 
    if(this.trophy.isGameTrophy){
      this.globalService.addAdminGoogleEvent('Detailed_Report_SLG_Player_Trophy_Viewed');
    }else if(this.trophy.isMLGTrophy){
      this.globalService.addAdminGoogleEvent('Detailed_Report_MLG_Player_Trophy_Viewed');
    }
  }
  ngAfterViewInit() {}
  downloadImage() {
    let trophyName;
    let lastName;
    lastName = this.player_info.last_name;
    if(this.trophy.isGameTrophy){
      trophyName = this.trophy.trophies_name;
      this.globalService.addAdminGoogleEvent('Detailed_Report_SLG_Player_Trophy_Downloaded');
    }else if(this.trophy.isMLGTrophy){
      trophyName = this.trophy.title; 
      this.globalService.addAdminGoogleEvent('Detailed_Report_MLG_Player_Trophy_Downloaded');
    }
    let image;
    if (this.trophy.isMLGTrophy) {
      image = this.trophy.logo_url;
      html2canvas(this.capture.nativeElement, {
        scale: 2,
        proxy: image,
        ignoreElements: function (node) {
          return node.nodeName === 'IFRAME';
        }
      }).then(function (canvas) {
        var a = document.createElement('a');
        a.href = canvas.toDataURL("image/jpeg");
        a.download = `1HuddleTrophy_${trophyName}_${lastName}.jpeg`;
        // a.download = 'myfile.jpeg';
        a.click();
      });
    } 
    else {
      html2canvas(this.capture.nativeElement, {
        scale: 2,
        proxy: image,
        ignoreElements: function (node) {
          return node.nodeName === 'IFRAME';
        }
      }).then(function (canvas) {
        var a = document.createElement('a');
        a.href = canvas.toDataURL("image/jpeg");
        a.download = `1HuddleTrophy_${trophyName}_${lastName}.jpeg`;
        // a.download = 'myfile.jpeg';
        a.click();
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
  imageUrlUpdated(imageUrl){
    const that = this;
    const relativePath = this.getImageURLService.trimmedURLValue(imageUrl)
    this.getImageURLService.getURL(relativePath, function (err, data) {
      that.img  = data;
      let ctx: CanvasRenderingContext2D =
      that.gmaelogoImg.nativeElement.getContext("2d");
     if (ctx) {
      //Loading of the home test image - img1
      var img1 = new Image();        
      img1.onload = function () {
      ctx.drawImage(img1, 0, 0, 300, 150);
      };
      img1.crossOrigin = "Anonymous";
      img1.src = that.img;
  }
 });  
}
}
