import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrandingComponent } from './branding.component';
import { SharedModule } from '../../shared/shared.module';
import { CropImageComponent } from '../../shared/crop-image/crop-image.component';
import { ImagePreviewComponent } from '../image-preview/image-preview.component';
import { BrandingPreviewComponent } from '../branding-preview/branding-preview.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { SaveChangesService } from 'src/app/services/save-changes/save-changes.service';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';

const routes: Routes = [
  { path: '', component: BrandingComponent, canActivate: [SessionValidatorService], pathMatch: 'full', canDeactivate: [SaveChangesService]}
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule, ColorPickerModule],
    exports: [RouterModule],
    declarations: [BrandingComponent, BrandingPreviewComponent]
})
export class BrandingRoutingModule {
  constructor() {
    console.log('BrandingRoutingModule loaded.');
  }
}
