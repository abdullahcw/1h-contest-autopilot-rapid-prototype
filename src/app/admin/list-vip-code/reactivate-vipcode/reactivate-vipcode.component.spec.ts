import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivateVIPcodeComponent } from './reactivate-vipcode.component';

describe('ReactivateVIPcodeComponent', () => {
  let component: ReactivateVIPcodeComponent;
  let fixture: ComponentFixture<ReactivateVIPcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactivateVIPcodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactivateVIPcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
