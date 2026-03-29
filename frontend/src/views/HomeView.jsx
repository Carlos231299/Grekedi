import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import { FaTiktok, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useSearch } from '../context/SearchContext';

const API = '';

// Formateador de precios en Pesos Colombianos
const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// Imágenes de portada por categoría principal (V7.3 Female Focus)
const CATEGORY_COVERS = {
  'Ropa Deportiva': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800',
  'Bienestar & Suplementos': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800',
  'Accesorios': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
  default: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
};

const HomeView = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const { searchTerm, setSearchTerm } = useSearch();
  const productsRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);
      setSearchTerm('');
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [location.state, setSearchTerm]);

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setProducts(data) : [])
      .catch(err => console.error('Productos:', err));

    fetch(`${API}/api/categories`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setCategories(data) : [])
      .catch(err => console.error('Categorías:', err));

    fetch(`${API}/api/settings`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Ajustes:', err));
  }, []);

  const parentCategories = categories.filter(c => !c.parent_id);
  const subCategories = categories.filter(c => c.parent_id);

  // Map subcategory names under their parent
  const allSubNamesFor = (parentId) =>
    subCategories.filter(s => s.parent_id === parentId).map(s => s.name);

  const filteredProducts = products.filter(p => {
    if (searchTerm) return p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!activeCategory) return true;
    // Si se seleccionó una categoría padre, incluir todos sus hijos
    const parent = parentCategories.find(c => c.name === activeCategory);
    if (parent) {
      const subNames = allSubNamesFor(parent.id);
      return subNames.includes(p.category_name) || p.category_name === activeCategory;
    }
    // Si se seleccionó una subcategoría
    return p.category_name === activeCategory;
  });

  const scrollToProducts = () => productsRef.current?.scrollIntoView({ behavior: 'smooth' });

  const whatsappMessage = encodeURIComponent(settings.whatsapp_msg || '¡Hola Grekedi! 👋 Vi la página y me interesó mucho uno de sus productos.');
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number || '573147247187'}?text=${whatsappMessage}`;

  return (
    <div className="bg-surface font-body text-on-surface">
      <TopAppBar />

      <main className="pt-16 pb-12">

        {/* ── Hero (CMS Driven) ── */}
        {!searchTerm && (
          <section className="relative h-[600px] w-full overflow-hidden">
            <img
              alt="Grekedi Hero"
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.2]"
              src={settings.hero_image || 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=1200'}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-6 right-6 flex flex-col items-start text-left">
              <h2 className="text-5xl font-headline font-black text-white leading-[0.9] tracking-tighter mb-6 uppercase italic">
                {settings.hero_title || 'PODER EN MOVIMIENTO'}
              </h2>
              <button
                onClick={scrollToProducts}
                className="grekedi-gradient text-on-primary font-label font-bold uppercase tracking-widest px-8 py-4 rounded-lg shadow-2xl active:scale-95 transition-transform"
              >
                {settings.hero_button || 'Ver Colección'}
              </button>
            </div>
          </section>
        )}

        {/* ── Series Curadas ── */}
        <section ref={productsRef} className="py-12 px-6">

          {/* Título */}
          <div className="mb-5 text-left">
            <h3 className="text-xs font-label text-secondary uppercase tracking-[0.2em] mb-1">Series Curadas</h3>
            <h2 className="text-3xl font-headline font-bold text-on-surface uppercase italic">
              {activeCategory || 'Novedades'}
            </h2>
          </div>

          {/* Pills de navegación: Todos + Categorías padre + Subcategorías */}
          {parentCategories.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-8 scrollbar-none">
              {/* Pill: Todos */}
              <div className="flex flex-col gap-2 shrink-0 justify-start">
                <button
                  onClick={() => { setActiveCategory(null); setSearchTerm(''); }}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                    !activeCategory
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-lg'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  Todos
                </button>
              </div>

              {parentCategories.map(parent => {
                const isParentActive = activeCategory === parent.name ||
                  subCategories.filter(s => s.parent_id === parent.id).some(s => s.name === activeCategory);

                return (
                  <div key={parent.id} className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setActiveCategory(parent.name)}
                      className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                        activeCategory === parent.name
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-lg'
                          : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {parent.name}
                    </button>
                    {/* Subcategorías: solo visibles si esta categoría padre está activa */}
                    {isParentActive && (
                      <div className="flex gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {subCategories.filter(s => s.parent_id === parent.id).map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveCategory(sub.name)}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                              activeCategory === sub.name
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-red-300'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Carrusel de Productos (Scroll horizontal con Snap) */}
          {filteredProducts.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory px-1">
              {filteredProducts.map(product => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.slug}`} 
                  className="group text-left shrink-0 w-[240px] snap-start"
                >
                  <div className="aspect-3/4 rounded-2xl overflow-hidden bg-zinc-100 mb-4 relative shadow-sm border border-black/5">
                    <img
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      src={product.image_url}
                    />
                    {product.is_limited === 1 && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg">Limitado</span>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-headline text-sm font-bold text-on-surface pr-1 truncate uppercase tracking-tight mb-1">{product.name}</h4>
                  <p className="font-label text-xs text-red-600 font-black uppercase tracking-wider">{formatCOP(product.price)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-300">
              <span className="material-symbols-outlined text-5xl block mb-4">inventory_2</span>
              <p className="text-[10px] font-bold uppercase tracking-widest">Sin productos en esta categoría</p>
            </div>
          )}

        </section>

        {/* ── Bento Grid Categorías (Dinámico desde API) ── */}
        {!searchTerm && parentCategories.length > 0 && (
          <section className="py-12 bg-zinc-50">
            <div className="px-6 mb-8 text-left">
              <h3 className="text-xs font-label text-secondary uppercase tracking-[0.2em] mb-1">Enfoque de Actividad</h3>
              <h2 className="text-3xl font-headline font-bold text-on-surface uppercase italic">Comprar por Estilo</h2>
            </div>
            <div className="px-6 grid grid-cols-2 gap-3 h-[450px]">
              {parentCategories.slice(0, 3).map((cat, i) => (
                <div
                  key={cat.id}
                  className={`relative rounded-2xl overflow-hidden ${
                    i === 0 ? 'row-span-2' : ''
                  }`}
                >
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src={CATEGORY_COVERS[cat.name] || CATEGORY_COVERS.default}
                    alt={cat.name}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-on-surface/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-left">
                    <p className="text-[9px] font-label font-bold text-red-400 mb-1 uppercase tracking-widest">
                      {subCategories.filter(s => s.parent_id === cat.id).length} subcategorías
                    </p>
                    <h4 className={`font-headline font-bold text-white uppercase italic ${i === 0 ? 'text-2xl' : 'text-lg'}`}>{cat.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Filosofía (CMS Driven) ── */}
        <section className="py-20 px-8 bg-zinc-950 text-white border-t border-white/5">
          <div className="max-w-md mx-auto space-y-16">
            <div className="space-y-6 text-left">
              <h2 className="text-xs font-label text-red-500 uppercase tracking-[0.3em] font-bold">{settings.philosophy_label || 'Filosofía'}</h2>
              <h3 className="text-3xl font-headline font-black tracking-tighter leading-none uppercase italic">{settings.philosophy_title || 'ESTILO CON PERSONALIDAD'}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-body">{settings.philosophy_body || 'Contenido de filosofía de marca...'}</p>
            </div>
            <div className="pt-10 border-t border-white/10 space-y-10">
              <div className="flex flex-col gap-6 text-left">
                <h4 className="text-[10px] font-label text-zinc-500 uppercase tracking-widest">Conecta con nosotros</h4>
                <div className="flex gap-6">
                  <a href={settings.tiktok_url || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"><FaTiktok size={20} /></a>
                  <a href={settings.instagram_url || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"><FaInstagram size={20} /></a>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all"><FaWhatsapp size={20} /></a>
                </div>
              </div>
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span className="text-xs font-label tracking-wider">{settings.contact_email || 'contacto@grekedi.store'}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="material-symbols-outlined text-sm">call</span>
                  <span className="text-xs font-label tracking-wider">+{settings.whatsapp_number || '573147247187'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Floating WhatsApp */}
      <div className="fixed bottom-10 right-6 z-50">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 active:scale-95 transition-all shadow-green-900/20">
          <FaWhatsapp size={28} />
        </a>
      </div>
    </div>
  );
};

export default HomeView;
