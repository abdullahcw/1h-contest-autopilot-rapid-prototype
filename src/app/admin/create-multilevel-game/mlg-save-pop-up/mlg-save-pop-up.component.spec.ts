import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MlgSavePopUpComponent } from './mlg-save-pop-up.component';

describe('MlgSavePopUpComponent', () => {
  let component: MlgSavePopUpComponent;
  let fixture: ComponentFixture<MlgSavePopUpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MlgSavePopUpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgSavePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
