import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { PlayersComponent } from './players.component';
import { ChangeDepartmentComponent } from '../change-department/change-department.component';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';


const routes: Routes = [
  { path: '', component: PlayersComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [PlayersComponent, ChangeDepartmentComponent]
})
export class PlayersRoutingModule {
  constructor() {
    // console.log('PlayersRoutingModule loaded.');
  }
}
