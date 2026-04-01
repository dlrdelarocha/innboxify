# Firebase OAuth en Vercel - Mejores Prácticas 2026

## 🎯 Resumen Ejecutivo

Cuando usas Firebase Auth con OAuth en Vercel, existen varios desafíos:
1. **Cross-origin storage**: El iframe de Firebase no puede acceder a storage en dominios cruzados
2. **Preview deployments**: Cada preview genera un nuevo dominio que requiere configuración en Firebase
3. **Módule loading**: Firebase SDK puede cargar mal si no está correctamente bundled

---

## ✅ Mejores Prácticas Recomendadas

### 1. **Usa `signInWithRedirect` (NO `signInWithPopup`)**

**Por qué:**
- Los popups pueden ser bloqueados por navegadores
- Los popups tienen problemas en Vercel por cross-origin storage
- Las redirecciones full-page son más confiables

**Implementación:**
```javascript
// ✅ RECOMENDADO
await signInWithRedirect(auth, provider)

// ❌ EVITAR EN VERCEL
await signInWithPopup(auth, provider)
```

**Beneficios:**
- Funciona en todos los navegadores
- No depende de cross-origin storage
- Menos propenso a ser bloqueado

---

### 2. **Configuración de Vercel Rewrite**

**Para proxear requests a Firebase:**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/__(.*)?", "destination": "/api/firebase-auth-handler" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Por qué funciona:**
- Redirige `/__/auth/*` a tu API handler
- Evita que el navegador intente ir al dominio de Firebase Hosting
- Permite que Firebase SDK complete el flujo

---

### 3. **Auth Handler Endpoint**

**Características importantes:**

```javascript
export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  // Devuelve HTML MÍNIMA, sin cargar Firebase de nuevo
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Authenticating...</title>
    </head>
    <body>
      <p>Please wait...</p>
    </body>
    </html>
  `)
}
```

**Reglas:**
- ✅ NO cargues Firebase SDK nuevamente
- ✅ NO intentes procesar OAuth aquí
- ✅ Devuelve HTML simple y mínima
- ❌ NO agregues `<script type="module">`
- ❌ NO intentes usar `import/export`

**Por qué:**
- Firebase SDK en el cliente ya maneja todo
- Este endpoint solo necesita existir
- Si cargas Firebase aquí → conflicto de módulos

---

### 4. **Inicialización en App.vue**

**Estructura correcta:**

```vue
<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  // Espera a que auth.init() complete
  await auth.init()
})
</script>
```

**Por qué es importante:**
- Necesitas esperar `getRedirectResult()` antes de renderizar
- Evita que la app se cargue antes de saber si hay sesión

---

### 5. **Manejo de Redirect Result**

**En auth.js:**

```javascript
export async function getRedirectResultIfExists() {
  if (!auth) return null
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result)
      return {
        user: result.user,
        accessToken: credential.accessToken
      }
    }
  } catch (error) {
    console.error('Error getting redirect result:', error)
    throw error
  }
  return null
}
```

**Detalles importantes:**
- Llama a `getRedirectResult()` UNA SOLA VEZ al iniciar
- Si retorna un resultado → usuario viene de OAuth redirect
- Si retorna null → usuario no está autenticado o es primera carga

---

### 6. **Configuración de Firebase Console**

**Checklist obligatorio:**

```
✅ Proyecto: emails-management-dba8f
✅ Authentication → Settings
✅ Authorized domains:
   - localhost
   - 127.0.0.1
   - emails-management-dba8f.firebaseapp.com
   - innboxify.vercel.app (IMPORTANTE)
   - innboxify-*.vercel.app (para previews)
