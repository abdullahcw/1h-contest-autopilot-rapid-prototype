# 1Huddle Admin — Strip Plan

> **Goal:** Remove every external service dependency (Firebase, AWS S3, LaunchDarkly, real auth) 
> so the app runs fully locally with faker data. Every stripped item maps to a concrete faker replacement.
> Source: `1huddle-admin-client-fresh` → stripped into this repo.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## Execution Order (follow this sequence — later steps depend on earlier ones)

1. `environment.ts` — set `env_path: ''` so all URLs become relative
2. Stub `LaunchDarklyService` — must happen before `APP_INITIALIZER` can be removed
3. `app.module.ts` — remove `APP_INITIALIZER` block for LaunchDarkly
4. `app-routing.module.ts` — remove `ActivateAppResolver` and `AuthResolveService` from all routes
5. Stub `PermissionsService` — pre-set `permissions` and `awsTokens` in constructor
6. Stub `GlobalService` — kill Firebase init and analytics no-ops
7. Seed `localStorage` in `AppComponent.ngOnInit()`
8. Stub `GetImageURLService` — kill S3 signed URL calls
9. Stub `UploaderService` — kill S3 upload calls
10. Hollow out `InterceptorService.intercept()` — passthrough only
11. Add `FakerInterceptor` to `app.module.ts` providers
12. `ng serve` — fix remaining compile/runtime errors screen by screen

---

## 1. Boot Chain

### [ ] APP_INITIALIZER — LaunchDarkly init
**File:** `src/app/app.module.ts`
**What it does:** Blocks app startup with a network call to LaunchDarkly servers before any route loads.
**Strip action:** Delete this entire block from `providers[]` and delete the `initializeLaunchDarkly()` function:
```ts
// DELETE:
{
  provide: APP_INITIALIZER,
  useFactory: initializeLaunchDarkly,
  deps: [LaunchDarklyService, UserContextService],
  multi: true
}
```
**Faker replacement:** None — LD is stubbed separately.

### [ ] ActivateAppResolver — THE main blocker
**File:** `src/app/util/resolver/activateApp.resolver.ts`
**What it does:** Before any `/admin/*` route loads — hits `GET /v3.0/resources/config`, then Firebase Remote Config to fetch RSA private key, then decrypts AWS credentials with JSEncrypt. App shows blank screen until this resolves (or crashes).
**Strip action:**
```ts
// app-routing.module.ts line 25 — BEFORE:
{ path: 'admin', loadChildren: ..., resolve: { message: ActivateAppResolver } }
// AFTER:
{ path: 'admin', loadChildren: ... }
```
Also remove from `providers: [ActivateAppResolver]`. Delete the resolver file.
**Faker replacement:** `PermissionsService.awsTokens` pre-set in constructor (see §5).

### [ ] AuthResolveService
**File:** `src/app/services/resolve/auth-resolve.service.ts`
**What it does:** Resolver on root `''` path — checks localStorage for valid session, redirects to `/login` if absent.
**Strip action:** Remove `resolve: { checkValidation: AuthResolveService }` from root path in routing. Pre-seed localStorage (see §6).
**Faker replacement:** localStorage seed.

### [ ] environment.ts — real API URLs
**File:** `src/environments/environment.ts`
**What it does:** `env_path` resolves to `'https://stg-api.1huddle.co'` — prepended to every API call in `RequestManagerService`.
**Strip action:**
```ts
export const environment = {
  production: false,
  env_path: '',                    // was: 'https://stg-api.1huddle.co'
  firebaseConfig: {},              // was: real firebase config
  launchDarkly: { clientSideID: '', options: {} },
  // leave other keys — they won't be reached with faker interceptor
};
```
**Faker replacement:** FakerInterceptor catches all relative-path requests.

---

## 2. Firebase

### [ ] GlobalService — Firebase init + analytics
**File:** `src/app/services/global/global.service.ts`
**What it does:** `InitilizeApp()` calls `firebase.initializeApp()`, `firebase.analytics()`, `firebase.remoteConfig()`. `addAdminGoogleEvent()` fires `firebase.analytics().logEvent()` — called 15+ times per screen.
**Strip action:** Stub these methods to no-ops:
```ts
InitilizeApp(): void {}
addGoogleEvent(eventName: string, category?: string, label?: string, method?: string): void {}
addAdminGoogleEvent(key: string, method?: string): void {}
fetchTutorialVideo(): void {
  this.tutorialVideo = { BUILD_GAME:'', CREATE_CONTEST:'', LOGIN_ADD_USER:'',
    RUN_REPORTS:'', ADD_TROPHIES:'', EXPLORE_SHOP_GAME:'', CREATE_GAME_IN_MIN:'',
    FREE_CREDIT_OFFER:'', GET_STARTED:'', NEW_GAME_FORMAT:'' };
}
```
**Faker replacement:** All analytics silently dropped.

