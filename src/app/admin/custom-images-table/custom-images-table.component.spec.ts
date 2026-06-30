import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomImagesTableComponent } from './custom-images-table.component';

describe('CustomImagesComponent', () => {
  let component: CustomImagesTableComponent;
  let fixture: ComponentFixture<CustomImagesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomImagesTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomImagesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
