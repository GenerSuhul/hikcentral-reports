import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Send, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { parseExcelFile, extractBranchCode } from '../utils/excelParser';
import { fetchBranches, fetchBranchContacts } from '../utils/supabase';
import { sendEmail, generateHtmlTable } from '../utils/emailService';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults(null);
    setError(null);
  };

  const handleProcessFile = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo Excel primero.');
      return;
    }

    setProcessing(true);
    setResults(null);
    setError(null);

    try {
      const parsedData = await parseExcelFile(file);
      if (parsedData.length === 0) {
        setError('El archivo Excel no contiene datos válidos o no se encontró el encabezado.');
        setProcessing(false);
        return;
      }

      const branchesData = await fetchBranches();
      const branchMap = new Map(branchesData.map(b => [b.code, b.id]));

      const groupedByBranch = {};
      parsedData.forEach(record => {
        const department = record['Departamento'];
        const branchCode = extractBranchCode(department);

        if (branchCode) {
          if (!groupedByBranch[branchCode]) {
            groupedByBranch[branchCode] = [];
          }
          groupedByBranch[branchCode].push(record);
        } else {
          console.warn(`Registro omitido: No se pudo extraer el código de sucursal de "${department}"`);
        }
      });

      const emailResults = {
        detectedBranches: Object.keys(groupedByBranch).length,
        sentEmails: [],
        errors: [],
        warnings: []
      };

      for (const branchCode in groupedByBranch) {
        const branchId = branchMap.get(branchCode);
        if (!branchId) {
          emailResults.warnings.push(`Sucursal con código '${branchCode}' detectada en el Excel pero no encontrada en la base de datos. No se enviarán correos para esta sucursal.`);
          continue;
        }

        const contacts = await fetchBranchContacts(branchId);
        if (contacts.length === 0) {
          emailResults.warnings.push(`No se encontraron contactos para la sucursal '${branchCode}'. No se enviarán correos.`);
          continue;
        }

        const recipientEmails = contacts.map(c => c.email);
        const htmlContent = generateHtmlTable(groupedByBranch[branchCode]);
        const subject = `Reporte Diario – ${branchCode}`;

        const templateParams = {
          to_email: recipientEmails.join(','),
          subject: `Reporte Diario – ${branchCode}`,
          message: generateHtmlTable(groupedByBranch[branchCode]) // <- CORRECTO
        };


        const emailResponse = await sendEmail(templateParams);

        if (emailResponse.success) {
          emailResults.sentEmails.push({
            branchCode,
            recipients: recipientEmails,
            status: 'Enviado'
          });
        } else {
          emailResults.errors.push({
            branchCode,
            recipients: recipientEmails,
            error: emailResponse.error.message || 'Error desconocido al enviar correo'
          });
        }
      }

      setResults(emailResults);

    } catch (err) {
      setError('Error al procesar el archivo: ' + err.message);
      console.error(err);
    } finally {
      setProcessing(false);
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
        <UploadCloud className="w-8 h-8 text-blue-600" />
        Cargar y Enviar Reporte HikCentral
      </h2>

      <div className="mb-6">
        <label htmlFor="excel-upload" className="block text-gray-700 text-lg font-medium mb-2">
          Selecciona tu archivo de reporte Excel:
        </label>
        <input
          type="file"
          id="excel-upload"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-gray-600 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Archivo seleccionado: <span className="font-medium">{file.name}</span>
          </p>
        )}
      </div>

      <motion.button
        onClick={handleProcessFile}
        disabled={!file || processing}
        className={`w-full px-6 py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
          file && !processing
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={file && !processing ? { scale: 1.02 } : {}}
        whileTap={file && !processing ? { scale: 0.98 } : {}}
      >
        {processing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Procesando y Enviando...
          </>
        ) : (
          <>
            <Send className="w-6 h-6" />
            Procesar y Enviar Reportes
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mt-6 flex items-center gap-2"
            role="alert"
          >
            <XCircle className="w-5 h-5" />
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl shadow-md"
          >
            <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-7 h-7 text-blue-600" />
              Resumen del Proceso
            </h3>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Sucursales detectadas en el Excel:</span> {results.detectedBranches}
            </p>

            {results.sentEmails.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Correos Enviados Exitosamente:
                </h4>
                <ul className="list-disc list-inside text-gray-700">
                  {results.sentEmails.map((res, index) => (
                    <li key={index}>
                      <span className="font-medium">{res.branchCode}:</span> a {res.recipients.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.warnings.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Advertencias:
                </h4>
                <ul className="list-disc list-inside text-gray-700">
                  {results.warnings.map((warn, index) => (
                    <li key={index} className="text-yellow-800">{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Errores al Enviar Correos:
                </h4>
                <ul className="list-disc list-inside text-gray-700">
                  {results.errors.map((err, index) => (
                    <li key={index} className="text-red-800">
                      <span className="font-medium">{err.branchCode}:</span> a {err.recipients.join(', ')} - {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileUpload;