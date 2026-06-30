import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-branding-preview',
  templateUrl: './branding-preview.component.html',
  styleUrls: ['./branding-preview.component.scss']
})
export class BrandingPreviewComponent implements OnInit {

  selectedMode = 0; // 0  is backround and 1 is text;

  @Input() backgroundColor;
  @Input() textColor;
  @Output() brandingUpdated: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('colorPickerInput', { static: true }) colorPickerInput: ElementRef;

  public cmykColor: Cmyk = new Cmyk(0, 0, 0, 0);
  selectedColor;
  color = '';
  bottom = '';
  constructor(private cpService: ColorPickerService,
    public dialogRef: MatDialogRef<any>) {
      dialogRef.disableClose = true;
      dialogRef.backdropClick().subscribe(() => {
        this.colorPickerInput.nativeElement.focus();
      });
    }

  ngOnInit() {
  }

  public onChangeColorCmyk(color: string): Cmyk {
    if (this.selectedMode === 0) {
      this.backgroundColor = color;
    } else {
      this.textColor = color;
    }
    const hsva = this.cpService.stringToHsva(color);

    if (hsva) {
      const rgba = this.cpService.hsvaToRgba(hsva);

      return this.cpService.rgbaToCmyk(rgba);
    }

    return new Cmyk(0, 0, 0, 0);
  }

  public onChangeColorHex8(color: string): string {
    const hsva = this.cpService.stringToHsva(color, true);

    if (hsva) {
      return this.cpService.outputFormat(hsva, 'rgba', null);
    }

    return '';
  }

  onValChange(value) {
    if (value === 'background') {
      this.selectedMode = 0;
    } else {
      this.selectedMode = 1;
    }
  }

  public saveBranding() {
    this.dialogRef.close();
    this.brandingUpdated.emit({'background_color': this.backgroundColor, 'text_color': this.textColor});
  }
}
