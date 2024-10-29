import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-product-dialog',
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.css']
})
export class AddProductDialogComponent {
  newProduct: string = '';
  selectedCategory: string = '';
  categories: string[] = [];
  filteredCategories: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.categories = data.categories; // Receive categories here
    this.filteredCategories = this.categories; // Initially show all categories
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addProduct() {
    this.dialogRef.close({ product: this.newProduct, category: this.selectedCategory });
  }

  // Add this method to filter categories based on input
  filterCategories() {
    const filterValue = this.selectedCategory.toLowerCase();
    this.filteredCategories = this.categories.filter(category => category.toLowerCase().includes(filterValue));
  }
}
