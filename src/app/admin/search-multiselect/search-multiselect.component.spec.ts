import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SearchMultiselectComponent } from './search-multiselect.component';

describe('SearchMultiselectComponent', () => {
  let component: SearchMultiselectComponent;
  let fixture: ComponentFixture<SearchMultiselectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchMultiselectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
