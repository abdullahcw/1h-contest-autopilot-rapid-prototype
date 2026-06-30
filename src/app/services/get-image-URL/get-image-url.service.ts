import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GetImageURLService {
  getURL(imgOBJ: any, callback: Function): void {
    callback(null, imgOBJ?.origionalImg || '/assets/img/default.png');
  }
  getAudioURL(imgOBJ: any, callback: Function): void {
    callback(null, imgOBJ?.origionalImg || '');
  }
  trimmedURLValue(imgValue: string, ignoreCache = false): any {
    return { relatievURL: imgValue, bucket: 'stub', origionalImg: imgValue, ignore_cache: ignoreCache };
  }
  deleteCache(): void {}
  deleteSpecificCache(_key: string): void {}
  matchImageCache(_key: string, _cb: Function): void {}
  cachedImages(): any[] { return []; }
}
