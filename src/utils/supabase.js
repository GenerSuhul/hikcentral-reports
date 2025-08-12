import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fbswmipelgbgkqrxezia.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3dtaXBlbGdiZ2txcnhlemlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDQ3MzcsImV4cCI6MjA2OTMyMDczN30.RDJdNhN-jcJ4AKORW54BlQWSiBL5KWATmq0jNonMaL8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchBranches = async () => {
  try {
    console.log('🔄 Obteniendo sucursales y contactos...');
    
    // Obtener sucursales
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('*');
    
    if (branchesError) {
      console.error('❌ Error obteniendo sucursales:', branchesError);
      throw branchesError;
    }

    // Obtener contactos de sucursales
    const { data: contacts, error: contactsError } = await supabase
      .from('branch_contacts')
      .select('*');
    
    if (contactsError) {
      console.error('❌ Error obteniendo contactos:', contactsError);
      throw contactsError;
    }

    // Combinar sucursales con sus contactos
    const branchesWithContacts = branches.map(branch => {
      const branchContacts = contacts.filter(contact => contact.branch_id === branch.id);
      
      // Encontrar el email principal (prioridad: RRHH > Gerente > Supervisor)
      let primaryEmail = null;
      let primaryContact = null;
      
      // Buscar RRHH primero
      const rrhhContact = branchContacts.find(c => c.type === 'RRHH');
      if (rrhhContact) {
        primaryEmail = rrhhContact.email;
        primaryContact = rrhhContact;
      } else {
        // Buscar Gerente
        const gerenteContact = branchContacts.find(c => c.type === 'Gerente');
        if (gerenteContact) {
          primaryEmail = gerenteContact.email;
          primaryContact = gerenteContact;
        } else {
          // Buscar Supervisor
          const supervisorContact = branchContacts.find(c => c.type === 'Supervisor');
          if (supervisorContact) {
            primaryEmail = supervisorContact.email;
            primaryContact = supervisorContact;
          }
        }
      }

      return {
        ...branch,
        email: primaryEmail,
        contact_email: primaryEmail,
        contact_name: primaryContact?.type || 'Sin contacto',
        contacts: branchContacts
      };
    });

    console.log('✅ Sucursales obtenidas:', branchesWithContacts);
    return branchesWithContacts;
    
  } catch (error) {
    console.error('❌ Error en fetchBranches:', error);
    throw error;
  }
};

export const addBranch = async (branch) => {
  const { data, error } = await supabase
    .from('branches')
    .insert(branch)
    .select();
  if (error) throw error;
  return data[0];
};

export const updateBranch = async (id, updates) => {
  const { data, error } = await supabase
    .from('branches')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteBranch = async (id) => {
  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const fetchBranchContacts = async (branchId) => {
  const { data, error } = await supabase
    .from('branch_contacts')
    .select('*')
    .eq('branch_id', branchId);
  if (error) throw error;
  return data;
};

export const addBranchContact = async (contact) => {
  const { data, error } = await supabase
    .from('branch_contacts')
    .insert(contact)
    .select();
  if (error) throw error;
  return data[0];
};

export const updateBranchContact = async (id, updates) => {
  const { data, error } = await supabase
    .from('branch_contacts')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteBranchContact = async (id) => {
  const { error } = await supabase
    .from('branch_contacts')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Función para verificar y crear la tabla users si no existe
export const ensureUsersTable = async () => {
  try {
    console.log('Verificando estructura de la base de datos...');
    
    // Verificar si la tabla users existe intentando hacer una consulta simple
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error verificando tabla users:', error);
      return false;
    }
    
    console.log('Tabla users existe y es accesible');
    return true;
  } catch (error) {
    console.error('Error en ensureUsersTable:', error);
    return false;
  }
};

// Función para crear usuario de prueba si no existe
export const createTestUser = async () => {
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'it.agrisystem@gmail.com')
      .maybeSingle();

    if (checkError) {
      console.error('Error verificando usuario existente:', checkError);
      return false;
    }

    if (!existingUser) {
      console.log('Creando usuario de prueba...');
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: 'it.agrisystem@gmail.com',
          password: 'Gener2004#',
          name: 'Usuario de Prueba',
          role: 'admin'
        });

      if (insertError) {
        console.error('Error creando usuario de prueba:', insertError);
        return false;
      }
      
      console.log('Usuario de prueba creado exitosamente');
    } else {
      console.log('Usuario de prueba ya existe');
    }
    
    return true;
  } catch (error) {
    console.error('Error en createTestUser:', error);
    return false;
  }
};

// utils/supabase.js (al final del archivo)

export const loginUser = async (email, password) => {
  try {
    console.log('Intentando login con:', { email, password: '***' });
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      console.error('Error Supabase:', error);
      return { user: null, error: 'Error del servidor. Intenta más tarde.' };
    }

    if (!data) {
      console.log('Usuario no encontrado o credenciales incorrectas');
      return { user: null, error: 'Correo o contraseña inválidos.' };
    }

    console.log('Login exitoso para usuario:', data.email);
    return { user: data, error: null };

  } catch (e) {
    console.error('Excepción inesperada:', e);
    return { user: null, error: 'Error inesperado.' };
  }
};

// Función para obtener estadísticas del dashboard
export const getDashboardStats = async () => {
  try {
    // Obtener total de sucursales
    const { count: branchesCount } = await supabase
      .from('branches')
      .select('*', { count: 'exact', head: true });

    // Obtener total de contactos
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    // Obtener sucursales activas (con contactos)
    const { data: branchesWithContacts } = await supabase
      .from('branches')
      .select('id, contacts(*)');

    const activeBranches = branchesWithContacts?.filter(branch => 
      branch.contacts && branch.contacts.length > 0
    ).length || 0;

    // Calcular promedio de contactos por sucursal
    const averageContacts = branchesCount > 0 ? Math.round(contactsCount / branchesCount) : 0;

    return {
      totalBranches: branchesCount || 0,
      totalContacts: contactsCount || 0,
      activeBranches,
      averageContacts
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    return {
      totalBranches: 0,
      totalContacts: 0,
      activeBranches: 0,
      averageContacts: 0
    };
  }
};

// Función para obtener actividades recientes
export const getRecentActivities = async () => {
  try {
    // Por ahora retornamos actividades estáticas, pero podrías crear una tabla 'activities' en Supabase
    // y registrar todas las acciones del sistema
    return [
      {
        id: 1,
        type: 'success',
        message: 'Sistema inicializado correctamente',
        time: 'Ahora',
        icon: 'CheckCircle'
      }
    ];
  } catch (error) {
    console.error('Error obteniendo actividades recientes:', error);
    return [];
  }
};

// Función para obtener métricas de rendimiento
export const getPerformanceMetrics = async () => {
  try {
    // Estas métricas podrían venir de logs del sistema o tablas de métricas
    return [
      { label: 'Tasa de Éxito', value: '99.9%', color: 'text-green-500' },
      { label: 'Tiempo de Respuesta', value: '< 2s', color: 'text-blue-500' },
      { label: 'Uptime del Sistema', value: '99.99%', color: 'text-purple-500' },
      { label: 'Usuarios Activos', value: '1', color: 'text-orange-500' }
    ];
  } catch (error) {
    console.error('Error obteniendo métricas de rendimiento:', error);
    return [];
  }
};
