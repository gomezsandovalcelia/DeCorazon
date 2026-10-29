# DeCorazon

[Español](#español) · [English](#english)

---

## Español

DeCorazon es una aplicación de seguimiento entre pacientes y médicos, desarrollada como Trabajo de Fin de Grado. El paciente registra a diario sus medidas, su medicación y sus ejercicios, y responde a un cuestionario. El médico consulta la evolución de cada uno de sus pacientes y gestiona su tratamiento.

La interfaz está pensada para personas mayores: tipografía Atkinson Hyperlegible, tamaño base de 18 px, botones grandes y una barra de navegación inferior con icono y texto en cada opción.

### Funcionalidades

**Paciente**
- Registro de medidas (peso, frecuencia cardiaca y tensión arterial), con validación de rangos.
- Pastillero semanal con las tomas de mañana, tarde y noche.
- Consulta de sus tratamientos y rutinas de ejercicio.
- Cuestionario diario. Ciertas respuestas generan una alerta para el médico.
- Perfil con cambio de contraseña y sección de preguntas frecuentes.

**Médico**
- Registro público de médicos.
- Panel con la lista de sus pacientes y búsqueda por nombre.
- Alta de nuevos pacientes, que quedan asignados automáticamente al médico que los crea.
- Detalle de cada paciente: medidas, IMC, gráfica con una puntuación de salud de 0 a 100, pastillero, tratamientos y ejercicios.

### Tecnologías

| Parte | Tecnologías |
|-------|-------------|
| Frontend (`frontend/`) | Ionic 8, Angular 18 (NgModules), Capacitor, Chart.js, SweetAlert2 |
| Backend (`backend/`) | Node.js, Express, Mongoose, express-validator, JWT, bcrypt, helmet |
| Base de datos | MongoDB |
| Tests | Jest + supertest (backend), Karma + Jasmine (frontend) |

### Arquitectura

- **API REST** en `/api` con un router por recurso: `login`, `paciente`, `medico`, `pregunta` y `respuesta`. Cada recurso sigue la estructura `routes/` → `controllers/` → `models/`.
- **Modelo de datos**: el paciente guarda dentro de su propio documento sus tratamientos, su pastillero, sus medidas y sus rutinas de ejercicio. El médico guarda la lista de sus pacientes, que es el único vínculo entre ambos.
- **Autenticación**: el login devuelve un JWT válido durante 7 días que el cliente envía en la cabecera `x-token`. Las contraseñas se guardan cifradas con bcrypt y nunca se devuelven en las respuestas.
- **Autorización**: cada ruta comprueba el rol del usuario y que tenga acceso al paciente consultado. Un paciente solo ve sus propios datos y un médico solo ve a sus pacientes. El login y el registro de médicos tienen límite de peticiones.

### Requisitos

- Node.js 18, 20 o 22
- MongoDB escuchando en `localhost:27017`

### Puesta en marcha

1. Arrancar MongoDB (en Windows, desde PowerShell como administrador): `Start-Service MongoDB`
2. Backend:
   ```
   cd backend
   npm install
   copy .env.example .env
   node index.js
   ```
   En `.env` hay que rellenar `PORT`, `DBCONECTION` y `JWTSECRET` (`CORSORIGIN` es opcional). La API queda en http://localhost:3000.
3. Frontend, en otra terminal:
   ```
   cd frontend
   npm install
   npm start
   ```
   La app queda en http://localhost:4200.

### Tests

- Backend: `npm test` dentro de `backend/`. Usa la base de datos `corazon_test`, que se borra al terminar.
- Frontend: `npm test` dentro de `frontend/` (requiere Chrome). `npm run lint` pasa el linter.

### Migración de datos

`npm run migrar` (en `backend/`) adapta los datos antiguos al modelo actual. Antes de modificar nada guarda una copia de seguridad en `backend/backups/`. Se puede ejecutar varias veces sin problema.

---

## English

DeCorazon is a patient–doctor follow-up app, developed as a Bachelor's thesis (TFG). Patients log their measurements, medication and exercise every day and answer a daily questionnaire. Doctors track how each of their patients is doing and manage their treatment.

The interface is designed for elderly users: the Atkinson Hyperlegible font, an 18 px base size, large buttons and a bottom navigation bar where every item has an icon and a text label. The UI text is in Spanish.

### Features

**Patient**
- Log measurements (weight, heart rate and blood pressure), with range validation.
- Weekly pill organizer with morning, afternoon and night doses.
- View their treatments and exercise routines.
- Daily questionnaire. Some answers raise an alert for the doctor.
- Profile with password change, and a FAQ section.

**Doctor**
- Public doctor sign-up.
- Dashboard listing their patients, with name search.
- Register new patients, who are assigned automatically to the doctor who creates them.
- Patient detail: measurements, BMI, a chart with a 0–100 health score, pill organizer, treatments and exercises.

### Tech stack

| Part | Technologies |
|------|--------------|
| Frontend (`frontend/`) | Ionic 8, Angular 18 (NgModules), Capacitor, Chart.js, SweetAlert2 |
| Backend (`backend/`) | Node.js, Express, Mongoose, express-validator, JWT, bcrypt, helmet |
| Database | MongoDB |
| Tests | Jest + supertest (backend), Karma + Jasmine (frontend) |

### Architecture

- **REST API** under `/api` with one router per resource: `login`, `paciente` (patient), `medico` (doctor), `pregunta` (question) and `respuesta` (answer). Each resource follows `routes/` → `controllers/` → `models/`.
- **Data model**: each patient document embeds its own treatments, pill organizer, measurements and exercise routines. Each doctor document holds the list of their patients, which is the only link between the two.
- **Authentication**: login returns a JWT valid for 7 days, which the client sends in the `x-token` header. Passwords are hashed with bcrypt and never returned in responses.
- **Authorization**: every route checks the user's role and whether they can access the requested patient. Patients only see their own data and doctors only see their own patients. Login and doctor sign-up are rate-limited.

### Requirements

- Node.js 18, 20 or 22
- MongoDB listening on `localhost:27017`

### Getting started

1. Start MongoDB (on Windows, from an administrator PowerShell): `Start-Service MongoDB`
2. Backend:
   ```
   cd backend
   npm install
   copy .env.example .env
   node index.js
   ```
   Fill in `PORT`, `DBCONECTION` and `JWTSECRET` in `.env` (`CORSORIGIN` is optional). The API runs at http://localhost:3000.
3. Frontend, in another terminal:
   ```
   cd frontend
   npm install
   npm start
   ```
   The app runs at http://localhost:4200.

### Tests

- Backend: `npm test` inside `backend/`. It uses the `corazon_test` database, which is dropped afterwards.
- Frontend: `npm test` inside `frontend/` (requires Chrome). `npm run lint` runs the linter.

### Data migration

`npm run migrar` (in `backend/`) converts old data to the current model. Before changing anything it writes a backup to `backend/backups/`. It is safe to run more than once.
