import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class TipsService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getTips() {
    return this.requestManager.get(EndPoint.GET_TIPS);
  }

  updateTips(payload) {
    return this.requestManager.put(EndPoint.UPDATE_TIPS, payload);
    // `${EndPoint.UPDATE_MANAGER}`
  }
}
