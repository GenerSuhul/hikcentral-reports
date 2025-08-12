import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_kjwa94s';
const TEMPLATE_ID = 'template_wdqmcgg';
const PUBLIC_KEY = 'jGbbtc2gBfH9bHjvv';

emailjs.init(PUBLIC_KEY);

export const sendEmail = async (templateParams) => {
  try {
    console.log('📧 Enviando correo con parámetros:', templateParams);
    
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('✅ Correo enviado correctamente:', response.status, response.text);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return { success: false, error };
  }
};

export const generateHtmlTable = (data) => {
  if (!data || data.length === 0) {
    return '<p>No hay datos para mostrar en la tabla.</p>';
  }

  const headers = [
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

  let tableHtml = `
    <div style="margin: 20px 0; overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; min-width: 800px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  `;

  headers.forEach(header => {
    tableHtml += `<th style="border: 1px solid #e1e5e9; text-align: left; padding: 12px 10px; font-weight: 600; color: white; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">${header}</th>`;
  });

  tableHtml += `
          </tr>
        </thead>
        <tbody>
  `;

  data.forEach((row, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
    const borderColor = index % 2 === 0 ? '#e9ecef' : '#dee2e6';
    
    tableHtml += `<tr style="background-color: ${bgColor}; border-bottom: 1px solid ${borderColor};">`;
    headers.forEach(header => {
      const value = row[header] || '-';
      const isDate = header === 'Fecha';
      const isTime = header.includes('Hora') || header.includes('Duración');
      
      // Aplicar estilos especiales según el tipo de dato
      let cellStyle = 'border: 1px solid #e1e5e9; text-align: left; padding: 10px 8px; color: #495057;';
      
      if (isDate) {
        cellStyle += 'font-weight: 600; color: #2c3e50;';
      } else if (isTime) {
        cellStyle += 'font-family: "Courier New", monospace; color: #6c757d;';
      }
      
      tableHtml += `<td style="${cellStyle}">${value}</td>`;
    });
    tableHtml += '</tr>';
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;

  return tableHtml;
};

// Función para generar el mensaje completo del correo
export const generateEmailMessage = (branchData, branchName) => {
  const htmlTable = generateHtmlTable(branchData);
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
      
      <!-- Header con gradiente -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
          📊 Reporte de Asistencia - ${branchName}
        </h1>
      </div>
      
      <!-- Contenido del mensaje -->
      <div style="background: white; padding: 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <p style="margin-bottom: 15px; color: #2d3748; font-size: 16px; line-height: 1.6;">
          <strong>Hola equipo,</strong>
        </p>
        
        <p style="margin-bottom: 20px; color: #4a5568; font-size: 15px; line-height: 1.6;">
          Adjunto encontrarán el reporte de asistencia correspondiente a la sucursal.
        </p>
      </div>
      
      <!-- Tabla de datos -->
      ${htmlTable}
      
      <!-- Footer -->
      <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <p style="margin-bottom: 10px; color: #4a5568; font-size: 15px;">Saludos cordiales,</p>
        <p style="font-weight: 700; color: #2d3748; font-size: 18px; margin: 0;">${branchName}</p>
      </div>
      
    </div>
  `;
};

// Función para generar solo la tabla HTML (para casos donde solo se necesite la tabla)
export const generateHtmlTableOnly = (data) => {
  return generateHtmlTable(data);
};
