import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Building2, 
  XCircle, 
  CheckCircle,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  MailPlus,
  Eye,
  Settings,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  MapPin,
  Phone,
  Globe,
  Shield,
  Database,
  Network
} from 'lucide-react';
import { fetchBranches, addBranch, updateBranch, deleteBranch, fetchBranchContacts, addBranchContact, updateBranchContact, deleteBranchContact } from '../utils/supabase';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [editingBranch, setEditingBranch] = useState(null);
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactType, setNewContactType] = useState('RRHH');
  const [editingContact, setEditingContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedBranches, setExpandedBranches] = useState(new Set());
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBranches();
      setBranches(data);
      
      // Cargar contactos para todas las sucursales
      const branchesWithContacts = await Promise.all(
        data.map(async (branch) => {
          try {
            const branchContacts = await fetchBranchContacts(branch.id);
            return { ...branch, contacts: branchContacts || [] };
          } catch (err) {
            console.error(`Error cargando contactos para sucursal ${branch.id}:`, err);
            return { ...branch, contacts: [] };
          }
        })
      );
      
      setBranches(branchesWithContacts);
    } catch (err) {
      setError('Error al cargar sucursales: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranchName.trim() || !newBranchCode.trim()) {
      setError('El nombre y el código de la sucursal no pueden estar vacíos.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await addBranch({ name: newBranchName.trim(), code: newBranchCode.trim() });
      setNewBranchName('');
      setNewBranchCode('');
      setShowAddBranchModal(false);
      await loadBranches();
      setSuccessMessage('Sucursal agregada con éxito.');
    } catch (err) {
      setError('Error al agregar sucursal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBranch = async (branchId) => {
    if (!editingBranch.name.trim() || !editingBranch.code.trim()) {
      setError('El nombre y el código de la sucursal no pueden estar vacíos.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateBranch(branchId, { name: editingBranch.name.trim(), code: editingBranch.code.trim() });
      setEditingBranch(null);
      await loadBranches();
      setSuccessMessage('Sucursal actualizada con éxito.');
    } catch (err) {
      setError('Error al actualizar sucursal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta sucursal y todos sus contactos?')) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteBranch(branchId);
      await loadBranches();
      setSuccessMessage('Sucursal eliminada con éxito.');
    } catch (err) {
      setError('Error al eliminar sucursal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setContacts(branch.contacts || []);
  };

  const handleAddContact = async () => {
    if (!selectedBranch || !newContactEmail.trim()) {
      setError('Selecciona una sucursal y proporciona un correo.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await addBranchContact({
        branch_id: selectedBranch.id,
        email: newContactEmail.trim(),
        type: newContactType
      });
      setNewContactEmail('');
      setNewContactType('RRHH');
      setShowAddContactModal(false);
      await loadBranches();
      setSuccessMessage('Contacto agregado con éxito.');
    } catch (err) {
      setError('Error al agregar contacto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async (contactId) => {
    if (!editingContact.email.trim()) {
      setError('El correo del contacto no puede estar vacío.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateBranchContact(contactId, { email: editingContact.email.trim(), type: editingContact.type });
      setEditingContact(null);
      await loadBranches();
      setSuccessMessage('Contacto actualizado con éxito.');
    } catch (err) {
      setError('Error al actualizar contacto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await deleteBranchContact(contactId);
      await loadBranches();
      setSuccessMessage('Contacto eliminado con éxito.');
    } catch (err) {
      setError('Error al eliminar contacto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBranchExpansion = (branchId) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
    }
    setExpandedBranches(newExpanded);
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'withContacts' && (branch.contacts?.length || 0) > 0) ||
                         (filterType === 'withoutContacts' && (!branch.contacts || branch.contacts.length === 0));
    return matchesSearch && matchesFilter;
  });

  const getContactTypeColor = (type) => {
    const colors = {
      'RRHH': 'bg-blue-100 text-blue-800 border-blue-200',
      'Administración': 'bg-green-100 text-green-800 border-green-200',
      'Ventas': 'bg-purple-100 text-purple-800 border-purple-200',
      'Soporte': 'bg-orange-100 text-orange-800 border-orange-200',
      'Gerencia': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getContactTypeIcon = (type) => {
    const icons = {
      'RRHH': Users,
      'Administración': Settings,
      'Ventas': Globe,
      'Soporte': Phone,
      'Gerencia': Shield
    };
    return icons[type] || Users;
  };

  if (loading && branches.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-slate-700">Cargando sucursales...</h2>
          <p className="text-slate-500 text-sm">Conectando con la base de datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Administración de Sucursales</h1>
                <p className="text-slate-600">Gestiona sucursales y contactos de Agrisystems</p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowAddBranchModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Sucursal</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <motion.div
            className="bg-white rounded-xl border border-slate-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Sucursales</p>
                <p className="text-2xl font-bold text-slate-900">{branches.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl border border-slate-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Contactos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {branches.reduce((total, branch) => total + (branch.contacts?.length || 0), 0)}
                </p>
              </div>
        </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl border border-slate-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Network className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Sucursales Activas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {branches.filter(branch => (branch.contacts?.length || 0) > 0).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl border border-slate-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Promedio Contactos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {branches.length > 0 ? Math.round(branches.reduce((total, branch) => total + (branch.contacts?.length || 0), 0) / branches.length) : 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
                  placeholder="Buscar sucursales por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
              >
                <option value="all">Todas las sucursales</option>
                <option value="withContacts">Con contactos</option>
                <option value="withoutContacts">Sin contactos</option>
              </select>
            </div>
          </div>
          </div>

        {/* Branches List */}
        <div className="space-y-4">
          {filteredBranches.map((branch, index) => (
                <motion.div
                  key={branch.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Branch Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{branch.name}</h3>
                      <p className="text-slate-600">Código: {branch.code}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Contactos</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {branch.contacts?.length || 0}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => toggleBranchExpansion(branch.id)}
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {expandedBranches.has(branch.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </motion.button>
                      
                      <motion.button
                        onClick={() => {
                          setSelectedBranch(branch);
                          setShowAddContactModal(true);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <UserPlus className="w-5 h-5" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => setEditingBranch({ ...branch })}
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-5 h-5" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => handleDeleteBranch(branch.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts Section */}
              <AnimatePresence>
                {expandedBranches.has(branch.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-slate-200 bg-slate-50"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                          <Users className="w-5 h-5 text-slate-600" />
                          <span>Contactos de la Sucursal</span>
                        </h4>
                        <motion.button
                          onClick={() => {
                            setSelectedBranch(branch);
                            setShowAddContactModal(true);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Agregar Contacto</span>
                        </motion.button>
                      </div>

                      {branch.contacts && branch.contacts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {branch.contacts.map((contact) => (
                            <motion.div
                              key={contact.id}
                              className="bg-white rounded-lg border border-slate-200 p-4"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getContactTypeColor(contact.type)}`}>
                                      {contact.type}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 text-slate-700">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm font-medium">{contact.email}</span>
                                  </div>
                    </div>
                                
                                <div className="flex space-x-1">
                    <motion.button
                                    onClick={() => setEditingContact({ ...contact })}
                                    className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                                    <Edit className="w-4 h-4" />
                    </motion.button>
                                  
                    <motion.button
                                    onClick={() => handleDeleteContact(contact.id)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                                    <Trash2 className="w-4 h-4" />
                    </motion.button>
                                </div>
                  </div>
                </motion.div>
              ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 mb-4">Esta sucursal no tiene contactos registrados</p>
                          <motion.button
                            onClick={() => {
                              setSelectedBranch(branch);
                              setShowAddContactModal(true);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus className="w-5 h-5" />
                            <span>Agregar Primer Contacto</span>
                          </motion.button>
                        </div>
            )}
          </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredBranches.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No se encontraron sucursales</h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda' 
                : 'Comienza agregando tu primera sucursal'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <motion.button
                onClick={() => setShowAddBranchModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-medium flex items-center space-x-3 mx-auto transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-6 h-6" />
                <span>Crear Primera Sucursal</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Branch Modal */}
      <AnimatePresence>
        {showAddBranchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Nueva Sucursal</h3>
                <button
                  onClick={() => setShowAddBranchModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddBranch(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de la Sucursal
                  </label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                    placeholder="Ej: Sucursal Centro"
                    required
                  />
                </div>
                
        <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Código de la Sucursal
                  </label>
                  <input
                    type="text"
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                    placeholder="Ej: CENTRO"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBranchModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Crear Sucursal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContactModal && selectedBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Nuevo Contacto - {selectedBranch.name}
          </h3>
                <button
                  onClick={() => setShowAddContactModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleAddContact(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Correo Electrónico
                  </label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                    placeholder="contacto@sucursal.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Contacto
                  </label>
                <select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                >
                  <option value="RRHH">RRHH</option>
                  <option value="Administración">Administración</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Soporte">Soporte</option>
                  <option value="Gerencia">Gerencia</option>
                </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddContactModal(false)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Agregar Contacto
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Branch Modal */}
      <AnimatePresence>
        {editingBranch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Editar Sucursal</h3>
                <button
                  onClick={() => setEditingBranch(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleUpdateBranch(editingBranch.id); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de la Sucursal
                  </label>
                  <input
                    type="text"
                    value={editingBranch.name}
                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Código de la Sucursal
                  </label>
                  <input
                    type="text"
                    value={editingBranch.code}
                    onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingBranch(null)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Actualizar Sucursal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Contact Modal */}
                <AnimatePresence>
        {editingContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
                    <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Editar Contacto</h3>
                <button
                  onClick={() => setEditingContact(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateContact(editingContact.id); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Correo Electrónico
                  </label>
                          <input
                            type="email"
                            value={editingContact.email}
                            onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Contacto
                  </label>
                          <select
                            value={editingContact.type}
                            onChange={(e) => setEditingContact({ ...editingContact, type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-800 focus:border-transparent transition-colors"
                          >
                            <option value="RRHH">RRHH</option>
                            <option value="Administración">Administración</option>
                            <option value="Ventas">Ventas</option>
                            <option value="Soporte">Soporte</option>
                            <option value="Gerencia">Gerencia</option>
                          </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                            onClick={() => setEditingContact(null)}
                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    Actualizar Contacto
                  </button>
                        </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50"
          >
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6" />
              <span>{error}</span>
                      </div>
                    </motion.div>
        )}
                </AnimatePresence>

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg z-50"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6" />
              <span>{successMessage}</span>
      </div>
    </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BranchManagement;