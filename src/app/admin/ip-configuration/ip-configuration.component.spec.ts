import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpConfigurationComponent } from './ip-configuration.component';

describe('IpConfigurationComponent', () => {
  let component: IpConfigurationComponent;
  let fixture: ComponentFixture<IpConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IpConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
