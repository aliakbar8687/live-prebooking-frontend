import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveProductDialogComponent } from './remove-product-dialog.component';

describe('RemoveProductDialogComponent', () => {
  let component: RemoveProductDialogComponent;
  let fixture: ComponentFixture<RemoveProductDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RemoveProductDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
