import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryLogBookComponent } from './delivery-log-book.component';

describe('DeliveryLogBookComponent', () => {
  let component: DeliveryLogBookComponent;
  let fixture: ComponentFixture<DeliveryLogBookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliveryLogBookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryLogBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
