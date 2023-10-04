const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.use((req, res, next) => {
  if (req.url.endsWith('.html')) {
    res.status(404).send('<h1>404 Not Found</h1>');
  } else {
    next();
  }
});

// API Routes
app.use(express.json());

let items = [];

app.post('/api/items', (req, res) => {
  const newItem = req.body;
  newItem.id = generateItemId();
  items.push(newItem);
  saveItemsToFile();
  res.status(201).json(newItem);
});

// Get all items
app.get('/api/items', (req, res) => {
  res.json(items);
});

app.get('/api/items/:id', (req, res) => {
  const itemId = req.params.id;
  const item = items.find((i) => i.id === itemId);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.put('/api/items/:id', (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;
  const index = items.findIndex((i) => i.id === itemId);
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedItem };
    saveItemsToFile();
    res.json(items[index]);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  const itemId = req.params.id;
  const index = items.findIndex((i) => i.id === itemId);
  if (index !== -1) {
    const deletedItem = items.splice(index, 1)[0];
    saveItemsToFile();
    res.json(deletedItem);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

function generateItemId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function saveItemsToFile() {
  fs.writeFileSync('items.json', JSON.stringify(items, null, 2), 'utf8');
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
