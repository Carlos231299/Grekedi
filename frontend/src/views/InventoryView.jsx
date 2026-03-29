import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const InventoryView = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchProducts = () => {
    fetch('http://localhost:3001/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      fetch(`http://localhost:3001/api/products/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => fetchProducts())
        .catch(err => console.error(err));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen text-left">
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-surface-container-highest/50">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-zinc-600">menu</span>
          <h1 className="text-2xl font-black tracking-tighter text-red-800 uppercase font-headline">GREKEDI <span className="font-light">STORE</span></h1>
        </div>
      </header>

      <main className="pt-20 pb-24 px-4 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-headline text-secondary mb-1">Gestor</p>
              <h2 className="text-3xl font-bold font-headline tracking-tight text-on-surface">Inventario</h2>
            </div>
            <div className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-bold font-label uppercase">
              {filteredProducts.length} Items
            </div>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute top-4 left-4 text-outline">search</span>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/60"
              placeholder="Buscar SKU, nombre o categoría..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 group active:scale-[0.98] transition-all relative overflow-hidden">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container shrink-0">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.image_url} alt={product.name} />
              </div>
              <div className="grow min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-headline font-bold text-sm truncate pr-8 uppercase tracking-tight">{product.name}</h3>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="absolute top-4 right-4 text-outline-variant hover:text-red-500 active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
                <p className="text-[10px] font-label text-outline uppercase tracking-wider mb-1">SKU: {product.sku}</p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-secondary">${product.price.toFixed(2)}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${product.stock > 10 ? 'bg-secondary/10 text-secondary' : 'bg-tertiary-container/20 text-on-tertiary-container'}`}>
                    {product.stock > 10 ? 'En Stock' : 'Stock Bajo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('/admin/add-product')}
          className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50 shadow-primary/40"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </main>

    </div>
  );
};

export default InventoryView;
