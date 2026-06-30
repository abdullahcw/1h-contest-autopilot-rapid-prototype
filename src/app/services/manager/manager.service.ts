import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';
import { UploaderService } from '../uploader/uploader.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  updateUserDetails = new Subject<any>();


  constructor(public requestManager: RequestManagerService, public apiService: ApiService,
    public uploaderService: UploaderService) { }

  getManagers(company_id, sortBy, order, startLimit, endLimit, filters) {
    let queryParams = '';
    if (filters) {
      queryParams += `sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams = `sort_by=${sortBy}&order=${order}`;
    }
    if (endLimit !== 0) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.GET_MANAGERS}?${queryParams}`);
  }

  addManager(payload) {
    console.log('service payload', payload);
    return this.requestManager.post(`${EndPoint.ADD_MANAGER}`, payload);

  }

  getManagerDetails(managerId) {
    return this.requestManager.get(`${EndPoint.GET_MANAGER_DETAILS}?manager_id=${managerId}`);
  }

  updateManager(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_MANAGER}`, payload);
  }

  deleteManager(payload) {
    return this.requestManager.post(EndPoint.DELETE_MANAGER, payload);
  }

  activateDeactivateManagers(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_MANAGER_STATUS}`, payload);
  }

  getUrlToDowload(companyId, filters) {
    let queryParams = '';
    if (companyId) {
      queryParams += `sort_by=${'first_name'}&order=${'asc'}&company_id=${companyId}`;
    }
    if (filters) {
      queryParams += `&${filters}`;
    }
    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.DOWNLOAD_MANAGERS}?${queryParams}`);
  }

  updateLoggedInUserDetails() {
    this.updateUserDetails.next();
  }

  getCustomManagerList(start_index, limit, searchText = null) {
    let queryParams = '';
    if (searchText) {
      queryParams += `start_index=${start_index}&limit=${limit}&${searchText}`;
    } else {
      queryParams += `start_index=${start_index}&limit=${limit}`;
    }
    return this.requestManager.get(`${EndPoint.GET_CUSTOM_MANAGER_LIST}?${queryParams}`);
  }
}

export class Manager {
  manager_id: number;
  status = 'active';
}
