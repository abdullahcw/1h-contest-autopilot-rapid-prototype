import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getGroups(company_id, sortBy, order, startLimit, endLimit, filters = null) {
    // tslint:disable-next-line:max-line-length
    let queryParams = '';
    if (filters) {
      queryParams += `sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams = `sort_by=${sortBy}&order=${order}`;
    }
    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.GET_GROUPS}?company_id=${company_id}&start_index=${startLimit}&limit=${endLimit}&${queryParams}`);
  }

  addGroup(company_id, user_id, group: Group) {
    const payload = {'group_name': group.group_name, 'company_id': company_id, 'created_by': user_id};
    return this.requestManager.post(EndPoint.ADD_GROUP, payload);
  }

  updateGroupDetails(payload) {
    return this.requestManager.put(EndPoint.UPDATE_GROUP, payload);
  }

  deleteGroup(payload) {
    return this.requestManager.post(EndPoint.DELETE_GROUP, payload);
  }

}


export class Group {
  group_id: number;
  group_name: string;
  company_id: number;
  company_name: string;
}
