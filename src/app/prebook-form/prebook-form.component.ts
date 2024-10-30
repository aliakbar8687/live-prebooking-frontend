import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrebookFormService } from '../prebook-form.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AddProductDialogComponent } from '../add-product-dialog/add-product-dialog.component';
import { RemoveProductDialogComponent } from '../remove-product-dialog/remove-product-dialog.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-prebook-form',
  templateUrl: './prebook-form.component.html',
  styleUrls: ['./prebook-form.component.css']
})
export class PrebookFormComponent implements OnInit {
  prebookForm: FormGroup;
  message: string | null = null;
  productMessage: string | null = null;
  private allStores = [
    "BATHA - 8310", "VILLAGIO - 8315", "TRAIN MALL - 8320", "KHARJ - 8325", "MALAZ - 8330",
    "SANAYA - 8335", "SHAQRA - 8340", "ARRAS - 8345", "MAJMA - 8350", "BURAIDA - 8355",
    "MINA PORT - 8415", "KHOBAR - 8420", "JUBAIL - 8425", "AL HASSA - 8430", "DABBAB - 8435",
    "BUDGET FOOD - 8485", "TUWAIQ - 9551", "EXIT16 - 9552", "MALAZ - 9553", "MAKKAH - 9651", 
    "TAIF - 9652", "KHURAIS - 9555",
     "SHOLAY - 9554",
    " SHIFA - 9556"
  ];
  filteredStores: string[] = [];
  products: string[] = [];
  uniqueId: string | any;
  minDate: string;
  categories: string[] = [];
  messageType = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;
  constructor(
    private fb: FormBuilder,
    private prebookFormService: PrebookFormService,
    private router: Router,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.prebookForm = this.fb.group({
      store: ['', Validators.required],
      category: [''],
      product: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      description: [''],
      amount: ['', Validators.required],
      advance: [''],
      balance: [{ value: '', disabled: true }],
      date: ['', Validators.required],
      ddate: ['', Validators.required],
      voucher: [''],
      bill: [''],
      status: [{ value: 'pending', disabled: true }],
      selectedProduct: ['']
    });
    
    this.minDate = new Date().toISOString().split("T")[0];
  }

  ngOnInit() {
    this.loadProductDropdown();
    this.filterProducts();

    this.filterStores();
    this.setupFormListeners();
  }

  setupFormListeners() {
    this.prebookForm.get('store')?.valueChanges.subscribe(() => this.filterProducts());
    this.prebookForm.get('category')?.valueChanges.subscribe(() => this.filterProducts());
    this.prebookForm.get('amount')?.valueChanges.subscribe(() => this.calculateBalance());
    this.prebookForm.get('advance')?.valueChanges.subscribe(() => this.calculateBalance());
  }

  filterStores() {
    if (this.prebookFormService.isAdmin()) {
      this.filteredStores = this.allStores;
    } else {
      const userRole = this.prebookFormService.getUserRole();
      this.filteredStores = userRole ? [userRole] : [];
    }
  }

  setMinDate() {
    this.minDate = new Date().toISOString().split("T")[0];
  }

  calculateBalance() {
    const amount = this.prebookForm.get('amount')?.value || 0;
    const advance = this.prebookForm.get('advance')?.value || 0;
    const balance = amount - advance;

    this.prebookForm.get('balance')?.setValue(balance);

    if (balance === 0) {
      this.prebookForm.get('status')?.setValue('paid');
      this.prebookForm.get('status')?.disable();
    } else {
      this.prebookForm.get('status')?.setValue('pending');
      this.prebookForm.get('status')?.enable();
    }
  }

  loadProductDropdown() {
    this.prebookFormService.getProducts().subscribe(
      (data: any) => {
        const products = data as { productName: string, category: string }[];
        this.products = products.map(item => item.productName);
        this.categories = [...new Set(products.map((item) => item.category))];
      },
      (error) => {
        console.error('Error loading products:', error);
      }
    );
  }

