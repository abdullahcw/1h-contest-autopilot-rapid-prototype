import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAssistComponent } from './ai-assist.component';

describe('AiAssistComponent', () => {
  let component: AiAssistComponent;
  let fixture: ComponentFixture<AiAssistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiAssistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AiAssistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
