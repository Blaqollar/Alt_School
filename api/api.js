const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(express.json());

const itemsFilePath = path.join(__dirname, 'item.json');

const readItemsFromFile = async () => {
  try {
    const data = await fs.readFile(itemsFilePath, 'utf8');
    return JSON.parse(data).items;
  } catch (error) {
    console.error('Error reading items file:', error);
    return [];
  }
};

const saveItemsToFile = async (items) => {
  try {
    const data = await fs.readFile(itemsFilePath, 'utf8');
    const json = JSON.parse(data);
    json.items = items;
    await fs.writeFile(itemsFilePath, JSON.stringify(json, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing items file:', error);
  }
};

// Middleware for API key authentication
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['api-key'];
  if (!apiKey) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    // Check if the API key is valid (you can store valid keys in a database or a separate file)
    if (apiKey === 'your-api-key') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  }
};

// Middleware for role-based access control
const roleMiddleware = (role) => {
  return (req, res, next) => {
    const user = req.user;
    if (user && user.role === role) {
      next();
    } else {
      res.status(403).json({ error: 'Access Denied' });
    }
  };
};

// API Routes

// Create an item (admin only)
app.post('/api/items', apiKeyMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const items = await readItemsFromFile();
    const newItem = req.body;
    newItem.id = Date.now().toString();
    items.push(newItem);
    await saveItemsToFile(items);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all items (normal users)
app.get('/api/items', apiKeyMiddleware, roleMiddleware('normal'), async (req, res) => {
  try {
    const items = await readItemsFromFile();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get one item by ID (normal users)
app.get('/api/items/:id', apiKeyMiddleware, roleMiddleware('normal'), async (req, res) => {
  try {
    const items = await readItemsFromFile();
    const itemId = req.params.id;
    const item = items.find((i) => i.id === itemId);
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an item by ID (admin only)
app.put('/api/items/:id', apiKeyMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const items = await readItemsFromFile();
    const itemId = req.params.id;
    const updatedItem = req.body;
    const index = items.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
      await saveItemsToFile(items);
      res.status(200).json(items[index]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error updating item by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an item by ID (admin only)
app.delete('/api/items/:id', apiKeyMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const items = await readItemsFromFile();
    const itemId = req.params.id;
    const index = items.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      const deletedItem = items.splice(index, 1)[0];
      await saveItemsToFile(items);
      res.status(200).json(deletedItem);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
