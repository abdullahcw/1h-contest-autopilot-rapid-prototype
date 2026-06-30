import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReorderComponent } from './reorder/reorder.component';
import { ReorderGamesComponent } from './reorder-games.component';


const routes: Routes = [
  { path: '', component: ReorderGamesComponent, canActivate: [SessionValidatorService], pathMatch: 'full'}
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [ReorderGamesComponent, ReorderComponent]
})
export class ReorderGamesRoutingModule {
  constructor() {
    console.log('ReorderComponent loaded.');
  }
 }
