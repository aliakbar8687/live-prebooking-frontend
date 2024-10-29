import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'exceljs';
import { format } from 'date-fns';
import { retry, catchError, throwError } from 'rxjs';


export interface DeliveryLog {
  id?: number;
  store: string;
  vehiclename: string;
  date: string;
  vehiclenumber: string;
  tripcount?: number;
  numoforder?: number;
  amount?: number;
  remarks?: string;
}

@Component({
  selector: 'app-delivery-log-table',
  templateUrl: './delivery-log-table.component.html',
  styleUrls: ['./delivery-log-table.component.css']
})
export class DeliveryLogTableComponent implements OnInit {
  deliveryLogs: DeliveryLog[] = [];
  selectedStore: string = '';
  selectedVehicle: string = '';
  deliveryLog: DeliveryLog = { store: '', vehiclename: '', date: '', vehiclenumber: '' };
  isModalOpen: boolean = false;
  isEdit: boolean = false;
  successMessage: string = ''; // Property for success message
  totalTripCount: number = 0;
  totalNumOfOrders: number = 0;
  totalAmount: number = 0;
  
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('All query params:', params);  // Log all query params
      this.selectedStore = params['store'];
      this.selectedVehicle = params['vehiclename'] || params['vehicle'];  // Try both 'vehiclename' and 'vehicle'
      console.log('Selected Store:', this.selectedStore);
      console.log('Selected Vehicle:', this.selectedVehicle);
      if (!this.selectedVehicle) {
        console.error('Vehicle name is undefined. Please check the URL parameters.');
      }
      this.loadDeliveryLogs();
    });
  }

  loadDeliveryLogs(): void {
    if (this.selectedStore && this.selectedVehicle) {
      this.http.get<DeliveryLog[]>(`https://prebookingapi.hyperwafa.com/api/deliverylog?store=${this.selectedStore}&vehicle=${this.selectedVehicle}`)
        .subscribe(
          (data: DeliveryLog[]) => {
            this.deliveryLogs = data;
            this.calculateTotals(); // Calculate totals
            this.showSuccessMessage('Delivery logs loaded successfully!');
          },
          (error) => console.error('Error loading delivery logs:', error)
        );
    }
  }
  
  // Method to calculate totals
  calculateTotals(): void {
    this.totalTripCount = this.deliveryLogs.reduce((sum, log) => sum + (log.tripcount || 0), 0);
    this.totalNumOfOrders = this.deliveryLogs.reduce((sum, log) => sum + (log.numoforder || 0), 0);
    this.totalAmount = this.deliveryLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
  }

  openModal(): void {
    this.isModalOpen = true;
    this.isEdit = false;
    window.scrollTo(0, 0);
    this.deliveryLog = { 
      store: this.selectedStore, 
      vehiclename: this.selectedVehicle, 
      date: '', 
      vehiclenumber: '' 
    };
    
    this.fetchVehicleNumber();
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  fetchVehicleNumber(): void {
    console.log('Fetching vehicle number for:', this.selectedStore, this.selectedVehicle);
    this.http.get<{ vehiclenumber: string }>(
      `https://prebookingapi.hyperwafa.com/api/vehicle-number?store=${encodeURIComponent(this.selectedStore)}&vehicleName=${encodeURIComponent(this.selectedVehicle)}`
    ).subscribe(
      response => {
        console.log('Fetched vehicle number:', response.vehiclenumber);
        this.deliveryLog.vehiclenumber = response.vehiclenumber;
      },
      error => console.error('Error fetching vehicle number:', error)
    );
  }

  addDeliveryLog(): void {
    if (this.isFormValid()) {
      this.http.post('https://prebookingapi.hyperwafa.com/api/deliverylog', this.deliveryLog)
        .subscribe(
          () => {
            this.loadDeliveryLogs();
            this.closeModal();
            this.showSuccessMessage('Delivery log added successfully!'); // Show success message
          },
          (error) => console.error('Error adding delivery log:', error)
        );
    }
  }

  editDeliveryLog(log: DeliveryLog): void {
    this.deliveryLog = { ...log };
    
    // Format the date to YYYY-MM-DD
    if (this.deliveryLog.date) {
      const date = new Date(this.deliveryLog.date);
      this.deliveryLog.date = date.toISOString().split('T')[0];
    }
    
    this.isEdit = true;
    this.isModalOpen = true;
  }

  updateDeliveryLog(): void {
    if (this.deliveryLog.id !== undefined && this.isFormValid()) {
      try {
        // Create a clean copy of the delivery log with default values
        const updatedLog = {
          id: this.deliveryLog.id,
          store: this.deliveryLog.store || '',
          vehiclename: this.deliveryLog.vehiclename || '',
          vehiclenumber: this.deliveryLog.vehiclenumber || '',
          tripcount: this.deliveryLog.tripcount || 0,
          numoforder: this.deliveryLog.numoforder || 0,
          amount: this.deliveryLog.amount || 0,
          remarks: this.deliveryLog.remarks || '',
          date: this.deliveryLog.date ? 
            new Date(this.deliveryLog.date).toISOString().split('T')[0] : null
        };
  
        // Replace localhost with environment variable in production
        const apiUrl =  
          'https://prebookingapi.hyperwafa.com';
  
        this.http.put(`${apiUrl}/api/deliverylog/${updatedLog.id}`, updatedLog)
          .pipe(
            retry(1), // Retry failed request once
            catchError((error) => {
              console.error('Error updating delivery log:', error);
              this.showSuccessMessage('Failed to update delivery log. Please try again.');
              return throwError(() => error);
            })
          )
          .subscribe({
            next: (response) => {
              this.loadDeliveryLogs();
              this.closeModal();
              this.showSuccessMessage('Delivery log updated successfully!');
            },
            error: (error) => {
              if (error.status === 500) {
                this.showSuccessMessage('Server error occurred. Please try again later.');
              } else if (error.status === 404) {
                this.showSuccessMessage('Delivery log not found.');
              } else {
                this.showSuccessMessage('Error updating delivery log. Please try again.');
              }
            },
            complete: () => {
              // Optional: Add any cleanup code here
            }
          });
      } catch (error) {
        console.error('Error preparing delivery log data:', error);
        this.showSuccessMessage('Error preparing data for update.');
      }
    } else {
      const errorMessage = !this.deliveryLog.id ? 
        'Delivery log ID is missing.' : 
        'Please fill in all required fields.';
      this.showSuccessMessage(errorMessage);
      console.error('Validation error:', errorMessage);
    }
  }

  deleteDeliveryLog(id?: number): void {
    if (id !== undefined && confirm('Are you sure you want to delete this delivery log?')) {
      this.http.delete(`https://prebookingapi.hyperwafa.com/api/deliverylog/${id}`)
        .subscribe(
          () => {
            this.loadDeliveryLogs();
            this.showSuccessMessage('Delivery log deleted successfully!'); // Show success message
          },
          (error) => console.error('Error deleting delivery log:', error)
        );
    } else if (id === undefined) {
      console.error('Delivery log ID is undefined, cannot delete.');
    }
  }

  // Function to show success message
  showSuccessMessage(message: string): void {
    this.successMessage = message; // Set the success message
    setTimeout(() => {
      this.successMessage = ''; // Clear the message after 2 seconds
    }, 2000);
  }

  // Helper method to ensure all required fields are filled
  isFormValid(): boolean {
    return !!(this.deliveryLog.store && 
              this.deliveryLog.vehiclename && 
              this.deliveryLog.date && 
              this.deliveryLog.vehiclenumber &&
              this.deliveryLog.tripcount !== undefined &&
              this.deliveryLog.numoforder !== undefined &&
              this.deliveryLog.amount !== undefined);
  }

  exportToExcel() {
    // Show prompt for filename and handle cancellation
    const userInput = prompt("Please enter the filename:", "DeliveryLogs.xlsx");
    
    // If user clicks Cancel or enters empty string, return early
    if (userInput === null || userInput.trim() === '') {
      return;
    }
  
    // Use user input or default filename
    const filename = userInput.trim() || 'DeliveryLogs.xlsx';
    
    // Ensure filename has .xlsx extension
    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  
    try {
      // Create workbook and worksheet
      if (!XLSX) {
        throw new Error('XLSX library is not loaded');
      }
  
      const workbook = new XLSX.Workbook();
      if (!workbook) {
        throw new Error('Failed to create workbook');
      }
  
      const worksheet = workbook.addWorksheet('DeliveryLogs');
      if (!worksheet) {
        throw new Error('Failed to create worksheet');
      }
  
      // Check if deliveryLogs exists and has data
      if (!this.deliveryLogs || !Array.isArray(this.deliveryLogs) || this.deliveryLogs.length === 0) {
        this.showSuccessMessage?.('No delivery logs data to export.');
        return;
      }
  
      // Define headers
      const headers = [
        "Store", "Vehicle Name", "Date", "Vehicle Number", 
        "Trip Count", "Number of Orders", "Amount", "Remarks"
      ];
  
      // Create data rows with proper date formatting and null checks
      const data = this.deliveryLogs.map(log => [
        log?.store ?? '',
        log?.vehiclename ?? '',
        log?.date ? format(new Date(log.date), 'dd MMM yyyy') : '',
        log?.vehiclenumber ?? '',
        log?.tripcount ?? 0,
        log?.numoforder ?? 0,
        log?.amount ?? 0,
        log?.remarks ?? ''
      ]);
  
      // Add headers and data
      const allData = [headers, ...data];
      worksheet.addRows(allData);
  
      // Style headers (first row)
      const headerRow = worksheet.getRow(1);
      if (headerRow?.eachCell) {
        headerRow.eachCell((cell, colNumber) => {
          if (cell) {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFA50000' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      }
  
      // Set column widths with null checks
      if (worksheet.columns) {
        worksheet.columns.forEach(column => {
          if (column) {
            let maxLength = 0;
            column.eachCell?.({ includeEmpty: true }, cell => {
              const columnLength = cell?.value ? cell.value.toString().length : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            column.width = Math.min(Math.max(maxLength + 2, 10), 30);
          }
        });
      }
  
      // Add and style totals row with null checks
      const totalRow = worksheet.addRow([
        "Totals", "", "", "", 
        this.totalTripCount ?? 0, 
        this.totalNumOfOrders ?? 0, 
        (this.totalAmount ?? 0).toFixed(2),
        ""
      ]);
  
      if (totalRow?.eachCell) {
        totalRow.eachCell((cell, colNumber) => {
          if (cell) {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF00A550' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      }
  
      // Generate and download file
      if (!workbook.xlsx?.writeBuffer) {
        throw new Error('Write buffer method not found');
      }
  
      workbook.xlsx.writeBuffer()
        .then((buffer) => {
          if (!buffer) {
            throw new Error('Failed to generate Excel buffer');
          }
  
          const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = finalFilename;
          link.click();
          
          // Clean up the URL object
          setTimeout(() => {
            if (link.href) {
              window.URL.revokeObjectURL(link.href);
            }
          }, 100);
  
          this.showSuccessMessage?.('Delivery logs exported to Excel successfully!');
        })
        .catch(error => {
          console.error('Export failed:', error);
          this.showSuccessMessage?.('Failed to export delivery logs to Excel.');
        });
  
    } catch (error) {
      console.error('Error in export process:', error);
      this.showSuccessMessage?.('An error occurred while preparing the export.');
    }
  }

  

  
  
}
