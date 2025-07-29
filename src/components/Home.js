import React from 'react';
import { motion } from 'framer-motion';
import { Mail, FileText, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <motion.div
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
      >
        <Mail className="w-16 h-16 text-blue-500" />
      </motion.div>

      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
        Automatizador de Reportes Agrisystems
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Carga tus reportes de asistencia en Excel y el sistema carga automaticamente los correos a cada sucursal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <Link to="/upload">
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText className="w-12 h-12 text-blue-600 mb-3" />
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Cargar Reporte</h3>
            <p className="text-gray-600 text-center">Sube tu archivo Excel y envía los reportes con un clic.</p>
          </motion.div>
        </Link>

        <Link to="/branches">
          <motion.div
            className="bg-purple-50 border border-purple-200 rounded-2xl p-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Database className="w-12 h-12 text-purple-600 mb-3" />
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Administrar Sucursales</h3>
            <p className="text-gray-600 text-center">Gestiona tus sucursales y los contactos de correo asociados.</p>
          </motion.div>
        </Link>

        <motion.div
          className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Mail className="w-12 h-12 text-green-600 mb-3" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Envío Automatizado</h3>
          <p className="text-gray-600 text-center">Disfruta de la tranquilidad de que tus reportes se envían solos.</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
