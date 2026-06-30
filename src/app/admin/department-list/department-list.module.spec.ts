import { DepartmentListModule } from './department-list.module';

describe('DepartmentListModule', () => {
  let departmentListModule: DepartmentListModule;

  beforeEach(() => {
    departmentListModule = new DepartmentListModule();
  });

  it('should create an instance', () => {
    expect(departmentListModule).toBeTruthy();
  });
});
