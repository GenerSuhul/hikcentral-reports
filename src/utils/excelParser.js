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
            processedData.push(record);
            if (rowIndex < 3) { // Solo mostrar los primeros 3 registros para debug
              console.log(`✅ Registro ${rowIndex + 1} procesado:`, record);
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