import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe} from "@angular/common";
import { CartService } from 'app/cart/data-access/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
})

export class CartComponent {
  constructor(public cartService: CartService) {}

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
