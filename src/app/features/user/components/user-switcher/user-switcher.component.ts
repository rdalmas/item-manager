import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../core/models/user.interface';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-user-switcher',
  standalone: true,
  imports: [CommonModule, MatSelectModule, FormsModule],
  templateUrl: './user-switcher.component.html',
  styleUrls: ['./user-switcher.component.scss']
})
export class UserSwitcherComponent implements OnInit {
  users: User[] = [];
  selectedUserId: number | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      
      this.userService.getCurrentUser().subscribe(currentUser => {
        this.selectedUserId = currentUser?.id || (users.length > 0 ? users[0].id : null);
        if (this.selectedUserId && !currentUser) {
          const selectedUser = users.find(u => u.id === this.selectedUserId);
          if (selectedUser) {
            this.userService.setCurrentUser(selectedUser);
          }
        }
      });
    });
  }

  onUserChange(): void {
    if (this.selectedUserId) {
      const selectedUser = this.users.find(u => u.id === this.selectedUserId);
      if (selectedUser) {
        this.userService.setCurrentUser(selectedUser);
      }
    }
  }
}