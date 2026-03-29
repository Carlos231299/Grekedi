import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import Sidebar from './Sidebar';
import CartDrawer from './CartDrawer';

const TopAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { searchTerm, setSearchTerm } = useSearch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isProductDetail = location.pathname.startsWith('/product/');
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3002/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
    } else {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category_name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Limit to top 5 results
      setSearchResults(filtered);
    }
  }, [searchTerm, allProducts]);

  const handleResultClick = (slug) => {
    setSearchTerm('');
    setIsSearchOpen(false);
    navigate(`/product/${slug}`);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-surface-container-highest/20">
        <div className="flex justify-between items-center px-6 h-16 w-full relative">
          <button 
            onClick={() => isProductDetail ? navigate(-1) : setIsSidebarOpen(true)}
            className="active:scale-95 transition-transform text-red-800 dark:text-zinc-300"
          >
            <span className="material-symbols-outlined text-3xl">
              {isProductDetail ? 'arrow_back' : 'menu'}
            </span>
          </button>
          
          <h1 className="text-2xl font-black tracking-tighter text-red-800 dark:text-red-500 font-headline uppercase italic">
            GREKEDI <span className="font-light text-zinc-950 dark:text-white">STORE</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`active:scale-95 transition-all ${isSearchOpen ? 'text-red-500' : 'text-red-800 dark:text-zinc-300'}`}
            >
              <span className="material-symbols-outlined text-2xl">{isSearchOpen ? 'close' : 'search'}</span>
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="active:scale-95 transition-transform text-red-800 dark:text-zinc-300 relative"
            >
              <span className="material-symbols-outlined text-3xl">shopping_bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Dropdown with Results */}
          <div className={`absolute top-16 left-0 w-full bg-white dark:bg-zinc-950 border-b border-surface-container-highest/20 px-6 py-4 shadow-2xl transition-all duration-300 origin-top ${isSearchOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
            <div className="relative flex items-center gap-3 bg-zinc-100 dark:bg-white/5 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-zinc-400">search</span>
              <input
                autoFocus={isSearchOpen}
                type="text"
                placeholder="¿Qué estás buscando hoy?"
                className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 outline-none text-zinc-950 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Live Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-label font-bold text-zinc-500 uppercase tracking-widest px-2">Sugerencias</p>
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => handleResultClick(product.slug)}
                      className="flex items-center gap-4 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer transition-colors active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-200 shrink-0">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-sm font-headline font-bold text-zinc-900 dark:text-white truncate uppercase tracking-tight">{product.name}</h4>
                        <p className="text-xs font-label text-red-600 font-bold tracking-wider">${product.price.toFixed(2)}</p>
                      </div>
                      <span className="material-symbols-outlined text-zinc-300 text-sm">arrow_forward</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {searchTerm && searchResults.length === 0 && (
              <div className="mt-6 py-4 text-center text-zinc-400">
                <p className="text-xs italic">No se encontraron productos para "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default TopAppBar;
