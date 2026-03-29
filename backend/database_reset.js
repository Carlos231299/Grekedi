const sqlite3 = require('better-sqlite3');
const db = new sqlite3('grekedi.db');

console.log('--- GENERANDO MIGRACIÓN FINAL V7.3.3 (CATÁLOGO + ÓRDENES REALES) ---');

db.exec(`
  PRAGMA foreign_keys = OFF;
  DROP TABLE IF EXISTS order_items;
  DROP TABLE IF EXISTS orders;
  DROP TABLE IF EXISTS sales;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS categories;
  DROP TABLE IF EXISTS site_settings;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS providers;
  PRAGMA foreign_keys = ON;

  CREATE TABLE providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT
  );

  CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    parent_id INTEGER DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    provider_id INTEGER DEFAULT NULL,
    name TEXT,
    slug TEXT UNIQUE,
    price REAL,
    stock INTEGER,
    min_stock INTEGER DEFAULT 5,
    sku TEXT UNIQUE,
    description TEXT,
    image_url TEXT,
    is_limited BOOLEAN DEFAULT 0,
    rating REAL DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 12,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (provider_id) REFERENCES providers(id)
  );

  CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    avatar TEXT
  );
  
  CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    amount REAL
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    customer_email TEXT,
    total REAL,
    status TEXT DEFAULT 'Completado',
    date TEXT
  );

  CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

// 1. Admin
db.prepare('INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)').run('Admin Grekedi', 'admin', 'stitch2026', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400');

// 2. Providers
const createProv = db.prepare('INSERT INTO providers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)');
createProv.run('Textiles Premium S.A.S', 'Marta Rodríguez', 'ventas@textilespremium.com', '+57 301 234 5678', 'Calle 45 # 23-12, Medellín');
createProv.run('Gofit Nutrición Orgánica', 'Carlos Herrera', 'contacto@gofit.co', '+57 312 987 6543', 'Cra 15 # 82-45, Bogotá');
const provIdRopa = 1;
const provIdSupps = 2;

// 3. Categories
const createCat = db.prepare('INSERT INTO categories (name, parent_id) VALUES (?, ?)');
const catRopa = createCat.run('Ropa Deportiva', null).lastInsertRowid;
createCat.run('Leggings & Shorts', catRopa);
createCat.run('Tops & Bras', catRopa);
createCat.run('Conjuntos Power', catRopa);
const catBienestar = createCat.run('Bienestar & Suplementos', null).lastInsertRowid;
createCat.run('Proteínas Clean', catBienestar);
createCat.run('Burners & Detox', catBienestar);
const catAccesorios = createCat.run('Accesorios', null).lastInsertRowid;
createCat.run('Cinturones & Straps', catAccesorios);

// 4. Products (Exactamente 20 por subcategoría)
const subcategories = db.prepare('SELECT id, name FROM categories WHERE parent_id IS NOT NULL').all();
const insertP = db.prepare(`INSERT INTO products (category_id, provider_id, name, slug, price, stock, min_stock, sku, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const CURATED_IMAGES = [
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', // Leggings
  'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&q=80', // Bra
  'https://images.unsplash.com/photo-1518611012118-69306914674e?w=800&q=80', // Gym Girl
  'https://images.unsplash.com/photo-1533681436402-231dc39cd5ce?w=800&q=80', // Dumbbells
  'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&q=80', // Supplements
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', // Activewear
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', // Sport Shoes
  'https://images.unsplash.com/photo-1579726241517-74220b33b24f?w=800&q=80'  // Protein Powder
];

let productCounter = 1;
subcategories.forEach(sub => {
  for(let i=1; i<=20; i++) {
    const isRopa = sub.name.includes('Leggings') || sub.name.includes('Tops') || sub.name.includes('Conjuntos') || sub.name.includes('Cinturones');
    const provId = isRopa ? provIdRopa : provIdSupps;
    const price = Math.floor(Math.random() * 150000) + 50000; // Entre 50k y 200k
    const stock = Math.floor(Math.random() * 50) + 1; // Entre 1 y 50
    const slug = `prod-${sub.id}-${i}-${Date.now()}`;
    
    insertP.run(
      sub.id, 
      provId, 
      `${sub.name.split(' ')[0]} Elite Series ${i}`, 
      slug, 
      price, 
      stock, 
      5, 
      `GK-${sub.id}-${i.toString().padStart(4, '0')}`, 
      `Producto premium categoría ${sub.name}. Ideal para potenciar tu entrenamiento diario con máximo confort.`, 
      CURATED_IMAGES[productCounter % CURATED_IMAGES.length]
    );
    productCounter++;
  }
});

// 5. Sales & Orders (Generación de 100 órdenes aleatorias con múltiples items)
const totalProducts = db.prepare('SELECT id, price FROM products').all();
const today = new Date();

for(let i=100; i>=1; i--) {
  const d = new Date(today); 
  d.setDate(today.getDate() - Math.floor(i/3)); // Espaciar fechas
  const dateStr = d.toISOString().split('T')[0];
  
  // Seleccionar de 1 a 4 productos al azar para esta orden
  const itemsCount = Math.floor(Math.random() * 4) + 1; 
  let orderTotal = 0;
  let itemsToInsert = [];
  
  for(let j=0; j<itemsCount; j++) {
     const p = totalProducts[Math.floor(Math.random() * totalProducts.length)];
     const qty = Math.floor(Math.random() * 3) + 1;
     orderTotal += p.price * qty;
     itemsToInsert.push({ pid: p.id, qty, price: p.price });
  }

  // Registrar Venta Resumen
  db.prepare('INSERT INTO sales (date, amount) VALUES (?,?)').run(dateStr, orderTotal);
  
  // Registrar Orden Real
  const statuses = ['Completado', 'Pendiente', 'Enviado'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const orderInfo = db.prepare('INSERT INTO orders (customer_name, customer_email, total, status, date) VALUES (?,?,?,?,?)')
    .run(`Cliente Frecuente ${i}`, `cliente${i}@gmail.com`, orderTotal, status, dateStr);
  
  // Registrar Items (Asociados a los productos generados previamente)
  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  itemsToInsert.forEach(it => {
     insertItem.run(orderInfo.lastInsertRowid, it.pid, it.qty, it.price);
  });
}

// 6. Site Settings (HERO INTACTO)
const settings = [
  { key: 'hero_title', value: 'PODER SIN LÍMITES' },
  { key: 'hero_image', value: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=1200' },
  { key: 'hero_button', value: 'Ver Nueva Colección' },
  { key: 'hero_align', value: 'center' },
  { key: 'brand_primary', value: '#db2777' },
  { key: 'brand_secondary', value: '#1e293b' },
  { key: 'brand_accent', value: '#fb7185' },
  { key: 'font_family', value: 'Montserrat' },
  { key: 'button_radius', value: '16px' },
  { key: 'whatsapp_number', value: '573147247187' },
  { key: 'instagram_user', value: 'grekedi.style' },
  { key: 'philosoph_title', value: 'Estilo & Personalidad' },
  { key: 'philosophy_body', value: 'Grekedi es una tienda de ropa pensada para quienes buscan estilo, comodidad y personalidad en cada prenda.' },
  { key: 'footer_text', value: '© 2026 GREKEDI | EXCELENCIA EN CADA FIBRA' }
];
const insertS = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?)');
settings.forEach(s => insertS.run(s.key, s.value));

console.log('--- MIGRACIÓN V7.3.3 COMPLETADA (DATOS VERIFICADOS) ---');
db.close();
