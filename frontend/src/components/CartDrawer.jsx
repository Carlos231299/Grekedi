import React from 'react';
import { useCart } from '../context/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const handleCheckout = () => {
    alert('¡Pedido realizado con éxito! Gracias por confiar en Grekedi Store.');
    clearCart();
    onClose();
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-100 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <aside 
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[350px] bg-zinc-950 z-101 shadow-2xl transition-transform duration-500 ease-out border-l border-white/5 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-8">
          <header className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-headline font-black tracking-tighter text-red-500 uppercase italic">
              TU <span className="font-light text-white text-sm">CARRITO</span>
            </h2>
            <button onClick={onClose} className="text-zinc-500 active:scale-90 transition-transform">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6 hide-scrollbar text-left">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                <span className="material-symbols-outlined text-6xl opacity-20">shopping_basket</span>
                <p className="font-label text-xs uppercase tracking-[0.2em]">Tu bolsa está vacía</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-24 rounded-2xl overflow-hidden bg-zinc-900 shrink-0">
                    <img className="w-full h-full object-cover" src={item.image_url} alt={item.name} />
                  </div>
                  <div className="grow min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-headline font-bold text-xs truncate pr-2 text-white uppercase tracking-tight">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <p className="text-[10px] font-label text-zinc-500 uppercase tracking-wider mb-3">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center bg-zinc-900 border border-white/5 rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-zinc-400">-</button>
                          <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-zinc-400">+</button>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <footer className="mt-8 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-label text-zinc-500 uppercase tracking-widest">Total Estimado</span>
                <span className="text-2xl font-headline font-black text-white">${cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full grekedi-gradient text-on-primary py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-sm shadow-xl shadow-red-950/40 active:scale-95 transition-all"
              >
                Finalizar Compra
              </button>
            </footer>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
