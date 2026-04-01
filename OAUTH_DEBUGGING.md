# Debugging Firebase OAuth en Vercel

## 🔍 Pasos de Debug

### 1. **Abre DevTools**
```
F12 (Windows/Linux)
Cmd + Option + I (Mac)
```

### 2. **Ve a la pestaña Console**
Busca mensajes con estos patrones:

#### ✅ Flujo Correcto
```
🔐 Iniciando autenticación con Google...
📱 Redirigiendo a Google para autenticación...
[Page redirects to Google]
✅ Autenticación completada
🔍 Verificando resultado de autenticación...
✅ Autenticación completada
🔄 Estado de autenticación cambió: Autenticado
```

#### ❌ Errores Comunes y Soluciones

**Error: "Este dominio no está autorizado en Firebase"**
```
Solución:
1. Firebase Console → emails-management-dba8f
2. Authentication → Settings → Authorized domains
3. Agrega: innboxify.vercel.app (sin https://)
4. Espera 5-10 minutos
5. Abre pestaña privada y reintenta
```

**Error: "Cannot use import statement outside a module"**
```
Significa: auth-handler.js está cargando Firebase de nuevo
Solución: Este error ya está FIJO en el código
Si persiste: Limpiar cache (Ctrl+Shift+R o Cmd+Shift+R)
```

**Error: "OAuth not supported in this environment"**
```
Significa: El navegador no soporta OAuth
Soluciones:
1. Usa navegador moderno (Chrome, Firefox, Safari, Edge)
2. Desactiva extensiones que bloquean OAuth
3. Intenta en pestaña privada
```

**Popup se abre pero está en blanco**
```
Esto NO debería suceder ahora - estamos usando redirect
Si pasa: Es un problema de cache
Solución: Limpiar cache completo del navegador
```

---

## 📊 Checklist de Validación

```
Antes de testear:
☐ Vercel terminó de desplegar (ver en dashboard)
☐ Firebase tiene innboxify.vercel.app en Authorized domains
☐ Abriste en pestaña PRIVADA/incógnita

Durante el test:
☐ Haces click en "Sign in with Google"
☐ Se REDIRIGE a accounts.google.com (NO popup)
☐ Completas login en Google
☐ Vuelves a innboxify.vercel.app
☐ Ves el Dashboard (NO pantalla en blanco)

Si falla:
☐ Abre DevTools (F12)
☐ Ve a Console
☐ Copia el mensaje de error completo
☐ Verifica que no haya errores rojos
```

---

## 🧪 Testing Localmente

```bash
# 1. En el terminal del proyecto
npm run dev

# 2. Abre http://localhost:5173/
# 3. Testing es igual al procedimiento anterior
```

**Notas locales:**
- No necesitas agregar localhost a Firebase (ya viene)
- Los redirects funcionan igual
- Puedes testear todo sin Vercel

---

## 📱 Herramientas Útiles

### Chrome DevTools Network Tab
```
1. Abre DevTools (F12)
2. Ve a Network
3. Haz click en "Sign in with Google"
4. Busca requests a:
   - accounts.google.com → 🔴 Si hay CORS error
   - OAuth redirect → ✅ Si todo está bien
```

### Local Storage vs Session Storage
```javascript
// En Console, puedes revisar:
sessionStorage.getItem('gmail_access_token')
// Si retorna un token largo → ✅ Token guardado correctamente
// Si retorna null → ❌ Token no se guardó
```

### Probar auth.init() manualmente
```javascript
// En Console:
import('./src/stores/auth.js').then(m => {
  m.useAuthStore().init()
})
```

---

## 🔧 Problemas Avanzados

### "State parameter mismatch"
**Causa:** CORS o caché viejo
**Solución:**
```bash
# Fuerza refresh sin caché
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# O abre pestaña completamente nueva en incógnito
```

### Token expira inmediatamente
**Causa:** sessionPersistence está limpiando tokens
**Verificación:**
```javascript
// En Console:
firebase.auth().currentUser?.getIdTokenResult()
.then(r => console.log('Expira:', r.expirationTime))
```

### Redirección infinita
**Causa:** getRedirectResult() se llama múltiples veces
**Solución:** Ya está FIJA en el código actual
Si sigue pasando: revisa que auth.init() se llame UNA SOLA VEZ

---

## 📞 Información para Reportar Bugs

Si algo sigue sin funcionar, copia esto:

```
Platform: [Windows/Mac/Linux]
Browser: [Chrome/Firefox/Safari/Edge] version [X.X]
Vercel URL: https://innboxify.vercel.app/
Error message: [copia del error en Console]

Console output:
[Pega TODO lo que ves en la consola]

Steps to reproduce:
1. Abrí https://innboxify.vercel.app/
2. Hice click en "Sign in with Google"
3. [Describe qué pasó]
```

---

## ✅ Estado Esperado Vercel

Cuando todo funciona:

```
1. Usuario ve página LOGIN
2. Hace click "Sign in with Google"
3. Browser redirige a https://accounts.google.com/...
4. Usuario ve pantalla de Google para hacer login
5. Usuario completa con su email y password de Google
6. Browser redirige a https://innboxify.vercel.app/
7. APARECE el DASHBOARD (no blanco)
8. Usuario ve lista de emails/senders
```

Si algo sale diferente, anota exactamente dónde falla y abre DevTools.

---

## 🚨 Nuclear Option (Reset Total)

Si todo falla y nada funciona:

```bash
# 1. Limpia el código
git reset --hard origin/main

# 2. Borra node_modules y caché
rm -rf node_modules dist
npm install

# 3. Reinicia dev server
npm run dev

# 4. Prueba localmente primero
# Luego en Vercel

# 5. Si Vercel falla: Force deploy
git commit --allow-empty -m "Force Vercel redeploy"
git push
```

Esto reconstruye todo desde cero.

---

## 📚 Referencias Rápidas

- Firebase Console: https://console.firebase.google.com/
- Vercel Dashboard: https://vercel.com/dashboard
- OAuth Error Codes: https://firebase.google.com/docs/auth/handle-errors
- Browser DevTools: https://developer.chrome.com/docs/devtools/
