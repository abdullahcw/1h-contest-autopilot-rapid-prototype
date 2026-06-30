import { TestBed } from '@angular/core/testing';
import { FeatureFlagsService, FEATURE_FLAGS } from './feature-flags.service';
import { LaunchDarklyService } from '../launchdarkly/launchdarkly.service';
import { of } from 'rxjs';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let mockLaunchDarklyService: jasmine.SpyObj<LaunchDarklyService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('LaunchDarklyService', [
      'getBooleanValue',
      'getStringValue',
      'getNumberValue',
      'getJSONValue',
      'onFlagChange',
      'isReady',
      'getInitializationStatus'
    ]);

    TestBed.configureTestingModule({
      providers: [
        FeatureFlagsService,
        { provide: LaunchDarklyService, useValue: spy }
      ]
    });

    service = TestBed.inject(FeatureFlagsService);
    mockLaunchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should listen to flag changes', () => {
    const mockObservable = of(true);
    mockLaunchDarklyService.onFlagChange.and.returnValue(mockObservable);
    
    const result = service.onFlagChange(FEATURE_FLAGS.LIMIT_MANAGER_VIEW_ACCESS, false);
    
    expect(result).toBe(mockObservable);
    expect(mockLaunchDarklyService.onFlagChange).toHaveBeenCalledWith(FEATURE_FLAGS.LIMIT_MANAGER_VIEW_ACCESS, false);
  });

  it('should check if ready', () => {
    mockLaunchDarklyService.isReady.and.returnValue(true);
    
    const result = service.isReady();
    
    expect(result).toBe(true);
    expect(mockLaunchDarklyService.isReady).toHaveBeenCalled();
  });
});
