const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Product list with image URLs
let products = [
  {
    id: 1,
    name: "Organic Honey Jar",
    description: "Pure local organic honey.",
    price: 10.99,
    category: "Food",
    image: "images/HONEY.png"

  },
  {
    id: 2,
    name: "Handmade Soap",
    description: "Natural ingredients soap.",
    price: 5.99,
    category: "Personal Care",
    image:"images/SOAP.png"

  },
  {
    id: 3,
    name: "Herbal Tea",
    description: "Refreshing and healthy.",
    price: 7.49,
    category: "Food",
    image:"images/TEA.png"
  },
  {
    id: 4,
    name: "Scented Candle",
    description: "Relaxing aroma.",
    price: 12.00,
    category: "Home Decor",
    image:"images/CANDLE.png"
  }
];

let cart = [];

// Get all products (with optional filter/sort)
app.get('/products', (req, res) => {
  let result = [...products];

  if (req.query.category) {
    const categoryFilter = req.query.category.toLowerCase();
    result = result.filter(p => p.category.toLowerCase() === categoryFilter);
  }

  if (req.query.sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (req.query.sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  }

  res.json(result);
});

// Add or update item in cart
app.post('/cart', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);

  if (!product) return res.status(404).json({ message: "Product not found" });
  if (quantity <= 0) return res.status(400).json({ message: "Quantity must be positive" });

  let cartItem = cart.find(item => item.product.id === productId);

  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }

  res.json(cart);
});

// Update quantity in cart
app.put('/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  if (quantity < 0) return res.status(400).json({ message: "Quantity cannot be negative" });

  const cartItem = cart.find(item => item.product.id === productId);

  if (!cartItem) return res.status(404).json({ message: "Item not found in cart" });

  if (quantity === 0) {
    cart = cart.filter(item => item.product.id !== productId);
  } else {
    cartItem.quantity = quantity;
  }

  res.json(cart);
});

// Remove item from cart
app.delete('/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const cartLengthBefore = cart.length;

  cart = cart.filter(item => item.product.id !== productId);

  if (cart.length === cartLengthBefore) {
    return res.status(404).json({ message: "Item not found in cart" });
  }

  res.json(cart);
});

// Get cart contents
app.get('/cart', (req, res) => {
  res.json(cart);
});

// Calculate total bill
app.get('/cart/bill', (req, res) => {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  res.json({ total: total.toFixed(2) });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});

