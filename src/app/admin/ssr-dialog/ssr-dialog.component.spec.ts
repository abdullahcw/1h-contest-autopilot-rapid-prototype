import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SsrDialogComponent } from './ssr-dialog.component';

describe('SsrDialogComponent', () => {
  let component: SsrDialogComponent;
  let fixture: ComponentFixture<SsrDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SsrDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsrDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
