# Configuración de Dominios Autorizados en Firebase - Guía Visual

## 🎯 Objetivo
Agregar `innboxify.vercel.app` a los dominios autorizados en Firebase para que Google OAuth funcione en Vercel.

---

## Paso 1: Ir a Firebase Console

**URL:** https://console.firebase.google.com/

1. Inicia sesión con tu cuenta de Google
2. Selecciona el proyecto **`emails-management-dba8f`**

---

## Paso 2: Acceder a Autenticación

En el menú izquierdo, busca y haz clic en:
- **Build** (si aparece un menú expandible)
- Luego **Authentication** (Autenticación)

O directamente: **Authentication** en el menú lateral

---

## Paso 3: Ir a Settings (Configuración)

Una vez en la página de Authentication:
1. Busca la pestaña **Settings** (engranaje o rueda de configuración) arriba a la derecha
2. Haz clic en ella

Deberías ver varias pestañas:
- General
- Sign-in method
- **Authorized domains** ← AQUÍ

---

## Paso 4: Ir a "Authorized domains"

En la sección **Authorized domains** verás una lista como:
```
✓ localhost
✓ 127.0.0.1
✓ emails-management-dba8f.firebaseapp.com
```

---

## Paso 5: Agregar nuevo dominio

1. Haz clic en el botón **Add domain** (o similar)
2. En el campo de texto, escribe exactamente:
   ```
   innboxify.vercel.app
   ```
3. Haz clic en **Add** o **Save**

---

## Resultado final

Deberías ver:
```
✓ localhost
✓ 127.0.0.1
✓ emails-management-dba8f.firebaseapp.com
✓ innboxify.vercel.app
```

---

## ⏱️ Importante

Después de agregar el dominio:
1. **Espera 5-10 minutos** - Firebase necesita propagar los cambios
2. **Borra el cache del navegador** o abre una pestaña privada
3. **Ve a https://innboxify.vercel.app/**
4. Intenta autenticarte de nuevo con Google

---

## 🔍 Verificación

Para verificar que funciona:
1. Abre https://innboxify.vercel.app/
2. Haz clic en "Sign in with Google"
3. Se debe abrir el popup de Google
4. Si sale error: abre DevTools (F12) → Console y mira qué dice

### Errores comunes que NO deberías ver:
- ❌ "Firebase domain not authorized"
- ❌ "Unauthorized domain for Cloud Firestore"

Si ves uno de estos, significa que el dominio NO se agregó correctamente.

---

## Si sigue sin funcionar

### Debug paso 1: Verifica en Firebase que está el dominio
1. Ve a https://console.firebase.google.com/
2. Proyecto: `emails-management-dba8f`
3. Authentication → Settings → Authorized domains
4. ¿Aparece `innboxify.vercel.app` en la lista?

### Debug paso 2: Verifica en Vercel las variables
1. Ve a https://vercel.com/dashboard
2. Proyecto: `innboxify`
3. Settings → Environment Variables
4. ¿Aparecen estas variables?
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_APP_ID

### Debug paso 3: Limpiar session storage del navegador
1. Abre https://innboxify.vercel.app/
2. Abre DevTools (F12)
3. Ve a **Application** → **Session Storage**
4. Haz clic en `https://innboxify.vercel.app/`
5. Elimina la clave `gmail_access_token` si existe
6. Recarga la página (F5 o Ctrl+R)

---

## Ubicación exacta en Firebase Console

Ruta completa:
```
Firebase Console
  └─ Proyecto: emails-management-dba8f
      └─ Build
          └─ Authentication
              └─ Settings (pestaña arriba)
                  └─ Authorized domains (tercera pestaña)
```

---

## ✅ Checklist de configuración

- [ ] El dominio `innboxify.vercel.app` está en Firebase Authorized domains
- [ ] Las variables de entorno están en Vercel Settings
- [ ] Esperé 5-10 minutos después de agregar el dominio
- [ ] Limpié el cache/session storage del navegador
- [ ] Hice redeploy en Vercel (o push a main)
- [ ] Intento autenticar en https://innboxify.vercel.app/
