import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardEntityComponent } from './card-entity.component';

describe('CardEntityComponent', () => {
  let component: CardEntityComponent;
  let fixture: ComponentFixture<CardEntityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
