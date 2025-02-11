const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const PRODUCTS_FILE = "products.json";

app.get("/", (req, res) => {
  res.send("Bienvenue sur mon serveur Node.js !");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});

app.post('/products', (req, res) => {
   const newProduct = req.body;

   // Read existing products from the JSON file
   fs.readFile(PRODUCTS_FILE, "utf8", (err, data) => {
     if (err) {
       return res.status(500).json({ error: "Error reading file" });
     }
 
     let products = JSON.parse(data);
     
     // Generate an Unique ID (simulated)
     newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
     newProduct.createdAt = Date.now();
     newProduct.updatedAt = Date.now();
 
     // Add new product to the array
     products.push(newProduct);
 
     // Save the updated array to the JSON file
     fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ error: "Error writing file" });
        }
        res.status(201).json(newProduct);
     });
   });
 });
 
// Get all products from the JSON file
app.get('/products', (req, res) => {
  fs.readFile('products.json', function(err, data) { 
    if (err) {
      return res.status(500).json({ error: "Error reading file" });
    }
    try {
      let products = JSON.parse(data);
      res.status(200).json(products);
    } catch (parseError) {
      res.status(500).json({ error: "Error format JSON file" });
    }
  }); 
});

// Get a single product by ID from the JSON file
app.get('/products/:id', (req, res) => {
  fs.readFile('products.json', function(err, data) { 
    if (err) {
      return res.status(500).json({ error: "Error reading file" });
    }
    try {
      let products = JSON.parse(data);
      const product = products.find(p => p.id === parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(200).json(product);
    } catch (parseError) {
      res.status(500).json({ error: "Error format JSON file" });
    }
  });
});

// Update a product detail by ID in the JSON file
app.patch('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10); // Convert ID to number
  const updates = req.body;

  fs.readFile('products.json', 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: "Error reading file" });
      }

      try {
          let products = JSON.parse(data); // Convert JSON to an array

          // Find product by ID
          let productIndex = products.findIndex(p => p.id === productId);
          if (productIndex === -1) {
              return res.status(404).json({ error: "Product not found" });
          }

          // Update the product fields
          products[productIndex] = { ...products[productIndex], ...updates };

          // Save back to file
          fs.writeFile('products.json', JSON.stringify(products, null, 2), (err) => {
              if (err) {
                  return res.status(500).json({ error: "Error writing file" });
              }
              res.status(200).json(products[productIndex]); // Return updated product
          });

      } catch (parseError) {
          res.status(500).json({ error: "Error format JSON file" });
      }
  });
});

// Delete a product by ID from the JSON file
app.delete('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);

  fs.readFile('products.json', 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: "Error reading file" });
      }

      let products = JSON.parse(data);
      const initialLength = products.length;

      // Filtrer pour supprimer le produit avec l'ID correspondant
      products = products.filter(product => product.id !== productId);

      // Check if the product was found and deleted successfully
      if (products.length === initialLength) {
          return res.status(404).json({ error: "Product not found" });
      }

      // Rewrite the updated array to the JSON file
      fs.writeFile('products.json', JSON.stringify(products, null, 2), (err) => {
          if (err) {
              return res.status(500).json({ error: "Error writing file" });
          }

          res.json({ message: "Product deleted with success" });
      });
  });
});