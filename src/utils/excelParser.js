import * as XLSX from 'xlsx';

const REQUIRED_HEADERS = [
  'Departamento',
  'Grupo de asistencia',
  'Nombre',
  'Fecha',
  'Hora real del registro de entrada',
  'Hora real de registro de salida',
  'Grabación de asistencia',
  'Duración de la pausa',
  'Registros de descansos',
  'Periodo de tiempo'
];

const normalizeHeader = (header) => {
  return header.toLowerCase().replace(/\s+/g, ' ').trim();
};

// Helper para parsear horas en formato HH:MM a minutos
export const parseHHMM = (str) => {
  if (!str || str === '-' || str === '') return null;
  
  const match = String(str).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  
  return hours * 60 + minutes;
};

// Helper para verificar si una hora es un valor por defecto del sistema
export const isDefaultTime = (timeStr) => {
  if (!timeStr || timeStr === '-' || timeStr === '') return false;
  
  // Lista de horas que son valores por defecto del sistema
  const defaultTimes = [
    '16:50', '16:40', '16:30', // Horas comunes por defecto
    '08:00', '08:30', '09:00', // Horas de entrada por defecto
    '00:00', '12:00'           // Horas neutrales por defecto
  ];
  
  return defaultTimes.includes(timeStr);
};

