import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomImagesTableStaticComponent } from './custom-images-table-static.component';


describe('CustomImagesComponent', () => {
  let component: CustomImagesTableStaticComponent;
  let fixture: ComponentFixture<CustomImagesTableStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomImagesTableStaticComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomImagesTableStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
