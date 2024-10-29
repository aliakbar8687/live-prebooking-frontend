import { TestBed } from '@angular/core/testing';

import { PrebookFormService } from './prebook-form.service';

describe('PrebookFormService', () => {
  let service: PrebookFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrebookFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
