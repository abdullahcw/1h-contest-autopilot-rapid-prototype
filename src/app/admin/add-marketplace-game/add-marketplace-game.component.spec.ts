import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddMarketplaceGameComponent } from './add-marketplace-game.component';

describe('AddMarketplaceGameComponent', () => {
  let component: AddMarketplaceGameComponent;
  let fixture: ComponentFixture<AddMarketplaceGameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMarketplaceGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMarketplaceGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
