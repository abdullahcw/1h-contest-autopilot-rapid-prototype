import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomAudienceListComponent } from './custom-audience-list.component';

describe('CustomAudienceListComponent', () => {
  let component: CustomAudienceListComponent;
  let fixture: ComponentFixture<CustomAudienceListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomAudienceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAudienceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
