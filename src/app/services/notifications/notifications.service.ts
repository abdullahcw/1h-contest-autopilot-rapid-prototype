import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  alert_id: any = null;
  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getNotificationSettings(companyId) {
    return this.requestManager.get(`${EndPoint.GET_NOTIFICATION_SETTINGS}?company_id=${companyId}`);
  }

  updateNotificationSettings(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_NOTIFICATION_SETTINGS}`, payload);
  }

  sendCustomNotification(payload) {
    return this.requestManager.post(`${EndPoint.SEND_CUSTOM_NOTIFICATION}`, payload);
  }

  getAlerts(company_id,manager_id, startLimit, endLimit) {    

    let queryParams = '';
    
    if (endLimit !== 0) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }

    return this.requestManager.get(`${EndPoint.GET_ALERTS}company_id=${company_id}&manager_id=${manager_id}&${queryParams}`);
  }

  getCallToAction(type) {    
    return this.requestManager.get(`${EndPoint.CALL_TO_ACTION}${type}`);
  }

  createAlert( payload) {
    return this.requestManager.post(`${EndPoint.CREATE_ALERT}`, payload);
  }

  updateAlert( payload) {
    return this.requestManager.post(`${EndPoint.EDIT_ALERT}`, payload);
  }

  getMarketplaceGames(category_id, offset = null, limit = null) {
    const queryParams = `category_id=${category_id}`;
    return this.requestManager.get(`${EndPoint.GET_MARKETPLACE_GAMES_BY_CATEGORY}`, queryParams);
  }

  disableAlert(alert_id,to_disable) {
    const queryParams = `alert_id=${alert_id}&to_disable=${to_disable}`;
    return this.requestManager.put(`${EndPoint.ENABLE_DISABLE_ALERT}${queryParams}`,null);
  }

  

  getAlertsDetails(alertId) {
    return this.requestManager.get(`${EndPoint.GET_ALERT_DETAILS}alert_id=${alertId}`);
  }


}
