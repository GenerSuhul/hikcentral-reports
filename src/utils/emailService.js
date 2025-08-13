import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_84atx8z';
const TEMPLATE_ID = 'template_nheocue';
const PUBLIC_KEY = 'edmmZnNVXTeu0HwLg';

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
          <tr style="background: linear-gradient(135deg,rgb(255, 163, 3)  0%, #F83E02  100%);">
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
export const generateEmailMessage = (rows, title, options = {}) => {
  const { hasInfractions = false, blockLabel = 'General' } = options;
  
  // Función para generar la tabla HTML con valores en infracción marcados en rojo
  const generateHtmlTable = (data) => {
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
       <div style="margin: 20px 0; width: 100%; overflow-x: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
         <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; background: white; border-radius: 12px;">
           <thead>
             <tr style="background: linear-gradient(135deg, rgb(255, 163, 3) 0%, #F83E02 100%);">
     `;

         headers.forEach(header => {
       tableHtml += `<th style="text-align: left; padding: 16px 12px; font-weight: 600; color: white; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; word-wrap: break-word; overflow-wrap: break-word; border: none;">${header}</th>`;
     });

    tableHtml += `
            </tr>
          </thead>
          <tbody>
    `;

         data.forEach((row, index) => {
       const bgColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
       const borderColor = index % 2 === 0 ? '#f1f3f4' : '#e8eaed';
       
       tableHtml += `<tr style="background-color: ${bgColor}; border-bottom: 1px solid ${borderColor}; transition: background-color 0.2s ease;">`;
       headers.forEach(header => {
         const value = row[header] || '-';
         const isDate = header === 'Fecha';
         const isTime = header.includes('Hora') || header.includes('Duración');
         
         // Verificar si este valor tiene infracciones
         let displayValue = value;
         if (row.classification && row.classification.violations && row.classification.violations.length > 0) {
           // Marcar en rojo si hay infracciones relacionadas con este campo
           const hasViolation = (
             (header === 'Hora real del registro de entrada' && row.classification.violations.some(v => v.includes('entrada'))) ||
             (header === 'Hora real de registro de salida' && row.classification.violations.some(v => v.includes('salida'))) ||
             (header === 'Duración de la pausa' && row.classification.violations.some(v => v.includes('pausa')))
           );
           
           if (hasViolation) {
             displayValue = `<span style="color:#dc2626;font-weight:600;background-color:#fef2f2;padding:4px 8px;border-radius:6px;border:1px solid #fecaca;display:inline-block;min-width:20px;text-align:center;">${value}</span>`;
           }
         }
         
         // Aplicar estilos especiales según el tipo de dato
         let cellStyle = 'padding: 14px 12px; text-align: left; color: #374151; word-wrap: break-word; overflow-wrap: break-word; vertical-align: middle; font-size: 13px; line-height: 1.4; border: none;';
         
         if (isDate) {
           cellStyle += 'font-weight: 600; color: #1f2937; background-color: #f9fafb; border-radius: 6px;';
         } else if (isTime) {
           cellStyle += 'font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace; color: #059669; font-weight: 500; background-color: #f0fdf4; border-radius: 6px;';
         }
         
         tableHtml += `<td style="${cellStyle}">${displayValue}</td>`;
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

  const htmlTable = generateHtmlTable(rows);
  
  // Bloque RRHH solo si hay infracciones
  const rrhhBlock = hasInfractions ? `
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin: 20px 0; font-family: Arial, sans-serif;">
      <h3 style="color: #856404; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
        ⚠️ Aviso de RRHH
      </h3>
      <p style="color: #856404; margin: 0 0 8px 0; font-size: 14px; line-height: 1.5;">
        Se detectaron registros fuera de horario o con pausas no permitidas.
      </p>
      <p style="color: #856404; margin: 0 0 8px 0; font-size: 14px; line-height: 1.5;">
        Para los colaboradores involucrados, agradeceremos indicar el motivo de la llegada tarde, la salida temprana o la variación en la pausa.
      </p>
      <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.5;">
        Si existió una situación excepcional (permiso, comisión, emergencia), por favor responder a este correo adjuntando la justificación correspondiente.
      </p>
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Asistencia - ${title}</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          background-color: #f4f4f4; 
          font-family: Arial, sans-serif; 
          width: 100% !important;
        }
        .container { 
          width: 100% !important; 
          max-width: 100% !important; 
          margin: 0 !important; 
          background-color: #ffffff; 
          box-sizing: border-box;
        }
                 .header { 
           background: linear-gradient(135deg, rgb(255, 163, 3) 0%, #F83E02 100%); 
           padding: 25px 20px; 
           text-align: center; 
           width: 100%;
           box-sizing: border-box;
         }
        .header h1 { 
          color: white; 
          margin: 0; 
          font-size: 24px; 
          font-weight: 700; 
          text-shadow: 0 1px 2px rgba(0,0,0,0.3); 
        }
        .header p { 
          color: white; 
          margin: 8px 0 0 0; 
          font-size: 14px; 
          opacity: 0.9; 
        }
        .content { 
          padding: 25px 20px; 
          background-color: #ffffff; 
          width: 100%;
          box-sizing: border-box;
        }
        .table-container { 
          padding: 0 20px; 
          margin-bottom: 20px; 
          width: 100%;
          box-sizing: border-box;
        }
        .footer { 
          padding: 25px 20px; 
          background-color: #ffffff; 
          text-align: center; 
          border-top: 1px solid #e2e8f0; 
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Responsive para móviles */
        @media only screen and (max-width: 600px) {
          .container { 
            width: 100% !important; 
            margin: 0 !important; 
          }
          .header { 
            padding: 20px 15px !important; 
          }
          .content { 
            padding: 20px 15px !important; 
          }
          .table-container { 
            padding: 0 15px !important; 
            overflow-x: auto; 
          }
          .table-container table { 
            min-width: 600px; 
          }
          .footer { 
            padding: 20px 15px !important; 
          }
        }
        
        /* Responsive para tablets */
        @media only screen and (min-width: 601px) and (max-width: 1024px) {
          .container { 
            width: 100% !important; 
            margin: 0 !important; 
          }
          .table-container table { 
            min-width: 700px; 
          }
        }
        
        /* Responsive para desktop */
        @media only screen and (min-width: 1025px) {
          .container { 
            width: 100% !important; 
            margin: 0 !important; 
          }
          .table-container table { 
            min-width: 800px; 
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header con gradiente -->
        <div class="header">
          <h1>Reporte de Asistencia - ${title}</h1>
          <p>Bloque: ${blockLabel}</p>
        </div>
        
        <!-- Contenido del mensaje -->
        <div class="content">
          <p style="margin-bottom: 15px; color: #2d3748; font-size: 14px; line-height: 1.6;">
            <strong>Hola equipo,</strong>
          </p>
          
          <p style="margin-bottom: 20px; color: #4a5568; font-size: 14px; line-height: 1.6;">
            Adjunto encontrarán el reporte de asistencia correspondiente a la sucursal.
          </p>
        </div>
        
        <!-- Tabla de datos -->
        <div class="table-container">
          ${htmlTable}
        </div>
        
        <!-- Bloque RRHH (solo si hay infracciones) -->
        ${rrhhBlock}
        
        <!-- Footer -->
        <div class="footer">
          <p style="margin-bottom: 10px; color: #4a5568; font-size: 14px;">Saludos cordiales,</p>
          <p style="font-weight: 700; color: #2d3748; font-size: 16px; margin: 0;">${title}</p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

// Función para generar solo la tabla HTML (para casos donde solo se necesite la tabla)
export const generateHtmlTableOnly = (data) => {
  return generateHtmlTable(data);
};
