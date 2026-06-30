import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadingProgressComponent } from './uploading-progress.component';

describe('UploadingProgressComponent', () => {
  let component: UploadingProgressComponent;
  let fixture: ComponentFixture<UploadingProgressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadingProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadingProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
