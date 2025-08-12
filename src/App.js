import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Navbar';
import Home from './components/Home';
import FileUpload from './components/FileUpload';
import BranchManagement from './components/BranchManagement';
import Login from './components/Login';
import { supabase } from './utils/supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica si ya hay sesión iniciada al cargar la app
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Escucha cambios en la sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Cargando Agrisystems...</h2>
          <p className="text-gray-500 text-sm">Inicializando la aplicación</p>
        </motion.div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  // Main app
  return (
    <Router>
      <div className="min-h-screen bg-secondary-50">
        <Sidebar onLogout={handleLogout} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="ml-64 p-6"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<FileUpload />} />
              <Route path="/branches" element={<BranchManagement />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </Router>
  );
}
