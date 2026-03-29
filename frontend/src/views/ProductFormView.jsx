import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';

const ProductFormView = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category_id: 1,
    slug: '',
    price: '',
    stock: '',
    sku: '',
    description: '',
    image_url: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'name' && !prev.slug) {
        newData.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      }
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, price: parseFloat(formData.price), stock: parseInt(formData.stock) })
    })
    .then(res => res.json())
    .then(() => navigate('/admin/inventory'))
    .catch(err => console.error(err));
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-12 text-left">
      <TopAppBar />
      <main className="pt-20 px-6">
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className="text-primary text-xs font-label uppercase tracking-widest flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Atrás
          </button>
          <h2 className="text-3xl font-headline font-black tracking-tight text-on-surface uppercase italic">Nuevo Producto</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
             <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-secondary block mb-2 px-2">Nombre del Producto</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ej: Whey Protein Grekedi" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-secondary block mb-2 px-2">Precio ($)</label>
                <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="59.99" required />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-secondary block mb-2 px-2">Stock Inicial</label>
                <input name="stock" type="number" value={formData.stock} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="50" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-secondary block mb-2 px-2">Categoría</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value={1}>Ropa Deportiva Hombre</option>
                  <option value={2}>Accesorios de Gym</option>
                  <option value={3}>Suplementos</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-secondary block mb-2 px-2">SKU</label>
                <input name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="SP-WP-01" required />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-secondary block mb-2 px-2">Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]" placeholder="Detalles del producto..." required />
            </div>

            <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-secondary block mb-2 px-2">URL de Imagen</label>
              <input name="image_url" value={formData.image_url} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="https://unsplash.com/..." required />
            </div>
          </div>

          <button type="submit" className="w-full grekedi-gradient text-on-primary py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all mt-8">
            Guardar Producto
          </button>
        </form>
      </main>
    </div>
  );
};

export default ProductFormView;
