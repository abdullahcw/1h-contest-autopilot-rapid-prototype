import { TestBed } from '@angular/core/testing';

import { PlayerFeedbackService } from './player-feedback.service';

describe('PlayerFeedbackService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlayerFeedbackService = TestBed.get(PlayerFeedbackService);
    expect(service).toBeTruthy();
  });
});
