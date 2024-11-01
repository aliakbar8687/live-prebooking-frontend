import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerForgetRegisterComponent } from './customer-forget-register.component';

describe('CustomerForgetRegisterComponent', () => {
  let component: CustomerForgetRegisterComponent;
  let fixture: ComponentFixture<CustomerForgetRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerForgetRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerForgetRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