### [ ] PermissionsService — Firebase Remote Config call
**File:** `src/app/services/permissions/permissions.service.ts`
**What it does:** `setAWSResponse()` is the only place Firebase Remote Config is called — fetches RSA key to decrypt AWS credentials.
**Strip action:** Stub `setAWSResponse()` to a no-op. Pre-set `awsTokens` in constructor (see §5).
**Faker replacement:** Fake AWS token object.

---

## 3. HTTP Interceptor

### [ ] InterceptorService
**File:** `src/app/services/interceptor/interceptor.service.ts`
**What it does:** Injects `api-key`, `api-secret`, `session-token`, `user-type`, `platform`, `locale`, `x-api-key` headers on every request. Redirects to `/login` on 401 or specific message_codes.
**Strip action:** Replace `intercept()` body entirely:
```ts
intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  return next.handle(request);
}
```
Remove now-unused imports inside the class.
**Faker replacement:** FakerInterceptor handles responses before they reach the network.

---

## 4. LaunchDarkly

### [ ] LaunchDarklyService
**File:** `src/app/services/launchdarkly/launchdarkly.service.ts`
**What it does:** Full LD SDK wrapper making outbound connections on init and every flag evaluation.
**Strip action:** Replace the entire class body:
```ts
@Injectable({ providedIn: 'root' })
export class LaunchDarklyService {
  isInitialized = true;
  async initialize(_opts: any): Promise<void> {}
  isReady(): boolean { return true; }
  getBooleanValue(flagKey: string, defaultValue: boolean): boolean {
    if (flagKey === 'web-admin-midManagerScopeEnhancement-perm') return true;
    return defaultValue;
  }
  getStringValue(_k: string, def: string): string { return def; }
  getNumberValue(_k: string, def: number): number { return def; }
  getJSONValue(_k: string, def: any): any { return def; }
  onFlagChange(_k: string, def: any) { return of(def); }
  createUserContext(_u: any): any { return {}; }
  createAnonymousContext(): any { return { kind: 'user', anonymous: true }; }
  identify(_ctx: any): Promise<void> { return Promise.resolve(); }
  track(_event: string): void {}
  close(): void {}
}
```
**Faker replacement:** Flag `web-admin-midManagerScopeEnhancement-perm` → `true`; all others return `defaultValue`.

### [ ] FeatureFlagsService
**File:** `src/app/services/feature-flags/feature-flags.service.ts`
**What it does:** Thin facade over LaunchDarklyService.
**Strip action:** No changes needed — inherits from LD stub. Optionally hardcode `isMidManagerScopeEnhancementEnabled()` to `return true`.

---

## 5. Permissions Service

### [ ] PermissionsService
**File:** `src/app/services/permissions/permissions.service.ts`
**What it does:** Makes 3 HTTP calls (`get_user_information`, `get_permissions`, `resources/config`) + Firebase Remote Config + JSEncrypt RSA decryption. Sets `this.permissions` and `this.awsTokens`.
**Strip action:** Pre-set both in the constructor, stub all HTTP methods:
```ts
constructor() {
  this.permissions = {
    company: { list:true, create:true, update:true, delete:true, list_all:true },
    game:    { list:true, create:true, update:true, delete:true },
    contest: { list:true, create:true, update:true, delete:true },
    player:  { list:true, create:true, update:true, delete:true },
    manager: { list:true, create:true, update:true, delete:true },
    report:  { list:true, create:true, update:true, delete:true },
  };
  this.awsTokens = {
    access_key:'FAKE', secret_key:'FAKE', region:'us-east-1',
    bucket_name:'fake-bucket', bucket_name_static:'fake-static',
    base_url:'https://fake.s3.amazonaws.com/',
    base_url_static:'https://fake-static.s3.amazonaws.com/',
    admin_access_key:'FAKE', admin_secret_key:'FAKE',
    presign_timeout:'604800', expired_on:''
  };
}
getUserPermissions(): Observable<any> { return of({ success:true, data:{} }); }
getAWSConfig(): Observable<any> { return of({ success:true, data:{} }); }
setAWSResponse(_res: any, _key: any): void {}
```
**Faker replacement:** All permission checks (`canDo()`, `hasAccess()`, etc.) evaluate to `true`.

