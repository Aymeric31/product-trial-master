import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe} from "@angular/common";
import { CartService } from 'app/cart/data-access/cart.service';
import { CartItem } from "app/cart/data-access/cart.model";


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
})

export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  public cartItems = signal<CartItem[]>([]);
  public totalItems: number = 0;

  ngOnInit(): void {
    this.cartService.getCart().subscribe((items: CartItem[]) => {
      this.cartItems.set(items);  // Mettre à jour les articles dans le signal
    });
  }

  public removeItem(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe(() => {
      // Update the cart with deleted products
      const updatedItems = this.cartItems().filter(item => item.id !== productId);
      // update cart items 
      this.cartItems.set(updatedItems);
    });
  }
  public clearCart(): void {
    this.cartService.clearCart().subscribe(() => {
      this.cartService.getCart().subscribe((items: CartItem[]) => {
        this.cartItems.set(items); // Recharge depuis le backend
      });
    });
  }

}