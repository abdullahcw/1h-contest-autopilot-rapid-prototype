import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UserDetails {
  managerID?: number;
  companyID?: number;
}

@Injectable({ providedIn: 'root' })
export class LaunchDarklyService {
  isInitialized = true;
  async initialize(_opts: any): Promise<void> {}
  isReady(): boolean { return true; }
  getInitializationStatus(): Observable<boolean> { return of(true); }
  getBooleanValue(flagKey: string, defaultValue: boolean = false): boolean {
    if (flagKey === 'web-admin-midManagerScopeEnhancement-perm') return true;
    return defaultValue;
  }
  getStringValue(_k: string, def: string = ''): string { return def; }
  getNumberValue(_k: string, def: number = 0): number { return def; }
  getJSONValue(_k: string, def: any): any { return def; }
  onFlagChange(_k: string, def: any): Observable<any> { return of(def); }
  createUserContext(_u: any): any { return { kind: 'user', key: 'stub' }; }
  createAnonymousContext(): any { return { kind: 'user', key: 'anonymous-user', anonymous: true }; }
  async identify(_ctx: any): Promise<void> {}
  track(_event: string): void {}
  close(): void {}
}
