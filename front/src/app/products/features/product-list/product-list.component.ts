import { CurrencyPipe, DatePipe, CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { Product } from "app/products/data-access/product.model";
import { ProductsService } from "app/products/data-access/products.service";
import { CartService } from "app/cart/data-access/cart.service";
import { CartItem } from 'app/cart/data-access/cart.model';
import { ProductFormComponent } from "app/products/ui/product-form/product-form.component";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DataViewModule } from "primeng/dataview"
import { DialogModule } from "primeng/dialog";
import { AuthService } from 'app/auth.service'; 

const emptyProduct: Product = {
  id: 0,
  code: "",
  name: "",
  description: "",
  image: "",
  category: "",
  price: 0,
  quantity: 0,
  internalReference: "",
  shellId: 0,
  inventoryStatus: "INSTOCK",
  rating: 0,
  createdAt: 0,
  updatedAt: 0,
};

@Component({
  selector: "app-product-list",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.scss"],
  standalone: true,
  imports: [CommonModule, DataViewModule, CardModule, ButtonModule, DialogModule, ProductFormComponent, DatePipe, CurrencyPipe],
})
export class ProductListComponent implements OnInit {
  
  private readonly productsService = inject(ProductsService);

  public readonly products = this.productsService.products;
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  
  public isDialogVisible = false;
  public isCreation = false;
  public readonly editedProduct = signal<Product>(emptyProduct);

  ngOnInit() {
    this.productsService.get().subscribe();
  }

  // Verify if the user is logged in as admin
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Verify if the user is logged in
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  public onCreate() {
    this.isCreation = true;
    this.isDialogVisible = true;
    this.editedProduct.set(emptyProduct);
  }

  public onUpdate(product: Product) {
    this.isCreation = false;
    this.isDialogVisible = true;
    this.editedProduct.set(product);
  }

  public onDelete(product: Product) {
    this.productsService.delete(product.id).subscribe();
  }
  private updateTotalItems(): void {
    this.cartService.getTotalItems(); // Met à jour la valeur dans le service
    console.log(this.cartService.getTotalItems());
  }
  // Add to cart function
  public onAddToCart(product: any): void {
    const quantity = 1;
    const cartItem = {
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: quantity,
    };
    // Ajoute l'article au panier via le service
    this.cartService.addToCart(cartItem).subscribe(() => {
      // Appel de getCart après l'ajout pour récupérer les articles mis à jour
      this.cartService.getCart().subscribe((updatedCartItems: CartItem[]) => {
        // Mets à jour le signal avec les nouveaux articles du panier
        this.cartService._cartItems.set(updatedCartItems); // Mise à jour dans le signal
        console.log('Panier mis à jour avec', updatedCartItems); // Pour vérifier la mise à jour
      });
    });
  }

  public onSave(product: Product) {
    if (product.price <= 0) {
      alert("❌ Impossible d'enregistrer un produit avec un prix de 0 !");
      return;
    }
    if (this.isCreation) {
      this.productsService.create(product).subscribe();
    } else {
      this.productsService.update(product).subscribe();
    }
    this.closeDialog();
  }

  public onCancel() {
    this.closeDialog();
  }

  private closeDialog() {
    this.isDialogVisible = false;
  }
}
