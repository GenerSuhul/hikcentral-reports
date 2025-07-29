import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Mail, Building2, XCircle, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBranches();
      setBranches(data);
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
      if (selectedBranch && selectedBranch.id === branchId) {
        setSelectedBranch(null);
        setContacts([]);
      }
      setSuccessMessage('Sucursal eliminada con éxito.');
    } catch (err) {
      setError('Error al eliminar sucursal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = async (branch) => {
    setSelectedBranch(branch);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBranchContacts(branch.id);
      setContacts(data);
    } catch (err) {
      setError('Error al cargar contactos: ' + err.message);
    } finally {
      setLoading(false);
    }
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
      await handleSelectBranch(selectedBranch); // Reload contacts
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
      await handleSelectBranch(selectedBranch); // Reload contacts
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
      await handleSelectBranch(selectedBranch); // Reload contacts
      setSuccessMessage('Contacto eliminado con éxito.');
    } catch (err) {
      setError('Error al eliminar contacto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Building2 className="w-8 h-8 text-blue-600" />
        Administrar Sucursales y Contactos
      </h2>

      {loading && (
        <div className="flex items-center justify-center p-4 text-blue-600">
          <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center gap-2"
            role="alert"
          >
            <XCircle className="w-5 h-5" />
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative mb-4 flex items-center gap-2"
            role="alert"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="block sm:inline">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sección de Sucursales */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-500" />
            Sucursales
          </h3>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nombre de la sucursal"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <input
              type="text"
              placeholder="Código de la sucursal (ej: AC_RNV_LBRTD)"
              value={newBranchCode}
              onChange={(e) => setNewBranchCode(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <motion.button
              onClick={handleAddBranch}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Agregar Sucursal
            </motion.button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            <AnimatePresence>
              {branches.map((branch) => (
                <motion.div
                  key={branch.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    selectedBranch?.id === branch.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  } shadow-sm`}
                >
                  {editingBranch?.id === branch.id ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editingBranch.name}
                        onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={editingBranch.code}
                        onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg"
                      />
                      <motion.button
                        onClick={() => handleUpdateBranch(branch.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Guardar
                      </motion.button>
                      <motion.button
                        onClick={() => setEditingBranch(null)}
                        className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-gray-400"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancelar
                      </motion.button>
                    </div>
                  ) : (
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSelectBranch(branch)}
                    >
                      <p className="font-semibold text-gray-800">{branch.name}</p>
                      <p className="text-sm text-gray-500">{branch.code}</p>
                    </div>
                  )}
                  <div className="flex gap-2 ml-4">
                    <motion.button
                      onClick={() => setEditingBranch(branch)}
                      className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteBranch(branch.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {branches.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-4">No hay sucursales registradas.</p>
            )}
          </div>
        </div>

        {/* Sección de Contactos */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6 text-purple-500" />
            Contactos de Sucursal
          </h3>
          {selectedBranch ? (
            <>
              <p className="text-lg font-medium text-gray-700 mb-4">
                Contactos para: <span className="text-blue-600">{selectedBranch.name} ({selectedBranch.code})</span>
              </p>
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
                <select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="RRHH">RRHH</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Gerente">Gerente</option>
                </select>
                <motion.button
                  onClick={handleAddContact}
                  className="bg-purple-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-5 h-5" />
                  Agregar Contacto
                </motion.button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <AnimatePresence>
                  {contacts.map((contact) => (
                    <motion.div
                      key={contact.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
                    >
                      {editingContact?.id === contact.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            value={editingContact.email}
                            onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg"
                          />
                          <select
                            value={editingContact.type}
                            onChange={(e) => setEditingContact({ ...editingContact, type: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded-lg"
                          >
                            <option value="RRHH">RRHH</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Gerente">Gerente</option>
                          </select>
                          <motion.button
                            onClick={() => handleUpdateContact(contact.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Guardar
                          </motion.button>
                          <motion.button
                            onClick={() => setEditingContact(null)}
                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-gray-400"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Cancelar
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{contact.email}</p>
                          <p className="text-sm text-gray-500">{contact.type}</p>
                        </div>
                      )}
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          onClick={() => setEditingContact(contact)}
                          className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {contacts.length === 0 && !loading && (
                  <p className="text-gray-500 text-center py-4">No hay contactos para esta sucursal.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Selecciona una sucursal para ver y administrar sus contactos.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BranchManagement;