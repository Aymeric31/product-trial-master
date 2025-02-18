import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/login';

  constructor(private http: HttpClient) { }

  // Connection function
  login(email: string, password: string): Observable<any> {
    // Save the email into local storage
    localStorage.setItem('authEmail', email);
    return this.http.post(this.apiUrl, { email, password });
  }

  // Function to store credentials and expiration time information
  saveToken(token: string): void {
    const expirationTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour to milliseconds
    localStorage.setItem("authToken", token);
    localStorage.setItem("authTokenExpiration", expirationTime.toString());
  }
  isTokenExpired(): boolean {
    const expiration = localStorage.getItem("authTokenExpiration");
    if (!expiration) return true;
  
    return new Date().getTime() > parseInt(expiration, 10);
  }

  // Function to retrieve credentials
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Get the user email
  getEmail(): string | null {
    return localStorage.getItem('authEmail');
  }

  // Function to delete credentials
  logout(): void {
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authToken');
    localStorage.removeItem("authTokenExpiration");
  }

  // Function to check if user is logged in and if the token is expired
  isAuthenticated(): boolean {
    if (this.isTokenExpired()) {
      this.logout(); // Delete token if it expired
      return false;
    }
    return this.getToken() !== null;
  }
  
  // Check the user email
  isAdmin(): boolean {
    const email = this.getEmail();
    return email === 'admin@admin.com';
  }
}