import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebookFormComponent } from './prebook-form.component';

describe('PrebookFormComponent', () => {
  let component: PrebookFormComponent;
  let fixture: ComponentFixture<PrebookFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrebookFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrebookFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
