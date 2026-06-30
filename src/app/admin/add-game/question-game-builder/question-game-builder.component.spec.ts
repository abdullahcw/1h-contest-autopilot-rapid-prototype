import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionGameBuilderComponent } from './question-game-builder.component';

describe('QuestionComponent', () => {
  let component: QuestionGameBuilderComponent;
  let fixture: ComponentFixture<QuestionGameBuilderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionGameBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionGameBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
