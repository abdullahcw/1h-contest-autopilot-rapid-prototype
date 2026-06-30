import { Injectable } from '@angular/core';
import { EndPoint, ApiService } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GamesService {

  public textEditorValidation$ = new Subject<any>();
  public getGameDetails$ = new Subject<any>();
  public createGameFromBuilder$ = new Subject<any>();
  public textEditorValidationInformation$ = new Subject<any>();
  gameBeingEdited: any = {};
  gameCopied: any = {};
  marketPlaceGameNames = [];
  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  // FIX ME, Hardcoded endlimit
  getGames(company_id, sortBy = 'game_name', order = 'asc', startLimit = 0, endLimit = 5000,
    filters = null, archiveAll = false, includeDeleted = false) {
    // tslint:disable-next-line:max-line-length
    if (filters && Array.isArray(filters)) {
      this.applyModeFilterIfRequired(filters);
    }
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
    if (filters && filters.indexOf('archive=archive') !== -1) {
      queryParams += `&is_archived=true`;
    } else if (!archiveAll) {
      queryParams += `&is_archived=false`;
    }
    if (filters && filters.indexOf('archive=archive') !== -1) {
      queryParams = queryParams.replace('&archive=archive', '');
    }
      queryParams += `&include_deleted=${includeDeleted}`;
    return this.requestManager.get(`${EndPoint.GET_GAMES}?${queryParams}`);
  }

  getTranslationProgress(gameID,companyId) {
    const queryParams = `game_id=${gameID}&company_id=${companyId}`
    return this.requestManager.get(`${EndPoint.GET_TRANSLATION_PROGRESS}?${queryParams}`);
  }
  retryTranslation(gameID,companyId) {
    const queryParams = `game_id=${gameID}&company_id=${companyId}`
    return this.requestManager.get(`${EndPoint.RETRY_TRANSLATION_PROGRESS}?${queryParams}`);
  }

  // Update filters to include mode if required
  applyModeFilterIfRequired(filter) {
    if (!filter) {
      return;
    }
    if (filter.indexOf('game_state=PRACTICE') !== -1) {
      filter = filter.replace('game_state=PRACTICE', 'game_state=LIVE&game_mode=PRACTICE');
    } else if (filter.indexOf('game_state=LIVE') !== -1) {
      filter = filter.replace('game_state=LIVE', 'game_state=LIVE&game_mode=CONTEST');
    }
  }

  getQuestionCategories(gameId) {
    const queryParams = `game_id=${gameId}`;
    return this.requestManager.get(`${EndPoint.GET_QUESTION_CATEGORIES}?${queryParams}`);
  }

  updateQuestionCategories(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_QUESTION_CATEGORY}`, payload);
  }
  
  getGameDetails(gameId, companyId, managerId , gameModeLanguage) {
    const queryParams = `game_id=${gameId}&company_id=${companyId}&manager_id=${managerId}&lang_id=${gameModeLanguage}`;
    return this.requestManager.get(`${EndPoint.GET_GAME_DETAILS}?${queryParams}`);
  }

  getGameCategories(companyId,showUncategorized = false) {
    const queryParams = `company_id=${companyId}&show_uncategorized=${showUncategorized}`;
    return this.requestManager.get(`${EndPoint.GET_GAME_CATEGORIES}?${queryParams}`);
  }

  addNew(payload) {
    return this.requestManager.post(`${EndPoint.ADD_GAME}`, payload);
  }
  moveQuestions(payload) {
    return this.requestManager.post(`${EndPoint.MOVE_QUESTIONS}`, payload);
  }
  copyQuestions(payload) {
    return this.requestManager.post(`${EndPoint.COPY_QUESTIONS}`, payload);
  }
  updateQuestionTimeAndPoints(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_QUESTIONS_POINTS_TIME}`, payload);
  }
  copyQuestionsProgress(pollingId) {
    const queryParams = `polling_identifier=${pollingId}`;
    return this.requestManager.get(`${EndPoint.COPY_QUESTIONS_PROGRESS}?${queryParams}`);
  }
  getStaticIcons() {
    return this.requestManager.get(`${EndPoint.GAME_ICONS}`);
  }

  validateGameReadiness(companyId, gameId) {
    return this.requestManager.get(`${EndPoint.VALIDATE_GAME_READINESS}?company_id=${companyId}&game_id=${gameId}`);
  }

  setGameBeingEdited(game) {
    this.gameBeingEdited = game;
  }

  saveGame(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_GAME}`, payload);
  }

  saveProfile(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_PROFILE}`, payload);
  }

  linkProfile(payload) {
    return this.requestManager.post(`${EndPoint.LINK_PROFILE}`, payload);
  }

  unlinkProfile(payload) {
    return this.requestManager.put(`${EndPoint.UNLINK_PROFILE}`, payload);
  }

  deleteGameProfile(profileid) {
    let queryParams = '';
    queryParams = `profile_id=${profileid}`;
    return this.requestManager.delete(`${EndPoint.DELETE_PROFILE}?${queryParams}`);
  }

  addQuestionCategory(payload) {
    return this.requestManager.post(`${EndPoint.ADD_QUESTION_CATEGORY}`, payload);
  }
  deleteQuestionCategory(payload) {
    return this.requestManager.post(`${EndPoint.DELETE_QUESTION_CATEGORY}`, payload);
  }

  getGameBeingEdited() {
    return this.getGameBeingEdited;
  }

  deleteGames(company_id, gameId) {
    let queryParams = '';
    queryParams = `game_id=${gameId}`;
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    return this.requestManager.delete(`${EndPoint.DELETE_GAME}?${queryParams}`);
  }

  copyGame(payload) {
    return this.requestManager.post(`${EndPoint.COPY_GAME}`, payload);
  }

  copyGameToCompanies(payload) {
    return this.requestManager.post(`${EndPoint.COPY_GAME_TO_COMPANIES}`, payload);
  }

  getProfiles(companyId, gameID, sortBy, order, startLimit, endLimit, managerId, filters,gameModeLanguage) {
    let queryParams = `company_id=${companyId}&game_id=${gameID}&sort_by=${sortBy}&order=${order}&manager_id=${managerId}&lang_id=${gameModeLanguage}`;
    if (filters) {
      queryParams += `&${filters}`;
    }
    return this.requestManager.get(`${EndPoint.GET_GAME_PROFILES}?${queryParams}`);
  }
  addProfile(game, selectedProfile) {
    const information = [] = selectedProfile.information.filter((info) => {
      return info.description !== '' && info.title !== '';
    });
    const payload = {
      'company_id': game.company_id,
      'game_id': game.game_id,
      'lang_id': game.default_lang_id,
      'profile_name': selectedProfile.profile_name,
      'video_url': selectedProfile.video_url,
      'scenario': selectedProfile.scenario,
      'information': information,

    };
    return this.requestManager.post(`${EndPoint.ADD_PROFILE}`, payload);
  }
  updateGameState(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_GAME_STATE}`, payload);
  }

  getLimits(companyId, gameID, isCustom = false) {
  }

  addLimits(payload) {
    if (payload.department_ids.length && payload.department_ids[0] === -1) {
      delete payload.department_ids;
    }
    if (payload.location_id === -1) {
      delete payload.location_id;
    }
    return this.requestManager.post(`${EndPoint.ADD_LIMIT_EVERYONE}`, payload);
  }

  updateLimits(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_LIMIT}`, payload);
  }

  addSchedule(payload) {
    return this.requestManager.post(`${EndPoint.ADD_GAME_SCHEDULE}`, payload);
  }

  updateSchedule(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_GAME_SCHEDULE}`, payload);
  }

  deleteSchedule(payload) {
    return this.requestManager.put(`${EndPoint.DELETE_GAME_SCHEDULE}`, payload);
  }
  archiveGame(payload) {
    return this.requestManager.put(`${EndPoint.ARCHIVE_GAME}`, payload);
  }
  unarchiveGame(payload) {
    return this.requestManager.put(`${EndPoint.UNARCHIVE_GAME}`, payload);
  }

  deleteLimits(payload) {
    return this.requestManager.post(`${EndPoint.DELETE_LIMIT}`, payload);
  }

  uploadQuestions(payload) {
    return this.requestManager.post(EndPoint.UPLOAD_QUESTIONS, payload);
  }

  getOwners(company_id, sortBy, order, startLimit = 0, endLimit = 1000, filters = 0) {
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
    queryParams += `&access_type= M,MM`;
    return this.requestManager.get(`${EndPoint.GET_OWNERS}?${queryParams}`);
  }

  addSLGLimits(payload) {
    return this.requestManager.post(`${EndPoint.ADD_GAME_LIMIT}`, payload);
  }

  getSLGLimits(companyId, gameID, IsCustom, IsCompanyCustom) {
    const queryParams = `company_id=${companyId}&game_id=${gameID}&is_custom=${IsCustom}&is_company_with_custom_fields=${IsCompanyCustom}`;
    return this.requestManager.get(`${EndPoint.RETRIEVE_GAME_LIMIT}?${queryParams}`);
  }

  deleteSLGLimits(payload) {
    return this.requestManager.post(`${EndPoint.DELETE_GAME_LIMIT}`, payload);
  }

  updateSLGLimits(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_GAME_LIMIT}`, payload);
  }

  updateSLGAttempts(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_GAME_ATTEMPTS}`, payload);
  }

  getPinnedGames(payload) {
    return this.requestManager.post(`${EndPoint.GET_PINNED_GAMES}`, payload);
  }

  getPinnedGamesListForMoreReport(payload) {
    const queryParams = `company_id=${payload.company_id}&manager_id=${payload.manager_id}`;
    return this.requestManager.get(`${EndPoint.GET_PINNED_GAMES_LIST}?${queryParams}`);
  }

  updatePinGame(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_PIN_GAMES}`, payload)
  }

  getGamesByWinRate(payload) {
    return this.requestManager.post(`${EndPoint.GET_GAMES_BY_WIN_RATE}`, payload);
  }

  setGameCopied(game) {
    this.gameCopied = game;
    // console.log(this.gameCopied);
  }

  scanerioValidation(hide) {
    this.textEditorValidation$.next(hide);
  }
  localiseGameFromBuilder(value) {
    this.createGameFromBuilder$.next(value);
  }
  informationValidation(hide) {
    this.textEditorValidationInformation$.next(hide);
  }

  aiGenerateQuestions(payload) {
    // return this.requestManager.post(`${EndPoint.AI_GENERATE_QUESTIONS}`, payload);
    return this.requestManager.post(`${EndPoint.AI_GENERATE_QUESTIONS_V1}`, payload);
  }

  aiGenerateAddQuestions(payload) {
    // return this.requestManager.post(`${EndPoint.AI_GENERATE_QUESTIONS}`, payload);
    return this.requestManager.post(`${EndPoint.AI_GENERATE_Add_MORE_QUESTIONS}`, payload);
  }

  // aiGenerateQuestionsPolling(pollingId) {
  //   const queryParams = `polling_identifier=${pollingId}`;
  //   return this.requestManager.get(`${EndPoint.AI_GENERATE_QUESTIONS_POLLING}?${queryParams}`);
  // }

  updatePDFFileToServer(payload) {    
    return this.requestManager.post(`${EndPoint.UPDATE_PDF_FILE}`, payload);
  }

  processPDFFile(payload) {    
    return this.requestManager.post(`${EndPoint.PROCESS_PDF_FILE}`, payload);
  }

  aiAddQuestions(payload) {
    return this.requestManager.post(`${EndPoint.AI_ADD_QUESTIONS}`, payload);
  }
  getGameLanguage(companyId,gameId) {
    let queryParams;
    if(gameId){
       queryParams = `game_id=${gameId}&company_id=${companyId}`;
    }else{
       queryParams = `company_id=${companyId}`;

    }
    return this.requestManager.get(`${EndPoint.GET_GAME_LANG}?${queryParams}`);
  }
  saveGameLanguage(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_GAME_LANG}`, payload);
  }
  getLocalizationProgress(companyId,gameId){
    const queryParams = `game_id=${gameId}&company_id=${companyId}`;
    return this.requestManager.get(`${EndPoint.GET_LOCALIZATION_PROGRESS}?${queryParams}`);
  }
}

export class Game {
  game_id: number;
  name: string;
}

export const GameMode = {
  LIVE: 'Live',
  CONTEST: 'Contest',
  PRACTICE: 'Practice'
};
