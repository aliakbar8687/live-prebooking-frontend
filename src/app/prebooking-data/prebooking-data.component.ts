import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { PrebookFormService } from '../prebook-form.service';
import * as XLSX from 'exceljs';

@Component({
  selector: 'app-prebooking-data',
  templateUrl: './prebooking-data.component.html',
  styleUrls: ['./prebooking-data.component.css']
})
export class PrebookingDataComponent implements OnInit {
  prebookingData: any[] = [];
  filteredData: any[] = [];
  searchText: string = '';
  page: number = 1;
  userRole: string | null = null;
  isModalOpen: boolean = false;
  selectedUniqueId: string = '';
  successMessage: string = '';
  itemsPerPage: number = 5; // Default value
  itemsPerPageOptions: number[] = [5, 10, 20, 50]; // Options for dropdown
  isAdmin: boolean = false;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private prebookFormService: PrebookFormService
  ) {}

  ngOnInit() {
    this.userRole = this.prebookFormService.getUserRole();
    console.log('User Role:', this.userRole);
    this.loadPrebookingData();
    this.isAdmin = this.prebookFormService.isAdmin();

  }

  loadPrebookingData() {
    this.http.get('https://prebookingapi.hyperwafa.com/api/prebookings').subscribe(
      (data: any) => {
        this.prebookingData = data;
        console.log('Prebooking Data:', this.prebookingData);
        this.filterDataByRole();
      },
      (error) => {
        console.error('Error loading prebooking data:', error);
      }
    );
  }

  filterDataByRole() {
    if (this.userRole === 'admin') {
      this.filteredData = this.prebookingData;
      console.log('Filtered Data for Admin:', this.filteredData);
    } else if (this.userRole) {
      const userStoreSuffix = this.userRole.slice(-4).trim();
      console.log('User Store Suffix:', userStoreSuffix);
  
      this.filteredData = this.prebookingData.filter(item => {
        const storeSuffix = item.store.slice(-4).trim();
        console.log('Store Suffix:', storeSuffix);
        return storeSuffix === userStoreSuffix;
      });
  
      console.log('Filtered Data for Store Users:', this.filteredData);
    } else {
      this.filteredData = [];
      console.log('No user role found, filtered data is empty.');
    }
  }

  openModal(uniqueId: string) {
    this.selectedUniqueId = uniqueId;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  goToPrebookingForm() {
    this.router.navigate(['/prebook-form']);
    this.showSuccessMessage('Navigated to Prebooking Form!');
  }

  editPrebooking(uniqueId: string) {
    console.log('Navigating to update prebooking with ID:', uniqueId);
    this.router.navigate(['/update-prebooking', uniqueId]);
    this.showSuccessMessage('Navigated to update Prebooking!');
  }

  updateBooking() {
    console.log('Navigating to update prebooking with ID:', this.selectedUniqueId);
    this.router.navigate(['/update-prebooking', this.selectedUniqueId]);
    this.closeModal();
    this.showSuccessMessage('Update booking initiated!');
  }

  createTicket() {
    console.log('Creating ticket for:', this.selectedUniqueId);
    this.router.navigate(['/ticket-form', this.selectedUniqueId]);
    this.closeModal();
    this.showSuccessMessage('Ticket created successfully!');
  }

  exportToExcel() {
    // Show prompt for filename
    const userInput = prompt("Please enter the filename:", "PrebookingData.xlsx");
    
    // If user clicks Cancel or enters empty string, return early
    if (userInput === null || userInput.trim() === '') {
      return;
    }
  
    // Use user input or default filename
    const filename = userInput.trim() || 'PrebookingData.xlsx';
    
    // Ensure filename has .xlsx extension
    const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  
    const workbook = new XLSX.Workbook();
    const worksheet = workbook.addWorksheet('PrebookingData');
  
    // Add headers only if there is data
    if (this.filteredData.length > 0) {
      const headers = Object.keys(this.filteredData[0]);
      const headerRow = worksheet.addRow(headers);
  
      // Style header row
      headerRow.eachCell((cell) => {
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFA50000' }
        };
      });
  
      // Add data rows
      this.filteredData.forEach(data => {
        worksheet.addRow(Object.values(data));
      });
  
      // Set column widths
      worksheet.columns.forEach(column => {
        column.width = 15;
      });
  
      // Generate and download file
      workbook.xlsx.writeBuffer()
        .then((buffer) => {
          const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = finalFilename;
          link.click();
          this.showSuccessMessage('Data exported to Excel successfully!');
        })
        .catch(error => {
          console.error('Export failed:', error);
          this.showSuccessMessage('Failed to export data to Excel.');
        });
    } else {
      this.showSuccessMessage('No data to export.');
    }
  }
  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  onItemsPerPageChange(newItemsPerPage: number) {
    this.itemsPerPage = newItemsPerPage;
    this.page = 1;
  }

  deletePrebooking(uniqueId: string): void {
    if (confirm('Are you sure you want to delete this prebooking?')) {
      this.prebookFormService.deletePrebookingData(uniqueId).subscribe(
        response => {
          this.loadPrebookingData(); 
          this.showSuccessMessage('Prebooking deleted successfully');
          this.closeModal();
        },
        error => {
          this.showSuccessMessage('Error deleting prebooking. Please try again.');
        }
      );
    }
  }
}