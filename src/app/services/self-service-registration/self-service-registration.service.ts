import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';


@Injectable({
  providedIn: 'root'
})
export class SelfServiceRegistrationService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) {
  }
  signupFormSubmit(userDetails) {
    return this.requestManager.gatewaypost(EndPoint.PERSONAL_DETAILS_GATEWAY,
      {
        'first_name': userDetails.first_name, 
        'last_name': userDetails.last_name,
        'password': userDetails.password, 
        'registration_token': userDetails.registration_token
      });
  }

  submitCategoryDetails(catDetails) {
    return this.requestManager.gatewaypost(EndPoint.COMPANY_CATEGORY_DETAILS_GATEWAY,
      {
        'preferred_category_ids': catDetails.preferred_category_ids, 'registration_token': catDetails.registration_token
      });
  }

  companySetupFormSubmit(companyDetails) {
    return this.requestManager.gatewaypost(EndPoint.COMPANY_SETUP_DETAILS_GATEWAY,
      {
        'company_name': companyDetails.company_name, 'company_size': companyDetails.company_size,
        'registration_token': companyDetails.registration_token
      });
  }

  userOnboard(token) {
    return this.requestManager.post(EndPoint.USER_ONBOARD, { 'registration_token': token });
  }
  getGategory(token) {
    let queryParams = '';
    queryParams += `registration_token=${token}`;
    return this.requestManager.gatewayget(`${EndPoint.GET_USER_CATEGORY_GATEWAY}?${queryParams}`);
  }

  addLearningAssets(asset) {
    return this.requestManager.post(EndPoint.ADD_LEARNING_ASSETS, {
      'company_id': asset.company_id, 'manager_id': asset.manager_id, 'assets_url': asset.assets_url
    });
  }
}

export enum Screen {
  THIRD_SCREEN = 'third',
  FOURTH_SCREEN = 'fourth',
  FIFTH_SCREEN = 'fifth'
}
