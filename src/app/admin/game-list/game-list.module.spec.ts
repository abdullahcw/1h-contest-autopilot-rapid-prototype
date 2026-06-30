import { GameListModule } from './game-list.module';

describe('GameListModule', () => {
  let gameListModule: GameListModule;

  beforeEach(() => {
    gameListModule = new GameListModule();
  });

  it('should create an instance', () => {
    expect(gameListModule).toBeTruthy();
  });
});
