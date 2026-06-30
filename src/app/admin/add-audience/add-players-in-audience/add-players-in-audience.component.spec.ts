import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPlayersInAudienceComponent } from './add-players-in-audience.component';

describe('AddPlayersInAudienceComponent', () => {
  let component: AddPlayersInAudienceComponent;
  let fixture: ComponentFixture<AddPlayersInAudienceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPlayersInAudienceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPlayersInAudienceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
