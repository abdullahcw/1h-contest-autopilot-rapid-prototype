import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PopupAlertsComponent } from './popup-alerts.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddEditAlertComponent } from './add-edit-alert/add-edit-alert.component';
const routes: Routes = [
  { path: '', component: PopupAlertsComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes),SharedModule],
  declarations: [PopupAlertsComponent,AddEditAlertComponent],
  exports: [RouterModule]
})
export class PopupAlertsRoutingModule { }
