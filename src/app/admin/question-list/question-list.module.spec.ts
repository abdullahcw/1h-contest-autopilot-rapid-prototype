import { QuestionListModule } from './question-list.module';

describe('QuestionListModule', () => {
  let questionListModule: QuestionListModule;

  beforeEach(() => {
    questionListModule = new QuestionListModule();
  });

  it('should create an instance', () => {
    expect(questionListModule).toBeTruthy();
  });
});
