import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UserSwitcherComponent } from './features/user/components/user-switcher/user-switcher.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { StateService } from './core/services/state.service';
import { DataInitializerService } from './core/services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatSnackBarModule,
    UserSwitcherComponent,
    NotificationComponent,
    LoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
    constructor(
      public stateService: StateService,
      private dataInitializer: DataInitializerService
    ) {}
  
    async ngOnInit(): Promise<void> {
      try {
        this.stateService.setLoading(true);
        await this.dataInitializer.initializeData();
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        this.stateService.setLoading(false);
      }
    }
  }