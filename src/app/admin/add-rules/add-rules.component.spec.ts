import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddRulesComponent } from './add-rules.component';

describe('AddRulesComponent', () => {
  let component: AddRulesComponent;
  let fixture: ComponentFixture<AddRulesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
