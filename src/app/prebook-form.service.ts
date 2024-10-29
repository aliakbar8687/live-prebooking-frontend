import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, retry, tap, throwError } from 'rxjs';
import { UserResponse } from './auth/auth.component';

export interface AuthResponse {
  token: string;   // Token returned from the server upon successful login
  role: string;    // User role (admin/store/user)
  message: string; // Message returned from the server
}

export interface AuthUser {
  token: string | null;  // User token (null if not logged in)
  role: string | null;   // User role (admin/store/user)
}

@Injectable({
  providedIn: 'root'
})
export class PrebookFormService {
  private baseUrl = 'https://prebookingapi.hyperwafa.com/api'; // Backend API URL
  private authTokenKey = 'authToken'; // Key for storing the token in localStorage
  private loading: boolean = false; // Add a loading state

  constructor(private http: HttpClient) { }

  // Fetch products
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`).pipe(
      tap(response => console.log('API Response:', response)),
      catchError(error => {
        console.error('Error fetching products:', error.message);
        return throwError(error);
      })
    );
  }

  // Set loading state
  setLoading(state: boolean) {
    this.loading = state;
  }

  // Method to get loading state
  isLoading(): boolean {
    return !!this.loading; 
  }

  submitPrebooking(data: any): Observable<any> {
    // Only setting content type header
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    return this.http.post(`${this.baseUrl}/prebooking`, data, {
      headers: headers
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error details:', error);
    if (error.status === 0) {
      return throwError(() => 'Network error occurred. Please check your internet connection');
    }
    return throwError(() => error.error?.message || 'An unexpected error occurred');
  }


  // Update prebooking data
  updatePrebooking(uniqueId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/prebooking/${uniqueId}`, data).pipe(
      tap(response => console.log('Update Response:', response)),
      catchError(error => {
        console.error('Error updating prebooking data:', error.message);
        return throwError(error);
      })
    );
  }

  // Add product
  addProduct(productName: string, category: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/products`, { productName, category });
  }
  

  removeProduct(productName: string): Observable<any> {
    const body = { productName }; // Only send productName
    return this.http.delete(`${this.baseUrl}/products`, { body });
  }
  
  



  // Signup
  signup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, data).pipe(
      tap(response => console.log('Signup Response:', response)),
      catchError(error => {
        console.error('Signup error:', error.message);
        return throwError(error);
      })
    );
  }

  // Fetch stores
  getStores(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/stores`);
  }

  // Login method in your service
  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((response: AuthResponse) => {
        if (response.token) {
          this.storeToken(response.token); // Store the token
          this.storeUserRole(response.role); // Store the user role (admin/store/user)
        }
      }),
      catchError(error => {
        console.error('Login error:', error.message);
        return throwError(error);
      })
    );
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.authTokenKey, token);
  }

  private storeUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }

  // Get the current user role
  getUserRole(): string | null {
    return localStorage.getItem('userRole'); // Retrieve user role
  }

  // Logout method
  logout(): void {
    localStorage.removeItem(this.authTokenKey); // Remove token
    localStorage.removeItem('userRole'); // Remove user role
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.authTokenKey); // Check if token exists and coerce to boolean
  }

  // Check if user is an admin
  isAdmin(): boolean {
    return this.getUserRole() === 'admin'; // Check if user role is admin
  }

  // Check if user belongs to a store
  isStoreUser(): boolean {
    const role = this.getUserRole();
    return role !== null && role.startsWith('store'); // Ensure role is not null before checking
  }

  // Check if user is a regular user (non-admin, non-store)
  isRegularUser(): boolean {
    return this.getUserRole() === 'user'; // Check if user role is 'user'
  }

  // Get the current user details (token and role)
  getCurrentUser(): AuthUser {
    const token = localStorage.getItem(this.authTokenKey); // Get token
    const role = localStorage.getItem('userRole'); // Get role
    return { token, role }; // Return user data
  }

  // Fetch prebooking data by unique ID
  getPrebookingData(uniqueId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/prebooking/${uniqueId}`); // Make sure the endpoint is correct
  }
  deletePrebookingData(uniqueId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/prebooking/${uniqueId}`);
  }
  

  // Fetch vehicles
  getVehicles(): Observable<any> {
    const userRole = localStorage.getItem('userRole'); // Fetch user role from localStorage
    console.log('Fetching vehicles for role:', userRole);
    
    // Append only userRole to the request parameters
    return this.http.get<any>(`${this.baseUrl}/vehicles?role=${userRole}`);
  }

  // Submit a ticket
  submitTicket(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tickets`, data).pipe(
      tap(response => console.log('Submit Ticket Response:', response)),
      catchError(error => {
        console.error('Error submitting ticket:', error.message);
        return throwError(error);
      })
    );
  }

  // Fetch a ticket by itemId
  getTicketByItemId(itemId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tickets/${itemId}`);
  }

  // Delete a ticket
  deleteTicket(itemId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tickets/${itemId}`);
  }

  // Update a ticket
  updateTicket(ticketId: string, ticketData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/tickets/${ticketId}`, ticketData).pipe(
      catchError((error) => {
        console.error('Error updating ticket:', error);
        return throwError(error);
      })
    );
  }

  // Get all tickets
  getAllTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tickets`);
  }

  // Fetch all users
  getAllUsers(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/users`).pipe(
      tap(response => console.log('Fetched users:', response)),
      catchError(error => {
        console.error('Error fetching users:', error.message);
        return throwError(error);
      })
    );
  }
  
  // Update user data
  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}`, data).pipe(
      tap(response => console.log('Update User Response:', response)),
      catchError(error => {
        console.error('Error updating user:', error.message);
        return throwError(error);
      })
    );
  }

  // Delete a user
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`).pipe(
      tap(response => console.log('Delete User Response:', response)),
      catchError(error => {
        console.error('Error deleting user:', error.message);
        return throwError(error);
      })
    );
  }


    // Fetch activity logs from the backend
    getActivityLogs(): Observable<any> {
      return this.http.get<any>(`${this.baseUrl}/activitylog`).pipe(
        tap(response => console.log('Activity Logs:', response)),
        catchError(error => {
          console.error('Error fetching activity logs:', error.message);
          return throwError(error);
        })
      );
    }

      // Delete selected logs
  deleteLogs(logIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/delete-logs`, { logIds });
  }


  
}
