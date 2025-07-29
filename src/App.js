import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import FileUpload from './components/FileUpload';
import BranchManagement from './components/BranchManagement';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8">
        <div className="container mx-auto max-w-5xl">
          <Navbar />
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