import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LocationListComponent } from 'src/app/admin/location-list/location-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddLocationComponent } from '../add-location/add-location.component';
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';


const routes: Routes = [
  {
    path: '', component: LocationListComponent, canActivate: [SessionValidatorService], pathMatch: 'full', data: {
    breadcrumb: 'Locations'
  }}
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [LocationListComponent, AddLocationComponent]
})
export class LocationListRoutingModule { }
