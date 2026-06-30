import { SsoModule } from './sso.module';

describe('SsoModule', () => {
  let ssoModule: SsoModule;

  beforeEach(() => {
    ssoModule = new SsoModule();
  });

  it('should create an instance', () => {
    expect(ssoModule).toBeTruthy();
  });
});
