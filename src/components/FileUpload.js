import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Info, 
  Clock, 
  Users, 
  Mail, 
  BarChart3, 
  Download, 
  Settings, 
  Database, 
  Globe, 
  Shield, 
  Zap, 
  ArrowRight,
  FileText,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { parseExcelFile, extractBranchCode } from '../utils/excelParser';
import { sendEmail, generateEmailMessage } from '../utils/emailService';
import { fetchBranches, getContactsByDepartment } from '../utils/supabase';

const FileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [dataByBranch, setDataByBranch] = useState(null);
  const [branches, setBranches] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalEmails: 0,
    successRate: 99,
    avgTime: 30
  });

  // Cargar estadísticas reales al montar el componente
  React.useEffect(() => {
    loadRealStats();
  }, []);

  const loadRealStats = async () => {
    try {
      console.log('📊 Cargando estadísticas del sistema...');
      // Aquí podrías obtener estadísticas reales desde Supabase
      // Por ahora usamos localStorage para persistir entre sesiones
      const savedStats = localStorage.getItem('fileUploadStats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        console.log('📊 Estadísticas cargadas:', parsedStats);
        setStats(parsedStats);
      } else {
        console.log('📊 No hay estadísticas guardadas, usando valores por defecto');
      }
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  };

  const updateStats = (newStats) => {
    const updatedStats = { ...stats, ...newStats };
    setStats(updatedStats);
    localStorage.setItem('fileUploadStats', JSON.stringify(updatedStats));
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel')) {
      setUploadedFile(file);
      setResults(null);
      setError(null);
    } else {
      setError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const processFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Paso 1: Parsear el archivo Excel
      setProgress(20);
      const parsedData = await parseExcelFile(uploadedFile);
      console.log('Datos del Excel parseados:', parsedData);

      if (!parsedData || parsedData.length === 0) {
        throw new Error('No se pudieron extraer datos del archivo Excel');
      }

      // Paso 2: Obtener las sucursales desde Supabase
      setProgress(40);
      const fetchedBranches = await fetchBranches();
      console.log('🏢 Sucursales obtenidas:', fetchedBranches);
      console.log('📧 Emails disponibles por sucursal:');
      fetchedBranches.forEach(branch => {
        console.log(`  ${branch.code}: ${branch.email || 'Sin email'} (${branch.contact_name || 'Sin contacto'})`);
      });

      if (!fetchedBranches || fetchedBranches.length === 0) {
        throw new Error('No se encontraron sucursales configuradas');
      }

      // Paso 3: Agrupar datos por sucursal
      setProgress(60);
      const groupedData = {};
      
      console.log('🔍 Códigos de sucursal disponibles en BD:', fetchedBranches.map(b => b.code));
      
      parsedData.forEach((record, index) => {
        const department = record['Departamento'];
        console.log(`Registro ${index + 1} - Departamento:`, department);
        
        if (department) {
          const branchCode = extractBranchCode(department);
          console.log(`Código de sucursal extraído:`, branchCode);
          
          if (branchCode) {
            // Verificar si el código de sucursal existe en la base de datos
            const branchExists = fetchedBranches.find(b => 
              b.code === branchCode || 
              b.name?.includes(branchCode) || 
              b.department?.includes(branchCode)
            );
            
            if (branchExists) {
              if (!groupedData[branchCode]) {
                groupedData[branchCode] = [];
              }
              groupedData[branchCode].push(record);
              console.log(`✅ Registro agregado a sucursal: ${branchCode}`);
              
              // Mostrar información de clasificación si hay infracciones
              if (record.classification && record.classification.violations.length > 0) {
                console.log(`⚠️ Infracciones detectadas en registro ${index + 1}:`, record.classification.violations);
              }
            } else {
              console.warn(`⚠️ Código de sucursal ${branchCode} no encontrado en la base de datos`);
              console.log(`Sucursales disponibles:`, fetchedBranches.map(b => ({ code: b.code, name: b.name })));
            }
          } else {
            console.warn(`No se pudo extraer código de sucursal del departamento:`, department);
          }
        } else {
          console.warn(`Registro ${index + 1} no tiene departamento`);
        }
      });

      console.log('Datos agrupados por sucursal:', groupedData);
      console.log('Total de sucursales encontradas:', Object.keys(groupedData).length);

      // Calcular estadísticas de infracciones
      let totalInfractions = 0;
      let recordsWithInfractions = 0;
      
      Object.values(groupedData).forEach(branchRecords => {
        branchRecords.forEach(record => {
          if (record.classification && record.classification.violations.length > 0) {
            totalInfractions += record.classification.violations.length;
            recordsWithInfractions++;
          }
        });
      });

      console.log(`📊 Estadísticas de infracciones: ${totalInfractions} infracciones en ${recordsWithInfractions} registros`);

      // Guardar datos para uso posterior
      setExcelData(parsedData);
      setDataByBranch(groupedData);
      setBranches(fetchedBranches);

      setProgress(100);
      
      // Paso 4: Mostrar resultados del procesamiento
      setResults({
        totalRecords: parsedData.length,
        processedRecords: parsedData.length,
        emailsSent: 0, // Aún no se han enviado correos
        errors: 0,
        processingTime: '< 30s',
        branchesProcessed: Object.keys(groupedData).length,
        readyForEmails: true, // Indicar que está listo para enviar correos
        totalInfractions,
        recordsWithInfractions
      });

      // Actualizar estadísticas
      updateStats({
        totalFiles: stats.totalFiles + 1,
        avgTime: Math.round((stats.avgTime + 30) / 2) // Promedio simple
      });

      console.log('Procesamiento completado:', {
        totalRecords: parsedData.length,
        branchesProcessed: Object.keys(groupedData).length
      });

    } catch (error) {
      console.error('❌ Error durante el procesamiento:', error);
      setError(`Error durante el procesamiento: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setResults(null);
    setProgress(0);
    setError(null);
  };

  const sendEmails = async () => {
    if (!dataByBranch || !branches) {
      setError('No hay datos procesados para enviar correos');
      return;
    }

    setIsSendingEmails(true);
    setError(null);

    try {
      let emailsSent = 0;
      let errors = 0;
      const startTime = Date.now();
      const emailSummary = [];

      console.log('🚀 Iniciando envío de correos...');
      if (isTestMode) {
        console.log('🧪 MODO PRUEBA: Simulando envío sin enviar correos reales');
      }

      for (const [branchCode, branchData] of Object.entries(dataByBranch)) {
        try {
          console.log(`\n--- Procesando sucursal: ${branchCode} ---`);
          console.log(`Datos de la sucursal:`, branchData.length, 'registros');
          
          // Buscar la sucursal correspondiente
          const branch = branches.find(b => 
            b.code === branchCode || 
            b.name?.includes(branchCode) || 
            b.department?.includes(branchCode)
          );
          
          console.log(`Sucursal encontrada en BD:`, branch);
          
          if (!branch) {
            console.warn(`⚠️ Sucursal ${branchCode} no encontrada en la base de datos`);
            errors++;
            continue;
          }

          // Verificar que tenga contacto Gerente (obligatorio)
          const gerenteContact = branch.contacts?.find(c => c.type === 'Gerente');
          if (!gerenteContact && !branch.email) {
            console.warn(`⚠️ Sucursal ${branchCode} no tiene contacto Gerente ni email configurado`);
            errors++;
            continue;
          }

          // Lógica de agrupación según el tipo de sucursal
          if (branchCode === 'AC_RNV_CMX_PPTN_1') {
            // Sucursal especial con departamentos
            console.log(`🏢 Procesando sucursal especial ${branchCode} con departamentos`);
            
            // Agrupar por departamento
            const recordsByDept = {};
            branchData.forEach(record => {
              const dept = record['Grupo de asistencia']?.trim();
              const key = dept && dept !== '-' ? dept : 'General';
              if (!recordsByDept[key]) {
                recordsByDept[key] = [];
              }
              recordsByDept[key].push(record);
            });

            console.log(`📊 Departamentos encontrados:`, Object.keys(recordsByDept));

            // Enviar correo por cada departamento
            for (const [deptName, deptRecords] of Object.entries(recordsByDept)) {
              if (deptRecords.length === 0) continue;

              const hasInfractions = deptRecords.some(r => r.classification?.violations?.length > 0);
              const blockLabel = deptName === 'General' ? 'General' : `Departamento: ${deptName}`;
              
              console.log(`📧 Enviando correo para ${deptName}: ${deptRecords.length} registros, infracciones: ${hasInfractions}`);

              // Generar mensaje del correo
              const emailMessage = generateEmailMessage(deptRecords, branch.name || branchCode, {
                hasInfractions,
                blockLabel
              });

              // Obtener contactos específicos para este departamento
              const departmentContacts = getContactsByDepartment(branch.contacts, deptName);
              console.log(`👥 Contactos para departamento ${deptName}:`, departmentContacts);

              // Preparar destinatarios
              const toEmail = gerenteContact?.email || branch.email;
              const ccEmails = [];

              // Agregar contactos filtrados por departamento
              departmentContacts.forEach(contact => {
                if (contact.email !== toEmail && !ccEmails.includes(contact.email)) {
                  ccEmails.push(contact.email);
                  console.log(`✅ Agregando ${contact.type} (${contact.email}) al CC para ${deptName}`);
                }
              });

              // Agregar contacto de la tienda (branches.email) si existe y no está duplicado
              if (branch.email && branch.email !== toEmail && !ccEmails.includes(branch.email)) {
                ccEmails.push(branch.email);
                console.log(`✅ Agregando contacto de tienda (${branch.email}) al CC`);
              }

              // Generar asunto
              const subject = deptName === 'General' 
                ? `Reporte Diario - ${branch.code} - General`
                : `Reporte Diario - ${branch.code} - ${deptName}`;

              // Preparar parámetros del correo
              const templateParams = {
                to_email: toEmail,
                subject,
                message: emailMessage,
                cc_emails: ccEmails.join(', '),
                branch_code: branch.code,
                branch_name: branch.name || branchCode
              };

              console.log('📧 Enviando correo:', { to: toEmail, cc: ccEmails, subject, dept: deptName });

              // En modo de prueba, solo simular
              if (isTestMode) {
                emailsSent++;
                emailSummary.push({
                  branch: branch.name || branchCode,
                  dept: deptName,
                  to: toEmail,
                  cc: ccEmails,
                  subject,
                  records: deptRecords.length,
                  hasInfractions,
                  violations: deptRecords
                    .filter(r => r.classification?.violations?.length > 0)
                    .map(r => ({
                      nombre: r['Nombre'],
                      violations: r.classification.violations
                    })),
                  contacts: departmentContacts.map(c => `${c.type}: ${c.email}`)
                });
                console.log(`🧪 SIMULADO: Correo para ${deptName} (${deptRecords.length} registros)`);
              } else {
                // Enviar correo real
                const emailResult = await sendEmail(templateParams);
                
                if (emailResult.success) {
                  emailsSent++;
                  console.log(`✅ Correo enviado exitosamente para ${deptName}`);
                } else {
                  errors++;
                  console.error(`❌ Error enviando correo para ${deptName}:`, emailResult.error);
                }
              }
            }
          } else {
            // Otras sucursales: un correo con todos los registros
            console.log(`🏢 Procesando sucursal regular ${branchCode}`);
            
            const hasInfractions = branchData.some(r => r.classification?.violations?.length > 0);
            console.log(`📊 Infracciones detectadas: ${hasInfractions}`);

            // Generar mensaje del correo
            const emailMessage = generateEmailMessage(branchData, branch.name || branchCode, {
              hasInfractions,
              blockLabel: 'General'
            });

            // Preparar destinatarios
            const toEmail = gerenteContact?.email || branch.email;
            const ccEmails = [];

            // Agregar Supervisor si existe
            const supervisorContact = branch.contacts?.find(c => c.type === 'Supervisor');
            if (supervisorContact && supervisorContact.email !== toEmail) {
              ccEmails.push(supervisorContact.email);
            }

            // Agregar contacto de la tienda (branches.email) si existe y no está duplicado
            if (branch.email && branch.email !== toEmail && !ccEmails.includes(branch.email)) {
              ccEmails.push(branch.email);
            }

            // Agregar RRHH solo si hay infracciones
            if (hasInfractions) {
              const rrhhContact = branch.contacts?.find(c => c.type === 'RRHH');
              if (rrhhContact && rrhhContact.email !== toEmail && !ccEmails.includes(rrhhContact.email)) {
                ccEmails.push(rrhhContact.email);
              }
            }

            // Generar asunto
            const subject = `Reporte Diario - ${branch.code} - General`;

            // Preparar parámetros del correo
            const templateParams = {
              to_email: toEmail,
              subject,
              message: emailMessage,
              cc_emails: ccEmails.join(', '),
              branch_code: branch.code,
              branch_name: branch.name || branchCode
            };

            console.log('📧 Enviando correo:', { to: toEmail, cc: ccEmails, subject });

            // En modo de prueba, solo simular
            if (isTestMode) {
              emailsSent++;
              emailSummary.push({
                branch: branch.name || branchCode,
                dept: 'General',
                to: toEmail,
                cc: ccEmails,
                subject,
                records: branchData.length,
                hasInfractions,
                violations: branchData
                  .filter(r => r.classification?.violations?.length > 0)
                  .map(r => ({
                    nombre: r['Nombre'],
                    violations: r.classification.violations
                  }))
              });
              console.log(`🧪 SIMULADO: Correo para ${branch.name || branchCode} (${branchData.length} registros)`);
            } else {
              // Enviar correo real
              const emailResult = await sendEmail(templateParams);
              
              if (emailResult.success) {
                emailsSent++;
                console.log(`✅ Correo enviado exitosamente a ${branch.name || branchCode}`);
              } else {
                errors++;
                console.error(`❌ Error enviando correo a ${branch.name || branchCode}:`, emailResult.error);
              }
            }
          }
        } catch (emailError) {
          errors++;
          console.error(`❌ Error procesando sucursal ${branchCode}:`, emailError);
        }
      }

      const endTime = Date.now();
      const processingTime = Math.round((endTime - startTime) / 1000);

      // Actualizar resultados
      setResults(prev => ({
        ...prev,
        emailsSent,
        errors,
        processingTime: `${processingTime}s`,
        emailSummary: isTestMode ? emailSummary : undefined
      }));

      // Actualizar estadísticas
      updateStats({
        totalEmails: stats.totalEmails + emailsSent,
        successRate: emailsSent > 0 ? Math.round((emailsSent / (emailsSent + errors)) * 100) : stats.successRate
      });

      console.log('✅ Envío de correos completado:', {
        emailsSent,
        errors,
        processingTime: `${processingTime}s`,
        testMode: isTestMode
      });

      if (isTestMode) {
        alert(`🧪 SIMULACIÓN COMPLETADA\n\nSe simularon ${emailsSent} correos en ${processingTime} segundos\n\nRevisa el resumen detallado abajo para ver qué se habría enviado.`);
      } else if (emailsSent > 0) {
        alert(`✅ Se enviaron ${emailsSent} correos exitosamente en ${processingTime} segundos`);
      } else {
        alert('⚠️ No se pudo enviar ningún correo. Revisa la consola para más detalles.');
      }

    } catch (error) {
      console.error('❌ Error durante el envío de correos:', error);
      setError(`Error durante el envío de correos: ${error.message}`);
    } finally {
      setIsSendingEmails(false);
    }
  };

  const downloadResults = () => {
    if (results) {
      // Crear un archivo de resultados
      const resultsText = `
Resultados del Procesamiento
==========================
Fecha: ${new Date().toLocaleDateString('es-ES')}
Hora: ${new Date().toLocaleTimeString('es-ES')}

Total de Registros: ${results.totalRecords}
Registros Procesados: ${results.processedRecords}
Emails Enviados: ${results.emailsSent}
Errores: ${results.errors}
Sucursales Procesadas: ${results.branchesProcessed}
Tiempo de Procesamiento: ${results.processingTime}
${results.totalInfractions > 0 ? `
ESTADÍSTICAS DE INFRACCIONES:
Total de Infracciones: ${results.totalInfractions}
Registros con Infracciones: ${results.recordsWithInfractions}
` : ''}
      `;
      
      const blob = new Blob([resultsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resultados_procesamiento_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const statsCards = [
    {
      title: 'Archivos Procesados',
      value: stats.totalFiles.toLocaleString(),
      change: '+23%',
      icon: FileText,
      color: 'bg-primary'
    },
    {
      title: 'Emails Enviados',
      value: stats.totalEmails.toLocaleString(),
      change: '+18%',
      icon: Mail,
      color: 'bg-secondary'
    },
    {
      title: 'Tasa de Éxito',
      value: `${stats.successRate}%`,
      change: '+2%',
      icon: CheckCircle,
      color: 'bg-accent'
    },
    {
      title: 'Tiempo Promedio',
      value: `${stats.avgTime}s`,
      change: '-15%',
      icon: Clock,
      color: 'bg-info'
    }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header Section */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dark">Cargar Reporte</h1>
              <p className="text-info">Procesa archivos Excel y envía reportes automáticamente</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsTestMode(!isTestMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isTestMode 
                    ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
                title={isTestMode ? "Desactivar Modo Prueba" : "Activar Modo Prueba"}
              >
                {isTestMode ? "🧪 PRUEBA" : "🧪"}
              </button>
              <button 
                onClick={async () => {
                  try {
                    console.log('🧪 Probando EmailJS...');
                    const testResult = await sendEmail({
                      to_email: 'test@example.com',
                      subject: 'Test - AC_TEST',
                      message: '<h2>📊 Reporte de Asistencia - Test</h2><p>Este es un correo de prueba.</p>',
                      cc_emails: '',
                      branch_code: 'AC_TEST',
                      branch_name: 'Test Branch'
                    });
                    console.log('✅ Resultado de prueba EmailJS:', testResult);
                    if (testResult.success) {
                      alert('✅ EmailJS está funcionando correctamente\n\nServicio: ' + testResult.response.service_id + '\nTemplate: ' + testResult.response.template_id);
                    } else {
                      alert('❌ Error en EmailJS:\n' + testResult.error.message);
                    }
                  } catch (error) {
                    console.error('❌ Error en prueba EmailJS:', error);
                    alert('❌ Error en prueba EmailJS:\n' + error.message);
                  }
                }}
                className="p-2 text-info hover:text-dark hover:bg-secondary-100 rounded-lg transition-colors"
                title="Probar EmailJS"
              >
                <Mail className="w-5 h-5" />
              </button>
              <button className="p-2 text-info hover:text-dark hover:bg-secondary-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-info hover:text-dark hover:bg-secondary-100 rounded-lg transition-colors">
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
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
                <span className="text-sm font-medium text-success-500">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-dark mb-1">{stat.value}</h3>
              <p className="text-info text-sm font-medium">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Card */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-dark mb-2">Cargar Archivo Excel</h2>
                <p className="text-info">Arrastra y suelta tu archivo o haz clic para seleccionar</p>
                {isTestMode && (
                  <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-orange-800 text-sm font-medium">
                      🧪 MODO PRUEBA ACTIVADO - No se enviarán correos reales
                    </p>
                  </div>
                )}
              </div>

              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                  isDragOver 
                    ? 'border-primary bg-primary-50' 
                    : uploadedFile 
                      ? 'border-success-500 bg-success-50' 
                      : 'border-secondary-300 hover:border-secondary-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!uploadedFile ? (
                  <div>
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-lg font-medium text-dark mb-2">
                      {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo Excel aquí'}
                    </p>
                    <p className="text-info mb-4">o</p>
                    <label className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors">
                      <FileText className="w-5 h-5" />
                      Seleccionar Archivo
        <input
          type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-info mt-4">
                      Formatos soportados: .xlsx, .xls
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="w-20 h-20 bg-success-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-lg font-medium text-dark mb-2">
                      Archivo cargado: {uploadedFile.name}
                    </p>
                    <p className="text-info mb-4">
                      Tamaño: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={processFile}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        <Zap className="w-5 h-5" />
                        {isProcessing ? 'Procesando...' : 'Procesar Archivo'}
                      </motion.button>
                      {results?.readyForEmails && (
                        <div className="mt-2 text-sm text-success-600 font-medium">
                          Archivo procesado - Listo para enviar correos
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={removeFile}
                        className="flex items-center gap-2 bg-secondary-100 hover:bg-secondary-200 text-dark px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Remover
                      </motion.button>
                    </div>
                  </div>
        )}
      </div>

              {/* Progress Bar */}
              {isProcessing && (
          <motion.div
                  initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark">Procesando archivo...</span>
                    <span className="text-sm font-medium text-dark">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-3">
                    <motion.div
                      className="bg-primary h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
          </motion.div>
        )}

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">Error en el Procesamiento</h3>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Email Sending Progress */}
              {isSendingEmails && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-600 animate-pulse" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">Enviando Correos</h3>
                      <p className="text-blue-700">Procesando y enviando correos a todas las sucursales...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Branch Summary */}
              {results?.readyForEmails && dataByBranch && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-info-50 border border-info-200 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-6 h-6 text-info-600" />
                    <h3 className="text-lg font-semibold text-info-800">Resumen de Sucursales</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(dataByBranch).map(([branchCode, branchData]) => (
                      <div key={branchCode} className="p-3 bg-white rounded-lg border border-info-200">
                        <div className="font-medium text-info-800">{branchCode}</div>
                        <div className="text-sm text-info-600">{branchData.length} registros</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-info-700">
                    Total: {Object.keys(dataByBranch).length} sucursales con {results.totalRecords} registros
                  </div>
                </motion.div>
              )}

              {/* Results */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-success-50 border border-success-200 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-success-600" />
                    <h3 className="text-lg font-semibold text-success-800">Procesamiento Completado</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-primary">{results.totalRecords}</p>
                      <p className="text-sm text-primary-800">Registros Totales</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-success-600">{results.processedRecords}</p>
                      <p className="text-sm text-success-800">Registros Procesados</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-accent">{results.emailsSent}</p>
                      <p className="text-sm text-accent-800">Emails Enviados</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-info">{results.processingTime}</p>
                      <p className="text-sm text-info-800">Tiempo de Procesamiento</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-warning">{results.branchesProcessed}</p>
                      <p className="text-sm text-warning-800">Sucursales Procesadas</p>
                    </div>
                  </div>
                  
                  {/* Estadísticas de infracciones */}
                  {results.totalInfractions > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <h4 className="text-lg font-semibold text-red-800">Infracciones Detectadas</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg border border-red-200">
                          <p className="text-xl font-bold text-red-600">{results.totalInfractions}</p>
                          <p className="text-sm text-red-700">Total de Infracciones</p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg border border-red-200">
                          <p className="text-xl font-bold text-red-600">{results.recordsWithInfractions}</p>
                          <p className="text-sm text-red-700">Registros con Infracciones</p>
                        </div>
                      </div>
                      <p className="text-sm text-red-600 mt-3 text-center">
                        ⚠️ Los valores en rojo en el reporte indican registros fuera de horario o con pausas no permitidas
                      </p>
                    </div>
                  )}

                  {/* Resumen de Correos (Modo Prueba) */}
                  {results.emailSummary && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Mail className="w-6 h-6 text-blue-600" />
                        <h4 className="text-lg font-semibold text-blue-800">🧪 Resumen de Correos Simulados</h4>
                      </div>
                      
                      <div className="space-y-4">
                        {results.emailSummary.map((email, index) => (
                          <div key={index} className="bg-white rounded-lg border border-blue-200 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-blue-800">
                                {email.branch} - {email.dept}
                              </h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                email.hasInfractions 
                                  ? 'bg-red-100 text-red-800 border border-red-200' 
                                  : 'bg-green-100 text-green-800 border border-green-200'
                              }`}>
                                {email.hasInfractions ? '⚠️ Con Infracciones' : '✅ Sin Infracciones'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600"><strong>TO:</strong> {email.to}</p>
                                  <p className="text-gray-600"><strong>CC:</strong> {email.cc.length > 0 ? email.cc.join(', ') : 'Ninguno'}</p>
                                  <p className="text-gray-600"><strong>Asunto:</strong> {email.subject}</p>
                                  <p className="text-gray-600"><strong>Registros:</strong> {email.records}</p>
                                  {email.contacts && (
                                    <p className="text-gray-600"><strong>Contactos del Depto:</strong> {email.contacts.join(', ')}</p>
                                  )}
                                </div>
                              
                              {email.hasInfractions && (
                                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                  <p className="text-red-800 font-medium mb-2">Infracciones detectadas:</p>
                                  <div className="space-y-1">
                                    {email.violations.map((violation, vIndex) => (
                                      <div key={vIndex} className="text-red-700 text-xs">
                                        <strong>{violation.nombre}:</strong> {violation.violations.join(', ')}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-blue-800 text-sm text-center">
                          💡 Este es un resumen de lo que se habría enviado. Activa el modo real para enviar correos verdaderos.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center space-x-4">
                    {results.readyForEmails && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={sendEmails}
                        disabled={isSendingEmails}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                          isTestMode 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                            : 'bg-primary hover:bg-primary-600 text-white'
                        }`}
                      >
                        <Mail className="w-5 h-5" />
                        {isSendingEmails 
                          ? 'Enviando Correos...' 
                          : isTestMode 
                            ? '🧪 Simular Envío' 
                            : 'Enviar Correos'
                        }
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={downloadResults}
                      className="flex items-center gap-2 bg-success-500 hover:bg-success-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Descargar Resultados
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={removeFile}
                      className="flex items-center gap-2 bg-secondary-100 hover:bg-secondary-200 text-dark px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      Nuevo Archivo
                    </motion.button>
              </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Instrucciones
              </h3>
              <div className="space-y-3 text-sm text-info">
                <p>1. Prepara tu archivo Excel con los datos de asistencia</p>
                <p>2. Asegúrate de que las columnas estén correctamente formateadas</p>
                <p>3. Carga el archivo usando el área de arrastrar y soltar</p>
                <p>4. El sistema procesará automáticamente los datos</p>
                <p>5. Los reportes se enviarán por email a cada sucursal</p>
                
                {isTestMode && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 font-medium mb-2">🧪 Modo Prueba Activado:</p>
                    <ul className="text-orange-700 text-xs space-y-1">
                      <li>• No se enviarán correos reales</li>
                      <li>• Verás un resumen detallado de lo que se habría enviado</li>
                      <li>• Perfecto para probar la lógica sin molestar a las tiendas</li>
                      <li>• Desactiva el modo para enviar correos verdaderos</li>
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>

            {/* File Requirements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6"
            >
              <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-secondary" />
                Requisitos del Archivo
              </h3>
              <div className="space-y-3 text-sm text-info">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Formato: .xlsx o .xls</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Tamaño máximo: 10 MB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Columnas requeridas: Fecha, Empleado, Sucursal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span>Datos en formato de tabla</span>
                </div>
              </div>
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;