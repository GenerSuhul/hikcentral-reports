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
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        let headerRowIndex = -1;
        let headers = [];

        // Iterate through rows to find the header row
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const currentRowHeaders = [];
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            if (cell && cell.v) {
              currentRowHeaders.push(normalizeHeader(String(cell.v)));
            }
          }

          const foundAllRequired = REQUIRED_HEADERS.every(reqHeader =>
            currentRowHeaders.some(h => h.includes(normalizeHeader(reqHeader)))
          );

          if (foundAllRequired) {
            headerRowIndex = R;
            headers = currentRowHeaders;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('No se encontró la fila de encabezado válida con todas las columnas requeridas.');
        }

        // Map normalized headers to original headers for data extraction
        const headerMap = {};
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
          const cell = worksheet[cellAddress];
          if (cell && cell.v) {
            const normalized = normalizeHeader(String(cell.v));
            const original = String(cell.v);
            headerMap[normalized] = original;
          }
        }

        // Extract data starting from the row after the header
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: headerRowIndex + 1, // Start parsing from the row after the header
          raw: false // Keep original formatting for dates/times
        });

        const processedData = [];
        jsonData.forEach((row, rowIndex) => {
          const record = {};
          let isValidRow = true;

          REQUIRED_HEADERS.forEach(reqHeader => {
            const normalizedReqHeader = normalizeHeader(reqHeader);
            let foundColumn = false;
            for (const normalizedCol in headerMap) {
              if (normalizedCol.includes(normalizedReqHeader)) {
                const originalColName = headerMap[normalizedCol];
                record[reqHeader] = row[headers.indexOf(normalizedCol)]; // Use index from normalized headers
                foundColumn = true;
                break;
              }
            }
            if (!foundColumn) {
              isValidRow = false; // Missing a required column for this row
            }
          });

          if (isValidRow && Object.keys(record).length > 0) {
            processedData.push(record);
          }
        });

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
  if (!department) return null;
  const parts = department.split('>');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return null;
};