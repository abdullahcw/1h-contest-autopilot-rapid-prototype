import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddAttemptsComponent } from './add-attempts.component';

describe('AddAttemptsComponent', () => {
  let component: AddAttemptsComponent;
  let fixture: ComponentFixture<AddAttemptsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAttemptsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAttemptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
