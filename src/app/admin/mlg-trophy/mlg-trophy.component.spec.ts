import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MlgTrophyComponent } from './mlg-trophy.component';

describe('MlgTrophyComponent', () => {
  let component: MlgTrophyComponent;
  let fixture: ComponentFixture<MlgTrophyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MlgTrophyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgTrophyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
