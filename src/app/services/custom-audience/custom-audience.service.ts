import { Injectable } from '@angular/core';
import { ApiService, EndPoint } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';

@Injectable({
  providedIn: 'root'
})
export class CustomAudienceService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getAudience(company_id, sortBy, order, startLimit, endLimit, manager_Id = null, include_empty, filters = null ) {
    // tslint:disable-next-line:max-line-length
    let queryParams = '';
    if (company_id) {
      queryParams += `company_id=${company_id}`;
    }
    if (endLimit !== 0) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    queryParams += `&sort_by=${sortBy}&order=${order}`;
    if (manager_Id) {
      queryParams += `&manager_id=${manager_Id}`;
    }
    queryParams += `&include_empty=${include_empty}`;
    return this.requestManager.get(`${EndPoint.GET_CUSTOM_AUDIENCE}?${queryParams}`);
  }

  validateAudience(payload) {
    return this.requestManager.post(EndPoint.VALIDATE_AUDIENCE_NAME, payload);
  }

  addAudience(payload) {
    return this.requestManager.post(EndPoint.ADD_CUSTOM_AUDIENCE, payload);
  }

  getAudienceDetails(company_id, audience_id, manager_Id, startLimit, endLimit, sortBy, order, filters) {
    let queryParams = '';
    if (audience_id) {
        queryParams += `company_id=${company_id}&audience_id=${audience_id}&manager_id=${manager_Id}`;
      if (startLimit != null && endLimit != null) {
        queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
      }
      if (filters) {
        queryParams += `&sort_by=${sortBy}&order=${order}&${filters}`;
      } else {
        queryParams += `&sort_by=${sortBy}&order=${order}`;
      }
      return this.requestManager.get(`${EndPoint.GET_CUSTOM_AUDIENCE_DETAILS}?${queryParams}`);
    }
  }
  deletePlayersAudience(payload) {
    return this.requestManager.put(`${EndPoint.DELETE_CUSTOM_AUDIENCE_PLAYERS}`, payload);
  }

  updateAudience(payload) {
    return this.requestManager.put(EndPoint.UPDATE_CUSTOM_AUDIENCE, payload);
  }

  deleteAudience(payload) {
    return this.requestManager.post(`${EndPoint.DELETE_CUSTOM_AUDIENCE}`, payload);
  }

  getLimitsForAudience(companyId, gameID) {
    return this.requestManager.get(`${EndPoint.GET_AUDIENCE_GAME_LIMIT}?company_id=${companyId}&game_id=${gameID}`);
  }

  addLimitsForAudience(payload) {
    if (payload.audience_id === -1) {
      delete payload.audience_id;
    }
    return this.requestManager.post(`${EndPoint.ADD_AUDIENCE_GAME_LIMIT}`, payload);
  }

  updateLimitsForAudience(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_AUDIENCE_LIMIT}`, payload);
  }

  deleteLimitsForAudience(payload) {
    return this.requestManager.post(`${EndPoint.DELETE_AUDIENCE_LIMIT}`, payload);
  }

  checkAudienceInCompany(companyId) {
    return this.requestManager.get(`${EndPoint.CHECK_AUDIENCE}?company_id=${companyId}`);
  }
}

export class Audience {
  audience_id: number;
  audience_name: string;
}
