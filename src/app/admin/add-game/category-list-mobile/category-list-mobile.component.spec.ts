import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryListMobileComponent } from './category-list-mobile.component';

describe('CategoryListMobileComponent', () => {
  let component: CategoryListMobileComponent;
  let fixture: ComponentFixture<CategoryListMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryListMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryListMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
