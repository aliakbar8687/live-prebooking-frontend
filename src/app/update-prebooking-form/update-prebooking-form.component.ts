import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrebookFormService } from '../prebook-form.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-prebooking-form',
  templateUrl: './update-prebooking-form.component.html',
  styleUrls: ['./update-prebooking-form.component.css']
})
export class UpdatePrebookingFormComponent implements OnInit {
  prebookForm: FormGroup;
  message: string | null = null;
  private allStores = [
    "BATHA - 8310", "VILLAGIO - 8315", "TRAIN MALL - 8320", "KHARJ - 8325", "MALAZ - 8330",
    "SANAYA - 8335", "SHAQRA - 8340", "ARRAS - 8345", "MAJMA - 8350", "BURAIDA - 8355",
    "MINA PORT - 8415", "KHOBAR - 8420", "JUBAIL - 8425", "AL HASSA - 8430", "DABBAB - 8435",
    "BUDGET FOOD - 8485", "TUWAIQ - 9551", "EXIT16 - 9552", "MALAZ - 9553", "MAKKAH - 9651", 
    "TAIF - 9652"
  ];
  filteredStores: string[] = [];
  products: string[] = [];
  uniqueId: string | any; // Make sure uniqueId is null by default
  minDate: Date;
  sidebarVisible: boolean = true;
  
