import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('Credenciales incorrectas. Intente de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-body text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-900/10 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-red-800/5 blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-headline font-black tracking-tighter text-red-500 uppercase mb-2">
            GREKEDI <span className="font-light text-white">STORE</span>
          </h1>
          <p className="text-zinc-500 text-sm font-label uppercase tracking-widest">Panel de Administración</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-label text-zinc-500 uppercase tracking-widest px-2">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-red-500/50 outline-none transition-all placeholder:text-zinc-700"
              placeholder="admin"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-label text-zinc-500 uppercase tracking-widest px-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-red-500/50 outline-none transition-all placeholder:text-zinc-700"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full grekedi-gradient py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-sm shadow-xl shadow-red-950/20 active:scale-95 transition-all mt-4"
          >
            Acceder al Panel
          </button>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center space-y-3">
            <span className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
              Credenciales de Sistema
            </span>
            <div className="flex gap-4">
               <p className="text-zinc-500 text-[10px] uppercase font-label tracking-widest">
                 User: <span className="text-white font-bold ml-1">admin</span>
               </p>
               <span className="text-zinc-700">|</span>
               <p className="text-zinc-500 text-[10px] uppercase font-label tracking-widest">
                 Pass: <span className="text-white font-bold ml-1">stitch2026</span>
               </p>
            </div>
          </div>
        </form>

        <footer className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-zinc-500 text-[10px] font-label uppercase tracking-widest hover:text-white transition-colors"
          >
            ← Volver a la Tienda
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LoginView;
