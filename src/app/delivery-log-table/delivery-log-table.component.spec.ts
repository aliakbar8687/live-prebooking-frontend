import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryLogTableComponent } from './delivery-log-table.component';

describe('DeliveryLogTableComponent', () => {
  let component: DeliveryLogTableComponent;
  let fixture: ComponentFixture<DeliveryLogTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeliveryLogTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryLogTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
