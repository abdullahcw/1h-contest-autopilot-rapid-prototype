import { Injectable } from '@angular/core';
import { EndPoint } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerFeedbackService {

  constructor(public requestManager: RequestManagerService) { }

  getFeedback(company_id, only_som, filters = null, startLimit = 0, endLimit = 100, sortBy = 'created_on', order = 'desc') {
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
      queryParams += `&company_id=${company_id}&only_som=${only_som}`;
    }
    return this.requestManager.get(`${EndPoint.RETREIVE_FEEDBACK}${queryParams}`);
  }


  getUrlToDowload(companyId, timeZone, filters = null, sortBy = 'first_name', order = 'asc') {
    let queryParams = '';
    if (companyId) {
      queryParams += `company_id=${companyId}&timezone=${timeZone}&only_som=true`;
    }
    if (filters) {
      queryParams += `&sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams += `&sort_by=${sortBy}&order=${order}`;
    }

    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.DOWNLOAD_FEEDBACK_REPORT}${queryParams}`);
  }

  resolveQuestion(payload) {
    return this.requestManager.put(`${EndPoint.RESOLVE_FEEDBACK}`, payload);
  }
}