  filterProducts() {
    const selectedCategory = this.prebookForm.get('category')?.value;

    if (selectedCategory) {
      // Fetch products first to filter them
      this.prebookFormService.getProducts().subscribe(
        (data: any) => {
          const filteredProducts = data.filter((product: any) => product.category === selectedCategory);
          this.products = filteredProducts.map((product: any) => product.productName);
        },
        (error) => {
          console.error('Error filtering products:', error);
        }
      );
    } else {
      // If no category is selected, show all products
      this.loadProductDropdown();
    }
  }

  

  openAddProductModal() {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '250px',
      data: {
        product: this.prebookForm.get('newProduct')?.value,
        categories: this.categories // Pass categories here
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.product && result.category) {
        this.addProduct(result.product, result.category); // Pass both product and category
      }
    });
  }
  

  addProduct(newProductValue: string, category: string) {
    if (!newProductValue || !category) return;
  
    // Normalize both the product name and category to lowercase
    const lowerCaseProductValue = newProductValue.toLowerCase();
    const lowerCaseCategory = category.toLowerCase();
  
    this.prebookFormService.addProduct(lowerCaseProductValue, lowerCaseCategory).subscribe(
      (response: any) => {
        if (response.success) {
          this.products.push(lowerCaseProductValue); // Push lowercase version
          this.prebookForm.get('newProduct')?.reset();  // Reset the input field
          this.productMessage = 'Product added successfully!';
          this.loadProductDropdown();
          this.filterProducts();
        } else {
          this.productMessage = response.message || 'Product already exists'; // Use the message from response if available
        }
        this.clearProductMessage(); // Clear message after a brief time
      },
      (error) => {
        this.productMessage = 'Error adding product. Please try again later.';
        this.clearProductMessage(); // Clear message after a brief time
      }
    );
  }
  
  

  openRemoveProductModal() {
    const selectedProduct = this.prebookForm.get('product')?.value;
  
    const dialogRef = this.dialog.open(RemoveProductDialogComponent, {
      width: '300px',
      data: {
        product: selectedProduct
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) { // If true is returned, it means the user confirmed the removal
        this.removeProduct(selectedProduct); // Pass only the product name now
      }
    });
  }
  
  removeProduct(productToRemove: string) {
    if (productToRemove) {
      this.prebookFormService.removeProduct(productToRemove).subscribe(
        (response: any) => {
          if (response.success) {
            this.products = this.products.filter(product => product !== productToRemove);
            this.productMessage = 'Product removed successfully!';
            this.loadProductDropdown();
            this.filterProducts();
          } else {
            this.productMessage = response.message || 'Error removing product.';
          }
          this.clearProductMessage();
        },
        (error) => {
          this.productMessage = 'Error removing product.';
          this.clearProductMessage();
        }
      );
    } else {
      console.error('No product selected for removal.');
    }
  }
  

  clearProductMessage() {
    setTimeout(() => {
      this.productMessage = null;
    }, 2000);
  }

  submitForm() {
    this.loading = true;
    this.error = null;
    this.success = null;
  
    // Enable form controls
    this.prebookForm.get('status')?.enable();
    this.prebookForm.get('balance')?.enable();
  
    if (this.prebookForm.valid) {
      // Get the form data
      const formData = { ...this.prebookForm.value };
      
      // Format the dates to YYYY-MM-DD
      if (formData.date instanceof Date) {
        formData.date = formData.date.toISOString().split('T')[0];
      }
      
      if (formData.ddate instanceof Date) {
        formData.ddate = formData.ddate.toISOString().split('T')[0];
      }
  
      console.log('Sending request with formatted data:', formData);
  
      this.prebookFormService.submitPrebooking(formData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            console.log('Success response:', response);
            this.success = 'Form submitted successfully!';
            
            // Delay navigation
            setTimeout(() => {
              this.router.navigateByUrl('/prebooking-data')
                .then(() => console.log('Navigation successful'))
                .catch(err => {
                  console.error('Navigation error:', err);
                  this.error = 'Navigation failed. Please try manually.';
                });
            }, 2000);
          },
          error: (error) => {
            console.error('Error occurred:', error);
            this.error = error || 'An unexpected error occurred';
            
            // If it's a CORS error, provide more specific feedback
            if (error.toString().includes('CORS')) {
              this.error = 'Connection to server failed. Please contact support.';
            }
          }
        });
    } else {
      this.loading = false;
      this.error = 'Please fill out all required fields correctly.';
    }
  }




}
