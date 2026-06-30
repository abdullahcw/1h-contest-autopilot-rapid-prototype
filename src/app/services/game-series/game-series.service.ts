import { Injectable } from '@angular/core';
import { EndPoint } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';

@Injectable({
  providedIn: 'root'
})
export class GameSeriesService {

  constructor(public requestManager: RequestManagerService) { }
  getSeries(payload) {
     return this.requestManager.post(EndPoint.GET_SERIES, payload);
}
  getGameSeries(payload) {
     return this.requestManager.post(EndPoint.GET_GAMES_SERIES, payload);
}
  saveGameSeries(payload) {
     return this.requestManager.post(EndPoint.SAVE_GAMES_SERIES, payload);
}
  updateGameSeries(payload) {
     return this.requestManager.put(EndPoint.UPDATE_SERIES, payload);
}
  getGameSlgMlg(companyId,seriesId) {
    return this.requestManager.get(`${EndPoint.GET_GAMES_SLG_MLG}/${companyId}/${seriesId}`);
}

deleteSeries(seriesId) {
  return this.requestManager.delete(`${EndPoint.DELETE_SERIES}/${seriesId}`);
}

validateAudience(payload) {
  return this.requestManager.post(EndPoint.VALIDATE_AUDIENCE_NAME, payload);
}

addSeries(payload) {
  return this.requestManager.post(EndPoint.ADD_SERIES, payload);
}
}
export class Series {
  series_id: number;
  series_name: string;
}