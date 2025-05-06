import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JsonLoaderService {
  private readonly basePath: string;

  constructor(private http: HttpClient) {
    this.basePath = 'assets';
  }

  loadJson<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.basePath}/${path}.json`).pipe(
      catchError(this.handleError)
    );
  }

  async loadJsonAsync<T>(path: string): Promise<T> {
    try {
      const response = await fetch(`${this.basePath}/${path}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`Error loading ${path}.json:`, error);
      throw error;
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while loading data';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}