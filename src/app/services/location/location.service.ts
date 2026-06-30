import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { EndPoint, ApiService } from '../network/api.service';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  public allLocations = [];
  public locationsFetched = new Subject<any>();


  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getLocations(company_id, sortBy, order, startLimit, endLimit, filters = null, include_child = true) {
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
    return this.requestManager.get(`${EndPoint.GET_LOCATIONS}?${queryParams}`);
  }
    getLocationsByDepartment(company_id, sortBy, order, startLimit, endLimit, filters = null, departmentId, include_child = true) {
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
    if (departmentId) {
      queryParams += `&department_id=${departmentId}`;
    }
    queryParams += `&include_child=${include_child}`;
    return this.requestManager.get(`${EndPoint.GET_LOCATIONS}?${queryParams}`);
  }

  getAllLocations(companyId, forceRefresh = false, include_child, isPostLogin = false) {
    console.log('this.allLocations', this.allLocations);
    if (!forceRefresh && this.allLocations && this.allLocations.length) { return this.allLocations; }
    let queryParams = '';
    queryParams = `sort_by=${'location_name'}&order=${'asc'}`;
    if (companyId) {
      queryParams += `&company_id=${companyId}`;
    }
    queryParams += `&include_child=${include_child}`;
    this.requestManager.get(`${EndPoint.GET_LOCATIONS}?${queryParams}`).subscribe((res) => {
      const response: any = res;
      if (response.success) {
        this.allLocations = response.data.location_list;
        this.locationsFetched.next(this.allLocations);
      }
    });
  }
  getPlayerAllLocations(companyId, playerId) {
    let queryParams = '';
    if (companyId) {
      queryParams += `company_id=${companyId}&player_id=${playerId}`;
    }
    return this.requestManager.get(`${EndPoint.GET_PLAYER_ALL_LOCATION}?${queryParams}`);
  }
  getPlayerAllDepartments(companyId, playerId) {
    let queryParams = '';
    if (companyId) {
      queryParams += `company_id=${companyId}&player_id=${playerId}`;
    }
    return this.requestManager.get(`${EndPoint.GET_PLAYER_ALL_DEPARTMENT}?${queryParams}`);
  }

  getLocationAndDepartmentAccordingToSOM() {
    return this.requestManager.get(`${EndPoint.GET_LOCATIONS_DEPARTMENTS_SOM}`);
  }
  getLocationForCustomFieldPostLogin(companyId, include_child) {
    let queryParams = '';
    queryParams = `sort_by=${'location_name'}&order=${'asc'}`;
    if (companyId) {
      queryParams += `&company_id=${companyId}`;
    }
    queryParams += `&include_child=${include_child}`;
    return this.requestManager.get(`${EndPoint.GET_LOCATIONS}?${queryParams}`);
  }
  resetAllLocations() {
    this.allLocations = [];
  }

  getCountries() {
    return this.requestManager.get(EndPoint.GET_COUNTRIES);
  }

  getStates(countryId) {
    console.log('CountryId: ' + countryId);
    return this.requestManager.get(EndPoint.GET_STATES + countryId);
  }

  getTimeZone() {
    return this.requestManager.get(EndPoint.GET_TIMEZONE);
  }

  getTimeZoneByLocation(payload) {
    return this.requestManager.post(EndPoint.GET_TIMEZONE_BY_LOCATION, payload);
  }

  addLocation(payload, companyId) {
    return this.requestManager.post(EndPoint.ADD_LOCATION, payload).pipe(map(res => this.locationUpdated(res, companyId)));
  }

  updateLocation(payload, companyId) {
    return this.requestManager.put(EndPoint.UPDATE_LOCATION, payload).pipe(map(res => this.locationUpdated(res, companyId)));
  }

  deleteLocations(payload, companyId) {
    return this.requestManager.post(EndPoint.DELETE_LOCATION, payload).pipe(map(res => this.locationUpdated(res, companyId)));
  }

  locationUpdated(res, companyId) {
    const response: any = res;
    if (response.success) {
      this.getAllLocations(companyId, true, false);
    }
    return response;
  }
}
export class Location {
  location_id: number;
  name: string;
  country_id: number;
  state_id: number;
  city: string;
  country_name: string;
  state_name: string;
  tz_id: number;
  tz_name: string;
  head_location: boolean;
  selectedDepartments = [];
}
