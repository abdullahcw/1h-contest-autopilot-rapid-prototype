import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';
@Injectable({
  providedIn: 'root'
})
export class GamePathwayService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  addGamePathway(company_id, pathway) {
    const payload = { 'pathway_name': pathway, 'company_id': company_id };
    return this.requestManager.post(EndPoint.ADD_GAME_PATHWAY, payload);
  }

  getGamePathway(company_id, sortBy, order, startLimit = 0, endLimit = 500) {
    
    let queryParams = '';
    queryParams = `sort_by=${sortBy}&order=${order}`;       
    return this.requestManager.get(`${EndPoint.GET_GAME_PATHWAYS}?company_id=${company_id}&start_index=${startLimit}&limit=${endLimit}`); 
  }

  pathwayGameCount(company_id, pathway_id) {
    return this.requestManager.get(`${EndPoint.GET_PATHWAYS_GAME_COUNT}?company_id=${company_id}&pathway_id=${pathway_id}`);
  }

  deletePathway(pathway_id) {
    return this.requestManager.delete(`${EndPoint.DELETE_PATHWAYS}/${pathway_id}`);
  }

  updatePathway(payload) {
    return this.requestManager.put(EndPoint.UPDATE_PATHWAY, payload);
  }

  
}

export class Pathway {
  pathway_id: number;
  pathway_name: string;
}