import {
  Component, effect, ChangeDetectorRef, ChangeDetectionStrategy,
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
  changeDetection: ChangeDetectionStrategy.OnPush, // 🚀 OnPush activé
  imports: [CommonModule, RouterModule, SplitterModule, ToolbarModule, PanelMenuComponent],
})
export class AppComponent {
  title = "ALTEN SHOP";
  public totalItems = 0;

  constructor(public cartService: CartService, private cdr: ChangeDetectorRef,) {
    effect(() => {
      this.totalItems = this.cartService.getTotalItems();
      this.cdr.markForCheck();
    });
  }


  ngOnInit(): void {
    this.updateTotalItems();

  }

  // La méthode est bien hors du ngOnInit
  public updateTotalItems(): void {
    this.totalItems = this.cartService.getTotalItems();
  }
}