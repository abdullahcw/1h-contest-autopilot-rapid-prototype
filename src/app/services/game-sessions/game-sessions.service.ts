import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class GameSessionsService {

  constructor(private requestManager: RequestManagerService) { }
  getSessions(payload) {
    return this.requestManager.post(EndPoint.GET_LIVE_GAME_SESSIONS, payload);
  }

  deleteSessions(payload) {
    return this.requestManager.post(EndPoint.DELETE_LIVE_GAME_SESSIONS, payload);
  }
}
