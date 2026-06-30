import { Injectable, EventEmitter } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';
import { UploaderService } from '../uploader/uploader.service';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CompanyService {


  selectedCompany = null;
  fields: any;
  customFields: any;
  // Notify company search fellow about deleted company
  notifyCompanyListUpdated = new Subject<any>();
  onFieldsFetched = new EventEmitter();
  onCustomFieldsFetched = new EventEmitter();

  constructor(public requestManager: RequestManagerService, public apiService: ApiService,
    public uploaderService: UploaderService) {
  }

  getCompanies(sortBy, order, startLimit, endLimit, filters , include_details = true) {
    console.log('entering get companies');
    let queryParams = '';
    if (filters) {
      queryParams += `sort_by=${sortBy}&order=${order}&${filters}`;
    } else {
      queryParams = `sort_by=${sortBy}&order=${order}&include_details=${include_details}`;
    }
    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.GET_COMPANIES}?start_index=${startLimit}&limit=${endLimit}&${queryParams}`);
  }

  getCompanyDetails(companyId) {
    return this.requestManager.get(`${EndPoint.COMPANY_DETAILS}?company_id=${companyId}`);
  }
  getCompnayStatistics(companyId) {
    return this.requestManager.get(`${EndPoint.GET_COMPANY_STATISTICS}?company_id=${companyId}`);
  }

  loadFields(companyId) {
    console.log('dasdasdsad');
    const request = this.requestManager.get(`${EndPoint.GET_FIELDS}?company_id=${companyId}`);
    request.subscribe(res => {
      console.log('fieldss', res);
      if (res.success) {
        this.fields = res.data.fields;
        if (this.fields) {
          this.onFieldsFetched.emit(this.fields);
        }
      }
    });
    return request;
  }

  getFields(isManagerFilterOptionRequired = false) {
    if (!isManagerFilterOptionRequired && this.fields && this.fields.length) {
      const requiredFIlterOptions = this.fields.filter((field) => field.key_id !== -1);
      this.fields = requiredFIlterOptions;
    }
    return this.fields;
  }

  getValues(field, companyId, searchText = null) {
    let queryParams = '';
    if (searchText) {
      queryParams += `key_id=${field}&company_id=${companyId}&start_index=0&limit=100&${searchText}`;
    } else {
      queryParams += `key_id=${field}&company_id=${companyId}&start_index=0&limit=100`;
    }
    return this.requestManager.get(`${EndPoint.GET_VALUES}?${queryParams}`);
  }



  addCompany(payload) {
    return this.requestManager.post(EndPoint.ADD_COMPANY, payload);
  }
  updateShopForPlayers(payload) {
    return this.requestManager.post(EndPoint.UPDATE_SHOP_FOR_PLAYERS, payload);
  }

  deleteCompany(companyId) {
    return this.requestManager.delete(`${EndPoint.DELETE_COMPANY}?company_id=${companyId}`);
  }

  uploadCompanyLogo(newLogoImage, callback) {
    this.uploaderService.upload(newLogoImage.path, newLogoImage.blob, function (err, data) {
      console.log(data);
      let location;
      if (data) {
        location = data.Location;
      }
      callback(location);
    },true,'Uploading...','',true);
  }

  updateCompany(company) {
    return this.requestManager.put(EndPoint.UPDATE_COMPANY, company);
  }

  setSelectedcompany(company) {
    this.selectedCompany = company;
  }

  removeEmptyFields(obj) {
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

  getBranding(companyId) {
    return this.requestManager.get(`${EndPoint.GET_BRANDING}?company_id=${companyId}`);
  }
  getCSR() {
    return this.requestManager.get(`${EndPoint.GET_CSR}`);
  }
  getSDR() {
    return this.requestManager.get(`${EndPoint.GET_SDR}`);
  }

  updateBranding(payload) {
    return this.requestManager.put(EndPoint.UPDATE_BRANDING, payload);
  }

  deleteAsset(listId, companyId) {
    const payload = { 'list_ids': [listId], 'company_id': companyId };
    return this.requestManager.post(EndPoint.DELETE_ASSET, payload);
  }

  notifiyCompanySearchModule(companyId = 0) {
    this.notifyCompanyListUpdated.next(companyId);
  }

  checkUsageLimit(companyId, check_limit_for) {
    return this.requestManager.get(`${EndPoint.CHECK_USAGE_LIMIT}?company_id=${companyId}&check_limit_for=${check_limit_for}`);
  }

  // company custom fields
  loadCustomFields(companyId) {
    console.log('loadCustomFields');
    const request = this.requestManager.get(`${EndPoint.GET_CUSTOM_FIELDS}?company_id=${companyId}`);
    request.subscribe(res => {
      console.log('fieldss', res);
      if (res.success) {
        this.customFields = res.data.fields;
        if (this.customFields) {
          this.onCustomFieldsFetched.emit(this.customFields);
        }
      }
    });
    return request;
  }
  getCustomFieldsValues(field, companyId, searchText = null) {
    let queryParams = '';
    if (searchText) {
      queryParams += `key_id=${field}&company_id=${companyId}&start_index=0&limit=100&${searchText}`;
    } else {
      queryParams += `key_id=${field}&company_id=${companyId}&start_index=0&limit=2000`;
    }
    return this.requestManager.get(`${EndPoint.GET_CUSTOM_FIELDS_VALUES}?${queryParams}`);
  }
  getCustomFields() {
    return this.customFields;
  }

  getCompanyCustomFields(companyId) {
    return this.requestManager.get(`${EndPoint.GET_CUSTOM_FIELDS}?company_id=${companyId}`);
  }

  getCompaniesListDetails(isAllCompanies) {    
    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.COMPANIES_LIST_DETAILS}?is_shop_enabled=${isAllCompanies}`);
  }
}
export enum ACCOUNT_TYPE {
  TRIAL = 'TRIAL',
  PAID = 'PAID'
}

export enum AI_ASSIST_TYPE {
  AI_ASSIST = 'AI_ASSIST',
  AI_ASSIST_PLUS = 'AI_ASSIST_PLUS'
}
