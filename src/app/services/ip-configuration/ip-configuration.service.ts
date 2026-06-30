import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class IpConfigurationService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }
    getIpList(company_id, sortBy, order, startLimit, endLimit, filters = null) {
      // tslint:disable-next-line:max-line-length
      let queryParams = '';
      if (filters) {
        queryParams += `sort_by=${sortBy}&order=${order}&${filters}`;
      } else {
        queryParams = `sort_by=${sortBy}&order=${order}`;
      }
      // tslint:disable-next-line:max-line-length
      return this.requestManager.get(`${EndPoint.GET_IP}?company_id=${company_id}&offset=${startLimit}&limit=${endLimit}`);
    }

    addIp(payload){
      return this.requestManager.post(EndPoint.ADD_IP, payload);
    }
    updateIp(payload){
      return this.requestManager.put(EndPoint.UPDATE_IP, payload);
    }
    deleteIps(ipId,companyId) {
      return this.requestManager.delete(`${EndPoint.DELETE_IP}?company_id=${companyId}&id=${ipId}`);
    }


    getIpExclusion(companyId,isCustom,isCompanyWithCustomFields) {
      return this.requestManager.get(`${EndPoint.GET_IP_EXCLUSIONS}?company_id=${companyId}&is_custom=${isCustom}&is_company_with_custom_fields=${isCompanyWithCustomFields}`);
    }

    updateIpExclusion(payload){
      return this.requestManager.post(EndPoint.UPDATE_IP_EXCLUSIONS, payload);
    }
  }
  export class IpList {
    ip_id: number;
    ip_address: number;
    ip_desc: String;
    company_id: number;
  }

