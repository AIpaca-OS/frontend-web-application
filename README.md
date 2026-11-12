# Rumbo — Frontend (Open Source)

Angular 21, Angular Material y HttpClient. Consume los REST Controllers del backend
`AIpaca-OS/web-services` siguiendo el enfoque del proyecto Learning Center UPC.

## Compilar en cualquier PC
Requisitos: Node.js 22, npm y acceso a GitHub. No necesita PostgreSQL
ni un backend levantado para **compilar**.

```powershell
npm ci
npm run build
npm test -- --watch=false
```

## Ejecutar en desarrollo

```powershell
npm start
```

Abre `http://localhost:4200`. `npm start` y `npx ng serve` utilizan
el **mismo** proxy `src/proxy.conf.cjs`, que reenvía `/api/**` a
`http://127.0.0.1:8080` por defecto.

### Consumir un backend remoto desde tu PC
Sin modificar código ni instalar Spring Boot localmente:

```powershell
$env:RUMBO_API_URL = "https://TU-BACKEND.onrender.com"
npm start
```

Usa la URL **real** del servicio que Render asigne, sin `/api/v1` al final.
Si se trata de la instancia de vista previa protegida, el responsable del
equipo puede proporcionar una clave temporal y configurarla solo en su terminal:

```powershell
$env:RUMBO_PREVIEW_KEY = "CLAVE_PRIVADA_DE_PRUEBAS"
npm start
```

No subas esa clave a GitHub, no la guardes en Angular y utiliza solo
datos ficticios hasta implementar IAM. La clave temporal no verifica
roles de conductor o tutor.

Para volver a consumir el backend local, cierra la terminal o elimina esas
variables y ejecuta `npm start` de nuevo.

## Endpoints y limitaciones
- Routes, Vehicles y el catálogo de Billing consumen Spring Boot a través de `/api/v1`.
- Profiles y Notifications tienen módulos REST, pero algunas operaciones requieren
  perfiles de demostración o autenticación que todavía no existe.
- Incidents, Delays y preferencias no totalmente implementadas pueden conservar
  integraciones MockAPI temporales; no cuentan como servicios productivos.
- El proxy solo se aplica al servidor Angular de desarrollo. Para publicar Angular
  en otro hosting hay que configurar el enrutamiento de `/api/**` hacia el backend
  real o ajustar su URL de compilación y CORS.

Los errores `401`, `403` y `503` de recursos privados no deben ocultarse
con credenciales falsas: necesitan las autorizaciones de la aplicación.

El catálogo público se abre en `/plans/` sin iniciar sesión. GitHub Pages consulta el catálogo de Spring Boot por HTTPS en `https://rumbo-team-backend.onrender.com`.
