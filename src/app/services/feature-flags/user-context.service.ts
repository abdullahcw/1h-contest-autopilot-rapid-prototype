import { Injectable } from '@angular/core';
import { LaunchDarklyService, UserDetails } from '../launchdarkly/launchdarkly.service';
import { LDContext } from 'launchdarkly-js-client-sdk';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';

export interface AppUser {
  type: 'anonymous' | 'loggedIn';
  details?: UserDetails;
}

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  private currentUserSubject: BehaviorSubject<AppUser>;
  public currentUser$: Observable<AppUser>;

  constructor(
    private launchDarklyService: LaunchDarklyService,
    private storageService: StorageService
  ) {
    // Initialize with actual user state from storage to prevent context being incorrectly anonymous
    const existingUser = this.getExistingUserFromStorage();
    if (existingUser) {
      this.currentUserSubject = new BehaviorSubject<AppUser>({
        type: 'loggedIn',
        details: existingUser
      });
      console.log('UserContextService initialized with logged-in user from storage');
    } else {
      this.currentUserSubject = new BehaviorSubject<AppUser>({ type: 'anonymous' });
      console.log('UserContextService initialized with anonymous user');
    }
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get existing user details from storage
   * This method uses the StorageService to check for existing logged-in users
   */
  getExistingUserFromStorage(): UserDetails | null {
    try {
      // Check if user is logged in using StorageService
      const accessToken = this.storageService.getAccessToken();
      
      if (!accessToken) {
        console.log('[UserContextService] No access token found, user is not logged in');
        return null;
      }

      // Get user details from storage
      const userData = this.storageService.getUser();
      
      // Get company details from storage - this is the source of truth for all users
      const companyData = this.storageService.getCompany();
      
      if (userData) {
        const user = JSON.parse(userData);
        
        if (user && user.manager_id) {
          // Always use company_id from company data for all users (not just super admin)
          let companyId = null;
          
          if (companyData) {
            const company = typeof companyData === 'string' ? JSON.parse(companyData) : companyData;
            if (company && company.company_id) {
              companyId = company.company_id;
              console.log(`[UserContextService] Using company_id from company data: ${companyId}`);
            }
          }
          
          // Fallback to user company_id only if no company data available
          if (!companyId) {
            companyId = user.company_id;
            console.log(`[UserContextService] No company data found, using user company_id: ${companyId}`);
          }
          
          return {
            managerID: user.manager_id,
            companyID: companyId
          };
        }
      }

      // If we have an access token but no user data, log a warning
      console.warn('[UserContextService] Access token found but user details not available in storage');
      return null;
    } catch (error) {
      console.error('[UserContextService] Error reading user from storage:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AppUser {
    return this.currentUserSubject.value;
  }

  /**
   * Set user as anonymous
   */
  setAnonymousUser(): void {
    const user: AppUser = { type: 'anonymous' };
    this.currentUserSubject.next(user);
    this.updateLaunchDarklyContext();
  }

  /**
   * Set user as logged in
   * @param userDetails User details
   */
  setLoggedInUser(userDetails: UserDetails): void {
    const user: AppUser = { 
      type: 'loggedIn', 
      details: userDetails 
    };
    this.currentUserSubject.next(user);
    this.updateLaunchDarklyContext();
  }

  /**
   * Update LaunchDarkly context when user changes
   */
  private async updateLaunchDarklyContext(): Promise<void> {
    if (!this.launchDarklyService.isReady()) {
      console.warn('[UserContextService] LaunchDarkly not ready, cannot update context');
      return;
    }

    const currentUser = this.getCurrentUser();
    let context: LDContext;

    if (currentUser.type === 'loggedIn' && currentUser.details) {
      context = this.launchDarklyService.createUserContext(currentUser.details);
    } else {
      context = this.launchDarklyService.createAnonymousContext();
    }

    try {
      await this.launchDarklyService.identify(context);
    } catch (error) {
      console.error('[UserContextService] Failed to update LaunchDarkly context:', error);
    }
  }

  /**
   * Login user and update LaunchDarkly context
   * @param managerID Manager ID
   * @param companyID Optional company ID
   */
  loginUser(managerID?: number, companyID?: number): void {
    const userDetails: UserDetails = {
      managerID,
      companyID
    };

    this.setLoggedInUser(userDetails);
  }

  /**
   * Logout user and set as anonymous
   */
  logoutUser(): void {
    this.setAnonymousUser();
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.getCurrentUser().type === 'loggedIn';
  }

  /**
   * Get user details if logged in
   */
  getUserDetails(): UserDetails | undefined {
    const user = this.getCurrentUser();
    return user.type === 'loggedIn' ? user.details : undefined;
  }

  /**
   * Update company context for super admin company switching
   * @param companyID New company ID to set in context
   */
  updateCompanyContext(companyID: number): void {
    let currentUser = this.getCurrentUser();
    
    // Defensive check: if context is anonymous but user exists in storage, re-initialize
    if (currentUser.type === 'anonymous') {
      const existingUser = this.getExistingUserFromStorage();
      if (existingUser) {
        console.warn('[UserContextService] Re-initializing anonymous context from storage');
        this.setLoggedInUser(existingUser);
        currentUser = this.getCurrentUser();
      }
    }
    
    // Only update if user is logged in
    if (currentUser.type === 'loggedIn' && currentUser.details) {
      const oldCompanyID = currentUser.details.companyID;
      const updatedUserDetails: UserDetails = {
        managerID: currentUser.details.managerID,
        companyID: companyID
      };
      
      console.log(`[UserContextService] Updating company context from ${oldCompanyID} to ${companyID}`);
      
      // Update the user with new company context
      this.setLoggedInUser(updatedUserDetails);
    } else {
      console.warn('[UserContextService] Cannot update company context: user not logged in');
    }
  }
}