```

**Por qué cada uno:**
- `localhost` - desarrollo local
- `127.0.0.1` - desarrollo local IP
- `*.firebaseapp.com` - Firebase Hosting (si la usas)
- `innboxify.vercel.app` - producción
- `innboxify-*.vercel.app` - preview deployments

---

### 7. **Manejo de Preview Deployments**

**Problema:** Cada preview deployment en Vercel crea un nuevo dominio

**Soluciones:**

#### Opción A: Autorizar wildcard (más fácil)
```
En Firebase → Authorized domains
Agregar: innboxify-*.vercel.app
```

#### Opción B: Agregar manualmente cada preview
```
Cuando Vercel crea una preview en innboxify-pr-123.vercel.app
Agrega ese dominio en Firebase
```

#### Opción C: Usar script de auto-configuración
```javascript
// Al iniciar app, registra el dominio actual
if (window.location.hostname.includes('vercel.app')) {
  console.log('Current domain:', window.location.hostname)
  // Log esto para agregarlo manualmente después
}
```

---

## 📊 Comparación de Métodos

| Método | Popup | Redirect |
|--------|-------|----------|
| **Popup bloqueados** | ❌ Problema común | ✅ No afectado |
| **Cross-origin storage** | ❌ Problemas en Vercel | ✅ No necesita |
| **Mobile** | ❌ Mala UX | ✅ Natural |
| **Privacy browsers** | ❌ Bloqueado | ✅ Funciona |
| **Complejidad** | ✅ Simple | ⚠️ Requiere handler |

---

## 🚀 Flujo Recomendado (Paso a Paso)

```
1. Usuario en LOGIN page
   ↓
2. Click "Sign in with Google"
   ↓
3. signInWithRedirect(auth, provider)
   ↓
4. Browser redirige a accounts.google.com
   ↓
5. Usuario completa autenticación en Google
   ↓
6. Google redirige a: https://innboxify.vercel.app/?code=...&state=...
   ↓
7. App.vue onMounted() → auth.init()
   ↓
8. getRedirectResult() → obtiene credential + token
   ↓
9. Auth store actualiza user + accessToken
   ↓
10. Router detecta cambio → redirige a /dashboard ✅
```

---

## 🔐 Consideraciones de Seguridad

### ✅ Prácticas Seguras

- Usa HTTPS siempre (Vercel lo hace por defecto)
- Almacena tokens en sessionStorage (no localStorage)
- Limpiar tokens al cerrar sesión
- Validar state parameter en OAuth

### ❌ Evitar

- No expongas Firebase API key en código (usa variables de entorno)
- No almacenes tokens en localStorage
- No hagas bypass de verificación de dominio
- No confíes solo en client-side auth

---

## 📱 Soporte para Aplicaciones Móviles

Si en el futuro quieres soportar React Native o Flutter:

```javascript
// Para mobile, usa:
// - signInWithPopup() (en mobile browsers funciona bien)
// - O implementa deep linking + OAuth callback schemes
```

---

## 🔗 Referencias Oficiales

- [Firebase Redirect Best Practices](https://firebase.google.com/docs/auth/web/redirect-best-practices)
- [Vercel Next.js Firebase Auth Discussion](https://github.com/vercel/next.js/discussions/37636)
- [Firebase Examples on Vercel](https://vercel.com/templates/firebase)

---

## 📋 Checklist para Vercel + Firebase

- [ ] `vercel.json` redirige `/__/*` a `/api/auth-handler`
- [ ] `/api/auth-handler.js` devuelve HTML mínima
- [ ] `signInWithRedirect` está siendo usado
- [ ] `getRedirectResult()` se llama en `auth.init()`
- [ ] `innboxify.vercel.app` está en Firebase Authorized domains
- [ ] Variables de entorno están en Vercel Settings
- [ ] `onMounted()` en App.vue es `async`
- [ ] El token se guarda en sessionStorage
- [ ] El router redirige a /dashboard después de auth

---

## ✨ Estado Actual de Tu Implementación

✅ Usando `signInWithRedirect` (correcto)
✅ Vercel rewrite configurado (correcto)
✅ API handler creado (correcto)
✅ Dominio autorizado en Firebase (confirmado)

**Siguiente paso:** Esperar a que Vercel redeploy y probar nuevamente.
Si el error persiste, revisar consola para "Cannot use import statement".
