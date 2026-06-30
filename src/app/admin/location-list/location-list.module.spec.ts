import { LocationListModule } from './location-list.module';

describe('LocationsModule', () => {
  let locationsModule: LocationListModule;

  beforeEach(() => {
    locationsModule = new LocationListModule();
  });

  it('should create an instance', () => {
    expect(locationsModule).toBeTruthy();
  });
});
