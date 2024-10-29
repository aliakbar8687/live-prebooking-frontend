import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-remove-product-dialog',
  templateUrl: './remove-product-dialog.component.html',
})
export class RemoveProductDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RemoveProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
