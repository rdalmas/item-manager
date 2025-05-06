import { ErrorHandler, Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  constructor(
    private notificationService: NotificationService,
    private stateService: StateService
  ) {}

  handleError(error: Error): void {
    console.error(error);
    this.stateService.setError(error.message);
    this.notificationService.addNotification(error.message, 'error');
  }
}