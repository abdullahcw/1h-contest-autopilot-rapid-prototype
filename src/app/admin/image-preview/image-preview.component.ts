import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview',
  templateUrl: './image-preview.component.html',
  styleUrls: ['./image-preview.component.scss']
})
export class ImagePreviewComponent implements OnInit, AfterViewInit {

  @Input() image: any;
  @Input() shouldAllowEditing = false;
  @Input() isimageAssetsBase64 = false;
  @Output() OnEdit = new EventEmitter();
  @Output() OnDelete = new EventEmitter();
  setCustomHeight = false;

  constructor(public dialogRef: MatDialogRef<any>, private cdRef: ChangeDetectorRef,) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const imageEl = document.getElementById('previewImage');
    if (imageEl.offsetHeight > 1000) {
      this.setCustomHeight = true;
    } else {
      this.setCustomHeight = false;
    }
    this.cdRef.detectChanges();
  }

  edit() {
    this.OnEdit.emit();
  }

  delete() {
    this.OnDelete.emit();
  }
}
