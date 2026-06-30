import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameListComponent } from './game-list.component';
import { SharedModule } from '../../shared/shared.module';
import { AddGameComponent } from '../add-game/add-game.component';
import { GameIconPickerComponent } from '../game-icon-picker/game-icon-picker.component';
import { GameProfileComponent } from '../game-profile/game-profile.component';
import { AddGameHeaderComponent } from '../add-game/add-game-header/add-game-header.component';
import { DatePipe } from '@angular/common';
import { ElasticInputModule } from 'angular2-elastic-input';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { MlgListComponent } from '../mlg-list/mlg-list.component';
import { PinnedCardComponent } from './pinned-card/pinned-card.component';
import { AiAssistComponent } from '../add-game/ai-assist/ai-assist.component';
import { LanguagesSelectionDialogComponent } from '../languages-selection-dialog/languages-selection-dialog.component';
import { GameProgressDialogComponent } from '../game-progress-dialog/game-progress-dialog.component';
import { AiGameBuilderComponent } from '../add-game/ai-game-builder/ai-game-builder.component';
import { AiQuestionsListComponent } from '../add-game/ai-questions-list/ai-questions-list.component';
import { SingleQueGameBuilderComponent } from '../add-game/SLG/single-que-game-builder/single-que-game-builder.component';
import { QuestionGameBuilderComponent } from '../add-game/question-game-builder/question-game-builder.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PathwayListMobileComponent } from '../add-game/pathway-list-mobile/pathway-list-mobile.component';
import { CategoryListMobileComponent } from '../add-game/category-list-mobile/category-list-mobile.component';

import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';
export function playerFactory() {
  return player;
}
const routes: Routes = [
  { path: '', component: GameListComponent, canActivate: [SessionValidatorService], pathMatch: 'full' },
  { path: 'game', component: AddGameComponent, canActivate: [SessionValidatorService], pathMatch: 'full' },
  { path: 'game/profile', component: GameProfileComponent, canActivate: [SessionValidatorService], pathMatch: 'full' }
];


@NgModule({
    imports: [RouterModule.forChild(routes), SharedModule, ElasticInputModule.forRoot(), NgxSkeletonLoaderModule ,
      LottieModule.forRoot({ player: playerFactory })
    ],
    exports: [RouterModule],
    // tslint:disable-next-line:max-line-length
    declarations: [GameListComponent, AddGameComponent, AddGameHeaderComponent, GameIconPickerComponent, GameProfileComponent, MlgListComponent, PinnedCardComponent, LanguagesSelectionDialogComponent, GameProgressDialogComponent, AiAssistComponent, AiGameBuilderComponent, AiQuestionsListComponent, QuestionGameBuilderComponent, SingleQueGameBuilderComponent,PathwayListMobileComponent,CategoryListMobileComponent],
    providers: [DatePipe]
})
export class GameListRoutingModule {
  constructor() {
    console.log('GameListRouting loaded.');
  }
}
