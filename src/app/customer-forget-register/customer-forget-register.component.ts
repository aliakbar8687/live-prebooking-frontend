import { Component, OnInit, OnDestroy } from '@angular/core';
import { ForgetRegister, PrebookFormService } from '../prebook-form.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-customer-forget-register',
  templateUrl: './customer-forget-register.component.html',
  styleUrls: ['./customer-forget-register.component.css']
})
export class CustomerForgetRegisterComponent implements OnInit, OnDestroy {
  // Properties
  records: ForgetRegister[] = [];
  filteredRecords: ForgetRegister[] = [];
  searchTerm: string = '';
  showModal = false;
  loading = false;
  registerForm: FormGroup|any;
  isEditMode = false;
  private destroy$ = new Subject<void>();
  isAdmin:boolean = false;
  successMessage: string = '';
 
  // Add Math property for template usage
  protected readonly Math = Math;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 1;
  paginatedRecords: ForgetRegister[] = [];

  constructor(
    private service: PrebookFormService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.isAdmin = this.service.isAdmin();

    this.loadRecords();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Form Initialization
  private initializeForm(): void {
    this.registerForm = this.fb.group({
      id: [null],
      POS: ['', [Validators.required, Validators.minLength(2)]],
      CashierId: ['', [Validators.required, Validators.minLength(3)]],
      barcode: ['', [Validators.required, Validators.pattern('^[0-9]{8,13}$')]],
      description: ['', [Validators.required, Validators.minLength(3)]],
      quantity: [null, [Validators.required, Validators.min(1)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  // Data Loading
  // Update loadRecords to initialize pagination
  loadRecords(): void {
    this.loading = true;
    this.service.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.records = data;
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading records:', error);
          this.loading = false;
          this.handleError('Failed to load records');
        }
      });
  }
  // Search and Filter
    // Update applyFilter method to include pagination
    applyFilter(): void {
      if (!this.searchTerm.trim()) {
        this.filteredRecords = [...this.records];
      } else {
        const search = this.searchTerm.toLowerCase().trim();
        this.filteredRecords = this.records.filter(record => 
          record.name?.toLowerCase().includes(search) ||
          record.POS?.toLowerCase().includes(search) ||
          record.CashierId?.toLowerCase().includes(search) ||
          record.barcode?.toLowerCase().includes(search) ||
          record.phone?.includes(search) ||
          record.description?.toLowerCase().includes(search)
        );
      }
      
      this.updatePagination();
    }

 // Add pagination methods
 updatePagination(): void {
  this.totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
  this.currentPage = Math.min(this.currentPage, this.totalPages);
  this.currentPage = Math.max(1, this.currentPage);
  this.updatePaginatedRecords();
}

updatePaginatedRecords(): void {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = Math.min(startIndex + this.pageSize, this.filteredRecords.length);
  this.paginatedRecords = this.filteredRecords.slice(startIndex, endIndex);
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
    this.currentPage = page;
    this.updatePaginatedRecords();
  }
}

get pages(): number[] {
  const pagesArray = [];
  let startPage = Math.max(1, this.currentPage - 2);
  let endPage = Math.min(this.totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pagesArray.push(i);
  }
  return pagesArray;
}

// Get display text for pagination info
get paginationInfo(): string {
  const start = (this.currentPage - 1) * this.pageSize + 1;
  const end = Math.min(this.currentPage * this.pageSize, this.filteredRecords.length);
  return `Showing ${start} to ${end} of ${this.filteredRecords.length} records`;
}


  // Modal Handling
  openAddModal(): void {
    this.isEditMode = false;
    this.initializeForm();
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  editRecord(record: ForgetRegister): void {
    this.isEditMode = true;
    this.registerForm.patchValue({
      id: record.id,
      POS: record.POS,
      CashierId: record.CashierId,
      barcode: record.barcode,
      description: record.description,
      quantity: record.quantity,
      phone: record.phone,
      name: record.name
    });
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.initializeForm();
    document.body.style.overflow = 'auto';
  }

  closeModalOnOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  // Form Submission
  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const formData = this.registerForm.value;
    const operation = this.isEditMode
      ? this.service.update(formData.id, formData)
      : this.service.create(formData);

    operation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadRecords();
          this.closeModal();
          this.showSuccessMessage(
            this.isEditMode ? 'Record updated successfully' : 'Record added successfully'
          );
        },
        error: (error) => {
          console.error('Error saving record:', error);
          this.handleError(
            this.isEditMode ? 'Failed to update record' : 'Failed to create record'
          );
        }
      });
  }

  // Delete Operation
  deleteRecord(id: number): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.service.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadRecords();
            this.showSuccessMessage('Record deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting record:', error);
            this.handleError('Failed to delete record');
          }
        });
    }
  }

  // Helper Methods
  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  private handleError(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  // Form Validation Helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    if (!control) return '';
    
    if (control.hasError('required')) return `${fieldName} is required`;
    if (control.hasError('minlength')) return `${fieldName} is too short`;
    if (control.hasError('min')) return `${fieldName} must be at least 1`;
    if (control.hasError('pattern')) {
      switch (fieldName) {
        case 'phone': return 'Please enter a valid 10-digit phone number';
        case 'barcode': return 'Please enter a valid barcode (8-13 digits)';
        default: return `Invalid ${fieldName} format`;
      }
    }
    return '';
  }



