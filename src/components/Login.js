import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  Mail, 
  Lock, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff,
  Shield,
  CheckCircle,
  AlertTriangle,
  Building2,
  Database,
  Globe,
  Users
} from 'lucide-react';
import { loginUser, ensureUsersTable, createTestUser } from '../utils/supabase';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Inicializar tabla users cuando se carga el componente
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Inicializando base de datos...');
        await ensureUsersTable();
        await createTestUser();
        console.log('Base de datos inicializada correctamente');
      } catch (error) {
        console.error('Error inicializando base de datos:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeDatabase();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, error: loginError } = await loginUser(email, password);

      if (user) {
        onLoginSuccess(user);
      } else {
        console.error('Error de login:', loginError);
        setError(loginError || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const isFormValid = validateEmail(email) && validatePassword(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary rounded-full translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {initializing ? (
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-dark mb-2">Inicializando Sistema</h2>
          <p className="text-info">Configurando la base de datos de Agrisystems</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 20 }}
        >
          {/* Logo Section */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-dark mb-2">
              Agrisystems
            </h1>
            <p className="text-info text-sm font-medium">Sistema de Gestión Inteligente</p>
            
            {/* Feature Icons */}
            <div className="flex justify-center space-x-6 mt-6">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-info">Base de Datos</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-info">Conectividad</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-info">Usuarios</span>
              </div>
            </div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-dark mb-2 flex items-center justify-center gap-3">
                <LogIn className="w-7 h-7 text-primary" />
                Iniciar Sesión
              </h2>
              <p className="text-info">
                Accede a tu cuenta para continuar
              </p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="bg-error-50 border border-error-200 rounded-xl p-4 mb-6 flex items-start gap-3"
                  role="alert"
                >
                  <XCircle className="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-error-700">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-dark text-sm font-semibold mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    emailFocused ? 'text-primary' : 'text-info'
                  }`} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className={`w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                      email && !validateEmail(email) ? 'border-error-300 focus:border-error-500 focus:ring-error-200' : ''
                    }`}
                    placeholder="tu@ejemplo.com"
                    required
                    disabled={loading}
                  />
                  {email && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {validateEmail(email) ? (
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-error-500" />
                      )}
                    </motion.div>
                  )}
                </div>
                {email && !validateEmail(email) && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-error-500 text-xs mt-2 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Ingresa un correo electrónico válido
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-dark text-sm font-semibold mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                    passwordFocused ? 'text-primary' : 'text-info'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={`w-full pl-10 pr-12 py-3 border border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                      password && !validatePassword(password) ? 'border-error-300 focus:border-error-500 focus:ring-error-200' : ''
                    }`}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-info hover:text-dark transition-colors p-1 rounded-lg hover:bg-secondary-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
                {password && !validatePassword(password) && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-error-500 text-xs mt-2 flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    La contraseña debe tener al menos 6 caracteres
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`w-full bg-primary hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 ${
                  !isFormValid || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-primary/25'
                }`}
                whileHover={isFormValid && !loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Iniciando Sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    Iniciar Sesión
                  </>
                )}
              </motion.button>
            </form>

            {/* Additional Info */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="text-info text-sm">
                ¿Problemas para acceder?{' '}
                <a href="#" className="text-primary hover:text-primary-600 font-medium transition-colors">
                  Contacta al administrador
                </a>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="text-info text-xs">
              © 2024 Agrisystems. Sistema interno de gestión empresarial.
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
