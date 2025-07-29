import emailjs from '@emailjs/browser';

const SERVICE_ID = 'service_kjwa94s';
const TEMPLATE_ID = 'template_wdqmcgg';
const PUBLIC_KEY = 'jGbbtc2gBfH9bHjvv'; // tu PUBLIC KEY

emailjs.init(PUBLIC_KEY);

export const sendEmail = async (templateParams) => {
  try {
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
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 14px;">
      <thead>
        <tr>
  `;

  headers.forEach(header => {
    tableHtml += `<th style="border: 1px solid #dddddd; text-align: left; padding: 8px; background-color: #f2f2f2; font-weight: bold;">${header}</th>`;
  });

  tableHtml += `
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((row, index) => {
    const bgColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
    tableHtml += `<tr style="background-color: ${bgColor};">`;
    headers.forEach(header => {
      tableHtml += `<td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${row[header] || ''}</td>`;
    });
    tableHtml += '</tr>';
  });


  return tableHtml;
};
