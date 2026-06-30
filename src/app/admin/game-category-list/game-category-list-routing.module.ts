import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { GameCategoryListComponent } from './game-category-list.component';


const routes: Routes = [
  { path: '', component: GameCategoryListComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];

@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [GameCategoryListComponent, AddCategoryComponent]
})
export class GameCategoryListRoutingModule { }
