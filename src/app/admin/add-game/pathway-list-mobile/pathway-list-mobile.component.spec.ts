import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathwayListMobileComponent } from './pathway-list-mobile.component';

describe('PathwayListMobileComponent', () => {
  let component: PathwayListMobileComponent;
  let fixture: ComponentFixture<PathwayListMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathwayListMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathwayListMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
