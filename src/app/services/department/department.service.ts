import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getDepartments(company_id, sortBy, order, startLimit, endLimit, filters = null, include_child = true) {
    // tslint:disable-next-line:max-line-length
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
    queryParams += `&include_child=${include_child}`;
    return this.requestManager.get(`${EndPoint.GET_DEPARTMENTS}?${queryParams}`);
  }

  getDepartmentByLocation(company_id, sortBy, order, locationId, locationIds, filter = null, include_child = true) {
    let queryParams = '';
    queryParams += `sort_by=${sortBy}&order=${order}`;
    if (locationId) {
      queryParams += `&location_id=${locationId}`;
    }
    if (locationIds) {
      queryParams += `&location_ids=${locationIds}`;
    }
    if (filter) {
      queryParams += `&${filter}`;
    }
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    queryParams += `&include_child=${include_child}`;
    return this.requestManager.get(`${EndPoint.GET_DEPARTMENTS}?${queryParams}`);
  }

  getDepartmentsByLocations(payload) {
    return this.requestManager.post(`${EndPoint.GET_DEPT_BY_LOCATIONS}`, payload);
  }

  addDepartment(payload) {
    return this.requestManager.post(EndPoint.ADD_DEPARTMENT, payload);
  }

  updateDepartment(payload) {
    return this.requestManager.put(EndPoint.UPDATE_DEPARTMENT, payload);
  }

  deleteDepartments(payload) {
    return this.requestManager.post(EndPoint.DELETE_DEPARTMENT, payload);
  }
}

export class Department {
  department_id: number;
  name: string;
  selectedLocations = [];
}
