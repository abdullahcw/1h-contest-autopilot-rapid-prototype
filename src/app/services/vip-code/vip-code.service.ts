import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class VipCodeService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getVipCodes(company_id, sortBy, order, startLimit, endLimit, filters = null) {
    let queryParams = '';
    if (filters) {
      queryParams += `sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams += `sort_by=${sortBy}&order=${order}`;
    }
    if (startLimit != null && endLimit != null) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    return this.requestManager.get(`${EndPoint.GET_VIP_CODE}?${queryParams}`);
  }

  createVipCodes(payload) {

    return this.requestManager.post(EndPoint.CREATE_VIP_CODE, payload);
  }
  reactivateVipCodes(payload) {
    return this.requestManager.put(EndPoint.REACTIVATE_VIP_CODE, payload);
  }
  deactivateVipCode(payload) {
    return this.requestManager.post(EndPoint.VIP_CODE_STATUS, payload);
  }

}
export class VipCode {
  vip_code: number;
  // isGroup = false;
  status = '';
  // name: string;
}

