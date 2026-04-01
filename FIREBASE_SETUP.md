# Solución: Autenticación con Google en Vercel

## Problema
La página de email aparece en blanco en Vercel después de autenticarse con Google. Esto ocurre porque Firebase no autoriza el dominio de Vercel.

## Solución - Agregar dominio a Firebase

### Paso 1: Ve a Firebase Console
1. Accede a https://console.firebase.google.com/
2. Selecciona tu proyecto: `emails-management-dba8f`
3. En el menú izquierdo, ve a **Autenticación** > **Settings** (ícono de engranaje)

### Paso 2: Autorizar dominio de Vercel
1. Ve a la pestaña **Domains autorizados** (o "Authorized domains")
2. Haz clic en **Agregar dominio** (Add domain)
3. Agrega: `innboxify.vercel.app`
4. Haz clic en **Agregar**

### Paso 3: Verificar variables de entorno en Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `innboxify`
3. Ve a **Settings** > **Environment Variables**
4. Verifica que estén presentes:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `STITCH_API_KEY` (si lo necesitas)

### Paso 4: Redeploy en Vercel
Después de agregar el dominio, haz redeploy:
1. Ve a Vercel Dashboard
2. Selecciona tu proyecto
3. Haz clic en **Redeploy** (o haz un push a main)

## Variables de Entorno Vercel
Copia estas desde tu `.env` local a Vercel Settings:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `STITCH_API_KEY` (si lo necesitas)

## Dominios autorizados requeridos en Firebase
- ✅ localhost (ya viene por defecto)
- ✅ 127.0.0.1 (localhost)
- ⚠️ innboxify.vercel.app (DEBES AGREGAR ESTO)

## Verificar que funciona
Después de hacer redeploy:
1. Accede a https://innboxify.vercel.app/
2. Haz clic en "Sign in with Google"
3. Completa la autenticación
4. Deberías ver el Dashboard sin pantalla en blanco

## Si sigue sin funcionar

### Debug en navegador
1. Abre DevTools (F12)
2. Ve a **Console** (Consola)
3. Busca errores rojos
4. Los errores comunes son:
   - "Firebase domain not authorized"
   - "CORS error"
   - "auth/operation-not-supported-in-this-environment"

### Limpiar sesión
Si ya intentaste autenticarte:
1. Abre DevTools
2. Ve a **Application** > **Session Storage**
3. Elimina `gmail_access_token`
4. Recarga la página

## Notas
- Los cambios en Firebase Console pueden tardar unos minutos en propagarse
- Vercel cachea la build, así que redeploy es importante
- Los variables de entorno en Vercel se inyectan en tiempo de build (no en runtime)
