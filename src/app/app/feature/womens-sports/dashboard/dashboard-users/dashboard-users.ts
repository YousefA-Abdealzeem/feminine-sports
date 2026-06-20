import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from 'app/core/services/users';

@Component({
  selector: 'app-dashboard-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-users.html',
  styleUrl: './dashboard-users.css',
})
export class DashboardUsers implements OnInit {

  // ===== Filters =====
  searchTerm: string = '';
  filterStatus: string = 'all';

  // ===== Selection =====
  selectedUser: User | null = null;

  // ===== Suspend Modal =====
  suspendModal: boolean = false;
  suspendTarget: User | null = null;
  suspendDays: number = 0;

  constructor(public usersService: UsersService) {}

  ngOnInit(): void {
    this.usersService.loadUsers();
  }

  // ===== Filtered Users =====
  get filteredUsers(): User[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.usersService.getAll().filter(u => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchStatus =
        this.filterStatus === 'all' ||
        u.status === this.filterStatus;

      return matchSearch && matchStatus;
    });
  }

  // ===== Actions =====

  ban(userId: number): void {
    this.usersService.ban(userId);
  }

  activate(userId: number): void {
    this.usersService.unban(userId);
  }

  deleteUser(u: User): void {
    this.usersService.deleteUser(u.id);
  }

  viewUser(u: User): void {
    this.selectedUser = u;
  }

  closeModal(): void {
    this.selectedUser = null;
  }

  // ===== Suspend Modal =====

  openSuspendModal(user: User): void {
    this.suspendTarget = user;
    this.suspendDays = 0;
    this.suspendModal = true;
  }

  closeSuspendModal(): void {
    this.suspendModal = false;
    this.suspendTarget = null;
    this.suspendDays = 0;
  }

  confirmSuspend(): void {
    if (!this.suspendTarget || this.suspendDays <= 0) return;
    this.usersService.suspend(this.suspendTarget.id, this.suspendDays);
    this.closeSuspendModal();
  }

  // ===== Helpers =====

  statusLabel(s: string): string {
    return s === 'active'
      ? 'نشط'
      : s === 'suspended'
      ? 'موقف'
      : 'محظور';
  }

  statusClass(s: string): string {
    return s === 'active'
      ? 'green'
      : s === 'suspended'
      ? 'orange'
      : 'red';
  }
}