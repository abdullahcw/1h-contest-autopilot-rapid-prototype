import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { GetImageURLService } from 'src/app/services/get-image-URL/get-image-url.service';

@Directive({
  selector: '[appSignedUrl]'
})
export class SignedUrlDirective {
  @Input() imgSrcValue;
  @Input() imgSelector;
  @Input() isBase64 = false;

  constructor( 
    public el: ElementRef, 
    public render: Renderer2,  
    public getImageURLService:GetImageURLService,
    ) { }
    ngAfterContentInit() {
      this[this.imgSelector]();
    }
  changeImageSrc(elem = null) {
    setTimeout(() => {
      if(!this.imgSrcValue){
        return
      }
      if(this.isBase64){
        this.render.setAttribute(this.el.nativeElement, "src", this.imgSrcValue);
        return;
      }
      // Check if this is a PDF thumbnail URL and force cache refresh
      const isPdfThumbnail = this.imgSrcValue && this.imgSrcValue.includes('.jpeg') && 
                            (this.imgSrcValue.includes('game-profiles') || this.imgSrcValue.includes('pdf'));
      const ignoreCache = isPdfThumbnail;
      
      const relativePath = this.getImageURLService.trimmedURLValue(this.imgSrcValue, ignoreCache);
      if(!relativePath){
        return
      }
      const that = this;
      if(relativePath){
        this.getImageURLService.getURL(relativePath, function (err, data) {
          if(data){          
            that.render.setAttribute(that.el.nativeElement, "src", data);
          }
        });      
      }
    });
  }
}
