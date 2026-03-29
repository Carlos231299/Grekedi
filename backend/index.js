const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔍 DEBUG LOGGING
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'conectado', time: new Date() }));

// --- MULTER CONFIG ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Ningún archivo proporcionado' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/health', (req, res) => res.json({ status: 'online' }));

app.get('/api/user', (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, avatar FROM users WHERE id = 1').get();
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- API ROUTES ---
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    rows.forEach(r => settings[r.key] = r.value);
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/settings', (req, res) => {
  try {
    const stmt = db.prepare('UPDATE site_settings SET value = ? WHERE key = ?');
    db.transaction((items) => {
      for (const [k, v] of Object.entries(items)) stmt.run(v, k);
    })(req.body);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PROVIDERS CRUD ---
app.get('/api/providers', (req, res) => {
  try { res.json(db.prepare('SELECT * FROM providers').all()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/providers', (req, res) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    const info = db.prepare('INSERT INTO providers (name, contact_person, email, phone, address) VALUES (?,?,?,?,?)').run(name, contact_person, email, phone, address);
    res.json({ id: info.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/providers/:id', (req, res) => {
  try {
    const { name, contact_person, email, phone, address } = req.body;
    db.prepare('UPDATE providers SET name=?, contact_person=?, email=?, phone=?, address=? WHERE id=?').run(name, contact_person, email, phone, address, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/providers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM providers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PRODUCTS ---
app.get('/api/products', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT p.*, c.name as category_name, prov.name as provider_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN providers prov ON p.provider_id = prov.id
    `).all();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/products/slug/:slug', (req, res) => {
  try {
    const data = db.prepare(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?`).get(req.params.slug);
    if (!data) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', (req, res) => {
  try {
    const { category_id, provider_id, name, slug, price, stock, min_stock, sku, description, image_url } = req.body;
    const info = db.prepare(`INSERT INTO products (category_id, provider_id, name, slug, price, stock, min_stock, sku, description, image_url) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(category_id, provider_id || null, name, slug, price, stock, min_stock, sku, description, image_url);
    res.json({ id: info.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { category_id, provider_id, name, slug, price, stock, min_stock, sku, description, image_url } = req.body;
    db.prepare(`UPDATE products SET category_id=?, provider_id=?, name=?, slug=?, price=?, stock=?, min_stock=?, sku=?, description=?, image_url=? WHERE id=?`).run(category_id, provider_id || null, name, slug, price, stock, min_stock, sku, description, image_url, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- CATEGORIES ---
app.get('/api/categories', (req, res) => {
  try { res.json(db.prepare('SELECT * FROM categories').all()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/categories', (req, res) => {
  try {
    const info = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?,?)').run(req.body.name, req.body.parent_id || null);
    res.json({ id: info.lastInsertRowid });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/categories/:id', (req, res) => {
  try {
    db.prepare('UPDATE categories SET name = ?, parent_id = ? WHERE id = ?').run(req.body.name, req.body.parent_id || null, req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => {
  try { res.json(db.prepare('SELECT * FROM orders ORDER BY date DESC').all()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    order.items = db.prepare(`SELECT oi.*, p.name as product_name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`).all(req.params.id);
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
      db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    })();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USER & STATS ---
app.get('/api/user', (req, res) => {
  try { res.json(db.prepare('SELECT id, name, email, avatar FROM users LIMIT 1').get()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/user', (req, res) => {
  try {
    const { name, email, avatar, password } = req.body;
    if (password && password.length > 0) {
      db.prepare('UPDATE users SET name = ?, email = ?, avatar = ?, password = ? WHERE id = 1').run(name, email, avatar, password);
    } else {
      db.prepare('UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = 1').run(name, email, avatar);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/stats', (req, res) => {
  try {
    const totalSales = db.prepare('SELECT SUM(total) as total FROM orders').get().total || 0;
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const newOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE status = 'Pendiente'`).get().count;
    const salesChart = db.prepare('SELECT date, SUM(amount) as amount FROM sales GROUP BY date ORDER BY date ASC').all();
    const categoryChart = db.prepare(`SELECT c.name, COUNT(p.id) as count FROM categories c JOIN products p ON c.id = p.category_id GROUP BY c.name`).all();
    const lowStock = db.prepare('SELECT * FROM products WHERE stock <= min_stock').all();
    res.json({ totalSales: parseFloat(totalSales.toFixed(2)), activeProducts, newOrders, salesChart, categoryChart, lowStock });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/movements', (req, res) => {
  try {
    const { type, customer_name, customer_email, date, items, total } = req.body;
    db.transaction(() => {
      const orderStmt = db.prepare(`INSERT INTO orders (customer_name, customer_email, total, status, type, date) VALUES (?,?,?,?,?,?)`);
      const info = orderStmt.run(customer_name, customer_email, total, 'Completado', type, date);
      const orderId = info.lastInsertRowid;
      const itemStmt = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)`);
      const updateStockStmt = db.prepare(`UPDATE products SET stock = stock + ? WHERE id = ?`);
      for (const item of items) {
        itemStmt.run(orderId, item.product_id, item.quantity, item.price);
        const stockDiff = type === 'Venta' ? -item.quantity : item.quantity;
        updateStockStmt.run(stockDiff, item.product_id);
      }
      if (type === 'Venta') {
        db.prepare(`INSERT INTO sales (date, amount) VALUES (?,?)`).run(date, total);
      }
    })();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.url} no encontrada` });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SERVER RUNNING ON http://localhost:${PORT}`);
});
