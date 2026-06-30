import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MarketplaceViewAllComponent } from './marketplace-view-all.component';

describe('MarketplaceViewAllComponent', () => {
  let component: MarketplaceViewAllComponent;
  let fixture: ComponentFixture<MarketplaceViewAllComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceViewAllComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketplaceViewAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
