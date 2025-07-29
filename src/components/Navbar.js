import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Settings, Upload, LogOut } from 'lucide-react';
import { supabase } from '../utils/supabase';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Cargar Reporte', path: '/upload', icon: Upload },
    { name: 'Administrar Sucursales', path: '/branches', icon: Settings },
  ];

  const onLogout = async () => {
    // Si usas Supabase Auth (lo dejo comentado):
    // await supabase.auth.signOut();

    // Si usas tabla personalizada:
    localStorage.removeItem('user'); // opcional si guardaste algo
    navigate('/'); // redirige al login o inicio
  };

  return (
    <motion.nav
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-4 mb-8 shadow-xl flex justify-between items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <ul className="flex space-x-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <Link to={item.path}>
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* 🔴 BOTÓN DE SALIR */}
      <motion.button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <LogOut className="w-5 h-5" />
        <span>Salir</span>
      </motion.button>
    </motion.nav>
  );
};

export default Navbar;