// Helper para formatear minutos a HH:MM
export const formatHHMM = (mins) => {
  if (mins === null || mins === undefined) return '-';
  
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Función para clasificar un registro según las reglas de asistencia
export const classifyRecord = (record) => {
  const department = record['Grupo de asistencia']?.trim();
  const hasDept = department && department !== '-';
  
  // Definir horarios esperados según si tiene departamento o no
  const expected = hasDept 
    ? { in: '07:00', out: '17:00', break: '01:30' }
    : { in: '06:50', out: '17:00', break: '01:00' };
  
  // Parsear horas reales
  const actualIn = parseHHMM(record['Hora real del registro de entrada']);
  const actualOut = parseHHMM(record['Hora real de registro de salida']);
  const actualBreak = parseHHMM(record['Duración de la pausa']);
  
  // Convertir horarios esperados a minutos para comparación
  const expectedInMins = parseHHMM(expected.in);
  const expectedOutMins = parseHHMM(expected.out);
  const expectedBreakMins = parseHHMM(expected.break);
  
  const violations = [];
  
  // Validar entrada
  if (actualIn === null) {
    violations.push('falta entrada');
  } else if (actualIn > expectedInMins && !isDefaultTime(record['Hora real del registro de entrada'])) {
    violations.push('entrada después de la esperada');
  }
  
  // Validar salida
  if (actualOut === null) {
    violations.push('falta salida');
  } else if (actualOut < expectedOutMins && !isDefaultTime(record['Hora real de registro de salida'])) {
    violations.push('salida antes de 17:00');
  }
  
  // Validar pausa (con tolerancia de ±5 minutos)
  if (actualBreak !== null && expectedBreakMins !== null) {
    const tolerance = 5; // 5 minutos de tolerancia
    if (Math.abs(actualBreak - expectedBreakMins) > tolerance) {
      violations.push('pausa fuera de la esperada');
    }
  }
  
  // Extraer código de sucursal
  const branchCode = extractBranchCode(record['Departamento']);
  
  return {
    branchCode,
    department,
    hasDept,
    expected,
    actual: {
      in: actualIn !== null ? formatHHMM(actualIn) : null,
      out: actualOut !== null ? formatHHMM(actualOut) : null,
      breakMinutes: actualBreak
    },
    violations
  };
};

export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    console.log('🔄 Iniciando parsing del archivo Excel:', file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        console.log('📖 Archivo leído, procesando datos...');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('📊 Hoja de trabajo:', sheetName);
        console.log('📋 Hojas disponibles:', workbook.SheetNames);

        let headerRowIndex = -1;
        let headers = [];

        // Iterate through rows to find the header row
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        console.log('📏 Rango de datos:', range);
        
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const currentRowHeaders = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            if (cell && cell.v) {
              currentRowHeaders.push(normalizeHeader(String(cell.v)));
            }
          }

          console.log(`🔍 Fila ${R}:`, currentRowHeaders);

          const foundAllRequired = REQUIRED_HEADERS.every(reqHeader =>
            currentRowHeaders.some(h => h.includes(normalizeHeader(reqHeader)))
          );

          if (foundAllRequired) {
            headerRowIndex = R;
            headers = currentRowHeaders;
            console.log('✅ Fila de encabezado encontrada en índice:', R);
            console.log('📋 Headers encontrados:', headers);
            break;
          }
        }

        if (headerRowIndex === -1) {
          console.error('❌ No se encontró fila de encabezado válida');
          console.log('🔍 Headers requeridos:', REQUIRED_HEADERS);
          throw new Error('No se encontró la fila de encabezado válida con todas las columnas requeridas.');
        }

        // Map normalized headers to original headers for data extraction
        const headerMap = {};
        const originalHeaders = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
          const cell = worksheet[cellAddress];
          if (cell && cell.v) {
            const normalized = normalizeHeader(String(cell.v));
            const original = String(cell.v);
            headerMap[normalized] = original;
            originalHeaders.push(original);
          }
        }

        // Extract data starting from the row after the header
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: headerRowIndex + 1, // Start parsing from the row after the header
          raw: false // Keep original formatting for dates/times
        });

        const processedData = [];
        console.log('📊 Procesando filas de datos...');
        console.log('📋 Headers originales:', originalHeaders);
        
        jsonData.forEach((row, rowIndex) => {
          const record = {};
          let isValidRow = true;

          REQUIRED_HEADERS.forEach(reqHeader => {
            const normalizedReqHeader = normalizeHeader(reqHeader);
            let foundColumn = false;
            
            // Buscar la columna que coincida con el header requerido
            for (let colIndex = 0; colIndex < originalHeaders.length; colIndex++) {
              const originalHeader = originalHeaders[colIndex];
              const normalizedHeader = normalizeHeader(originalHeader);
              
              if (normalizedHeader.includes(normalizedReqHeader) || 
                  normalizedReqHeader.includes(normalizedHeader)) {
                record[reqHeader] = row[colIndex];
                foundColumn = true;
                break;
              }
            }
            
            if (!foundColumn) {
              console.warn(`⚠️ Columna no encontrada para: ${reqHeader}`);
              isValidRow = false; // Missing a required column for this row
            }
          });

          if (isValidRow && Object.keys(record).length > 0) {
            // Clasificar el registro según las reglas de asistencia
            const classifiedRecord = classifyRecord(record);
            record.classification = classifiedRecord;
            
            processedData.push(record);
            if (rowIndex < 3) { // Solo mostrar los primeros 3 registros para debug
              console.log(`✅ Registro ${rowIndex + 1} procesado:`, record);
              console.log(`🔍 Clasificación:`, classifiedRecord);
            }
          } else {
            console.warn(`⚠️ Fila ${rowIndex + 1} descartada - no válida`);
          }
        });

        console.log(`🎯 Total de registros procesados: ${processedData.length}`);
        resolve(processedData);

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const extractBranchCode = (department) => {
  if (!department) {
    console.log('⚠️ Departamento vacío o nulo');
    return null;
  }
  
  console.log('🔍 Extrayendo código de sucursal de:', department);
  const parts = department.split('>');
  console.log('📋 Partes del departamento:', parts);
  
  if (parts.length > 1) {
    const branchCode = parts[parts.length - 1].trim();
    console.log('✅ Código de sucursal extraído:', branchCode);
    return branchCode;
  } else {
    console.log('⚠️ No se encontró separador ">" en el departamento');
    return null;
  }
};