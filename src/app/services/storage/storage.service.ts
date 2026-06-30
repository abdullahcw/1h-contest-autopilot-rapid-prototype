import { Injectable } from '@angular/core';
import { Constants } from '../network/api.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  userPersonalData;
  allFilters = [];
  private ALL_FILTERS = 'allFilters';
  constructor() { }
  public $defaultSetAsClear = new Subject<any>();

  setTeb(data) {
    localStorage.setItem('tab', data);
  }
  setDateForCache() {}
  getDateForCache() {
    return JSON.parse(localStorage.getItem('dateForCache'));
  }

  getTab() {
    return localStorage.getItem('tab');
  }
  setContest(contest) {
    localStorage.setItem(Constants.CONTEST_DETAILS, JSON.stringify(contest));
  }
  getContest() {
    return localStorage.getItem(Constants.CONTEST_DETAILS);
  }
  setShowGameScreen(data) {
    localStorage.setItem('is_addgame', data);
  }

  getShowGameScreen() {
    return JSON.parse(localStorage.getItem('is_addgame'));
  }
  setUser(user) {
    console.log('user',user);
    const userData = {
      'access_type': user.access_type,
      'company_id' : user.company_id,
      'is_company_with_custom_fields' : user.is_company_with_custom_fields,
      'is_custom' : user.is_custom,
      'manager_id' : user.manager_id
    }
    localStorage.setItem(Constants.USER, JSON.stringify(userData));
  }
  setSSOUser(user) {
    localStorage.setItem(Constants.USER, JSON.stringify(user));
  }
  getUser() {
    return localStorage.getItem(Constants.USER);
  }
  setSSODetails(user) {
    localStorage.setItem(Constants.SSO_DETAILS, JSON.stringify(user));
    sessionStorage.setItem(Constants.SSO_DETAILS, JSON.stringify(user));
  }
  getsetSSODetails() {
    return localStorage.getItem(Constants.SSO_DETAILS);
  }
  getsetSSODetailsSessionStorage() {
    return sessionStorage.getItem(Constants.SSO_DETAILS);
  }

  setUserDetails(user, accesToken, accessType) {
    this.setUser(user)
    localStorage.setItem(Constants.ACCESS_TOKEN, accesToken);
    localStorage.setItem(Constants.ACCESS_TYPE, accessType);
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  setAccessToken(token) {
    localStorage.setItem(Constants.ACCESS_TOKEN, token);
  }

  getAccessToken() {
    return localStorage.getItem(Constants.ACCESS_TOKEN);
  }

  setCompanyId(companyID) {
    const company = this.getCompany();
    if (company) {
      company.company_id = companyID;
      this.setCompany(company);
    }
  }

  getCompanyId() {
    const company = this.getCompany();
    if (!company) { return 0; }
    const companyId = company.company_id;
    return companyId;
  }

  setCompany(company) {
    return localStorage.setItem('company_data', JSON.stringify(company));
  }
  setGameObject(gameObject) {
    return localStorage.setItem('gameObject', JSON.stringify(gameObject));
  }

  getGameObject(gameObject) {
    return JSON.parse(localStorage.getItem('gameObject'));
  }

  setmultilevelGameObject(multilevelgameObject) {
    return localStorage.setItem('multilevelgameObject', JSON.stringify(multilevelgameObject));
  }
  getmultilevelGameObject() {
    return JSON.parse(localStorage.getItem('multilevelgameObject'));
  }

  getCompany() {
    return JSON.parse(localStorage.getItem('company_data'));
  }

  getLoginUserID() {
    const userData = localStorage.getItem(Constants.USER);
     return JSON.parse(JSON.parse(userData) && JSON.parse(userData).manager_id);
  }


  setAccessType(accessType) {
    localStorage.setItem(Constants.ACCESS_TYPE, accessType);
  }

  getAccessType() {
    return localStorage.getItem(Constants.ACCESS_TYPE);
  }

  setPostLogin(postLogin) {
    localStorage.setItem(Constants.POST_LOGIN, postLogin);
  }

  isPostLogin() {
    return localStorage.getItem(Constants.POST_LOGIN) === 'true' ? true : false;
  }
  setPostLoginForCustomField(postLogin) {
    localStorage.setItem(Constants.POST_LOGIN_CUSTOM_FIELD, postLogin);
  }

  isPostLoginForCustomField() {
    return localStorage.getItem(Constants.POST_LOGIN_CUSTOM_FIELD) === 'true' ? true : false;
  }

  clearAllStoredFilter() {
    // console.log('clearingAllStoredFilter');
    this.allFilters = [];
    localStorage.setItem(this.ALL_FILTERS, JSON.stringify(this.allFilters));
  }

  setFilters(context, appliedFilter) {
    // Get all filters from local before crud operation or handle filter on page refresh
    this.allFilters = localStorage.getItem(this.ALL_FILTERS) ? JSON.parse(localStorage.getItem(this.ALL_FILTERS)) : [];
    if (this.allFilters === null) { return; }
    const incomingFilter = this.allFilters && this.allFilters.filter(filter => {
      return filter['key'] === context;
    });
    if (incomingFilter && incomingFilter.length > 0) {
      const indexOfIncomingFilterIndex = this.allFilters.indexOf(incomingFilter[0]);
      if (indexOfIncomingFilterIndex >= 0) {
        this.allFilters.splice(indexOfIncomingFilterIndex, 1);
      }
    }
    this.allFilters.push({ 'key': context, 'value': appliedFilter });
    localStorage.setItem(this.ALL_FILTERS, JSON.stringify(this.allFilters));
  }

  getFilterArray(context) {
    const storedFilters = localStorage.getItem(this.ALL_FILTERS);
    const allCompanyFilter = JSON.parse(storedFilters);
    let filters = allCompanyFilter && allCompanyFilter.filter(companyFilter => {
      return companyFilter['key'] === context;
    });
    if (filters === null || (filters && filters.length) === 0) { return; }
    filters = filters[0]['value'];

    const appliedFilters = [];
    if (filters && filters.length > 0) {
      filters.forEach(option => {
        const isAdditionalFilter = option.additionalFilter ? option.additionalFilter : false;
        let createFilter;
        if (option.hasOwnProperty('id')) {
          createFilter = {
            'filter': option.filter, 'searchingIn': option.searchingIn.trim(),
            'id': option.id, 'value': option.value, 'additionalFilter': isAdditionalFilter
          };
        } else if (option.filter === Constants.ARCHIVE) { // added for Archive filter on game list
          createFilter = {
            'filter': option.filter, 'searchingIn': option.searchingIn.trim(), 'is_static': option.is_static, 'value': Constants.ARCHIVE,
            'additionalFilter': isAdditionalFilter
          };
        } else {
          createFilter = {
            'filter': option.filter, 'searchingIn': option.searchingIn.trim(), 'value': option.value,
            'additionalFilter': isAdditionalFilter
          };
        }
        if (option.hasOwnProperty('tz_id')) {
          createFilter['tz_id'] = option.tz_id;
        }
        if (option.hasOwnProperty('tz_name')) {
          createFilter['tz_name'] = option.tz_name;
        }
        if (option.hasOwnProperty('customFilterKey')) {
          createFilter['customFilterKey'] = option.customFilterKey;
        }
        if (option.hasOwnProperty('isMultiDependantOn')) {
          createFilter['isMultiDependantOn'] = option.isMultiDependantOn
        }
        appliedFilters.push(createFilter);
      });
    }
    return appliedFilters;
  }

  getFilterFromStroageArray(context) {
    const filters = this.getFilterArray(context);
    return filters;
  }
  getFilterFromStroage(context) {
    const filters = this.getFilterArray(context);
    return this.getQueryString(filters);
  }

  getQueryString(filters) {
    const appliedFilters = [];
    if (filters && filters.length > 0) {
      filters.forEach(existingFilter => {
        const filterId = existingFilter.customFilterKey ? existingFilter.customFilterKey : existingFilter.filter;
        if (existingFilter.filter === 'date_range') {
          const filterValue: String = existingFilter.value;
          const splittedStr = filterValue.split(' - ', 2);
          if (splittedStr[0] && splittedStr[1]) {
            const startDateQuery = 'contest_start_date' + '=' + splittedStr[0];
            appliedFilters.push({ filter: filterId, query: startDateQuery });
            const endDateQuery = 'contest_end_date' + '=' + splittedStr[1];
            appliedFilters.push({ filter: filterId, query: endDateQuery });
          } else if (splittedStr[0]) {
            const startDateQuery = 'contest_start_date' + '=' + splittedStr[0];
            appliedFilters.push({ filter: filterId, query: startDateQuery });
          }
        } else {
          const value = encodeURIComponent(existingFilter.hasOwnProperty('id') && existingFilter.id !== null
            && existingFilter.id !== undefined && existingFilter.filter !== Constants.TROPHY_NAME ? existingFilter.id : existingFilter.value);

          const query = filterId + '=' + value;

          const clubbedFilters = appliedFilters.filter(clubbedFilter => {
            return clubbedFilter.filter === filterId;
          });
          if (clubbedFilters.length) {
            clubbedFilters[0].query += ',' + value;
          } else {
            appliedFilters.push({ filter: filterId, query: query });
          }
        }
      });
    }

    let queryString = '';
    for (let index = 0; index < appliedFilters.length; index++) {
      const element = appliedFilters[index];
      if (index === 0) {
        queryString = element.query;
      } else {
        queryString += '&' + element.query;
      }
    }
    return queryString;
  }

  getFilterFromStorageArrayLength(context) {
    const storedFilters = localStorage.getItem(this.ALL_FILTERS);
    if (storedFilters) {
      const allCompanyFilter = JSON.parse(storedFilters);
      let filters = allCompanyFilter && allCompanyFilter.filter(companyFilter => {
        return companyFilter['key'] === context;
      });
      console.log('filters', filters);
      if (filters.length) {
        return filters[0].value.length;
      }
    }
  }

  setObject(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
  }

  getObject(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  // trophyObject
  selectedTrophy(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
  }
  getselectedTrophy(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  //pin game limit reach
  setPinGameLimit(key, object) {
    localStorage.setItem(key, JSON.stringify(object))
  }

  getPinGameLimit(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  // manager first pin game
  setKeyForFirstManagerLogin(key, object) {
    localStorage.setItem(key, JSON.stringify(object))
  }

  getKeyForFirstManagerLogin(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  // get audience details
  setAudienceDetails(key, object) {
    localStorage.setItem(key, JSON.stringify(object))
  }

  getAudienceDetails(key) {
    return JSON.parse(localStorage.getItem(key));
  }
  setGameLanguage(selectedLanguage) {
    return localStorage.setItem('selectedLanguage', JSON.stringify(selectedLanguage));
  }
  getGameLanguage() {
    return JSON.parse(localStorage.getItem('selectedLanguage'));
  }
  setSelectedLanguage(selectedLanguage) {
    return localStorage.setItem('selectedLanguageObject', JSON.stringify(selectedLanguage));
  }
  getSelectedLanguage() {
    return JSON.parse(localStorage.getItem('selectedLanguageObject'));
  }
  setAllLanguage(selectedLanguage) {
    return localStorage.setItem('allLanguage', JSON.stringify(selectedLanguage));
  }
  getAllLanguage() {
    return JSON.parse(localStorage.getItem('allLanguage'));
  }

}
