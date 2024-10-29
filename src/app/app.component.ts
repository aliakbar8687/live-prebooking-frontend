import { Component, HostListener } from '@angular/core';
import { PrebookFormService } from './prebook-form.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'prebook App';
  
  constructor(private prebookFormService: PrebookFormService) {}
  
  // Method to check if the user is authenticated
  isAuthenticated(): boolean {
    return this.prebookFormService.isAuthenticated();
  }

  @HostListener('window:beforeunload', ['$event'])
  logoutOnBrowserClose(event: BeforeUnloadEvent): void {
    // Only attempt logout if user is authenticated
    if (this.isAuthenticated()) {
      // Check if the user is actually closing the browser or tab
      // (not just refreshing the page)
      if (this.isClosingBrowserOrTab(event)) {
        this.logoutUser();
      }
    }
  
    // Only show the confirmation dialog if the user is closing the browser window
    if (this.isClosingBrowserOrTab(event)) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
  
  private isClosingBrowserOrTab(event: BeforeUnloadEvent): boolean {
    // Check if the event is a 'beforeunload' event and is not trusted
    // (i.e., not triggered programmatically)
    return event.type === 'beforeunload' && !event.isTrusted;
  }
  
  private logoutUser(): void {
    try {
      // Call the logout method from service
      this.prebookFormService.logout();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Handle the error, e.g., display a message to the user
      alert('An error occurred during logout. Please try again later.');
    }
  }
}