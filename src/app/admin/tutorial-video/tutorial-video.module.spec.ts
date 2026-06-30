import { TutorialVideoModule } from './tutorial-video.module';

describe('TutorialVideoModule', () => {
  let tutorialVideoModule: TutorialVideoModule;

  beforeEach(() => {
    tutorialVideoModule = new TutorialVideoModule();
  });

  it('should create an instance', () => {
    expect(tutorialVideoModule).toBeTruthy();
  });
});
