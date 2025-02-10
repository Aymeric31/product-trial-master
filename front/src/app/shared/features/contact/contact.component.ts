import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { MessageModule } from "primeng/message";

@Component({
  selector: "app-contact",
  standalone: true,
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
  imports: [FormsModule, InputTextModule, ButtonModule, MessageModule, CommonModule],
})
export class ContactComponent {
   email: string = "";
   message: string = "";
   successMessage: string = "";
   errorMessage: string = "";

   sendMessage() {
      this.successMessage = "";
      this.errorMessage = "";
  
      if (!this.email || !this.message) {
        this.errorMessage = "Veuillez remplir tous les champs.";
        return;
      }
  
      if (this.message.length > 300) {
        this.errorMessage = "Le message ne doit pas dépasser 300 caractères.";
        return;
      }
  
      console.log("Email :", this.email);
      console.log("Message :", this.message);
      this.successMessage = "Demande de contact envoyée avec succès.";
      
      this.email = "";
      this.message = "";
   }
}
