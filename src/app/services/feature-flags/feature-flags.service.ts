import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LaunchDarklyService } from '../launchdarkly/launchdarkly.service';

// Define feature flag keys as constants
export const FEATURE_FLAGS = {
  MID_MANAGER_SCOPE_ENHANCEMENT : 'web-admin-midManagerScopeEnhancement-perm'
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  constructor(private launchDarklyService: LaunchDarklyService) {}

  /**
   * Check if a feature flag is enabled
   * @param flagKey The feature flag key
   * @param defaultValue Default value if flag is not found
   */
  isEnabled(flagKey: FeatureFlagKey, defaultValue: boolean = false): boolean {
    return this.launchDarklyService.getBooleanValue(flagKey, defaultValue);
  }

  /**
   * Get a string feature flag value
   * @param flagKey The feature flag key
   * @param defaultValue Default value if flag is not found
   */
  getStringValue(flagKey: FeatureFlagKey, defaultValue: string = ''): string {
    return this.launchDarklyService.getStringValue(flagKey, defaultValue);
  }

  /**
   * Get a number feature flag value
   * @param flagKey The feature flag key
   * @param defaultValue Default value if flag is not found
   */
  getNumberValue(flagKey: FeatureFlagKey, defaultValue: number = 0): number {
    return this.launchDarklyService.getNumberValue(flagKey, defaultValue);
  }

  /**
   * Get a JSON feature flag value
   * @param flagKey The feature flag key
   * @param defaultValue Default value if flag is not found
   */
  getJSONValue<T>(flagKey: FeatureFlagKey, defaultValue: T): T {
    return this.launchDarklyService.getJSONValue(flagKey, defaultValue);
  }

  /**
   * Listen to feature flag changes
   * @param flagKey The feature flag key
   * @param defaultValue Default value if flag is not found
   */
  onFlagChange<T>(flagKey: FeatureFlagKey, defaultValue: T): Observable<T> {
    return this.launchDarklyService.onFlagChange(flagKey, defaultValue);
  }

  /**
   * Check if LaunchDarkly is ready
   */
  isReady(): boolean {
    return this.launchDarklyService.isReady();
  }

  isMidManagerScopeEnhancementEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAGS.MID_MANAGER_SCOPE_ENHANCEMENT, false);
  }
}
