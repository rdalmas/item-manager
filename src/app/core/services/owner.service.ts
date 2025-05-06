import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

export interface Owner {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class OwnerService {
  private owners$ = new BehaviorSubject<Owner[]>([]);
  private readonly STORAGE_KEY = 'owners';

  constructor(private storageService: StorageService) {
    this.loadOwners();
  }

  private loadOwners(): void {
    const storedOwners = this.storageService.getItem<Owner[]>(this.STORAGE_KEY);
    if (storedOwners) {
      this.owners$.next(storedOwners);
    } else {
      fetch('assets/owners.json')
        .then(response => response.json())
        .then((owners: Owner[]) => {
          this.storageService.setItem(this.STORAGE_KEY, owners);
          this.owners$.next(owners);
        });
    }
  }

  getOwners(): Observable<Owner[]> {
    return this.owners$.asObservable();
  }

  getOwnerName(id: number): string {
    const owner = this.owners$.value.find(o => o.id === id);
    return owner ? owner.name : `Unknown Party (${id})`;
  }
}