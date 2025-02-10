import { Injectable, signal } from '@angular/core';
import { Product } from "app/products/data-access/product.model";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public cartItems = signal<Product[]>([]);

  addToCart(product: Product) {
    const existingItems = this.cartItems();
    const productExists = existingItems.some(item => item.id === product.id);

    if (!productExists) {
      // Add product to the cart if it doesn't exist already
      this.cartItems.set([...existingItems, product]);
    }
  }

  removeFromCart(productId: number) {
    this.cartItems.set(this.cartItems().filter(p => p.id !== productId));
  }

  clearCart() {
    this.cartItems.set([]);
  }

  //  Get the total of items in the cart
  getTotalItems(): number {
    return this.cartItems().length;
  }
}
