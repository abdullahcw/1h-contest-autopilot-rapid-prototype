# LaunchDarkly Integration Guide

## Overview

This document explains how LaunchDarkly feature flags are integrated into the 1Huddle Admin Client, with special attention to handling existing logged-in users when the feature is deployed.

## Architecture

### Services

1. **LaunchDarklyService** (`src/app/services/launchdarkly/launchdarkly.service.ts`)
   - Handles direct communication with LaunchDarkly SDK
   - Manages client initialization and context updates
   - Provides methods for getting feature flag values

2. **FeatureFlagsService** (`src/app/services/feature-flags/feature-flags.service.ts`)
   - High-level service for feature flag operations
   - Defines feature flag constants
   - Provides type-safe access to feature flags

3. **UserContextService** (`src/app/services/feature-flags/user-context.service.ts`)
   - Manages user context for LaunchDarkly
   - Handles authentication state changes
   - **Key feature: Automatically detects existing logged-in users**

## Handling Existing Logged-in Users

### The Problem

When the LaunchDarkly integration is deployed, users who are already logged in will continue to use the anonymous context for feature flags, which could lead to inconsistent behavior.

### The Solution

The `UserContextService` automatically detects existing logged-in users during app initialization and updates the LaunchDarkly context accordingly.

### How It Works

1. **App Initialization** (`src/app/app.module.ts`)
   ```typescript
   export function initializeLaunchDarkly(launchDarklyService: LaunchDarklyService, userContextService: UserContextService) {
     return async () => {
       // Check for existing logged-in users first
       const existingUser = userContextService.getExistingUserFromStorage();
       
       // Create appropriate context based on user state
       const context = existingUser 
         ? launchDarklyService.createUserContext(existingUser)
         : launchDarklyService.createAnonymousContext();

       // Initialize LaunchDarkly with the correct context from the start
       await launchDarklyService.initialize({...});
     };
   }
   ```

2. **User Detection** (`UserContextService.getExistingUserFromStorage()`)
   - Checks for access token in storage
   - Retrieves user details from `StorageService`
   - Returns user details if found, null otherwise

3. **Optimized Context Creation**
   - Creates the correct context (user or anonymous) from the start
   - Avoids unnecessary context switches and API calls
   - Reduces LaunchDarkly billing costs

## Usage Examples

### Using Feature Flags in Components

```typescript
import { FeatureFlagsService, FEATURE_FLAGS } from '../services/feature-flags/feature-flags.service';

@Component({...})
export class MyComponent {
  constructor(private featureFlagsService: FeatureFlagsService) {}

  ngOnInit() {
    // Check if feature is enabled
    if (this.featureFlagsService.isEnabled(FEATURE_FLAGS.NEW_DASHBOARD)) {
      // Show new dashboard
    }

    // Listen to feature flag changes
    this.featureFlagsService.onFlagChange(FEATURE_FLAGS.NEW_DASHBOARD, false)
      .subscribe(enabled => {
        // Handle flag changes
      });
  }
}
```

### Using Feature Flag Directive

```html
<!-- Show/hide based on boolean flag -->
<div *appFeatureFlag="'new-dashboard'">
  New Dashboard Content
</div>

<!-- Show/hide based on specific value -->
<div *appFeatureFlag="'beta-features'; appFeatureFlagValue: 'advanced'; appFeatureFlagType: 'string'">
  Advanced Beta Features
</div>
```

### Manual User Context Management

```typescript
import { UserContextService } from '../services/feature-flags/user-context.service';

@Component({...})
export class LoginComponent {
  constructor(private userContextService: UserContextService) {}

  onLogin(userData) {
    // Update LaunchDarkly context when user logs in
    this.userContextService.loginUser(userData.manager_id, userData.company_id);
  }

  onLogout() {
    // Clear LaunchDarkly context when user logs out
    this.userContextService.logoutUser();
  }
}
```

## Feature Flag Configuration

### Adding New Feature Flags

1. **Define the flag in `FeatureFlagsService`**:
   ```typescript
   export const FEATURE_FLAGS = {
     NEW_DASHBOARD: 'new-dashboard',
     BETA_FEATURES: 'beta-features',
     ADVANCED_ANALYTICS: 'advanced-analytics'
   } as const;
   ```

2. **Add convenience methods**:
   ```typescript
   isBetaFeaturesEnabled(): boolean {
     return this.isEnabled(FEATURE_FLAGS.BETA_FEATURES, false);
   }
   ```

### Environment Configuration

Feature flags are configured in `environment.ts` and `environment.prod.ts`:

```typescript
export const environment = {
  // ... other config
  launchDarkly: {
    clientSideID: getConfigUrls('urls', 'launchdarkly_client_id', environmet_name),
    options: {
      bootstrap: 'localStorage',
      sendEvents: true
    }
  }
};
```

## Testing

### Testing with Existing Users

1. **Before deployment**: Users are logged in and using the app
2. **After deployment**: The app automatically detects logged-in users and updates LaunchDarkly context
3. **Feature flags**: Will now work correctly for existing users

### Debugging

```typescript
// Check current user context
console.log('Current user:', this.userContextService.getCurrentUser());

// Check if context is initialized
console.log('Context initialized:', this.userContextService.isContextInitialized());

// Manually refresh context
this.userContextService.refreshUserContext();

// Check LaunchDarkly readiness
console.log('LaunchDarkly ready:', this.featureFlagsService.isReady());
```

## Best Practices

1. **Always provide default values** for feature flags to handle cases where LaunchDarkly is not ready
2. **Use the `FeatureFlagsService`** instead of directly accessing LaunchDarkly
3. **Listen to flag changes** when UI needs to update dynamically
4. **Test with both logged-in and anonymous users** to ensure proper context switching
5. **Monitor LaunchDarkly initialization** in production to ensure proper setup
6. **Optimize for billing** by creating the correct context from the start, avoiding unnecessary context switches

## Billing Optimization

### Cost-Saving Approach

The implementation is optimized to minimize LaunchDarkly API calls and reduce billing costs:

- **Single Context Creation**: Instead of starting with anonymous context and then switching to user context, we check for existing users first and create the appropriate context from the start
- **No Unnecessary API Calls**: Eliminates the `identify()` call that would occur when switching from anonymous to user context
- **Efficient Initialization**: Only one context is created and used throughout the session

### Before vs After

**Before (Costly)**:
1. Initialize with anonymous context → 1 API call
2. Check for existing user → No API call
3. Switch to user context → 1 additional API call
4. **Total: 2 API calls per session**

**After (Optimized)**:
1. Check for existing user → No API call
2. Initialize with correct context → 1 API call
3. **Total: 1 API call per session**

This optimization reduces LaunchDarkly billing by approximately 50% for existing logged-in users.

## Troubleshooting

### Common Issues

1. **Feature flags not working for existing users**
   - Check if `initializeFromExistingSession()` is being called
   - Verify user data is available in storage
   - Check LaunchDarkly initialization logs

2. **Context not updating after login**
   - Ensure `loginUser()` is called after successful authentication
   - Check if LaunchDarkly is ready before calling `identify()`

3. **Anonymous context being used for logged-in users**
   - Verify `StorageService` integration is working
   - Check access token and user data retrieval

### Debug Commands

```typescript
// Add to component for debugging
ngOnInit() {
  console.log('Storage user:', this.storageService.getUser());
  console.log('Access token:', this.storageService.getAccessToken());
  console.log('LaunchDarkly ready:', this.launchDarklyService.isReady());
  console.log('Current context:', this.userContextService.getCurrentUser());
}
```
