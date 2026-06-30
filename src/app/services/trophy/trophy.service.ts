import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, Constants, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class TrophyService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getTrophiesBy(company_id, is_trophy_report, type, sortBy = null, order = 'asc', filters = null, startLimit = 0, endLimit = 100) {
    let queryParams = '';
    queryParams += `type_of_trophies=${type}&is_trophy_report=${is_trophy_report}`;
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    if (endLimit !== 0) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    if (filters) {
      queryParams += `&sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams += `&sort_by=${sortBy}&order=${order}`;
    }
    // Include_deleted

    console.log('queryParams', queryParams);
    return this.requestManager.get(`${EndPoint.GET_TROPHIES_BY}?${queryParams}`);
  }
  // report service api integrated for trophy report
  getTrophiesByReport(company_id, is_trophy_report, type, sortBy = null, order = 'asc', filters = null, startLimit = 0, endLimit = 100) {
    let queryParams = '';
    queryParams += `type_of_trophies=${type}&is_trophy_report=${is_trophy_report}`;
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    if (endLimit !== 0) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    if (filters) {
      queryParams += `&sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams += `&sort_by=${sortBy}&order=${order}`;
    }
    return this.requestManager.get(`${EndPoint.GET_TROPHIES_BY_REPORT}?${queryParams}`);
  }

  getTrophyReport(payload) {
    return this.requestManager.post(EndPoint.GET_TROPHY_REPORT, payload);
  }
  getTrophyReportMLG(payload) {
    return this.requestManager.post(EndPoint.MLG_TROPHY_DETAILS, payload);
  }
  getContestTrophiesBy(payload) {
    return this.requestManager.post(EndPoint.CONTEST_VIEW_TROPHY, payload);
  }

  getMlgTrophiesBy(company_id, sortBy = null, order = 'asc', filters = null, startLimit = 0, endLimit = 100) {
    let queryParams = '';
    if (company_id) {
      queryParams += `company_id=${company_id}`;
    }
    if (endLimit !== 0) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    if (filters) {
      queryParams += `&sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams += `&sort_by=${sortBy}&order=${order}`;
    }
    return this.requestManager.get(`${EndPoint.MLG_VIEW_TROPHY}?${queryParams}`);
  }
  getUrlToDowload(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_TROPHY_REPORT, payload);
  }

  downloadContestTrophyReport(payload) {
    return this.requestManager.post(EndPoint.DOWNLOAD_CONTEST_TROPHY, payload);
  }

  getGames(company_id) {
    let queryParams = '';
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    return this.requestManager.get(`${EndPoint.GET_GAMES_TROPHY}?${queryParams}`);
  }

  addGameTrophy(payload) {
    return this.requestManager.post(EndPoint.ADD_GAME_TROPHY, payload);
  }

  updateGameTrophy(payload) {
    return this.requestManager.put(EndPoint.EDIT_GAME_TROPHY, payload);
  }
}
export class Trophy {
  title: string;
  description: string;
}
