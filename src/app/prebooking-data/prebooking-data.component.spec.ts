import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebookingDataComponent } from './prebooking-data.component';

describe('PrebookingDataComponent', () => {
  let component: PrebookingDataComponent;
  let fixture: ComponentFixture<PrebookingDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrebookingDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrebookingDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
