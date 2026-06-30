import { NgModule } from '@angular/core';
import { ShopReportComponent } from './shop-report.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {path: '', component: ShopReportComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [ShopReportComponent]
})
export class ShopReportRoutingModule { }