---

## 6. Storage Service / localStorage Seed

### [ ] StorageService + localStorage bootstrap
**File:** `src/app/services/storage/storage.service.ts`
**What it does:** Thin localStorage wrapper — no network calls. App reads auth state from it constantly.
**Strip action:** Keep the class as-is. In `AppComponent.ngOnInit()` add:
```ts
ngOnInit(): void {
  if (!localStorage.getItem('accessToken')) {
    localStorage.setItem('accessToken', 'fake-session-token-abc123');
    localStorage.setItem('accessType', 'A');
    localStorage.setItem('user', JSON.stringify({
      access_type:'A', company_id:1, manager_id:42,
      first_name:'John', last_name:'Doe', email:'john.doe@1huddle.co',
      is_company_with_custom_fields:false, is_custom:false
    }));
    localStorage.setItem('company_data', JSON.stringify({
      company_id:1, company_name:'Faker Corp',
      is_sso_company:false, is_custom:false
    }));
    localStorage.setItem('post_login', 'true');
  }
}
```
**Faker replacement:** `company_id: 1` flows through the entire app.

---

## 7. Signed URL Directive (S3 Images)

### [ ] appSignedUrl + GetImageURLService
**Files:** `src/app/util/signedUrl/signed-url.directive.ts`, `src/app/services/get-image-URL/get-image-url.service.ts`
**What it does:** Every `<img [appSignedUrl]="url">` calls AWS SDK `s3.getSignedUrl()`. Used in **23 files / 37 usages**.
**Strip action — stub the service (no template changes):**
```ts
getURL(imgOBJ: any, callback: Function): void {
  callback(null, imgOBJ?.origionalImg || '/assets/img/default.png');
}
getAudioURL(imgOBJ: any, callback: Function): void {
  callback(null, imgOBJ?.origionalImg || '');
}
trimmedURLValue(imgValue: string, ignoreCache = false): any {
  return { relatievURL: imgValue, bucket:'stub', origionalImg: imgValue, ignore_cache: ignoreCache };
}
deleteCache(): void {}
deleteSpecificCache(_key: string): void {}
matchImageCache(_key: string, _cb: Function): void {}
cachedImages(): any[] { return []; }
```
**Faker replacement:** Images fall back to `onError="this.src='/assets/img/default.png'"` (already on most `<img>` tags).

---

## 8. Uploader Service

