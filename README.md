# MIREGA APP - Sistema de Gestión de Mantenimiento de Ascensores

![MIREGA Logo](./public/logo-circular%20(2).png)

**MIREGA Ascensores Ltda.**
Pedro de Valdivia N°255 - Of. 202, Providencia
+56956087972 | contacto@mirega.cl

---

## 📋 ¿Qué es MIREGA APP?

Es una plataforma web completa para gestionar todas las operaciones de mantenimiento de ascensores de MIREGA. Incluye:

- ✅ Gestión de clientes y ascensores
- ✅ Programación de mantenimientos (mensual, trimestral, semestral, anual)
- ✅ Control de emergencias 24/7
- ✅ Órdenes de trabajo (OT)
- ✅ Rutas de trabajo para técnicos
- ✅ Generación de informes y PDFs
- ✅ Cotizaciones y facturación
- ✅ Inventario de repuestos
- ✅ Códigos QR para ascensores
- ✅ Notificaciones automáticas
- ✅ 4 perfiles de usuario con diferentes accesos

---

## 🚀 Inicio Rápido (3 Pasos)

### Paso 1: Crear tu usuario

1. Abre: https://supabase.com/dashboard
2. Entra a tu proyecto
3. Ve a **Authentication** > **Users**
4. Click en **"Add user"** > **"Create new user"**
5. Completa:
   - Email: `tu@mirega.cl`
   - Password: `tu_contraseña_segura`
   - ✓ Marca **"Auto Confirm User"**
6. Click **"Create user"**
7. **COPIA EL ID** del usuario (lo necesitarás en el paso 2)

### Paso 2: Crear tu perfil

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `CREAR_USUARIO_INICIAL.sql`
3. Reemplaza:
   - `TU-USER-ID-AQUI` con el ID del paso 1
   - `Tu Nombre Completo` con tu nombre real
   - `tu@mirega.cl` con tu email real
4. Ejecuta el script

### Paso 3: Cargar clientes (Opcional)

1. En Supabase, ve a **SQL Editor**
2. Abre el archivo `DATOS_CLIENTES.sql`
3. Ejecuta el script
4. Se cargarán 10 clientes de ejemplo

**¡Listo!** Ya puedes entrar a la aplicación con tu email y contraseña.

---

## 📁 Archivos Importantes

- **`GUIA_INICIAL.md`** - Guía detallada paso a paso
- **`CREAR_USUARIO_INICIAL.sql`** - Script para crear tu primer usuario
- **`DATOS_CLIENTES.sql`** - Script para cargar clientes de ejemplo
- **`FORMATO_INFORME_MANTO.pdf`** - Formato de checklist de mantenimiento

---

## 👥 Perfiles de Usuario

### 🔴 Desarrollador (Developer)
- **Acceso**: Total
- **Funciones**: Todo el sistema, configuración avanzada, permisos

### 🟡 Administrador (Admin)
- **Acceso**: Gestión completa
- **Funciones**: Clientes, técnicos, OT, rutas, reportes, cotizaciones

### 🟢 Técnico (Technician)
- **Acceso**: Operacional
- **Funciones**: Ruta del día, completar mantenimientos, reportar emergencias

### 🔵 Cliente (Client)
- **Acceso**: Solo sus datos
- **Funciones**: Ver ascensores, historial, solicitar servicios, aprobar cotizaciones

---

## 🎨 Colores Corporativos

```css
Rojo:  #DC2626  (Botones principales, alertas)
Verde: #16A34A  (Estados positivos, confirmaciones)
Negro: #000000  (Textos principales)
Gris:  #6B7280  (Textos secundarios)
```

---

## 🗄️ Base de Datos

La aplicación usa **Supabase** (PostgreSQL) con 19 tablas:

**Principales:**
- `profiles` - Usuarios del sistema
- `clients` - Empresas clientes
- `elevators` - Ascensores
- `maintenance_schedules` - Mantenimientos programados
- `emergency_visits` - Emergencias
- `work_orders` - Órdenes de trabajo
- `quotations` - Cotizaciones
- `spare_parts` - Repuestos
- `notifications` - Notificaciones

**Todas las tablas tienen:**
- ✅ Row Level Security (RLS)
- ✅ Políticas de acceso por rol
- ✅ Auditoría de cambios
- ✅ Timestamps automáticos

---

## 🔧 Tecnologías Usadas

- **Frontend**: React + TypeScript + Vite
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React

---

## ✅ Características Implementadas

- ✅ Sistema completo de checklists de mantenimiento con checklist dinámico
- ✅ Generación de PDFs (certificaciones, informes, checklists)
- ✅ Escáner y generador de códigos QR para ascensores
- ✅ Captura de fotos durante mantenimiento
- ✅ Firma digital del técnico y cliente
- ✅ Sistema de emergencias V2 con multi-ascensores
- ✅ Gestión de cotizaciones (internas y externas)
- ✅ Sistema de alertas para certificaciones vencidas
- ✅ Subida de manuales técnicos en PDF
- ✅ Historial de actividad y auditoría
- ✅ Dashboard con estadísticas básicas
- ✅ Exportación de datos a Excel
- ✅ Sincronización offline

## 🔜 Características Futuras

- [ ] Sistema de notificaciones por email
- [ ] Integración con WhatsApp
- [ ] Calendario interactivo avanzado
- [ ] Facturación electrónica (integración con SII Chile)
- [ ] Gestión de inventario de repuestos
- [ ] Aplicación móvil nativa

---

## 🚀 Despliegue a Producción

Esta plataforma está lista para ser desplegada en Vercel. Sigue estos pasos:

### Opción Rápida (15 minutos)

1. **Subir a GitHub:**
   - Ver: `CHECKLIST_DESPLIEGUE.md` (pasos simples)

2. **Desplegar en Vercel:**
   - Conectar repositorio
   - Configurar variables de entorno
   - Deploy automático

3. **Crear usuario administrador:**
   - Seguir: `CREAR_ADMIN_PRODUCCION.sql`

### Guías Detalladas

- 📋 **CHECKLIST_DESPLIEGUE.md** - Lista rápida de verificación
- 📘 **GUIA_DESPLIEGUE_PRODUCCION.md** - Guía completa paso a paso
- 🔐 **CREAR_ADMIN_PRODUCCION.sql** - Script para primer usuario

### Costos

- **Inicio:** $0/mes (planes gratuitos de Vercel + Supabase)
- **Producción:** ~$45/mes cuando escales (planes Pro)

---

## 🆘 Soporte

Si necesitas ayuda:

1. Lee la **`GUIA_INICIAL.md`** - Tiene instrucciones detalladas
2. Revisa los scripts SQL de ejemplo
3. Contacta al equipo técnico de MIREGA

**¿Problemas con la contraseña?**
- Debe tener mínimo 8 caracteres
- Usa letras, números y símbolos
- Puedes resetearla desde Supabase Authentication

**¿No puedes entrar?**
- Verifica que creaste el perfil en la tabla `profiles`
- Confirma que el rol está bien asignado
- Revisa que `is_active` sea `true`

---

## 📞 Contacto

**MIREGA Ascensores Ltda.**

📍 Pedro de Valdivia N°255 - Of. 202, Providencia
📞 +56956087972
✉️ contacto@mirega.cl

---

## 📄 Licencia

© 2025 MIREGA Ascensores Ltda. Todos los derechos reservados.

Esta aplicación es propiedad exclusiva de MIREGA Ascensores Ltda.
