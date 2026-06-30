import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrophyComponent } from './trophy.component';
// import { CreateGameTrophyComponent } from '../create-game-trophy/create-game-trophy.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateGameTrophyComponent } from '../create-game-trophy/create-game-trophy.component';
const routes: Routes = [
  { path: '', component: TrophyComponent, pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [TrophyComponent, CreateGameTrophyComponent]
})
export class TrophyRoutingModule { }
