import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MobileQuestionComponent } from './mobile-question.component';

describe('MobileQuestionComponent', () => {
  let component: MobileQuestionComponent;
  let fixture: ComponentFixture<MobileQuestionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
