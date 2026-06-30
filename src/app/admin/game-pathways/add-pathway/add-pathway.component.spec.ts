import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPathwayComponent } from './add-pathway.component';

describe('AddPathwayComponent', () => {
  let component: AddPathwayComponent;
  let fixture: ComponentFixture<AddPathwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPathwayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPathwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
