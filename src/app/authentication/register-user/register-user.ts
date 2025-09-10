import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserApiService } from '../../services/user.service';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
}

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './register-user.html',
  styleUrls: ['./register-user.scss']
})
export class RegisterUserComponent implements OnInit {
  users: User[] = [];
  editingUserId: string | null = null;  
  editingUser: User = {} as User;
  originalEditingUser: User = {} as User;

  showConfirmModal = false;
  confirmationTitle = '';
  confirmationMessage = '';
  pendingAction: (() => void) | null = null;

  constructor(private snackBar: MatSnackBar, private userApi: UserApiService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userApi.getUsers().subscribe({
      next: (data) => this.users = data,
      error: () => this.snackBar.open('Failed to fetch users', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  startEdit(user: User): void {
    this.editingUserId = user._id;
    this.editingUser = { ...user };
    this.originalEditingUser = { ...user };
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.editingUser = {} as User;
    this.originalEditingUser = {} as User;
  }

  confirmSave(): void {
    if (this.isValidUser(this.editingUser)) {
      this.confirmationTitle = 'Confirm Changes';
      this.confirmationMessage = `Are you sure you want to save the changes for ${this.editingUser.name}?`;
      this.pendingAction = () => this.saveUser();
      this.showConfirmModal = true;
    } else {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
    }
  }

  confirmDelete(user: User): void {
    this.confirmationTitle = 'Confirm Delete';
    this.confirmationMessage = `Are you sure you want to delete the user "${user.name}"? This action cannot be undone.`;
    this.pendingAction = () => this.deleteUser(user._id);
    this.showConfirmModal = true;
  }

  saveUser(): void {
    if (!this.editingUserId) return;

    this.userApi.updateUser(this.editingUserId, this.editingUser).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u._id === this.editingUserId);
        if (index !== -1) this.users[index] = updatedUser;
        this.snackBar.open('User updated successfully', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.cancelEdit();
        this.closeModal();
      },
      error: () => this.snackBar.open('Failed to update user', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  deleteUser(userId: string): void {
    this.userApi.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== userId);
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.closeModal();
      },
      error: () => this.snackBar.open('Failed to delete user', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  cancelAction(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.showConfirmModal = false;
    this.confirmationTitle = '';
    this.confirmationMessage = '';
    this.pendingAction = null;
  }

  private isValidUser(user: User): boolean {
    return !!(
      user.name?.trim() &&
      user.email?.trim() &&
      this.isValidEmail(user.email) &&
      user.phone?.trim() &&
      (!user.password || user.password.length >= 6)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
