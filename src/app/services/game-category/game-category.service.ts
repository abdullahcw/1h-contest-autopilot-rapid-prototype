import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class GameCategoryService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getGameCategory(company_id, sortBy, order, startLimit = 0, endLimit = 500, filters = null, contestId = null) {
    // tslint:disable-next-line:max-line-length
    let queryParams = '';
    queryParams = `sort_by=${sortBy}&order=${order}`;
    if (contestId) {
      // tslint:disable-next-line:max-line-length
      return this.requestManager.get(`${EndPoint.GET_GAME_CATEGORY}?company_id=${company_id}&start_index=${startLimit}&limit=${endLimit}&${queryParams}&contest_id=${contestId}`);
    } else {
      // tslint:disable-next-line:max-line-length
      return this.requestManager.get(`${EndPoint.GET_GAME_CATEGORY}?company_id=${company_id}&start_index=${startLimit}&limit=${endLimit}&${queryParams}}`);
    }
  }

  addGameCount(company_id, category_id) {
    return this.requestManager.get(`${EndPoint.GET_GAME_COUNT}?company_id=${company_id}&category_id=${category_id}`);
  }
  addGameCategory(company_id, category) {
    const payload = { 'category_name': category, 'company_id': company_id };
    return this.requestManager.post(EndPoint.ADD_GAME_CATEGORY, payload);
  }

  updateGameCategory(payload) {
    return this.requestManager.put(EndPoint.UPDATE_GAME_CATEGORY, payload);
  }

  deleteGameCategory(category_id, companyId) {
    return this.requestManager.delete(`${EndPoint.DELETE_GAME_CATEGORY}?company_id=${companyId}&category_id=${category_id}`);
  }

}


export class Category {
  category_id: number;
  category_name: string;
}

