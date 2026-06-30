import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TrophyDetailsComponent } from './trophy-details.component';

describe('TrophyDetailsComponent', () => {
  let component: TrophyDetailsComponent;
  let fixture: ComponentFixture<TrophyDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TrophyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrophyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
