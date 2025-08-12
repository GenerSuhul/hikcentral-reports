import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Menu, Home, Upload, Store, LogOut } from "lucide-react";

const Sidebar = ({ onLogout }) => {
  // Estado inicial basado en el tamaño de pantalla
  const [isOpen, setIsOpen] = useState(window.innerWidth > 1024);
  const location = useLocation();

  // Manejar responsive
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { name: "Inicio", href: "/", icon: <Home size={20} /> },
    { name: "Cargar Reporte", href: "/upload", icon: <Upload size={20} /> },
    { name: "Sucursales", href: "/branches", icon: <Store size={20} /> },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isOpen ? 240 : 70 }}
        className="h-screen bg-gray-900 text-white flex flex-col border-r border-gray-800 shadow-lg fixed left-0 top-0"
        style={{ zIndex: 50 }}
      >
        {/* Header */}
        <div
          className={`flex items-center ${
            isOpen ? "justify-between px-4" : "justify-center"
          } py-4 border-b border-gray-800`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="text-white" size={22} />
            </div>
            {isOpen && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">Agrisystems</h1>
                <p className="text-xs text-gray-400 truncate">Gestión Inteligente</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`text-gray-300 hover:text-accent transition-all duration-200 p-1 rounded-lg hover:bg-gray-800 ${
              isOpen ? "ml-2" : "mx-auto"
            }`}
            title={isOpen ? "Contraer sidebar" : "Expandir sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-accent text-white font-semibold shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                } ${!isOpen ? "justify-center" : ""}`}
                title={!isOpen ? item.name : ""}
              >
                <span className={`${isOpen ? "mr-3" : ""} transition-all duration-200`}>
                  {item.icon}
                </span>
                {isOpen && (
                  <span className="transition-all duration-200">{item.name}</span>
                )}
                
                {/* Tooltip para sidebar contraído */}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-l-gray-800"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className={`p-4 border-t border-gray-800 ${!isOpen ? "text-center" : ""}`}>
          <button
            onClick={onLogout}
            className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-red-400 transition-all duration-200 ${
              !isOpen ? "justify-center" : ""
            }`}
            title={!isOpen ? "Cerrar Sesión" : ""}
          >
            <LogOut size={20} className={`${isOpen ? "mr-3" : ""} transition-all duration-200`} />
            {isOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content (ajustado al sidebar) */}
      <motion.main
        animate={{ marginLeft: isOpen ? 240 : 70 }}
        className="flex-1 p-4 transition-all duration-200"
      >
      </motion.main>
    </div>
  );
};

export default Sidebar;
