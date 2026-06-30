import { CompanyDetailsModule } from './company-details.module';

describe('CompanyDetailsModule', () => {
  let companyDetailsModule: CompanyDetailsModule;

  beforeEach(() => {
    companyDetailsModule = new CompanyDetailsModule();
  });

  it('should create an instance', () => {
    expect(companyDetailsModule).toBeTruthy();
  });
});
