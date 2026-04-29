import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from 'app/core/services/users';

@Component({
  selector: 'app-dashboard-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-users.html',
  styleUrl: './dashboard-users.css',
})
export class DashboardUsers {
  searchTerm = '';
  suspendModal = false;
  suspendTarget: User | null = null;
  suspendDays = 3;

  constructor(public usersService: UsersService) {}

  get filteredUsers(): User[] {
    const q = this.searchTerm.trim().toLowerCase();
    const all = this.usersService.getAll();
    return q ? all.filter(u => u.name.toLowerCase().includes(q) || u.email.includes(q)) : all;
  }

  activate(id: number)  { this.usersService.activate(id); }
  ban(id: number)        { this.usersService.ban(id); }

  openSuspendModal(u: User): void {
    this.suspendTarget = u;
    this.suspendDays   = 3;
    this.suspendModal  = true;
  }

  confirmSuspend(): void {
    if (this.suspendTarget) {
      this.usersService.suspend(this.suspendTarget.id, this.suspendDays);
    }
    this.suspendModal = false;
  }
}
