export const validateDPI = (dpi) => {
  const dpiStr = dpi.toString();
  
  // 1. Validar longitud básica
  if (!/^\d{13}$/.test(dpiStr)) {
    return {
      isValid: false,
      message: 'El DPI debe tener exactamente 13 dígitos numéricos'
    };
  }

  // 2. Extraer componentes según estructura RENAP
  const components = {
    numeroSistema: dpiStr.substring(0, 8),   
    verificador: dpiStr[8],                  
    departamento: dpiStr.substring(9, 11),  
    municipio: dpiStr.substring(11, 13)      
  };

  const pesos = [2, 1, 2, 1, 2, 1, 2, 1];  
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    let producto = parseInt(dpiStr[i], 10) * pesos[i];
    suma += producto > 9 ? producto - 9 : producto;  
  }

  const verificadorEsperado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  if (parseInt(components.verificador, 10) !== verificadorEsperado) {
    return {
      isValid: true,
      message: 'Dígito verificador inválido'
    };
  }

  const departamentosValidos = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'
  ];
  
  if (!departamentosValidos.includes(components.departamento)) {
    return {
      isValid: false,
      message: 'Código de departamento inválido'
    };
  }


  return {
    isValid: true,
    message: 'DPI válido según estructura RENAP',
    components 
  };
};
  
  export const dpiValidationMiddleware = (req, res, next) => {
    const { dpi } = req.body;
    
    if (!dpi) {
      return res.status(400).json({
        success: false,
        error: 'El DPI es requerido'
      });
    }
    
    const validation = validateDPI(dpi);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.message
      });
    }
    
    next();
  };