import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService, ErrorCode } from './api.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class RequestManagerService {

  env_path = environment.env_path;

  constructor(public _http: HttpClient, public apiService: ApiService, public router: Router,
    public authService: StorageService) { }

  post(url: string, payload: any) {
    return this._http.post(`${this.env_path}${url}`, payload).pipe(map(res => this.validateResponse(res)));
  }

  gatewaypost(url: string, payload: any) {
    return this._http.post(`https://${url}`, payload, { headers: { api_gateway: "true" } }).pipe(map(res => this.validateResponse(res)));
  }

  put(url: string, payload: any) {
    return this._http.put(`${this.env_path}${url}`, payload).pipe(map(res => this.validateResponse(res)));
  }

  get(url: string, queryParams = '') {
    if (queryParams) {
      return this._http.get(`${this.env_path}${url}?${queryParams}`).pipe(map(res => this.validateResponse(res)));
    } else {
      return this._http.get(`${this.env_path}${url}`).pipe(map(res => this.validateResponse(res)));
    }
  }

  gatewayget(url: string, queryParams = '') {
    const headers = { 'test': 'yog' }
    if (queryParams) {
      return this._http.get(`https://${url}?${queryParams}`, { headers: { api_gateway: "true" } }).pipe(map(res => this.validateResponse(res)));
    } else {
      return this._http.get(`https://${url}`, { headers: { api_gateway: "true" } }).pipe(map(res => this.validateResponse(res)));
    }
  }



  delete(url: string) {
    return this._http.delete(`${this.env_path}${url}`).pipe(map(res => this.validateResponse(res)));
  }

  validateResponse(res) {
    const response: any = res;
    if (!response.success) {
      // 2000 - Session token expire
      if (+response.message_code === 2000) {
        console.log('Session expire');
        localStorage.clear(); // This  will redirect user to login screen
        this.router.navigate(['/login']);
        return response;
      }
      response.message_code = ErrorCode[response.message_code];
      return response;
    }
    return response;
  }
}
