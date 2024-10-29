import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePrebookingFormComponent } from './update-prebooking-form.component';

describe('UpdatePrebookingFormComponent', () => {
  let component: UpdatePrebookingFormComponent;
  let fixture: ComponentFixture<UpdatePrebookingFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdatePrebookingFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePrebookingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