exportToExcel(): void {
  try {
    // Get the table element
    const table = document.getElementById('register');
    if (!table) {
      throw new Error('Table not found');
    }

    // Convert HTML table to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);

    // Define the header style with blue background and white bold text
    const headerStyle = {
      fill: {
        fgColor: { rgb: "4F81BD" },  // Blue background
        patternType: 'solid'
      },
      font: {
        bold: true,
        color: { rgb: "FFFFFF" }  // White text
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      }
    };

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Store column indexes to remove (Actions column)
    const columnsToRemove: number[] = [];
    
    // Find the Actions column and apply header styles to all headers
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      const headerCell = worksheet[headerAddress];
      
      if (headerCell) {
        // Apply header styles to all header cells
        worksheet[headerAddress] = {
          ...headerCell,
          s: headerStyle
        };

        // Mark Actions column for removal
        if (headerCell.v === 'Actions') {
          columnsToRemove.push(C);
        }
      }
    }

    // Remove the Actions column (working backwards to avoid index issues)
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = columnsToRemove.length - 1; C >= 0; C--) {
        const col = columnsToRemove[C];
        // Shift all cells to the left
        for (let i = col; i < range.e.c; ++i) {
          const currentCell = XLSX.utils.encode_cell({ r: R, c: i });
          const nextCell = XLSX.utils.encode_cell({ r: R, c: i + 1 });
          worksheet[currentCell] = worksheet[nextCell];
        }
        // Delete the last cell in the row
        delete worksheet[XLSX.utils.encode_cell({ r: R, c: range.e.c })];
      }
    }

    // Adjust the range after removing columns
    range.e.c -= columnsToRemove.length;
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    // Auto-adjust column widths
    let maxWidths: number[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let max = 0;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const length = cell.v.toString().length;
          if (length > max) max = length;
        }
      }
      maxWidths[C] = max + 2; // Add padding
    }

    // Add Log Book Numbers section
    const startRow = range.e.r + 2;  // Skip a row after the table
    
    // Add "Log Book Numbers" header with styling
    // const logBookHeaderCell = XLSX.utils.encode_cell({ r: startRow, c: 0 });
    // worksheet[logBookHeaderCell] = {
    //   v: 'Log Book Numbers:',
    //   s: {
    //     font: { bold: true },
    //     fill: {
    //       fgColor: { rgb: "E0E0E0" },  // Light gray background
    //       patternType: 'solid'
    //     }
    //   }
    // };

    // Generate Log Book Numbers (one per 20 records)
    // let currentRow = startRow + 1;
    // for (let i = 0; i < this.filteredRecords.length; i += this.pageSize) {
    //   const randomNum = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit number
    //   const recordRange = `Records ${i + 1} - ${Math.min(i + this.pageSize, this.filteredRecords.length)}`;
    //   const cell = XLSX.utils.encode_cell({ r: currentRow, c: 0 });
    //   worksheet[cell] = {
    //     v: `${recordRange}: LB${randomNum}`,
    //     s: {
    //       alignment: { horizontal: 'left' }
    //     }
    //   };
    //   currentRow++;
    // }

    // Update worksheet range to include Log Book Numbers
    // worksheet['!ref'] = XLSX.utils.encode_range({
    //   s: { r: 0, c: 0 },
    //   e: { r: currentRow - 1, c: range.e.c }
    // });

    // Update column widths
    worksheet['!cols'] = maxWidths.map(w => ({ wch: w }));

    // Create workbook and add the worksheet
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel file buffer
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true  // Enable cell styles
    });

    // Create blob and save file
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // Get current date for filename
    const date = new Date();
    const fileName = `Export_${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.xlsx`;

    // Create download link and trigger download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = fileName;
    link.click();

    // Clean up
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    this.handleError('Failed to export to Excel');
  }
}
}
