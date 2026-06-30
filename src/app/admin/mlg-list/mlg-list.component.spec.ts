import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MlgListComponent } from './mlg-list.component';

describe('MlgListComponent', () => {
  let component: MlgListComponent;
  let fixture: ComponentFixture<MlgListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MlgListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MlgListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
