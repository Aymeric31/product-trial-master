import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/login';

  constructor(private http: HttpClient) { }

  // Connection function
  login(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(this.apiUrl, { email, password }).pipe(
      tap(response => {
        // Store token, l'ID et l'email into localStorage
        this.saveToken(response.token, email);
      })
    );
  }
  
  // Function to store credentials and expiration time information
  saveToken(token: string, email: string): void {
    const expirationTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour to milliseconds
    localStorage.setItem("authToken", token);
    localStorage.setItem('authEmail', email);
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

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      return null;
    }
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