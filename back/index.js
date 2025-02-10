const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json()); // Middleware pour parser JSON

const PRODUCTS_FILE = "products.json";

app.get("/", (req, res) => {
  res.send("Bienvenue sur mon serveur Node.js !");
});

app.listen(3000, () => {
  console.log("Serveur démarré sur http://localhost:3000");
});

app.post('/products', (req, res) => {
   const newProduct = req.body;

   // Lire le fichier JSON
   fs.readFile(PRODUCTS_FILE, "utf8", (err, data) => {
     if (err) {
       return res.status(500).json({ error: "Erreur de lecture du fichier" });
     }
 
     let products = JSON.parse(data);
     
     // Générer un ID unique (simulé)
     newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
     newProduct.createdAt = Date.now();
     newProduct.updatedAt = Date.now();
 
     // Ajouter le nouveau produit
     products.push(newProduct);
 
     // Sauvegarder dans le fichier JSON
     fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
       if (err) {
         return res.status(500).json({ error: "Erreur d'écriture du fichier" });
       }
       res.status(201).json(newProduct);
     });
   });
 });
 
 app.get('/products', (req, res) => {
   res.send('Got a GET request')
 })

