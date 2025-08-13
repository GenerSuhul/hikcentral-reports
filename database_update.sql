-- =====================================================
-- SCRIPT PARA AGREGAR CAMPO DEPARTMENTS
-- =====================================================
-- Ejecuta este script en tu Supabase Dashboard → SQL Editor

-- 1. AGREGAR EL CAMPO DEPARTMENTS
ALTER TABLE branch_contacts 
ADD COLUMN departments TEXT DEFAULT NULL;

-- 2. VERIFICAR QUE SE AGREGÓ
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'branch_contacts' 
  AND column_name = 'departments';

-- 3. CREAR ÍNDICE PARA MEJOR RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_branch_contacts_departments
ON branch_contacts USING GIN ((departments::jsonb));

-- 4. VERIFICAR LA ESTRUCTURA COMPLETA
SELECT * FROM branch_contacts LIMIT 1;

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================
-- 1. Ve a https://supabase.com/dashboard
-- 2. Selecciona tu proyecto
-- 3. Ve a "SQL Editor" en el menú lateral
-- 4. Copia y pega TODO este script
-- 5. Haz clic en "Run"
-- 6. Verifica que no haya errores
-- 7. ¡Listo! Ahora puedes usar el selector de departamentos
