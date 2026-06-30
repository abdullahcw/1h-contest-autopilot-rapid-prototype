import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class GameReorderService {

  constructor(public requestManager: RequestManagerService) { }
  getGamesList(company_id) {
    let queryParams = '';
    if (company_id) {
      queryParams += `company_id=${company_id}&order=asc&sort_by=position`;
    }
    return this.requestManager.get(`${EndPoint.GET_GAME_REORDER}?${queryParams}`);
  }
  updateGamePosition(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_GAME_REORDER}`, payload);
  }

}
