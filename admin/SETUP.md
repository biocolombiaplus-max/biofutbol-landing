# Configuración del panel administrativo de BioFutbol

Sigue estos pasos una sola vez para dejar el panel funcionando con datos reales.

## 1. Crear el proyecto de Firebase

1. Entra a https://console.firebase.google.com con tu cuenta de Google.
2. "Agregar proyecto" → nómbralo `biofutbol` (o el nombre que prefieras) → seguir los pasos (puedes desactivar Google Analytics, no es necesario).

## 2. Activar los 3 servicios que usa el panel

Dentro del proyecto, en el menú lateral:

- **Authentication** → pestaña "Sign-in method" → activa **"Correo electrónico/contraseña"**.
- **Firestore Database** → "Crear base de datos" → modo **producción** → elige la región más cercana (ej. `us-east1`).
- **Storage** → "Comenzar" → modo **producción**.

## 3. Crear los dos usuarios administradores

En **Authentication → Users → "Add user"**, crea exactamente estos dos:

| Correo | Contraseña |
|---|---|
| `admin1@biofutbol.app` | `88262856` (Juan Carlos) |
| `admin2@biofutbol.app` | `1127052812` (Nicol) |

En el panel, cada uno inicia sesión escribiendo solo `admin1` o `admin2` (sin el `@biofutbol.app`, el sistema lo agrega solo).

> Nota: usar la cédula como contraseña es cómodo para empezar, pero es una clave fácil de adivinar por alguien que conozca a la persona. Cuando puedan, les recomiendo cambiarla desde Authentication → el usuario → "Reset password".

## 4. Configurar las reglas de seguridad

- **Firestore Database → Reglas**: pega el contenido de `admin/firestore.rules` (ya está en el repositorio) y publica.
- **Storage → Reglas**: pega el contenido de `admin/storage.rules` y publica.

Esto asegura que: cualquiera puede *enviar* el formulario público de registro, pero solo ustedes dos (con sesión iniciada) pueden ver, editar o borrar datos de clientes, y solo ustedes pueden generar contratos.

## 5. Conectar el panel a tu proyecto

1. En Firebase Console → ⚙️ **Configuración del proyecto** → baja hasta "Tus apps" → clic en el ícono `</>` (Web) → regístrala con el nombre "Panel BioFutbol".
2. Copia el objeto `firebaseConfig` que te muestra (apiKey, authDomain, projectId, etc.).
3. Pégalo en el archivo **`admin/js/firebase-config.js`** del repositorio, reemplazando los valores de ejemplo.
4. Sube (commit + push) ese cambio — listo, el panel ya está conectado.

## 6. (Opcional) Envío automático de correo con EmailJS

Si quieres que el botón "Enviar por correo" funcione:

1. Crea una cuenta gratis en https://www.emailjs.com
2. Conecta tu correo (Gmail u otro) como "Email Service".
3. Crea una plantilla ("Email Template") con estas variables: `{{to_email}}`, `{{to_name}}`, `{{club_nombre}}`, `{{contrato_url}}`.
4. En "Account" copia tu **Public Key**, y del servicio/plantilla copia el **Service ID** y **Template ID**.
5. Pégalos en `admin/js/firebase-config.js` en las 3 variables `EMAILJS_...`.

Si no lo configuras, el botón de correo simplemente te avisa que falta configurarlo — el resto del panel funciona igual.

## 7. Probar

1. Abre `https://biocolombiaplus-max.github.io/biofutbol-landing/admin/login.html`
2. Entra con `admin1` / `88262856`.
3. Crea un cliente de prueba, genera el contrato, y prueba el botón de WhatsApp.
4. Revisa `auditoria.html` — debe aparecer cada acción que hiciste.

## Cómo se usa día a día

- **Cuando cierras un negocio nuevo**: usa "Nuevo cliente" en el panel (rápido, vos cargás los datos), o comparte el link de `registro.html` (botón "Copiar link de registro") para que el cliente los diligencie él mismo después de pagar.
- **Generar y enviar el contrato**: entra al cliente → "Generar contrato PDF" → "Enviar por WhatsApp" (o "por correo").
- **Registrar un pago**: entra al cliente → "Registrar pago recibido" — actualiza automáticamente la próxima fecha de vencimiento (+30 días).
- **Ver qué vence pronto**: el dashboard principal (`index.html`) siempre muestra los pagos por vencer (5 días) y los vencidos en rojo, sin que nadie tenga que revisar manualmente.
- **Auditoría**: todo lo que hacen admin1 y admin2 queda registrado con fecha, hora y quién lo hizo — `auditoria.html`.

## Importante sobre el contrato

El texto del contrato que genera el botón "Generar contrato PDF" es una **plantilla**. Cubre las cláusulas básicas (objeto, alcance, valor, plazo, vigencia, obligaciones, datos personales, firmas), pero **te recomiendo que un abogado lo revise** antes de usarlo formalmente con clientes reales — no reemplaza asesoría legal.
