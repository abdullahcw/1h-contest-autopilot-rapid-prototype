import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../material.module';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SidenavService } from '../services/sidenav/sidenav.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

import { DialogComponent } from './dialog/dialog.component';
import { ImageComponent } from './image/image-component.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmActionComponent } from '../admin/confirm-action/confirm-action.component';
import { CropImageComponent } from './crop-image/crop-image.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ImagePreviewComponent } from '../admin/image-preview/image-preview.component';
import { AddEditQuestionComponent } from './add-edit-question/add-edit-question.component';
import { AddUserComponent } from '../admin/add-user/add-user.component';
import { AddTagsComponent } from '../admin/add-tags/add-tags.component';
import { AudioPlayerComponent } from '../admin/audio-player/audio-player.component';
import { QuestionComponent } from '../admin/question/question.component';
import { SingleQuestionComponent } from './single-question/single-question.component';
import { WipComponent } from '../admin/wip/wip.component';
import { GameAttemptComponent } from '../admin/game-attempt/game-attempt.component';
import { NotificationComponent } from '../admin/notifications/notification.component';
import { LeaderboardComponent } from '../admin/leaderboard/leaderboard.component';
import { AddGroupComponent } from '../admin/add-group/add-group.component';
import { SelectGameTypeComponent } from '../admin/select-game-type/select-game-type.component';
import { ListSelectionComponent } from './list-selection/list-selection.component';
import { SearchComponent } from './search/search.component';
import { SearchPipe } from './pipes/search.pipe';
import { UploaderComponent } from '../admin/uploader/uploader.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ValidateInputDirective } from '../util/validate-input.directive';
import { CustomDatepickerComponent } from '../admin/custom-datepicker/custom-datepicker.component';
import { SearchSelectComponent } from '../admin/search-select/search-select.component';
import { SearchMultiselectComponent } from '../admin/search-multiselect/search-multiselect.component';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { MobileQuestionComponent } from '../admin/mobile-question/mobile-question.component';
import { GameAccuracyReportComponent } from '../admin/game-accuracy-report/game-accuracy-report.component';
import { AddLimitsComponent } from '../admin/schedule-game/add-limits/add-limits.component';
import { AddItemsComponent } from '../admin/add-items/add-items.component';
import { CreateContestComponent } from '../admin/create-contest/create-contest.component';
import { AnimateElementDirective } from '../util/animate-element/animate-element.directive';
import { ValidationDialogComponent } from '../admin/validation-dialog/validation-dialog.component';
import { DatepickerRangeComponent } from '../admin/datepicker-range/datepicker-range.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfPreviewComponent } from '../admin/pdf-preview/pdf-preview.component';
import { ConfigurationPreviewComponent } from '../admin/configuration-preview/configuration-preview.component';
import { TutorialVideoComponent } from '../admin/tutorial-video/tutorial-video.component';
import { MarketplaceComponent } from '../admin/marketplace/marketplace.component';

import { MultiselectEditableInputComponent } from './multiselect-editable-input/multiselect-editable-input.component';
import { AddRulesComponent } from '../admin/add-rules/add-rules.component';
import { MlgTrophyComponent } from '../admin/mlg-trophy/mlg-trophy.component';
import { ConfirmActionMultilevelGameComponent } from '../admin/confirm-action-multilevel-game/confirm-action-multilevel-game.component';
import { UserRestrictDialogComponent } from '../admin/user-restrict-dialog/user-restrict-dialog.component';
import { DateRangeFilterComponent } from '../shared/date-range-filter/date-range-filter.component';
import { CardInfoComponent } from '../admin/card-info/card-info.component';
import { CardEntityComponent } from '../admin/card-entity/card-entity.component';
import { AddToMarketplaceComponent } from '../admin/add-to-marketplace/add-to-marketplace.component';
import { PaywallActionComponent } from '../admin/paywallAction/paywall-action.component';
import { AlertComponent } from '../admin/alert/alert.component';
import { ChangeGamePositionComponent } from '../admin/change-game-position/change-game-position.component';


import { MarketplaceViewAllComponent } from '../admin/marketplace-view-all/marketplace-view-all.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SsrDialogComponent } from '../admin/ssr-dialog/ssr-dialog.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { TrophyDetailsComponent } from './trophy-details/trophy-details.component';
// import { ScheduleGameByComponent } from '../admin/schedule-game/schedule-game-by/schedule-game-by.component';
// import { AddAudienceLimitsComponent } from '../admin/schedule-game/add-audience-limits/add-audience-limits.component';
// tslint:disable-next-line:max-line-length
import { AddPlayersInScheduleMultilevelgamesComponent } from '../admin/schedule-multilevel-games/add-players-in-schedule-multilevelgames/add-players-in-schedule-multilevelgames.component';
// tslint:disable-next-line:max-line-length
import { AddPlayersInScheduleGamesComponent } from '../admin/schedule-game/add-players-in-schedule-games/add-players-in-schedule-games.component';
import { AddGameLimitsComponent } from '../admin/schedule-game/add-game-limits/add-game-limits.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CustomImagesTableComponent } from '../admin/custom-images-table/custom-images-table.component';
import { CustomImagesTableStaticComponent } from '../admin/custom-images-table-static/custom-images-table-static.component';
import { SearchCustomPipe } from './pipes/search_custom.pipe';
import { SignedUrlDirective } from '../util/signedUrl/signed-url.directive';
import { NumbersComponent } from './numbers/numbers.component';  
import { SchedulingFiltersComponent } from './scheduling-filters/scheduling-filters.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MenuComponent } from './menu/menu.component';
import { CompanyQRCodeComponent } from '../admin/company-qrcode/company-qrcode.component';
import { TooltipsDirective } from '../util/tooltip/tooltips.directive';
import { MatTooltipModule } from '@angular/material/tooltip';

