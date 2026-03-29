import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import { useCart } from '../context/CartContext';
import { FaWhatsapp } from 'react-icons/fa';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Negro', hex: '#18181b' },
  { name: 'Gris Oscuro', hex: '#52525b' },
  { name: 'Rojo Grekedi', hex: '#991b1b' },
  { name: 'Blanco', hex: '#f4f4f5' },
];

const API = 'http://localhost:3002';

const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(amount);

const ProductDetailView = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API}/api/products/slug/${slug}`)
      .then(res => res.json())
      .then(data => { if (data && !data.error) setProduct(data); })
      .catch(err => console.error('Producto:', err));
  }, [slug]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      const sizeSection = document.getElementById('size-selector');
      sizeSection?.scrollIntoView({ behavior: 'smooth' });
      sizeSection?.classList.add('animate-pulse');
      setTimeout(() => sizeSection?.classList.remove('animate-pulse'), 1200);
      return;
    }
    addToCart({ ...product, selectedSize: selectedSize.name, selectedColor: selectedColor.name });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const whatsappMsg = encodeURIComponent(`¡Hola Grekedi! 🔥 Quiero el producto *${product?.name}* en talla *${selectedSize?.name || '?'}* color *${selectedColor?.name}*. ¿Tienen disponibilidad?`);
  const whatsappUrl = `https://wa.me/573147247187?text=${whatsappMsg}`;

  if (!product) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cargando producto...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen relative">
      <TopAppBar />

      <main className="pt-16 pb-36 relative">
        {/* ── Imagen Principal ── */}
        <section className="relative bg-zinc-100 overflow-hidden">
          <div className="aspect-3/4 w-full overflow-hidden">
            <img
              alt={product.name}
              className="w-full h-full object-cover"
              src={product.image_url}
            />
          </div>
          {/* Badge de categoría */}
          <div className="absolute top-4 left-4">
            <span className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-zinc-600 shadow-sm">
              {product.category_name}
            </span>
          </div>
          {/* Badge limitado */}
          {product.is_limited === 1 && (
            <div className="absolute top-4 right-4">
              <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Limitado</span>
            </div>
          )}
          {/* Stock bajo */}
          {product.stock <= product.min_stock && (
            <div className="absolute bottom-4 right-4">
              <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">¡Pocas unidades!</span>
            </div>
          )}
        </section>

        {/* ── Información del Producto ── */}
        <section className="px-6 py-8 text-left">
          <h2 className="text-3xl font-headline font-black tracking-tighter text-on-surface leading-none uppercase mb-3">
            {product.name}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-red-600">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: `'FILL' ${i < Math.floor(product.rating || 4.5) ? 1 : 0}` }}>star</span>
              ))}
            </div>
            <span className="text-xs font-label text-zinc-400">{product.rating || '4.5'} · {product.reviews_count || 0} reseñas</span>
          </div>

          <p className="text-4xl font-headline font-black text-red-600 mb-6">{formatCOP(product.price)}</p>
          <p className="text-sm text-zinc-500 leading-relaxed mb-8">{product.description}</p>

          {/* ── Selector de Color ── */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Color: <span className="text-zinc-900">{selectedColor.name}</span>
              </span>
            </div>
            <div className="flex gap-3">
              {COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${
                    selectedColor.name === color.name
                      ? 'border-red-500 scale-110 shadow-lg'
                      : 'border-transparent hover:border-zinc-300'
                  }`}
                  style={{ backgroundColor: color.hex, boxShadow: color.hex === '#f4f4f5' ? 'inset 0 0 0 1px #d4d4d8' : '' }}
                />
              ))}
            </div>
          </div>

          {/* ── Selector de Talla ── */}
          <div id="size-selector" className="mb-8">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                Talla: <span className={selectedSize ? 'text-zinc-900' : 'text-red-500'}>
                  {selectedSize ? selectedSize.name : 'Selecciona tu talla'}
                </span>
              </span>
              <button className="text-[9px] font-bold uppercase tracking-widest text-red-600 underline underline-offset-2">
                Guía de Tallas
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize({ name: size })}
                  className={`h-12 flex items-center justify-center font-label font-black text-xs border-2 rounded-xl transition-all ${
                    selectedSize?.name === size
                      ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-900/20'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 active:scale-95'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ── Beneficios rápidos ── */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[
              { icon: 'local_shipping', label: 'Envío Gratis', sub: '+$50.000' },
              { icon: 'autorenew', label: 'Cambios', sub: '30 días' },
              { icon: 'verified', label: 'Calidad', sub: 'Garantizada' },
            ].map(b => (
              <div key={b.icon} className="bg-zinc-50 rounded-2xl p-3 text-center">
                <span className="material-symbols-outlined text-red-600 text-lg block mb-1">{b.icon}</span>
                <p className="text-[8px] font-black uppercase">{b.label}</p>
                <p className="text-[8px] text-zinc-400">{b.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Características Técnicas ── */}
        <section className="px-4 py-10 bg-zinc-950 text-white mt-4 text-left">
          <h3 className="px-2 text-[9px] font-bold uppercase tracking-[0.3em] text-red-400 mb-6">Rendimiento Técnico</h3>
          <div className="grid grid-cols-2 gap-3 px-2">
            <div className="col-span-2 bg-white/5 p-6 rounded-3xl">
              <span className="material-symbols-outlined text-4xl text-red-500 mb-3 block">air</span>
              <h4 className="font-headline font-bold text-lg mb-1 uppercase">KINETIC-STRETCH™</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">Tejido elástico de 4 vías para máximo rango de movimiento sin restricciones.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-3xl">
              <span className="material-symbols-outlined text-zinc-400 mb-2 block">water_drop</span>
              <h4 className="font-headline font-bold text-sm uppercase mb-1">Absorción</h4>
              <p className="text-[11px] text-zinc-400">Seca 3x más rápido que el nylon estándar.</p>
            </div>
            <div className="bg-white/5 p-5 rounded-3xl">
              <span className="material-symbols-outlined text-zinc-400 mb-2 block">shield</span>
              <h4 className="font-headline font-bold text-sm uppercase mb-1">Durabilidad</h4>
              <p className="text-[11px] text-zinc-400">Zonas reforzadas para larga vida útil.</p>
            </div>
          </div>
        </section>

      </main>

      {/* ── CTA Fijo ── */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-2xl px-6 pt-4 pb-8 flex items-center gap-3 z-60 border-t border-zinc-100 shadow-2xl">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 shrink-0 active:scale-90 transition-all"
        >
          <FaWhatsapp size={24} />
        </a>
        <button
          onClick={handleAddToCart}
          className={`flex-1 h-14 rounded-2xl font-headline font-black uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 outline-none ${
            addedToCart
              ? 'bg-emerald-500 text-white shadow-emerald-900/20'
              : selectedSize
                ? 'grekedi-gradient text-white shadow-red-900/20'
                : 'bg-zinc-100 text-zinc-400'
          }`}
        >
          {addedToCart ? '✓ Añadido al Carrito' : selectedSize ? 'Añadir al Carrito' : 'Elige tu Talla'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetailView;