  constructor(
    private fb: FormBuilder,
    private prebookFormService: PrebookFormService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.prebookForm = this.fb.group({
      store: [{ value: '', disabled: true }, Validators.required],  // Disable the store field and add required validator
      product: [{ value: '', disabled: true }, Validators.required], // Disable the product field and add required validator
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0)]],
      advance: ['', [Validators.min(0)]],
      balance: { value: '', disabled: true }, // Disable the balance field
      date: ['', Validators.required],
      ddate: ['', Validators.required],
      voucher: [''],
      bill: [''],
      status: ['', Validators.required] // Default to an empty string
    });

    this.minDate = new Date();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.uniqueId = params['uniqueId'];
      if (this.uniqueId) {
        this.loadPrebookingData(this.uniqueId);
      }
    });

    this.loadProducts();
    this.filterStores();

    // Listen for changes to amount and advance to update balance
    this.prebookForm.get('amount')?.valueChanges.subscribe(() => this.updateBalance());
    this.prebookForm.get('advance')?.valueChanges.subscribe(() => this.updateBalance());
  }

  loadPrebookingData(id: string) {
    this.prebookFormService.getPrebookingData(id).subscribe(
      data => {
        console.log('Prebooking Data:', data);
        
        this.prebookForm.patchValue({
          store: data.store,
          product: data.product,
          name: data.name,
          phone: data.phone,
          description: data.description,
          amount: data.amount,
          advance: data.advance,
          date: this.formatDate(data.date),
          ddate: this.formatDate(data.ddate),
          voucher: data.voucher,
          bill: data.bill,
          status: data.status || '' // Ensure this sets a default value
        });

        this.updateBalance(); // Update balance after patching values
        this.setMessage("Prebooking data loaded successfully!"); // Success message
      },
      error => {
        console.error('Error loading prebooking data:', error);
        this.setMessage("Error loading prebooking data. Please try again.");
      }
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1); // Add one day to the date
    return date.toISOString().split('T')[0];
  }

  filterStores() {
    if (this.prebookFormService.isAdmin()) {
      this.filteredStores = this.allStores;
    } else {
      const userRole = this.prebookFormService.getUserRole();
      this.filteredStores = userRole ? [userRole] : [];
    }
  }

  updateBalance() {
    const amount = this.prebookForm.get('amount')?.value || 0;
    const advance = this.prebookForm.get('advance')?.value || 0;
    const balance = amount - advance;
  
    this.prebookForm.get('balance')?.setValue(balance, { emitEvent: false });
  
    // Update the status and bill based on balance
    if (balance === 0) {
      this.prebookForm.get('status')?.setValue('paid');
      this.prebookForm.get('status')?.disable(); // Disable status when paid
  
      // Set the 'bill' field as required if balance is zero
      this.prebookForm.get('bill')?.setValidators([Validators.required]);
    } else {
      this.prebookForm.get('status')?.enable(); // Enable status if balance is not zero
      if (!['paid', 'confirmed'].includes(this.prebookForm.get('status')?.value)) {
        this.prebookForm.get('status')?.setValue('pending');
      }
  
      // Clear the 'bill' field and remove its validators if balance is not zero
      this.prebookForm.get('bill')?.clearValidators();
      this.prebookForm.get('bill')?.setValue('');  // Clear the value of 'bill' field
    }
  
    // Update the validity of the 'bill' field
    this.prebookForm.get('bill')?.updateValueAndValidity();
  }
  

  loadProducts() {
    this.prebookFormService.getProducts().subscribe(
      (data: any) => {
        this.products = data.map((item: any) => item.productName);
        this.setMessage("Products loaded successfully!"); // Success message
      },
      error => {
        console.error('Error loading products:', error);
        this.setMessage("Error loading products. Please try again.");
      }
    );
  }

  submitForm() {
    this.updateBalance(); // Ensure balance is updated before submission
  
    // Create a copy of the form value
    const formData = { ...this.prebookForm.getRawValue() };
  
    // Ensure balance is included even if the field is disabled
    formData.balance = this.prebookForm.get('balance')?.value;
  
    // Ensure status is included even if the field is disabled
    formData.status = this.prebookForm.get('status')?.value;
  
    console.log('Form Submitted Data:', formData);
  
    if (this.prebookForm.valid) {
      this.prebookFormService.setLoading(true);
  
      this.prebookFormService.updatePrebooking(this.uniqueId, formData).subscribe(
        response => {
          console.log('Update Response:', response);
  
          if (response.success && response.data && response.data.length > 0) {
            const updatedData = response.data[0];
  
            // Ensure status and balance are set from the response or fallback to the form
            const updatedStatus = updatedData.status !== null ? updatedData.status : formData.status;
            const updatedBalance = updatedData.balance !== null ? updatedData.balance : formData.balance;
  
            // Patch values back to form
            this.prebookForm.patchValue({
              status: updatedStatus,
              balance: updatedBalance
            });
  
            // Set success message before routing
            this.setMessage("Prebooking updated successfully!"); // Success message
            setTimeout(() => {
              this.router.navigate(['/prebooking-data']); // Navigate after message is shown
            }, 2000); // Wait for 2 seconds before navigating
            
          } else {
            // Set error message before routing
            this.setMessage("Error updating prebooking: No data returned."); // Error message
            setTimeout(() => {
              this.router.navigate(['/prebooking-data']); // Navigate after message is shown
            }, 2000); // Wait for 2 seconds before navigating
          }
        },
        error => {
          // Set error message before routing
          this.setMessage("Error updating prebooking."); // Error message
          console.error('Error:', error);
          setTimeout(() => {
            this.router.navigate(['/prebooking-data']); // Navigate after message is shown
          }, 2000); // Wait for 2 seconds before navigating
        },
        () => {
          this.prebookFormService.setLoading(false);
        }
      );
    } else {
      this.prebookForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }
  

  setMessage(msg: string) {
    this.message = msg;
    setTimeout(() => {
      this.message = null; // Clear the message after 2 seconds
    }, 2000);
  }
  

  hideSidebar() {
    this.sidebarVisible = false; // Set the flag to hide the sidebar
  }

  printForm() {
    this.hideSidebar(); // Hide the sidebar before printing
    
    // Open a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      // Get the content of the print section
      const content = document.getElementById('printSection')?.innerHTML || '';
      
      // Write the HTML structure to the print window
      printWindow.document.write(`
    <html>
<head>
  <title>Print Form</title>
  <style>
body {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 20px;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  background-color: #f4f4f9; /* Fallback background color */
  background-image: url('/images/background.jpeg'); /* Replace with your image path */
  background-size: cover; /* Cover the entire viewport */
  background-position: center; /* Center the image */
  color: #333;
}


    .company-info {
      text-align: left;
      margin-bottom: 20px;
    }

    .printable-content {
      margin-top: 5px;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .printable-content p {
      font-size: 16px;
      margin-bottom: 10px;
      line-height: 1.6;
    }

    /* Signature styles */
    .signature-section {
      position: absolute;
      bottom: 20px;
      width: 100%;
      display: flex;
      justify-content: flex-start; /* Align signatures to the left */
      padding: 0 20px;
    }

    .signature {
      display: flex;
      align-items: center;
      width: 20%;
      font-size: 16px;
      margin-left: 20px; /* Move signatures to the left */
      font-weight: 900;
      margin-right: 100px; /* Add more space between the signatures */
    }

    .signature p {
      margin: 0;
      margin-right: 10px;
      white-space: nowrap;
      font-weight: 900;
    }

    .signature-line {
      flex-grow: 1;
      border-top: 2px solid #333;
      height: 1px;
    }

    /* Add a colorful border and theme */
    .printable-content {
      border-left: 8px solid #3498db;
      border-right: 8px solid #e74c3c;
    }

    /* Custom colors and shadow for the header */
    #currentDateTime {
      text-align: left;
      color: brown;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
    }

    /* Add shadow to signature boxes */
    .signature {
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-weight: 900;
    }

  </style>
</head>
<body onload="window.print(); window.close();">

  <div class="printable-content">
    <h3 id="currentDateTime"></h3>
    ${content}
  </div>

  <!-- Signature section -->
  <div class="signature-section">
    <div class="signature">
      <p>Customer Signature</p>
      <div class="signature-line"></div>
    </div>
    <div class="signature">
      <p>Manager Signature</p>
      <div class="signature-line"></div>
    </div>
  </div>

  <script>
    // Function to format date and time
    function formatDateTime() {
      const now = new Date();
      return now.toLocaleString(); // Formats date and time according to the user's locale
    }

    // Set the current date and time in the h3 tag
    document.getElementById('currentDateTime').textContent = formatDateTime();
  </script>
</body>
</html>


      `);
      printWindow.document.close(); // Close the document for rendering
    }
  }
}
