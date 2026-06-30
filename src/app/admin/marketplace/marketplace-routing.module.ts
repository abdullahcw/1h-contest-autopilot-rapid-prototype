import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { MarketplaceComponent } from './marketplace.component';
import { CommonModule,  } from '@angular/common';
// import player from 'lottie-web';
// import { LottieModule } from 'ngx-lottie';
// export function playerFactory() {
//   return player;
// }
const routes: Routes = [
  { path: '', component: MarketplaceComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    CommonModule,
    // LottieModule.forRoot({ player: playerFactory })
  ],
  exports: [RouterModule],
  declarations: []
})
export class MarketplaceRoutingModule { }
