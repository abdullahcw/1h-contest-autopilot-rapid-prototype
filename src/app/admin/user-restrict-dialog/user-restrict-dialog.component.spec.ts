import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserRestrictDialogComponent } from './user-restrict-dialog.component';

describe('UserRestrictDialogComponent', () => {
  let component: UserRestrictDialogComponent;
  let fixture: ComponentFixture<UserRestrictDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserRestrictDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRestrictDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
