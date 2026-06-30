import { MainControllerModule } from './main-controller.module';

describe('MainControllerModule', () => {
  let mainControllerModule: MainControllerModule;

  beforeEach(() => {
    mainControllerModule = new MainControllerModule();
  });

  it('should create an instance', () => {
    expect(mainControllerModule).toBeTruthy();
  });
});
