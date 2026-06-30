import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { EndPoint } from '../network/api.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  constructor(public requestManager: RequestManagerService) { }

  getAccounts(payload) {
    return this.requestManager.post(EndPoint.GET_CSM_ACCOUNT, payload);
  }

  getAccountDetails(accountId) {
    const queryParams = `manager_id=${accountId}`
    return this.requestManager.get(`${EndPoint.GET_CSM_ACCOUNT_DETAILS}?${queryParams}`);
  }

  activateDeactivateAccount(payload) {
    return this.requestManager.put(EndPoint.ACTIVATE_DEACTIVATE_CSM_ACCOUNT, payload);
  }

  editAccount(payload) {
    return this.requestManager.put(EndPoint.EDIT_ACCOUNT, payload);
  }
}
