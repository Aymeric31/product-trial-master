import { Injectable, inject, signal } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, of, tap } from "rxjs";
import { AuthService } from "app/auth.service";
import { CartItem } from "./cart.model";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly path = "http://localhost:3000/cart";

  public _cartItems = signal<CartItem[]>([]);
  public readonly cartItems = this._cartItems.asReadonly();

  private getHeaders(): HttpHeaders {
      const token = this.authService.getToken();
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  public addToCart(item: CartItem): Observable<CartItem[]> {

    return this.http.post<CartItem[]>(`${this.path}`, item, { headers: this.getHeaders() }).pipe(
      tap((updatedCart: CartItem[]) => {
        this._cartItems.set(updatedCart);
      })
    );
  }
  
  public getCart(): Observable<CartItem[]> {
    const userId = this.authService.getUserId();
    if (!userId) return new Observable<CartItem[]>(); // Return empty Observable if userId null
      return this.http.get<CartItem[]>(`${this.path}/${userId}`, { headers: this.getHeaders() }).pipe(
        tap(cart => this._cartItems.set(cart)) // Update cart items
    );
  }
  
  public removeFromCart(productId: number): Observable<any> {
    return this.http.delete(`${this.path}/${productId}`, { headers: this.getHeaders() }).pipe(
      tap(() => {
        this._cartItems.set(this._cartItems().filter(item => item.id !== productId));
      }),
      catchError(() => of(null))
    );
  }

  public getTotalItems(): number {
    const cartItems = this._cartItems();
    return Array.isArray(cartItems) ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
  }
  
  public clearCart(): Observable<any> {
    return this.http.delete(`${this.path}`, { headers: this.getHeaders() }).pipe(
      catchError(() => of(null))
    );
  }
  
}
