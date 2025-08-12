import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  FileText, 
  Upload, 
  Database
} from 'lucide-react';
import { getDashboardStats } from '../utils/supabase';

const Home = () => {
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalContacts: 0,
    activeBranches: 0,
    averageContacts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'Total Sucursales',
      value: stats.totalBranches.toString(),
      icon: Building2,
      color: 'bg-primary',
      description: 'Sucursales registradas en el sistema'
    },
    {
      title: 'Total Contactos',
      value: stats.totalContacts.toString(),
      icon: Users,
      color: 'bg-secondary',
      description: 'Contactos activos en todas las sucursales'
    },
    {
      title: 'Sucursales Activas',
      value: stats.activeBranches.toString(),
      icon: FileText,
      color: 'bg-accent',
      description: 'Sucursales con contactos registrados'
    },
    {
      title: 'Promedio Contactos',
      value: stats.averageContacts.toString(),
      icon: Users,
      color: 'bg-info',
      description: 'Contactos promedio por sucursal'
    }
  ];

  const quickActions = [
    {
      title: 'Cargar Reporte',
      description: 'Sube archivos Excel para procesamiento automático',
      icon: Upload,
      color: 'bg-primary',
      link: '/upload'
    },
    {
      title: 'Gestionar Sucursales',
      description: 'Administra sucursales y contactos del sistema',
      icon: Building2,
      color: 'bg-secondary',
      link: '/branches'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Database className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-dark">Cargando Dashboard...</h2>
          <p className="text-info text-sm">Obteniendo datos del sistema</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header Section */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
              <p className="text-info">Bienvenido al sistema de gestión de Agrisystems</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-1">{stat.value}</h3>
              <p className="text-info text-sm font-medium">{stat.title}</p>
              <p className="text-muted text-xs mt-2">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Automator Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-dark">Automatizador de Reportes</h2>
                  <p className="text-info">Transforma la gestión de reportes de asistencia</p>
                </div>
              </div>
              
              <p className="text-dark mb-6 leading-relaxed">
                Carga archivos Excel y disfruta del envío automático de correos a cada sucursal. 
                Nuestro sistema procesa automáticamente los datos y distribuye la información de 
                manera eficiente y profesional.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Comenzar Ahora
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 hover:shadow-md transition-all duration-200 hover:border-primary-200"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2">{action.title}</h3>
                  <p className="text-info text-sm mb-4">{action.description}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 text-primary hover:text-primary-600 font-medium text-sm transition-colors"
                  >
                    Acceder
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-dark mb-4">Estado del Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm font-medium text-dark">Servidor Principal</span>
                  </div>
                  <span className="text-sm text-success-600 font-medium">Operativo</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm font-medium text-dark">Base de Datos</span>
                  </div>
                  <span className="text-sm text-success-600 font-medium">Conectado</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm font-medium text-dark">Servicio de Email</span>
                  </div>
                  <span className="text-sm text-success-600 font-medium">Activo</span>
                </div>
              </div>
            </motion.div>

            {/* System Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-dark mb-4">Información del Sistema</h3>
              <div className="space-y-3 text-sm text-info">
                <p>• Sistema de gestión empresarial interno</p>
                <p>• Gestión de sucursales y contactos</p>
                <p>• Procesamiento automático de reportes</p>
                <p>• Envío automático de correos</p>
                <p>• Base de datos en Supabase</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
