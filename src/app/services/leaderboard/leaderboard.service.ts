import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getLeaderboardSettings(payload) {
    return this.requestManager.get(`${EndPoint.VIEW_LEADERBOARD}?company_id=${payload}`);
  }

  updateLeaderboardSettings(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_LEADERBOARD}`, payload);
  }

  getLeaderBoardCustomFields(companyId, forLeaderboard) {
    return this.requestManager.get(`${EndPoint.GET_CUSTOM_FIELDS}?company_id=${companyId}&for_leaderboard=${forLeaderboard}`);
  }
}
