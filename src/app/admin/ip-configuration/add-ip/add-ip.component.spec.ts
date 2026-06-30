import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIpComponent } from './add-ip.component';

describe('AddIpComponent', () => {
  let component: AddIpComponent;
  let fixture: ComponentFixture<AddIpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddIpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
