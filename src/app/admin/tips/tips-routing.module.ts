import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TipsComponent } from './tips.component';
import { SharedModule } from 'src/app/shared/shared.module';
const routes: Routes = [
  { path: '', component: TipsComponent, pathMatch: 'full' }
];


@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule],
    declarations: [TipsComponent]
})
export class TipsRoutingModule { }
