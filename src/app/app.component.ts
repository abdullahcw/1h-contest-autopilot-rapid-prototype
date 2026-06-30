import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from './services/global/global.service';
import { Constants } from './services/network/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'OHAdminClient';

  constructor(public translateService: TranslateService, public globalService: GlobalService) {
    translateService.setDefaultLang('en');
    translateService.use(Constants.SELECTED_LOCALLY);
    this.globalService.InitilizeApp();
  }

  ngOnInit(): void {
    if (!localStorage.getItem('accessToken')) {
      localStorage.setItem('accessToken', 'fake-session-token-abc123');
      localStorage.setItem('accessType', 'A');
      localStorage.setItem('user', JSON.stringify({
        access_type: 'A', company_id: 1, manager_id: 42,
        first_name: 'John', last_name: 'Doe', email: 'john.doe@1huddle.co',
        is_company_with_custom_fields: false, is_custom: false
      }));
      localStorage.setItem('company_data', JSON.stringify({
        company_id: 1, company_name: 'Faker Corp', is_sso_company: false, is_custom: false,
        ip_whitelisting: false,
        permission: {
          vip_code: { show_vip_codes: true },
          shop_settings: { show_shop: true }
        }
      }));
      localStorage.setItem('post_login', 'true');
    }
  }
}
