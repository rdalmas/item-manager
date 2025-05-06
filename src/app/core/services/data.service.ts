import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DataInitializerService {
  constructor(private storageService: StorageService) {}

  async initializeData(): Promise<void> {
    const keys = ['items', 'owners', 'users'];
    
    for (const key of keys) {
      if (!this.storageService.getItem(key)) {
        const response = await fetch(`assets/${key}.json`);
        const data = await response.json();
        this.storageService.setItem(key, data);
      }
    }
  }
}