### [ ] UploaderService
**File:** `src/app/services/uploader/uploader.service.ts`
**What it does:** Uses `aws-sdk` S3 directly to upload files to S3 buckets.
**Strip action:**
```ts
upload(file: File, fileName: string, callback: Function): void {
  callback(null, { Location: `https://fake-cdn.1huddle.co/${fileName}` });
}
uploadPrivateCSV(file: File, fileName: string, callback: Function): void {
  callback(null, { Location: `https://fake-cdn.1huddle.co/private/${fileName}` });
}
```
**Faker replacement:** Immediate fake upload URL returned synchronously.

---

## 9. Analytics

### [ ] Google Analytics / Firebase Analytics
Already covered in §2 (GlobalService). No separate action needed.

---

## 10. ngx-translate

### ✅ NO CHANGES NEEDED
The `translate` pipe reads `/assets/i18n/en.json` — a **local file bundled with the app** served by Angular's dev server. 1621 template usages all work fully offline. Keep `TranslateModule.forRoot()` in `app.module.ts` exactly as-is.

---

## 11. FakerInterceptor

### [ ] Register FakerInterceptor
Add to `app.module.ts` providers:
```ts
{ provide: HTTP_INTERCEPTORS, useClass: FakerInterceptor, multi: true }
```
Copy `faker.interceptor.ts`, `contest.factory.ts`, `game.factory.ts` from the prototype at:
`/Users/guestuser/Documents/GitHub/rapid-prototyping/1huddle-contest-autopilot/app/src/app/core/`

### URL → Fixture Map

| URL pattern | Method | Returns |
|---|---|---|
| `contest/retrieve_contests` | GET | `{ contest_list: Contest[], total_contest: N }` |
| `contest/contest_details` | GET | `Contest` |
| `contest/retrieve_contest_games` | GET | `{ contest_game_list: ContestGame[] }` |
| `contest/add` | POST | `{ success:true }` |
| `contest/update` | POST | `{ success:true }` |
| `contest/publish` | POST | `{ success:true }` |
| `contest/add_game` | POST | `{ success:true }` |
| `contest/update_games` | POST | `{ success:true }` |
| `contest/forced_close` | POST | `{ success:true }` |
| `contest/ready_to_draft` | POST | `{ success:true }` |
| `contest/delete` | POST | `{ success:true }` |
| `contest/copy_contest` | POST | `{ success:true }` |
| `game/retrieve_games` | POST | `{ game_list: Game[], total_game: N }` ← v3.0 POST form |
| `game/retrieve_game` | GET | `{ game_list: Game[], total_game: N }` ← v1.6 GET form |
| `game/get_pinned_games` | GET/POST | `{ pinned_games: [] }` |
| `game/add` | POST | `{ success:true }` |
| `game/update` | POST | `{ success:true }` |
| `game/delete` | POST | `{ success:true }` |
| `game/archive` | POST | `{ success:true }` |
| `game/pin` | POST | `{ success:true }` |
| `game/copy_game` | POST | `{ success:true }` |
| `slg/get_limits` | GET | `{ game_schedule_list: [] }` |
| `game_schedule/get_limits` | GET | `{ game_schedule_list: [] }` |
| `users/get_user_information` | GET | `{ user: FakeUser }` |
| `auth/get_permissions` | GET | `{ permissions: {} }` |
| `resources/config` | GET | `{ success:true, data:{} }` |
| `manager/retrieve_game_owners` | GET | `{ manager_list: [] }` |
| `get/help/videos` | GET | `{ data:{} }` |

### Factory files needed
- `contest.factory.ts` — ✅ already built in prototype
- `game.factory.ts` — ✅ already built in prototype
- `user.factory.ts` — new: fake user + company profile
- `permissions.factory.ts` — new: all-true permissions object

---

## 12. What to Keep (do NOT touch)

| Item | Reason |
|---|---|
| All component HTML templates | The entire point of this approach |
| All SCSS / component styles | Visual parity with production |
| `ngx-translate` module + pipe | Works fully offline, 1621 usages |
| `appValidateInput` directive | Pure DOM, zero network |
| `appDragDrop` directive | Pure browser File API |
| `search` pipe | Pure client-side array filter |
| All Angular Material modules | All UI components |
| Full routing structure | Keep all routes, just remove guards/resolvers |
| `StorageService` class | Keep as-is, just seed the data |
| `RequestManagerService` | Keep — FakerInterceptor catches before network |

---

## 13. SessionValidatorService (Route Guard)

### [ ] SessionValidatorService
**File:** `src/app/services/session-validator/session-validator.service.ts`
**What it does:** `canActivate` / `canLoad` guard on ALL `/admin/**` routes — reads `StorageService.getAccessToken()` from localStorage; redirects to `/login` if absent.
**Strip action:** The localStorage seed in §6 handles this automatically (`accessToken` key is seeded). No code change needed. If the guard still blocks after seeding, replace the guard body:
```ts
canActivate(): boolean { return true; }
canLoad(): boolean { return true; }
```
**Faker replacement:** localStorage seed provides the token.

---

## 14. Help Widget (window globals)

### [ ] window['loadHelp'] / window['unloadHelp']
**Files:** `src/app/admin/admin.component.ts` (4 calls), `src/app/shared/header/header.component.ts` (2 calls), `src/app/authentication/login/login.component.ts` (2 calls)
**What it does:** Loads/unloads a third-party help chat widget (Freshdesk or similar) via global script injected at runtime. Throws `TypeError: window['loadHelp'] is not a function` in local dev.
**Strip action:** Delete all 8 call sites. No import needed — they are bare `window['loadHelp']()` calls.
**Faker replacement:** None.

---

## 15. Complete API Endpoint Reference

Full endpoint catalog from audit — use this to extend `FakerInterceptor` beyond the 4 core screens.

### Contest List
| Method | URL | Key params | Response |
|---|---|---|---|
| GET | `/v2.0/contest/retrieve_contests` | `company_id, start_index, limit, sort_by, order, [contest_name, contest_state]` | `{ contest_list, total_contest }` |
| DELETE | `/v2.0/contest/delete` | `company_id, contest_id` | `{ success }` |
| PUT | `/v2.0/contest/forced_close` | `{ company_id, contest_id, is_winner_declared }` | `{ success }` |
| PUT | `/v2.0/contest/ready_to_draft` | `{ company_id, contest_id }` | `{ success }` |
| POST | `/v3.1/contest/copy_contest` | `{ contest_id, company_id, created_by }` | `{ contest_details, polling_identifier }` |
| GET | `/v1.6/manager/retrieve_game_owners` | `company_id` | `{ owner_list }` |

### Add / Edit Contest
| Method | URL | Key params | Response |
|---|---|---|---|
| GET | `/v2.0/contest/contest_details` | `contest_id` | `Contest` |
| GET | `/v2.0/contest/retrieve_contest_games` | `contest_id, company_id` | `{ contest_game_list }` |
| GET | `/v2.0/contest/get_valid_contest_date` | `company_id` | valid start date |
| POST | `/v2.0/contest/add` | full Contest payload | `{ contest_id }` |
| PUT | `/v2.0/contest/update` | full Contest payload | `{ success }` |
| POST | `/v2.0/contest/add_game_to_contest` | `{ contest_id, games[] }` | `{ success }` |
| PUT | `/v2.0/contest/update_games_in_contest` | `{ contest_id, games[] }` | `{ success }` |
| POST | `/v2.0/contest/publish` | `{ contest_id, company_id }` | `{ success }` |

### Game Library
| Method | URL | Key params | Response |
|---|---|---|---|
| GET | `/v1.6/game/retrieve_game` | `company_id, game_state, start_index, limit` | `{ game_list, total_game }` |
| POST | `/v3.0/game/retrieve_games` | `{ company_id, ... }` | `{ game_list, total_game }` |
| GET | `/v3.0/game/get_pinned_games` | `company_id` | `{ pinned_games }` |
| POST | `/v3.0/pinned_games/pin_unpin` | `{ game_id, company_id, is_pinned }` | `{ success }` |
| POST | `/v1.6/game/archive` | `{ game_id, company_id }` | `{ success }` |
| POST | `/v1.6/game/unarchive` | `{ game_id, company_id }` | `{ success }` |
| PUT | `/v1.6/game/update_game_state` | `{ game_id, game_state }` | `{ success }` |
| GET | `/v3.0/slg/retrieve_game_limit` | `company_id` | attempt limits |

### Schedule Game
| Method | URL | Key params | Response |
|---|---|---|---|
| GET | `/v1.6/game/retrieve_game` | `company_id, game_state=LIVE,READY` | `{ game_list }` |
| GET | `/v1.6/game_schedule/get_limits` | `game_id, company_id` | `{ game_schedule_list }` |
| POST | `/v1.6/game_schedule/add_limits` | `{ game_id, start_date, end_date, attempt_count, attempt_type }` | `{ success }` |
| PUT | `/v1.6/game_schedule/edit_limits` | same + `schedule_id` | `{ success }` |
| DELETE | `/v1.6/game_schedule/delete_limits` | `schedule_id, game_id` | `{ success }` |

---

## 16. Risk Notes

1. **`ActivateAppResolver` = Priority 1.** Without removing this, the app shows a blank screen forever. Start here.
2. **`PermissionsService` constructor timing.** Many components read `this.permissions` synchronously on inject. Pre-set in the constructor (not `ngOnInit`).
3. **`game/retrieve_games` vs `game/retrieve_game`.** Game list uses a POST to v3.0 (`retrieve_games`), not the GET to v1.6 (`retrieve_game`). FakerInterceptor must handle both patterns.
4. **`APP_INITIALIZER` removal order.** Stub `LaunchDarklyService` FIRST, then remove the initializer. Otherwise DI instantiates the real LD class during the removal pass and hits the network.
5. **Module-level `HttpClientModule`.** Do NOT import in lazy feature modules — only in `AppModule`. (Same bug that broke the prototype earlier.)
6. **Dashboard screen.** ~10 complex POST endpoints with custom payload shapes not yet fully audited. Audit before building fixtures.
7. **`aws-sdk` compile errors.** After stubbing `GetImageURLService` and `UploaderService`, remove `aws-sdk` imports from those files or the build will warn about large bundles. The package can stay in `node_modules` for now.
8. **`GlobalService` is a god-service.** 128+ components inject it. Do NOT delete it — only null out the Firebase/analytics methods. Keep date utils, snackbar wrappers, pagination constants intact.
9. **`appSignedUrl` blast radius: 23 templates.** Stub `GetImageURLService` first (§7) — this makes the directive a no-op without touching templates. Template find-replace is optional cleanup only.
10. **`ngx-translate` works offline.** `/assets/i18n/en.json` is a local file — 1621 usages all work without any stub. Do NOT remove `TranslateModule`.
