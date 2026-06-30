import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockerPopupComponent } from './blocker-popup.component';

describe('BlockerPopupComponent', () => {
  let component: BlockerPopupComponent;
  let fixture: ComponentFixture<BlockerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockerPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
