import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    
  ],
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isConnected: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isConnected = this.authService.isAuthenticated(); // Verify that the user is connected
  }

  onLogin(form: any): void {
    if (form.invalid) {
      return;
    }

    this.authService.login(this.email, this.password).pipe(
      tap((response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/products']);
      }),
      catchError(() => {
        this.errorMessage = 'Email ou mot de passe incorrect.';
        return of(null);
      })
    ).subscribe();
  }
}
