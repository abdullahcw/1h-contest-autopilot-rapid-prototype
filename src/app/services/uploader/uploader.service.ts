import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploaderService {
  progress: any = { count: 0 };
  public uploadingProgress = new Subject<any>();

  upload(path: string, _blobedImage: any, callback: Function, _showProgress = true, _uploadTitle = '', _updateHeaders = '', _is_static = false): void {
    callback(null, { Location: `https://fake-cdn.1huddle.co/${path}` });
  }

  uploadPrivateCSV(path: string, _blobedImage: any, callback: Function, _showProgress = true, _uploadTitle = '', _updateHeaders = ''): void {
    callback(null, { Location: `https://fake-cdn.1huddle.co/private/${path}` });
  }

  assignValue(value: number): void {
    if (value <= 100) { this.progress.count = Math.round(value); }
  }
}
