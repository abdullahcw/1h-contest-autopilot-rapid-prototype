import { MasterReportModule } from './master-report.module';

describe('MasterReportModule', () => {
  let masterReportModule: MasterReportModule;

  beforeEach(() => {
    masterReportModule = new MasterReportModule();
  });

  it('should create an instance', () => {
    expect(masterReportModule).toBeTruthy();
  });
});
