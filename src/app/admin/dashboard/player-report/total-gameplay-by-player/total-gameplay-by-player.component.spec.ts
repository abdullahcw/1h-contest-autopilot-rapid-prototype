import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalGameplayByPlayerComponent } from './total-gameplay-by-player.component';

describe('TotalGameplayByPlayerComponent', () => {
  let component: TotalGameplayByPlayerComponent;
  let fixture: ComponentFixture<TotalGameplayByPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TotalGameplayByPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalGameplayByPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
