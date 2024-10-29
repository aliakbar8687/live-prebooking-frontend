import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrebookFormService } from '../prebook-form.service';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css']
})
export class TicketFormComponent implements OnInit {
  ticketForm: FormGroup;
  uniqueId: string = '';
  vehicles: any[] = [];
  filteredVehicles: any[] = [];
  userRole: string = '';
  isUpdateMode: boolean = false;
  confirmationDialogVisible: boolean = false;
  successMessage: string = '';
  allTickets: any[] = [];
  ticketsModalVisible: boolean = false;
  isLoading = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private vehicleService: PrebookFormService,
    private router: Router
  ) {
    this.ticketForm = this.fb.group({
      itemId: ['', Validators.required],
      ticketNumber: ['', Validators.required],
      vehicleName: ['', Validators.required],
      vehicleNumber: ['', Validators.required],
      status: ['', Validators.required],
      store: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.uniqueId = params.get('uniqueId')!;
      console.log('Unique ID from route:', this.uniqueId);
      // this.ticketForm.patchValue({'itemId': this.uniqueId})
      this.checkExistingTicket(this.uniqueId);
    });

    this.userRole = localStorage.getItem('userRole') || '';
    console.log('User Role:', this.userRole);

    this.loadVehicles();

    if (this.userRole.startsWith('admin')) {
      this.fetchAllTickets();
    }

    this.ticketForm.get('vehicleName')?.valueChanges.subscribe(selectedVehicle => {
      const selectedVehicleData = this.filteredVehicles.find(v => v.vehiclename === selectedVehicle);
      this.ticketForm.patchValue({
        vehicleNumber: selectedVehicleData ? selectedVehicleData.vehiclenumber : '',
        store: selectedVehicleData ? selectedVehicleData.store : ''
      });
    });

    this.ticketForm.get('itemId')?.valueChanges.subscribe(itemId => {
      this.filterVehicles(itemId);
    });
  }

  loadVehicles(): void {
    console.log('Fetching vehicles based on user role...');
    this.vehicleService.getVehicles().subscribe(data => {
      this.vehicles = data;
      if (this.vehicles.length === 0) {
        console.warn('No vehicles found for the user role:', this.userRole);
      }
      console.log('Fetched vehicles:', this.vehicles);
      
      this.filterVehicles(this.ticketForm.get('itemId')?.value);
    }, error => {
      console.error('Error fetching vehicles:', error);
    });
  }

  filterVehicles(itemId: string): void {
    if (!itemId || itemId.length < 4) {
      this.filteredVehicles = [];
      return;
    }

    const itemIdPrefix = itemId.substring(0, 4);
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const storeSuffix = vehicle.store.slice(-4);
      return itemIdPrefix === storeSuffix;
    });

    console.log('Filtered vehicles:', this.filteredVehicles);

    const currentVehicleName = this.ticketForm.get('vehicleName')?.value;
    if (!this.filteredVehicles.some(v => v.vehiclename === currentVehicleName)) {
      this.ticketForm.patchValue({ vehicleName: '' });
    }
  }

  fetchAllTickets(): void {
    this.vehicleService.getAllTickets().subscribe(tickets => {
      this.allTickets = tickets;
      console.log('All Tickets:', this.allTickets);
    }, error => {
      console.error('Error fetching all tickets:', error);
    });
  }

  checkExistingTicket(itemId: string): void {
    this.vehicleService
        .getTicketByItemId(itemId)
        .subscribe(
          ticket => {
            if (!ticket) return;

            this.ticketForm.patchValue(ticket);
            this.isUpdateMode = true;
            localStorage.setItem('isUpdateMode', 'true');
          },
          err => {
            const ticketNumber = this.generateTicketNumber(itemId);
            this.ticketForm.patchValue({ itemId, ticketNumber });
            this.isUpdateMode = false;
            localStorage.setItem('isUpdateMode', 'false');
          }
        );
  }

  generateTicketNumber(itemId: string): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomChars = '';

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomChars += characters[randomIndex];
    }

    return `${itemId}${randomChars}`;
  }

  onSubmit() {
    if (this.ticketForm.valid) {
      this.isLoading = true;
      const ticketData = this.ticketForm.value;
      console.log('Ticket data:', ticketData);
      
      if (this.isUpdateMode) {
        this.vehicleService.updateTicket(this.uniqueId, ticketData).subscribe({
          next: (response) => {
            console.log('Ticket updated successfully:', response);
            this.showSuccessMessage('Ticket updated successfully!');
            this.ticketForm.reset();
            this.ticketForm.patchValue(response); // Update form with latest data
            // Optionally redirect: this.router.navigate(['/tickets']);
          },
          error: (error) => {
            console.error('Error updating ticket:', error);
            this.showSuccessMessage('Failed to update ticket. Please try again.');
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.vehicleService.submitTicket(ticketData).subscribe({
          next: (response) => {
            console.log('Ticket submitted successfully:', response);
            this.showSuccessMessage('Ticket created successfully!');
            this.ticketForm.reset();
            // Optionally redirect: this.router.navigate(['/tickets']);
          },
          error: (error) => {
            console.error('Error submitting ticket:', error);
            this.showSuccessMessage('Failed to create ticket. Please try again.');
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.ticketForm.controls).forEach(key => {
        const control = this.ticketForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      
      // Show error message for invalid form
      this.showSuccessMessage('Please fill in all required fields correctly.');
      
      // Log specific validation errors for debugging
      Object.keys(this.ticketForm.controls).forEach(key => {
        const control = this.ticketForm.get(key);
        if (control?.errors) {
          console.log(`Validation errors for ${key}:`, control.errors);
        }
      });
    }
  }
  showSuccessMessage(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
      this.router.navigate(['/prebooking-data']);
    }, 2000);
  }

  confirmDeletion() {
    this.confirmationDialogVisible = true;
  }

  deleteTicket() {
    const itemId = this.ticketForm.get('itemId')?.value;
    this.vehicleService.deleteTicket(itemId).subscribe(response => {
      console.log('Ticket deleted successfully:', response);
      this.successMessage = 'Ticket deleted successfully!';
      this.confirmationDialogVisible = false;
      
      setTimeout(() => {
        this.successMessage = '';
        this.router.navigate(['/prebooking-data']);
      }, 2000);
    }, error => {
      console.error('Error deleting ticket:', error);
    });
  }

  openTicketsModal(): void {
    this.ticketsModalVisible = true;
    if (this.userRole === 'admin') {
      this.fetchAllTickets();
    }
  }

  closeTicketsModal(): void {
    this.ticketsModalVisible = false;
  }
  close(){
    this.successMessage = 'Closing & Loading Data';
    setTimeout(() => {
      this.router.navigate(['/prebooking-data']);
    }, 2000);
  }
}