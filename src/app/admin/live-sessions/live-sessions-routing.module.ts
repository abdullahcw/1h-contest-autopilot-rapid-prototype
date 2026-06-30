import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LiveSessionsComponent } from './live-sessions.component';
import { SharedModule } from '../../shared/shared.module';
import { DatePipe } from '@angular/common';

const routes: Routes = [
  {path: '', component: LiveSessionsComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  declarations: [LiveSessionsComponent],
  providers: [DatePipe]
})
export class LiveSessionsRoutingModule { }
