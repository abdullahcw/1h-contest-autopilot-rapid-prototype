import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddMarketplaceGameComponent } from './add-marketplace-game.component';


const routes: Routes = [
  { path: '', component: AddMarketplaceGameComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [AddMarketplaceGameComponent]
})
export class AddMarketplaceGameRoutingModule { }
