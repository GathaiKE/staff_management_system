import { TestBed } from '@angular/core/testing';

import { DynamicComponentsService } from './dynamic-components.service';

describe('DynamicComponentsService', () => {
  let service: DynamicComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
