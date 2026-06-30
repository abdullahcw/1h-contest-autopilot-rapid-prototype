import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MasterOverlayComponent } from './master-overlay.component';

describe('MasterOverlayComponent', () => {
  let component: MasterOverlayComponent;
  let fixture: ComponentFixture<MasterOverlayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
