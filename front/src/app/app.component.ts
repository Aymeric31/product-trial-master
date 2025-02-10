import {
  Component,
} from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { SplitterModule } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelMenuComponent } from "./shared/ui/panel-menu/panel-menu.component";
import { CartService } from 'app/cart/data-access/cart.service';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: true,
  imports: [CommonModule, RouterModule, SplitterModule, ToolbarModule, PanelMenuComponent],
})
export class AppComponent {
  constructor(public cartService: CartService) {}
  title = "ALTEN SHOP";
}
