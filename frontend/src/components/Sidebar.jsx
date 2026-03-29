import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [expandedCats, setExpandedCats] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(err => console.error('Error fetching categories:', err));
    }
  }, [isOpen]);

  const toggleExpand = (id) => {
    setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-100 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-zinc-950 z-101 shadow-2xl transition-transform duration-500 ease-out border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-8">
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-headline font-black tracking-tighter text-red-500 uppercase italic">
              GREKEDI <span className="font-light text-white text-xs">MENÚ</span>
            </h2>
            <button onClick={onClose} className="text-zinc-500 active:scale-90 transition-transform">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <nav className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-none text-left">
            {/* Inicio Link */}
            <Link to="/" onClick={onClose} className="flex items-center gap-4 text-white group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                <span className="material-symbols-outlined text-xl">home</span>
              </div>
              <span className="font-headline font-bold text-xs tracking-widest uppercase">Inicio</span>
            </Link>

            {/* Categorías Acordeón */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Colecciones</p>
              {parentCategories.map(cat => {
                const hasSubs = categories.some(s => s.parent_id === cat.id);
                const isExpanded = expandedCats[cat.id];

                return (
                  <div key={cat.id} className="space-y-2">
                    <button 
                      onClick={() => { toggleExpand(cat.id); navigate('/', { state: { category: cat.name } }); onClose(); }}
                      className="w-full flex items-center justify-between text-white group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isExpanded ? 'bg-red-600' : 'bg-zinc-700'}`} />
                        <span className="font-headline font-bold text-[11px] uppercase tracking-wider">{cat.name}</span>
                      </div>
                      {hasSubs && (
                        <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isExpanded ? 'rotate-180 text-red-600' : 'text-zinc-600'}`}>
                          expand_more
                        </span>
                      )}
                    </button>
                    
                    {isExpanded && hasSubs && (
                      <div className="pl-5 flex flex-col gap-3 mt-2 border-l border-white/5 animate-in slide-in-from-top-1 duration-200">
                        {categories.filter(s => s.parent_id === cat.id).map(sub => (
                          <Link
                            key={sub.id}
                            to="/"
                            state={{ category: sub.name }}
                            onClick={onClose}
                            className="text-[10px] font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
                          >
                            <span className="w-1 h-px bg-zinc-800" /> {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Acceso Admin */}
            {isAuthenticated && (
              <Link to="/admin" onClick={onClose} className="flex items-center gap-4 text-emerald-500 group pt-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <span className="font-headline font-bold text-xs tracking-widest uppercase">Panel Admin</span>
              </Link>
            )}
          </nav>

          <footer className="mt-auto pt-8 border-t border-white/5">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="w-full bg-red-500/10 text-red-500 py-4 rounded-xl font-label font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Salir
              </button>
            ) : (
              <Link 
                to="/login"
                onClick={onClose}
                className="w-full bg-white/5 text-white py-4 rounded-xl font-label font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center block"
              >
                Accionistas
              </Link>
            )}
          </footer>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
