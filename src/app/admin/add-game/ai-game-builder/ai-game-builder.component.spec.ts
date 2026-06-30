import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiGameBuilderComponent } from './ai-game-builder.component';

describe('AiGameBuilderComponent', () => {
  let component: AiGameBuilderComponent;
  let fixture: ComponentFixture<AiGameBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiGameBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AiGameBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
