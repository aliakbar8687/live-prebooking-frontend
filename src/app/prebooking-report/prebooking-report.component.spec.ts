import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrebookingReportComponent } from './prebooking-report.component';

describe('PrebookingReportComponent', () => {
  let component: PrebookingReportComponent;
  let fixture: ComponentFixture<PrebookingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrebookingReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrebookingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
