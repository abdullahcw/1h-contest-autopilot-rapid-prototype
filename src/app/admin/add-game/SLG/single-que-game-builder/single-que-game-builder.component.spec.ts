import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleQueGameBuilderComponent } from './single-que-game-builder.component';

describe('SingleQueGameBuilderComponent', () => {
  let component: SingleQueGameBuilderComponent;
  let fixture: ComponentFixture<SingleQueGameBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleQueGameBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleQueGameBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
