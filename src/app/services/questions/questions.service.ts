import { Injectable } from '@angular/core';
import { RequestManagerService } from '../network/request-manager.service';
import { ApiService, EndPoint } from '../network/api.service';
import { UploaderService } from '../uploader/uploader.service';
import { GlobalService } from '../global/global.service';

export class Question {
  question_id: number;
  name: string;
}

export const QuestionType = {
  SINGLE_CHOICE: 'Short Answer',
  YES_NO: 'Yes/No',
  MULTIPLE_CHOICE: 'Multiple Choice'
};

export const answerOptionsType = {
  RANDOM: "Random",
  SHORT_ANSWER: "Short answer",
  TWO_ANSWER: "2 answer Option",
  THREE_ANSWER: "3 answer Option",
  FOUR_ANSWER: "4 answer Option",
};
export const QuestionState = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

@Injectable({
  providedIn: 'root'
})
export class QuestionsService {

  constructor(public requestManager: RequestManagerService, 
    public apiService: ApiService,
    public globalService: GlobalService,
    public uploaderService: UploaderService) { }

  getQuestions(sortBy, order, startLimit, endLimit, filters, companyId, gameId = null) {
    let queryParams;
    if (!gameId) {
      queryParams = `start_index=${startLimit}&limit=${endLimit}&sort_by=${sortBy}&order=${order}&company_id=${companyId}`;
    } else {
      queryParams = `sort_by=${sortBy}&order=${order}&company_id=${companyId}&game_id=${gameId}`;
    }
    // console.log('sort order', filters);
    if (filters) {
      queryParams += `&${filters}`;
    }
    const url = `${EndPoint.GET_QUESTIONS}`;
    return this.requestManager.get(url, queryParams);
  }

  saveQuestion(question, companyId, gameId, categoryId) {
    console.log('save que',question);
    const payload = {
      'question_title': question.question_title,
      'game_id': +gameId,
      'category_id': +categoryId,
      'answer': question.answer,
      'points': +question.points,
      'time': +question.time,
      'question_type': +question.question_type,
      'company_id': +companyId,
      'tag_keywords': question.tag_keywords,
      'answer_option_type': question.answer_option_type,
    };
    question.game_type == 1 ? payload['lang_id'] = question['language'].id :  payload['lang_id'] = 1;

    if (question.copy_assets) {
      payload['copy_assets'] = question.copy_assets;
    }
    if (question.question_image && !question.blob) {
      payload['question_image'] = question.question_image;
    }
    if (question.question_audio && !question.question_audio_file) {
      payload['question_audio_key'] = question.question_audio;
    }


    if (question.question_id && !question.is_clone) {
      this.globalService.addGoogleEvent('Update_Question_Card' , 'Game Builder-Single level', question['language'].code , '');
      payload['question_id'] = question.question_id;
      return this.requestManager.put(`${EndPoint.UPDATE_QUESTION}`, payload);
    } else {
      // Add_Question_Card
      this.globalService.addGoogleEvent('Add_Question_Card' , 'Game Builder-Single level', question['language'].code , '');
      return this.requestManager.post(`${EndPoint.ADD_QUESTION}`, payload);
    }
  }
  


  updateQuestionsState(payload) {
    return this.requestManager.post(`${EndPoint.UPDATE_QUESTIONS_STATE}`, payload);
  }


  getUrlToDowload(companyId, filters) {
    let queryParams = '';
    if (companyId) {
      queryParams += `sort_by=${'question_title'}&order=${'asc'}&company_id=${companyId}`;
    }
    if (filters) {
      queryParams += `&${filters}`;
    }
    // tslint:disable-next-line:max-line-length
    return this.requestManager.get(`${EndPoint.DOWNLOAD_QUESTIONS}?${queryParams}`);
  }

}
