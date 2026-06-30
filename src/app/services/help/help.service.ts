import { Injectable } from '@angular/core';
import { ApiService, EndPoint } from '../network/api.service';
import { RequestManagerService } from '../network/request-manager.service';


@Injectable({
  providedIn: 'root'
})
export class HelpService {

  constructor(public requestManager: RequestManagerService, public apiService: ApiService) { }


  getFaqs(startLimit, endLimit, sectionId, status, order, search) {
    const queryParams = `order=${order}&help_section_id=${sectionId}&status=${status}&search=${search}`;
    const faqs = this.requestManager.get(`${EndPoint.GET_FAQS}?start_index=${startLimit}&limit=${endLimit}&${queryParams}`);
    return faqs;
  }
  addFaq(payload) {
    return this.requestManager.post(`${EndPoint.ADD_FAQ}`, payload);

  }
  updateFaq(payload) {
    return this.requestManager.put(`${EndPoint.UPDATE_FAQ}`, payload);
  }

  deleteFaq(faq_id) {
    const faq_id1 = EndPoint.DELETE_FAQ + '?faq_id=' + faq_id.faq_id;
    return this.requestManager.delete(faq_id1);
  }

}
