const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Customer Routes
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: { orders: true }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { orders: { include: { items: { include: { product: true } } } } }
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await prisma.customer.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order Routes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerId, items, status } = req.body;
    
    // Calculate total and get product prices
    let total = 0;
    const itemsWithPrices = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      const itemPrice = item.price || product.price;
      total += itemPrice * item.quantity;
      itemsWithPrices.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice
      });
    }

    const order = await prisma.order.create({
      data: {
        customerId,
        status: status || 'pending',
        total,
        items: {
          create: itemsWithPrices
        }
      },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { customerId, items, status } = req.body;
    const orderId = parseInt(req.params.id);

    // If items are being updated, handle them
    if (items && Array.isArray(items)) {
      // Delete existing items
      await prisma.item.deleteMany({
        where: { orderId: orderId }
      });

      // Calculate total and get product prices
      let total = 0;
      const itemsWithPrices = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: parseInt(item.productId) }
        });
        if (!product) {
          return res.status(404).json({ error: `Product ${item.productId} not found` });
        }
        const itemPrice = item.price ? parseFloat(item.price) : product.price;
        total += itemPrice * parseInt(item.quantity);
        itemsWithPrices.push({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: itemPrice
        });
      }

      // Update order with new items
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          customerId: customerId ? parseInt(customerId) : undefined,
          status: status || undefined,
          total: total,
          items: {
            create: itemsWithPrices
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });
      res.json(order);
    } else {
      // Just update order fields without items
      const updateData = {};
      if (customerId !== undefined) updateData.customerId = parseInt(customerId);
      if (status !== undefined) updateData.status = status;

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });
      res.json(order);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await prisma.order.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Item Routes
app.get('/api/items', async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: {
        order: true,
        product: true
      }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        order: true,
        product: true
      }
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const item = await prisma.item.create({
      data: req.body,
      include: {
        order: true,
        product: true
      }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const item = await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        order: true,
        product: true
      }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await prisma.item.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

