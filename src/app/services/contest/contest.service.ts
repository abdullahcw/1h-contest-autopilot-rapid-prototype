import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class ContestService {


  today = new Date();
  contest: any = {
    contest_id: '',
    contest_name: '',
    contest_image_url: '',
    contest_start_date: this.today,
    contest_end_date: this.today
  };
  contestProperty = '';
  isContestEditable = false;
  validStartDate = new Date();

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }

  validateContestDateRange() {
    const startDate = JSON.parse(JSON.stringify(this.contest.contest_start_date));
    const contestMaxDate = new Date(new Date(startDate).setDate(this.contest.contest_start_date.getDate() + 89));
    return this.isContestEditable ? !(this.contest.contest_start_date.getTime() < this.validStartDate.getTime() ||
      this.contest.contest_end_date.getTime() < this.contest.contest_start_date.getTime() ||
      this.contest.contest_end_date.getTime() < this.validStartDate.getTime() ||
      this.contest.contest_end_date.getTime() > contestMaxDate.getTime()) : true;
  }

  getValidContestDate(company_id) {
    let queryParams = '';
    queryParams = `company_id=${company_id}`;

    return this.requestManager.get(`${EndPoint.GET_VALID_CONTEST_DATE}?${queryParams}`);
  }

  getContestsList(company_id, sortBy, order, startLimit, endLimit, filters = null) {
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
    return this.requestManager.get(`${EndPoint.GET_CONTESTS_LIST}?${queryParams}`);
  }

  setContestDetails(payload) {
    this.contest = payload;
  }
  getContestDetails() {
    return this.contest;
  }
  getContestRewardCategory() {
    return this.requestManager.get(`${EndPoint.GET_CONTEST_REWARD_CATEGORY}?`);
  }
  getContestRewards(category_id) {
    let queryParams = '';
    queryParams = `&category_id=${category_id}`;

    return this.requestManager.get(`${EndPoint.GET_CONTEST_REWARD}?${queryParams}`);
  }

  getContest(contest_id = null, company_id = null) {
    let queryParams = '';
    queryParams = `contest_id=${contest_id}`;
    if (company_id) {
      queryParams += `&company_id=${company_id}`;
    }
    return this.requestManager.get(`${EndPoint.GET_CONTEST}?${queryParams}`);
  }

  getContestGames(company_id, contest_id, startLimit, endLimit) {
    const queryParams = `contest_id=${contest_id}&company_id=${company_id}&start_index=${startLimit}&limit=${endLimit}`;
    return this.requestManager.get(`${EndPoint.GET_CONTEST_GAMES}?${queryParams}`);
  }
  getAssignment(contestId, companyId, IsCustom, IsCompanyCustom) {
    const queryParams = `company_id=${companyId}&contest_id=${contestId}&is_custom=${IsCustom}&is_company_with_custom_fields=${IsCompanyCustom}`;
    return this.requestManager.get(`${EndPoint.GET_CONTEST_ASSIGNMENT_CF}?${queryParams}`);

  }
  createContest(payload) {
    return this.requestManager.post(EndPoint.CREAT_CONTEST, payload);
  }

  updateContestDetails(payload) {
    return this.requestManager.put(EndPoint.UPDATE_CONTEST, payload);
  }

  addGamesToContest(payload) {
    return this.requestManager.post(EndPoint.ADD_GAME_TO_CONTEST, payload);
  }
  updateGamesToContest(payload) {
    return this.requestManager.put(EndPoint.UPDATE_GAMES_CONTEST, payload);
  }
  publishContest(payload) {
    return this.requestManager.post(EndPoint.PUBLISH, payload);
  }
  addSchedule(payload) {
    return this.requestManager.post(`${EndPoint.ADD_GAME_SCHEDULE}`, payload);
  }
  addAssignment(payload) {
    return this.requestManager.post(`${EndPoint.ADD_CONTEST_ASSIGNMENT_CF}`, payload);
  }
  updateAssignment(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_CONTEST_ASSIGNMENT_CF}`, payload);
  }
  deleteContest(company_id, contest_id) {
    const queryParams = `company_id=${company_id}&contest_id=${contest_id}`;
    return this.requestManager.delete(`${EndPoint.DELETE_CONTEST}?${queryParams}`);
  }
  forceCloseContest(payload) {
    return this.requestManager.put(`${EndPoint.FORCE_CLOSE_CONTEST}`, payload);
  }
  deleteGames(payload) {
    return this.requestManager.post(`${EndPoint.DELETE_GAMES_IN_CONTEST}`, payload);
  }
  moveToDraft(payload) {
    return this.requestManager.put(`${EndPoint.MOVE_CONTEST_TO_DRAFT}`, payload);
  }

  getGameList(payload) {
    return this.requestManager.post(`${EndPoint.GET_GAMES_CONTEST}`, payload);
  }

  copyContest(payload) {
    return this.requestManager.post(`${EndPoint.COPY_CONTEST}`, payload);
  }

  copyContestProgress(pollingId) {
    const queryParams = `polling_identifier=${pollingId}`;
    return this.requestManager.get(`${EndPoint.CONTEST_COPY_PROGRESS}?${queryParams}`);
  }
}


export class Games {
  game_id: number;
}

export enum Range {
  THIS_MONTH = 'thisMonth',
  LAST_MONTH = 'lastMonth',
  LAST_6_MONTH = 'last6month',
  LAST_12_MONTH = 'last12month',
  MORE_THEN_12_MONTH = 'morethan12month'
}
