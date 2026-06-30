import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiQuestionsListComponent } from './ai-questions-list.component';

describe('AiQuestionsListComponent', () => {
  let component: AiQuestionsListComponent;
  let fixture: ComponentFixture<AiQuestionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiQuestionsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AiQuestionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
