import { Component, OnInit } from '@angular/core';
import { PrebookFormService } from '../prebook-form.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.css']
})
export class ManageUserComponent implements OnInit {
  users: any[] = [];
  isAdmin: boolean = false;
  selectedUser: any = null; // To hold the user selected for updating
  showModal: boolean = false; // To control modal visibility for updating user
  showDeleteConfirmation: boolean = false; // To control delete confirmation modal visibility
  selectedUserId: number | null = null; // To hold the ID of the user to be deleted
  successMessage: string | null = null; // To hold success messages

  constructor(private userService: PrebookFormService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((data: any) => {
      this.users = data.users;
    });
  }

  editUser(user: any) {
    this.selectedUser = { ...user }; // Clone the user object
    this.showModal = true; // Open the modal for updating
  }

  openDeleteConfirmation(userId: number) {
    this.selectedUserId = userId; // Set the ID of the user to be deleted
    this.showDeleteConfirmation = true; // Show the delete confirmation modal
  }

  deleteUser() {
    if (this.selectedUserId !== null) { // Check if selectedUserId is not null
      this.userService.deleteUser(this.selectedUserId.toString()).subscribe(() => {
        this.loadUsers(); // Refresh the user list
        this.successMessage = 'User deleted successfully!';
        this.autoDismissSuccessMessage();
        this.closeDeleteConfirmation(); // Close the confirmation modal
      });
    }
  }

  updateUser() {
    this.userService.updateUser(this.selectedUser.Id.toString(), this.selectedUser).subscribe(() => {
      this.showModal = false; // Close the modal
      this.loadUsers(); // Refresh the user list
      this.successMessage = 'User updated successfully!';
      this.autoDismissSuccessMessage();
    });
  }

  closeModal() {
    this.showModal = false; // Close the modal without saving
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirmation = false; // Close the delete confirmation modal
    this.selectedUserId = null; // Clear the selected user ID
  }

  autoDismissSuccessMessage() {
    setTimeout(() => {
      this.successMessage = null;
    }, 2000); // Dismiss message after 2 seconds
  }
}
