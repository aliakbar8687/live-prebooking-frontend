import { Component, OnInit } from '@angular/core';
import { PrebookFormService } from '../prebook-form.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isAdmin: boolean = false;
  userRole: string | null = null; // Holds the user's role
  currentDateTime: string|any; // Holds the current date and time

  constructor(private prebookFormService: PrebookFormService, private router: Router) {}

  ngOnInit(): void {
    // Check if the logged-in user is admin
    this.isAdmin = this.prebookFormService.isAdmin();

    // Fetch user role from the service
    this.userRole = this.prebookFormService.getUserRole();

    // Initialize current date and time
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000); // Update every second
  }

  // Method to update the current date and time
  updateDateTime(): void {
    const now = new Date();
    
    // Format the date part to "day month year"
    const optionsDate: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long', // Full month name
      year: 'numeric'
    };
  
    // Format the time part to 12-hour format
    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true // 12-hour format
    };
  
    const datePart = now.toLocaleDateString(undefined, optionsDate);
    const timePart = now.toLocaleTimeString(undefined, optionsTime);
    
    // Combine date and time in the desired format
    this.currentDateTime = `${datePart} ${timePart}`;
  }
  
  
  
  // Public method to check if the user is authenticated
  isAuthenticated(): boolean {
    return this.prebookFormService.isAuthenticated();
  }

  // Method to check if loading
  isLoading(): boolean {
    return this.prebookFormService.isLoading(); // Access loading state
  }

  // Logout method
  logout(): void {
    this.prebookFormService.logout();
    this.router.navigate(['/auth']); // Redirect to login after logout
  }

  // Navigate to AuthComponent and set the signup mode
  setSignupMode(): void {
    this.router.navigate(['/auth'], { queryParams: { mode: 'signup' } });
  }
}
