const express = require("express");
const fs = require("fs");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:4200',  // Frontend Angular URL
  methods: 'GET,POST,PUT,PATCH,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
};

// Enable CORS for all origins (can be restrictive based on your use case)
app.use(cors(corsOptions));
app.use(express.json());

const dotenv = require('dotenv');

dotenv.config();

const PRODUCTS_FILE = "products.json";
const USERS_FILE = 'users.json';
const SECRET_KEY = process.env.JWT_SECRET
;
// Function to read the users from the JSON file
const readUsers = () => {
  try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
  } catch (err) {
      return [];
  }
};

// Function to write the users to the JSON file
const writeUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Check if the user is the admin
const authenticateAdmin = (req, res, next) => {
  try {
      const token = req.headers.authorization?.split(" ")[1]; // Get token after bearer
      if (!token) {
          return res.status(401).json({ message: "Access denied. No token provided." });
      }

      const decoded = jwt.verify(token, SECRET_KEY);
      
      if (decoded.email !== "admin@admin.com") {
          return res.status(403).json({ message: "Access denied. Admin only." });
      }

      req.user = decoded; // Add the user to the request object for later use
      next();
  } catch (error) {
      return res.status(401).json({ message: "Invalid token." });
  }
};

// Check if the user is logged in
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
      const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY); // Get the token after "Bearer"
      req.user = decoded; // Add data from the user with `req`
      next();
  } catch (error) {
      return res.status(401).json({ message: "Invalid token." });
  }
};


app.get("/", (req, res) => {
  res.send("Bienvenue sur mon serveur Node.js !");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});


// USER ACCOUNT PART
// Route to create an account
app.post('/account', (req, res) => {
  const { username, firstname, email, password } = req.body;

  if (!username || !firstname || !email || !password) {
      return res.status(400).json({ message: "All area are requested" });
  }

  let users = readUsers();

  // Check if an account with the same email already exist
  if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: "An account with this email already exist" });
  }

  // Password hashing
  const hashedPassword = bcrypt.hashSync(password, 10);

  // New user creation
  const newUser = {
      id: users.length + 1,
      username,
      firstname,
      email,
      password: hashedPassword
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: "Account created with success", user: { id: newUser.id, username, email } });
});

// User authentication
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Incorrect email or password" });
  }

  // Token generation with jsonwebtoken
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

  res.json({ message: "Connection success", token });
});

// PRODUCT PART
app.post('/products', authenticateAdmin, (req, res) => {
  const { name, description, price, category } = req.body;

     // Verify fields
  if (!name || !description || !price || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

   // Read existing products from the JSON file
   fs.readFile(PRODUCTS_FILE, "utf8", (err, data) => {
     if (err) {
       return res.status(500).json({ error: "Error reading file" });
     }
 
     let products = JSON.parse(data);
     
    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,  // Generate unique ID
      name,
      description, 
      price,
      category, 
      createdAt: Date.now(),
      updatedAt: Date.now(),
      inventoryStatus: "INSTOCK", 
      rating: 0 
    };
 
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
app.patch('/products/:id', authenticateAdmin, (req, res) => {
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
app.delete('/products/:id', authenticateAdmin, (req, res) => {
  const productId = parseInt(req.params.id, 10);

  fs.readFile('products.json', 'utf8', (err, data) => {
      if (err) {
          return res.status(500).json({ error: "Error reading file" });
      }

      let products = JSON.parse(data);
      const initialLength = products.length;

      // Filter out the product with the given ID , if the product have the same ID = delete it from the array
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

// CART PART

//FUNCTIONS
const CART_FILE = "cart.json";

// Read the cart.jsonn
const readCart = () => {
    try {
        const data = fs.readFileSync(CART_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

// Write into the cart.json
const writeCart = (cart) => {
    fs.writeFileSync(CART_FILE, JSON.stringify(cart, null, 2));
};

//ENDPOINT
// Create cart with products
app.post("/cart", verifyToken, (req, res) => {
  const { productId, name, quantity, price } = req.body;

  if (!productId || !quantity || !price) {
      return res.status(400).json({ message: "Missing required fields" });
  }

  // Get userID from verifyToken
  const userId = req.user.id;

  let cart = readCart();

  if (!cart[userId]) {
      cart[userId] = [];
  }

  const existingProduct = cart[userId].find(p => p.id === productId);

  if (existingProduct) {
      existingProduct.quantity += quantity;
  } else {
      cart[userId].push({ id: productId, name, quantity, price });
  }

  writeCart(cart);
  res.json({ message: "Product added to cart", cart: cart[userId] });
});

// Get products from cart
app.get("/cart/:userId", verifyToken, (req, res) => {
  const { userId } = req.params;

  // Check if the user have the same id from json request
  if (parseInt(userId) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only access your own cart." });
  }

  let cart = readCart();
  res.json(cart[userId] || []);
});

// Delete a product from cart
app.delete("/cart/:userId/:productId", verifyToken, (req, res) => {
  const userId = req.params.userId;
  const productId = parseInt(req.params.productId, 10);
  const tokenUserId = req.user.id; // Get userID from verifyToken
  let cart = readCart();

  // Check if userId into URL match userId from the token
  if (userId !== tokenUserId.toString()) {
    return res.status(403).json({ message: "You cannot modify this cart" });
  }

  if (!cart[userId]) {
      return res.status(404).json({ message: "Cart not found" });
  }

  // Check if the product exists in cart
  const productExists = cart[userId].some(product => product.id === productId);

  if (!productExists) {
      return res.status(404).json({ message: "Product not found in cart" });
  }

  // Check the product ID to remove it
  cart[userId] = cart[userId].filter(product => product.id !== productId);

  writeCart(cart);
  res.json({ message: "Product removed from cart", cart: cart[userId] });
});

// Delete all the content from the cart by the user id
app.delete("/cart/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;
  const tokenUserId = req.user.id; // Get userID from verifyToken
  let cart = readCart();

  // Check if userId into URL match userId from the token
  if (userId !== tokenUserId.toString()) {
    return res.status(403).json({ message: "You cannot modify this cart" });
  }

  if (!cart[userId]) {
      return res.status(404).json({ message: "Cart not found" });
  }

  delete cart[userId]; // Delete completely the cart

  writeCart(cart);
  res.json({ message: "Cart cleared successfully" });
});
