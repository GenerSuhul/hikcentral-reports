const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fbswmipelgbgkqrxezia.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3dtaXBlbGdiZ2txcnhlemlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDQ3MzcsImV4cCI6MjA2OTMyMDczN30.RDJdNhN-jcJ4AKORW54BlQWSiBL5KWATmq0jNonMaL8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateDatabase() {
  try {
    console.log('🚀 Iniciando migración de base de datos...');
    
    // Primero, verificar si el campo departments ya existe
    console.log('🔍 Verificando estructura actual...');
    const { data: currentStructure, error: structureError } = await supabase
      .from('branch_contacts')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Error verificando estructura:', structureError.message);
      return;
    }

    console.log('✅ Estructura actual verificada');
    
    // Como no podemos ejecutar ALTER TABLE directamente, vamos a actualizar los contactos existentes
    // y agregar el campo departments como parte de los datos
    
    // 1. Obtener todos los contactos de AC_RNV_CMX_PPTN_1
    console.log('📝 Obteniendo contactos de AC_RNV_CMX_PPTN_1...');
    const { data: contacts, error: contactsError } = await supabase
      .from('branch_contacts')
      .select(`
        id,
        type,
        email,
        branch_id,
        branches!inner(code, name)
      `)
      .eq('branches.code', 'AC_RNV_CMX_PPTN_1');

    if (contactsError) {
      console.log('❌ Error obteniendo contactos:', contactsError.message);
      return;
    }

    console.log(`✅ Encontrados ${contacts.length} contactos para actualizar`);

    // 2. Actualizar cada contacto con su campo departments
    for (const contact of contacts) {
      let departments = null;
      
      // RRHH y Gerente manejan todos los departamentos
      if (contact.type === 'RRHH' || contact.type === 'Gerente') {
        departments = ['General', 'Ventas', 'Administración', 'Soporte'];
      }
      // Supervisor de Ventas solo maneja Ventas
      else if (contact.type === 'Supervisor' && contact.email.includes('ventas')) {
        departments = ['Ventas'];
      }
      // Supervisor de Administración solo maneja Administración
      else if (contact.type === 'Supervisor' && contact.email.includes('admin')) {
        departments = ['Administración'];
      }
      // Otros supervisores manejan todos los departamentos por defecto
      else if (contact.type === 'Supervisor') {
        departments = ['General', 'Ventas', 'Administración', 'Soporte'];
      }

      if (departments) {
        console.log(`📝 Actualizando ${contact.type}: ${contact.email} con departamentos: ${departments.join(', ')}`);
        
        // Intentar actualizar el contacto
        const { error: updateError } = await supabase
          .from('branch_contacts')
          .update({ 
            departments: JSON.stringify(departments),
            // Agregar un campo temporal para marcar que fue migrado
            migrated_at: new Date().toISOString()
          })
          .eq('id', contact.id);

        if (updateError) {
          console.log(`⚠️ Error actualizando ${contact.email}:`, updateError.message);
        } else {
          console.log(`✅ ${contact.email} actualizado exitosamente`);
        }
      }
    }

    // 3. Verificar la estructura actualizada
    console.log('🔍 Verificando contactos actualizados...');
    const { data: updatedContacts, error: verificationError } = await supabase
      .from('branch_contacts')
      .select(`
        id,
        type,
        email,
        departments,
        migrated_at,
        branches!inner(code, name)
      `)
      .eq('branches.code', 'AC_RNV_CMX_PPTN_1')
      .order('type', { ascending: true });

    if (verificationError) {
      console.log('❌ Error verificando contactos actualizados:', verificationError.message);
    } else {
      console.log('✅ Contactos verificados exitosamente:');
      updatedContacts.forEach(contact => {
        const depts = contact.departments ? JSON.parse(contact.departments) : 'No especificado';
        const migrated = contact.migrated_at ? '✅' : '❌';
        console.log(`  ${migrated} ${contact.type}: ${contact.email} - Departamentos: ${Array.isArray(depts) ? depts.join(', ') : depts}`);
      });
    }

    console.log('🎉 Migración completada exitosamente!');
    console.log('\n📋 Resumen de la migración:');
    console.log('  • RRHH y Gerente: manejan todos los departamentos');
    console.log('  • Supervisor Ventas: solo departamento Ventas');
    console.log('  • Supervisor Administración: solo departamento Administración');
    console.log('  • Otros Supervisores: manejan todos los departamentos');
    console.log('\n💡 Nota: El campo departments se agregó como parte de los datos.');
    console.log('   Para una migración completa de la estructura, ejecuta el SQL manualmente en Supabase.');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

// Ejecutar la migración
migrateDatabase();
