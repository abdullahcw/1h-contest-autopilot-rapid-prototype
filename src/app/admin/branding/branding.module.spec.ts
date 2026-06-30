import { BrandingModule } from './branding.module';

describe('BrandingModule', () => {
  let brandingModule: BrandingModule;

  beforeEach(() => {
    brandingModule = new BrandingModule();
  });

  it('should create an instance', () => {
    expect(brandingModule).toBeTruthy();
  });
});
