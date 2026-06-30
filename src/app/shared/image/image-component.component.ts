import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-image-component',
  templateUrl: './image-component.component.html',
  styleUrls: ['./image-component.component.scss']
})
export class ImageComponent implements OnInit {
  @Input() src;
  @Input() class;
  @Input() width;
  @Input() showImageOverlay;
  @Input() context;
  @Output() onPreview: EventEmitter < any > = new EventEmitter < any > ();
  imgWidth;
  imageUrl;
  isLoadingComplete = false;
  constructor() {}
  defaultImage = '/assets/img/default.png';
  ngOnInit() {
    this.imageUrl = this.defaultImage;
  }
  isImageLoaded() {
    this.imageUrl = this.src;
    this.isLoadingComplete = true;
  }
  onImageError(event) {
    event.target.src = this.defaultImage;
  }
  onPreviewItem() {
    this.onPreview.emit(true);
  }
}
