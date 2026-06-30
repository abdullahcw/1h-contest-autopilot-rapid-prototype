import { Injectable } from '@angular/core';
import { EndPoint, ApiService } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';


@Injectable({
  providedIn: 'root'
})
export class MultilevelGamesService {
  mlgBeingEdited: any = {};
  staticIcons = [];
  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  getMultilevelGames(company_id, sortBy = 'mlg_name', order = 'asc', startLimit = 0, endLimit = 5000, filters = null, includeDeleted = false) {

    let queryParams = '';
    if (filters) {
      queryParams += `sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams = `sort_by=${sortBy}&order=${order}`;
    }
    if (endLimit !== 0) {
      queryParams += `&start_index=${startLimit}&limit=${endLimit}`;
    }
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    queryParams += `&include_deleted=${includeDeleted}`;
    return this.requestManager.get(`${EndPoint.GET_MULTILEVEL_GAME}?${queryParams}`);
  }

  addNew(payload) {
    return this.requestManager.post(`${EndPoint.ADD_MULTILEVEL_GAME}`, payload);
  }

  deleteMlg(company_id, mlgId) {
    let queryParams = '';
    queryParams = `mlg_id=${mlgId}`;
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    return this.requestManager.delete(`${EndPoint.DELETE_MULTILEVEL_GAME}?${queryParams}`);
  }

  copyGame(payload) {
    return this.requestManager.post(`${EndPoint.MLG_COPY_GAME}`, payload);
  }

  copyMLGProgress(pollingId) {
    const queryParams = `polling_identifier=${pollingId}`;
    return this.requestManager.get(`${EndPoint.MLG_COPY_PROGRESS}?${queryParams}`);

  }
  saveGame(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_MULTILEVEL_GAME}`, payload);
  }

  getGameDetails(mlgId, companyId) {
    const queryParams = `company_id=${companyId}&mlg_id=${mlgId}`;
    return this.requestManager.get(`${EndPoint.GET_MULTILEVEL_GAME_DETAILS}?${queryParams}`);
  }

  addMultilevelGameAssignment_CF(payload) {
    return this.requestManager.put(`${EndPoint.ADD_MULTILEVEL_GAME_ASSIGNMENT_CF}`, payload);
  }

  getMultilevelGameAssignment_CF(mlgId, companyId, IsCustom, IsCompanyCustom) {
    const queryParams = `company_id=${companyId}&mlg_id=${mlgId}&is_custom=${IsCustom}&is_company_with_custom_fields=${IsCompanyCustom}`;
    return this.requestManager.get(`${EndPoint.GET_MULTILEVEL_GAME_ASSIGNMENT_CF}?${queryParams}`);
  }

  setMultilevelGameAssignment_CF(payload) {
    return this.requestManager.put(`${EndPoint.SET_MULTILEVEL_GAME_ASSIGNMENT_CF}`, payload);
  }

  checkMultilevelGameReadiness(payload) {
    return this.requestManager.put(`${EndPoint.CHECK_MULTILEVEL_GAME_READINESS}`, payload);
  }

  addGamesInMultilevelGame(payload) {
    return this.requestManager.put(`${EndPoint.ADD_GAMES_IN_MULTILEVEL_GAME}`, payload);
  }

  updateGameInMultilevelGame(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_GAME_IN_MULTILEVEL_GAME}`, payload);
  }

  deleteGameInMultilevelGame(queryParams) {
    return this.requestManager.delete(`${EndPoint.DELETE_GAME_IN_MULTILEVEL_GAME}?${queryParams}`);
  }

  updateLevelPositionInMultilevelGame(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_LEVEL_POSITION_IN_MULTILEVEL_GAME}`, payload);
  }

  addMultilevelGameAssignment(payload) {
    return this.requestManager.put(`${EndPoint.ADD_MULTILEVEL_GAME_ASSIGNMENT}`, payload);
  }

  setMultilevelGameAssignment(payload) {
    return this.requestManager.put(`${EndPoint.SET_MULTILEVEL_GAME_ASSIGNMENT}`, payload);
  }

  getMultilevelGameAssignment(mlgId, companyId) {
    const queryParams = `company_id=${companyId}&mlg_id=${mlgId}`;
    return this.requestManager.get(`${EndPoint.GET_MULTILEVEL_GAME_ASSIGNMENT}?${queryParams}`);
  }
}




