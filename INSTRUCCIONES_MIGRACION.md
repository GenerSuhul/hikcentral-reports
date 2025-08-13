# 🚀 Instrucciones para Migración de Base de Datos

## 🚨 **IMPORTANTE: Primero ejecuta el SQL, luego prueba la app**

### **Paso 1: Ejecutar SQL en Supabase (OBLIGATORIO)**

1. **Ve a tu [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Selecciona tu proyecto**
3. **Ve a "SQL Editor"** en el menú lateral izquierdo
4. **Copia y pega** este script completo:

```sql
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
```

5. **Haz clic en "Run"** (botón azul)
6. **Verifica** que aparezca el campo `departments` en los resultados
7. **Si hay errores**, verifica que estés en el proyecto correcto

## ✅ **Paso 2: Probar la Funcionalidad**

### **Agregar Nuevo Contacto:**
1. **Ve a BranchManagement** en tu aplicación
2. **Selecciona AC_RNV_CMX_PPTN_1**
3. **Haz clic en "+ Agregar Contacto"**
4. **Verás checkboxes** para seleccionar departamentos:
   - ✅ DEPTO. COMERCIAL
   - ✅ DEPTO. ADMINISTRACION  
   - ✅ DEPTO. COMPRAS
   - ✅ DEPTO. LOGISTICA
   - ✅ DEPTO. RRHH

### **Editar Contacto Existente:**
1. **Haz clic en el icono de editar** (lápiz)
2. **Verás los mismos checkboxes** para departamentos
3. **Selecciona/deselecciona** según necesites

## 🎯 **Departamentos Disponibles (Basados en tu Excel):**

- **DEPTO. COMERCIAL** - Departamento comercial
- **DEPTO. ADMINISTRACION** - Departamento administrativo
- **DEPTO. COMPRAS** - Departamento de compras
- **DEPTO. LOGISTICA** - Departamento de logística
- **DEPTO. RRHH** - Departamento de recursos humanos

## 🔧 **Configuración Recomendada:**

### **Para RRHH:**
- ✅ **Todos los departamentos** (maneja todo)

### **Para Gerente:**
- ✅ **Todos los departamentos** (maneja todo)

### **Para Supervisor:**
- ✅ **Departamentos específicos** según su área

## 🚨 **Si SIGUE dando error:**

### **Error: "column does not exist"**
- **NO ejecutaste el SQL** - ve al paso 1
- **Verifica** que estés en el proyecto correcto de Supabase
- **Verifica** que el SQL se ejecutó sin errores

### **Error: "permission denied"**
- **Verifica** que tienes permisos de administrador en Supabase
- **Contacta** al administrador del proyecto si es necesario

## 📱 **Características del Nuevo Sistema:**

- ✅ **Selector visual** con checkboxes
- ✅ **Departamentos reales** de tu Excel
- ✅ **Selección múltiple** fácil y visual
- ✅ **Validación automática** sin JSON manual
- ✅ **Interfaz intuitiva** y fácil de usar

## 🎉 **¡Listo!**

Una vez que ejecutes el SQL y pruebes la funcionalidad, tendrás:
- **Campo departments** en la base de datos ✅
- **Selector visual** para departamentos ✅
- **Sistema completo** de contactos por departamento ✅
- **Mejor experiencia** de usuario ✅

## ⚠️ **RECUERDA:**
**PRIMERO ejecuta el SQL en Supabase, DESPUÉS prueba la app.**
**Sin el campo en la base de datos, la app seguirá dando error.**

¿Necesitas ayuda con algún paso? ¡Pregunta sin problema!
