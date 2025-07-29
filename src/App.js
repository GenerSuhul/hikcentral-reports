import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import FileUpload from './components/FileUpload';
import BranchManagement from './components/BranchManagement';
import Login from './components/Login';
import { supabase } from './utils/supabase';

export const loginUser = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export default function App() {
  const [user, setUser] = useState(null);

  // Verifica si ya hay sesión iniciada al cargar la app
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Escucha cambios en la sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8">
        <div className="container mx-auto max-w-5xl">
          <Navbar onLogout={handleLogout} />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<FileUpload />} />
              <Route path="/branches" element={<BranchManagement />} />
            </Routes>
          </motion.div>
        </div>
      </div>
    </Router>
  );
}
