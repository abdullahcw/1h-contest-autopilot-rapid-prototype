import { TestBed } from '@angular/core/testing';
import { UserContextService, AppUser } from './user-context.service';
import { LaunchDarklyService, UserDetails } from '../launchdarkly/launchdarkly.service';
import { StorageService } from '../storage/storage.service';
import { of } from 'rxjs';

describe('UserContextService', () => {
  let service: UserContextService;
  let mockLaunchDarklyService: jasmine.SpyObj<LaunchDarklyService>;
  let mockStorageService: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const launchDarklySpy = jasmine.createSpyObj('LaunchDarklyService', [
      'isReady',
      'createUserContext',
      'createAnonymousContext',
      'identify'
    ]);

    const storageSpy = jasmine.createSpyObj('StorageService', [
      'getAccessToken',
      'getUser'
    ]);

    // Setup default mock behavior for storage - return null to simulate no logged-in user
    storageSpy.getAccessToken.and.returnValue(null);
    storageSpy.getUser.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        UserContextService,
        { provide: LaunchDarklyService, useValue: launchDarklySpy },
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(UserContextService);
    mockLaunchDarklyService = TestBed.inject(LaunchDarklyService) as jasmine.SpyObj<LaunchDarklyService>;
    mockStorageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;

    // Setup default mock behavior
    mockLaunchDarklyService.isReady.and.returnValue(true);
    mockLaunchDarklyService.identify.and.returnValue(Promise.resolve());
    mockLaunchDarklyService.createUserContext.and.returnValue({ kind: 'user', key: '123' } as any);
    mockLaunchDarklyService.createAnonymousContext.and.returnValue({ kind: 'user', key: 'anonymous' } as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update company context for logged in user', () => {
    // Setup initial logged in user
    const initialUserDetails: UserDetails = {
      managerID: 123,
      companyID: 456
    };
    service.setLoggedInUser(initialUserDetails);

    // Update company context
    const newCompanyId = 789;
    service.updateCompanyContext(newCompanyId);

    // Verify the user context was updated
    const currentUser = service.getCurrentUser();
    expect(currentUser.type).toBe('loggedIn');
    expect(currentUser.details?.managerID).toBe(123); // Manager ID should remain same
    expect(currentUser.details?.companyID).toBe(newCompanyId); // Company ID should be updated
    
    // Verify LaunchDarkly context was updated
    expect(mockLaunchDarklyService.identify).toHaveBeenCalled();
  });

  it('should not update company context for anonymous user', () => {
    // Setup anonymous user
    service.setAnonymousUser();

    // Try to update company context
    const newCompanyId = 789;
    service.updateCompanyContext(newCompanyId);

    // Verify LaunchDarkly identify was not called for anonymous user
    expect(mockLaunchDarklyService.identify).not.toHaveBeenCalled();
  });

  it('should preserve manager ID when updating company context', () => {
    // Setup initial logged in user
    const initialUserDetails: UserDetails = {
      managerID: 999,
      companyID: 111
    };
    service.setLoggedInUser(initialUserDetails);

    // Update company context multiple times
    service.updateCompanyContext(222);
    service.updateCompanyContext(333);

    // Verify manager ID is preserved throughout
    const currentUser = service.getCurrentUser();
    expect(currentUser.details?.managerID).toBe(999);
    expect(currentUser.details?.companyID).toBe(333);
  });

  it('should handle null/undefined company ID gracefully', () => {
    // Setup initial logged in user
    const initialUserDetails: UserDetails = {
      managerID: 123,
      companyID: 456
    };
    service.setLoggedInUser(initialUserDetails);

    // Try to update with null/undefined
    service.updateCompanyContext(0);
    service.updateCompanyContext(null as any);
    service.updateCompanyContext(undefined as any);

    // Should still work without errors
    expect(service).toBeTruthy();
  });

  it('should re-initialize context from storage if anonymous but user exists', () => {
    // Setup: user exists in storage
    mockStorageService.getAccessToken.and.returnValue('valid-token');
    mockStorageService.getUser.and.returnValue(JSON.stringify({
      manager_id: 555,
      company_id: 666
    }));

    // Force context to be anonymous
    service.setAnonymousUser();
    expect(service.getCurrentUser().type).toBe('anonymous');

    // Try to update company context - should re-initialize from storage
    service.updateCompanyContext(777);

    // Verify context was re-initialized and updated
    const currentUser = service.getCurrentUser();
    expect(currentUser.type).toBe('loggedIn');
    expect(currentUser.details?.managerID).toBe(555);
    expect(currentUser.details?.companyID).toBe(777);
  });
});
