import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getPlayers(company_id, sortBy, order, startLimit, endLimit, filters) {
    let queryParams = '';
    if (filters) {
      queryParams += `sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams += `sort_by=${sortBy}&order=${order}`;
    }
    if (startLimit != null && endLimit != null) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }

    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.GET_PLAYERS}?${queryParams}`);
  }

  getPlayersForCustomFields(payload) {
    return this.requestManager.post(`${EndPoint.GET_PLAYERS_FOR_CUSTOM_FIELDS}`, payload);
  }
  getPlayersForCustomAudiance(payload) {
    return this.requestManager.post(`${EndPoint.GET_PLAYERS_FOR_CUSTOM_AUDIENCE}`, payload);
  }
  getPlayerDetails(payload) {
    return this.requestManager.get(`${EndPoint.GET_PLAYER_DETAILS}?player_id=${payload}`);
  }

  getEthnicity() {
    return this.requestManager.get(`${EndPoint.GET_ETHNICITY}`);
  }
  getPlayerPhone(playerID) {
    return this.requestManager.get(`${EndPoint.GET_PLAYER_PHONE}?player_id=${playerID}`);
  }

  addPlayer(payload) {
    return this.requestManager.post(`${EndPoint.ADD_PLAYER}`, payload);
  }

  updatePlayer(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_PLAYER}`, payload);
  }

  bulkUpdate(payload) {
    return this.requestManager.put(`${EndPoint.BULK_UPDATE_PLAYER}`, payload);
  }
  unlinkPlayer(payload) {
    return this.requestManager.put(`${EndPoint.UNLINK_PLAYER_FROM_PHONE}`, payload);
  }

  deletePlayers(payload) {
    return this.requestManager.post(EndPoint.DELETE_PLAYER, payload);
  }

  activateDeactivatePlayers(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_PLAYER_STATUS}`, payload);
  }

  sendOnboardingEmail(payload) {
    return this.requestManager.post(`${EndPoint.OBOARDING_EMAIL}`, payload);
  }

  getUrlToDowload(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_PLAYERS, payload);
  }

  uploadPlayer(payload) {
    return this.requestManager.post(EndPoint.UPLOAD_PLAYER, payload);
  }
  companyCustomFields(companyId, ignore_default = false) {
    return this.requestManager.get(`${EndPoint.GET_CUSTOM_FIELDS}?company_id=${companyId}&ignore_default=${ignore_default}`);
  }
}


export class Player {
  player_id: number;
  isGroup = false;
  status = 'active';
  // name: string;
}
