import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddContestHeaderComponent } from './add-contest-header.component';

describe('AddContestHeaderComponent', () => {
  let component: AddContestHeaderComponent;
  let fixture: ComponentFixture<AddContestHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddContestHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContestHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
