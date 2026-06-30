import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class AttemptsService {

  constructor(private requestManager: RequestManagerService) { }  
  getAttempts(payload) {
    return this.requestManager.post(EndPoint.GET_PLAYER_ATTEMPTS, payload);
  }

  addAttempts(payload) {
    return this.requestManager.post(EndPoint.ADD_PLAYER_ATTEMPTS, payload);
  }

  updateAttempts(payload) {
    return this.requestManager.put(EndPoint.UPDATE_PLAYER_ATTEMPTS, payload);
  }

  deleteAttempts(payload) {
    return this.requestManager.put(EndPoint.DELETE_PLAYER_ATTEMPTS, payload);
  }
}
