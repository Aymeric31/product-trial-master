import { Routes } from "@angular/router";
import { HomeComponent } from "./shared/features/home/home.component";
import { CartComponent } from "./cart/features/cart.component";
import { ContactComponent } from "./shared/features/contact/contact.component";
import { LoginComponent } from "./login/login.component";
import { authGuard } from './auth.guard';


export const APP_ROUTES: Routes = [
  {
    path: "home",
    component: HomeComponent,
  },
  {
    path: "products",
    loadChildren: () =>
      import("./products/products.routes").then((m) => m.PRODUCTS_ROUTES)
  },
  {
    path: "cart",
    component: CartComponent,
    canActivate: [authGuard],
  },
  {
    path: "contact",
    component: ContactComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  { path: "", redirectTo: "home", pathMatch: "full" },
];
