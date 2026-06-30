import { NgModule } from '@angular/core';
import { AccountsComponent } from './accounts.component';
import { Routes, RouterModule } from '@angular/router';
import { SessionValidatorService } from 'src/app/services/session-validator/session-validator.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditAccountComponent } from './edit-account/edit-account.component';

const routes: Routes = [
  { path: '', component: AccountsComponent, canActivate: [SessionValidatorService], pathMatch: 'full'}
];

@NgModule({
    declarations: [AccountsComponent, EditAccountComponent],
    imports: [RouterModule.forChild(routes), SharedModule],
    exports: [RouterModule]
})
export class AccountsRoutingModule {
  constructor() {
    console.log('AccountsComponent loaded.');
  }
 }
