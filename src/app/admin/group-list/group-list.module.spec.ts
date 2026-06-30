import { GroupListModule } from './group-list.module';

describe('GroupListModule', () => {
  let groupListModule: GroupListModule;

  beforeEach(() => {
    groupListModule = new GroupListModule();
  });

  it('should create an instance', () => {
    expect(groupListModule).toBeTruthy();
  });
});
