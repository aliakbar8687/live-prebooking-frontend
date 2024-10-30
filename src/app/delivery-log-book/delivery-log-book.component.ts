import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PrebookFormService } from '../prebook-form.service';
import { Router } from '@angular/router';

export interface Vehicle {
  vehiclename: string;
  vehiclenumber: string;
  store: string;
}

export interface DeliveryLog {
  id: number;
  store: string;
  vehiclename: string;
  date: string;
  vehiclenumber: string;
  tripcount: number;
  numoforder: number;
  amount: number;
  remarks: string;
}

@Component({
  selector: 'app-delivery-log-book',
  templateUrl: './delivery-log-book.component.html',
  styleUrls: ['./delivery-log-book.component.css']
})
export class DeliveryLogBookComponent implements OnInit {
  stores: string[] = [
    "BATHA - 8310", "VILLAGIO - 8315", "TRAIN MALL - 8320", "KHARJ - 8325", "MALAZ - 8330",
    "SANAYA - 8335", "SHAQRA - 8340", "ARRAS - 8345", "MAJMA - 8350", "BURAIDA - 8355",
    "MINA PORT - 8415", "KHOBAR - 8420", "JUBAIL - 8425", "AL HASSA - 8430", "DABBAB - 8435",
    "BUDGET FOOD - 8485", "TUWAIQ - 9551", "EXIT16 - 9552", "MALAZ - 9553", "MAKKAH - 9651", 
    "TAIF - 9652","KHURAIS - 9555",
     "SHOLAY - 9554",
    " SHIFA - 9556"
  ];
  successMessage: string = ''; 
  vehicles: Vehicle[] = [];
  selectedStore: string = '';
  selectedVehicle: string = '';
  deliveryLogs: DeliveryLog[] = [];
  isAdmin: boolean = false;
  userStore: string = '';
  showAddVehicleModal: boolean = false;
  newVehicle: Vehicle = { vehiclename: '', vehiclenumber: '', store: '' };

  constructor(private http: HttpClient, private authService: PrebookFormService,private router: Router) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.userStore = this.authService.getUserRole()?.replace('store', '').trim() || '';

    if (this.isAdmin) {
      this.selectedStore = '';
    } else if (this.userStore) {
      this.selectedStore = this.userStore;
      this.stores = [this.userStore]; // Show only the user's store
      this.loadVehiclesForStore(this.userStore); // Load vehicles for the user's store
    }
  }

  loadVehiclesForStore(store: string): void {
    this.http.get<string[]>(`https://prebookingapi.hyperwafa.com/api/vehicles/${store}`).subscribe(
      (data: string[]) => {
        this.vehicles = data.map(vehiclename => ({
          vehiclename: vehiclename,
          vehiclenumber: 'N/A', // or generate a vehicle number if needed
          store: store
        }));
      },
      (error) => console.error('Error loading vehicles:', error)
    );
  }

  onStoreChange(): void {
    if (this.selectedStore) {
      this.loadVehiclesForStore(this.selectedStore);
    } else {
      this.vehicles = []; // Clear vehicles when no store is selected
    }
    this.selectedVehicle = '';
  }

  canViewDeliveryLog(): boolean {
    return this.selectedStore !== '' && this.selectedVehicle !== '';
  }

  viewDeliveryLog(): void {
    if (this.canViewDeliveryLog()) {
      this.successMessage = 'Navigating to Delivery Log...'; // Set the success message
  
      // Clear the success message after 2 seconds and redirect
      setTimeout(() => {
        this.router.navigate(['/delivery-log-table'], {
          queryParams: {
            store: this.selectedStore,
            vehiclename: this.selectedVehicle  // Ensure this is 'vehiclename'
          }
        });
        this.successMessage = ''; // Clear the message after redirection
      }, 2000);
    }
  }
  

  openAddVehicleModal(): void {
    this.showAddVehicleModal = true;
    this.newVehicle = { vehiclename: '', vehiclenumber: '', store: '' }; // Reset the newVehicle
  }
  
  closeAddVehicleModal(): void {
    this.showAddVehicleModal = false;
    this.newVehicle = { vehiclename: '', vehiclenumber: '', store: '' };
  }

  addVehicle(): void {
    const vehicleData: Vehicle = {
      vehiclename: this.newVehicle.vehiclename,
      vehiclenumber: this.newVehicle.vehiclenumber,
      store: this.newVehicle.store
    };
  
    // Check if the vehicle already exists (by name or number)
    this.http.get<{exists: boolean, message: string}>(`https://prebookingapi.hyperwafa.com/api/vehicles/check?store=${vehicleData.store}&vehiclenumber=${vehicleData.vehiclenumber}&vehiclename=${vehicleData.vehiclename}`).subscribe(
      (response: {exists: boolean, message: string}) => {
        if (response.exists) {
          this.successMessage = response.message;
          // Clear the success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        } else {
          // If the vehicle doesn't exist, proceed with adding it
          this.http.post('https://prebookingapi.hyperwafa.com/api/vehicles', vehicleData).subscribe(
            (response) => {
              console.log('Vehicle added successfully', response);
              this.successMessage = 'Vehicle added successfully!';
              this.closeAddVehicleModal();
              this.loadVehiclesForStore(this.selectedStore); // Refresh vehicles list
              // Clear the success message after 2 seconds
              setTimeout(() => {
                this.successMessage = '';
              }, 2000);
            },
            (error) => {
              console.error('Error adding vehicle:', error);
              this.successMessage = 'Error adding vehicle. Please try again.';
              // Clear the error message after 3 seconds
              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
            }
          );
        }
      },
      (error) => {
        console.error('Error checking vehicle existence:', error);
        this.successMessage = 'Error checking vehicle existence. Please try again.';
        // Clear the error message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    );
  }
}