import player from 'lottie-web';
import { LottieModule } from 'ngx-lottie';
import { DragDropDirective } from '../util/drag-drop/drag-drop.directive';
import { LanguageSelectionComponent } from '../admin/add-game/language-selection/language-selection.component';
import { GameBuilderNudgeComponent } from '../admin/add-game/game-builder-nudge/game-builder-nudge.component';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { TranslationsErrorPopupComponent } from '../admin/add-game/translations-error-popup/translations-error-popup.component';
import { FeatureFlagsService } from '../services/feature-flags/feature-flags.service';
import { UserContextService } from '../services/feature-flags/user-context.service';
export function playerFactory() {
  return player;
}

@NgModule({
    imports: [
        RouterModule,
        CommonModule,
        MaterialModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        AngularCropperjsModule,
        CKEditorModule,
        // Ng5SliderModule,
        PdfViewerModule,
        InfiniteScrollModule,
        NgxSliderModule,
        ScrollingModule,
        QRCodeModule,
        MatTooltipModule,
        RoundProgressModule,
        LottieModule.forRoot({ player: playerFactory })
    ],
    declarations: [
        HeaderComponent,
        SidenavComponent,
        DialogComponent,
        AddUserComponent,
        ImageComponent,
        ConfirmActionComponent,
        CropImageComponent,
        TextEditorComponent,
        ImagePreviewComponent,
        AddEditQuestionComponent,
        AddTagsComponent,
        AudioPlayerComponent,
        QuestionComponent,
        SingleQuestionComponent,
        WipComponent,
        GameAttemptComponent,
        NotificationComponent,
        LeaderboardComponent,
        AddGroupComponent,
        SelectGameTypeComponent,
        ListSelectionComponent,
        SearchComponent,
        SearchPipe,
        UploaderComponent,
        ValidateInputDirective,
        BreadcrumbsComponent,
        CustomDatepickerComponent,
        SearchSelectComponent,
        SearchMultiselectComponent,
        MobileQuestionComponent,
        GameAccuracyReportComponent,
        AddLimitsComponent,
        PdfPreviewComponent,
        AddItemsComponent,
        CreateContestComponent,
        AnimateElementDirective,
        ValidationDialogComponent,
        DatepickerRangeComponent,
        PdfPreviewComponent,
        DatepickerRangeComponent,
        ConfigurationPreviewComponent,
        TutorialVideoComponent,
        ConfirmActionMultilevelGameComponent,
        MultiselectEditableInputComponent,
        AddRulesComponent,
        MlgTrophyComponent,
        UserRestrictDialogComponent,
        DateRangeFilterComponent,
        MarketplaceComponent,
        CardInfoComponent,
        CardEntityComponent,
        AddToMarketplaceComponent,
        PaywallActionComponent,
        AlertComponent,
        ChangeGamePositionComponent,
        MarketplaceViewAllComponent,
        SsrDialogComponent,
        TrophyDetailsComponent,
        AddPlayersInScheduleMultilevelgamesComponent,
        AddPlayersInScheduleGamesComponent,
        AddGameLimitsComponent,
        CustomImagesTableComponent,
        CustomImagesTableStaticComponent,
        SearchCustomPipe,
        SignedUrlDirective,
        DragDropDirective,
        NumbersComponent,
        SearchCustomPipe,
        SchedulingFiltersComponent,
        CompanyQRCodeComponent,
        MenuComponent,
        TooltipsDirective,
        LanguageSelectionComponent,
        GameBuilderNudgeComponent,
        TranslationsErrorPopupComponent
    ],
    exports: [
        HeaderComponent,
        SidenavComponent,
        ReactiveFormsModule,
        CommonModule,
        MaterialModule,
        TranslateModule,
        SearchPipe,
        SearchComponent,
        FormsModule,
        BreadcrumbsComponent,
        ConfirmActionComponent,
        AddUserComponent,
        TextEditorComponent,
        CKEditorModule,
        AddEditQuestionComponent,
        QuestionComponent,
        WipComponent,
        NotificationComponent,
        LeaderboardComponent,
        GameAttemptComponent,
        ValidateInputDirective,
        ListSelectionComponent,
        SearchSelectComponent,
        GameAccuracyReportComponent,
        SearchMultiselectComponent,
        // Ng5SliderModule,
        PdfViewerModule,
        AnimateElementDirective,
        ConfirmActionMultilevelGameComponent,
        MultiselectEditableInputComponent,
        UserRestrictDialogComponent,
        DateRangeFilterComponent,
        MarketplaceComponent,
        AlertComponent,
        MarketplaceViewAllComponent,
        InfiniteScrollModule,
        NgxSliderModule,
        ScrollingModule,
        CustomImagesTableComponent,
        CustomImagesTableStaticComponent,
        SearchCustomPipe,
        SignedUrlDirective,
        DragDropDirective,
        NumbersComponent,
        SchedulingFiltersComponent,
        QRCodeModule,
        MenuComponent,
        TooltipsDirective,
        MatTooltipModule,
        LanguageSelectionComponent,
        TranslationsErrorPopupComponent,
        GameBuilderNudgeComponent,
        RoundProgressModule
    ],
    providers: [SidenavService, DatePipe, FeatureFlagsService, UserContextService]
})
export class SharedModule {
  constructor() {
    // console.log('SharedModule loaded.');
  }
}
