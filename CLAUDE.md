# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"DeCorazon": a patient/doctor follow-up app (TFG). `frontend/` is Ionic 8 + Angular 18 (NgModule-based, not standalone) with Capacitor; `backend/` is a Node/Express API on MongoDB via Mongoose. Code, identifiers, comments and UI text are in Spanish.

## Git

Only commit when the user asks for it, and always ask before committing or pushing. Never push unless the user explicitly says so.

## Commands

Requires MongoDB on `localhost:27017` (Windows: `Start-Service MongoDB` from an admin PowerShell).

Backend (`backend/`):
- `npm install`, then copy `.env.example` to `.env` and fill in `PORT`, `DBCONECTION` (note the spelling) and `JWTSECRET`. `CORSORIGIN` is optional.
- `node index.js` starts the API on http://localhost:3000. `npm run dev` starts it with nodemon.
- `npm test` runs the Jest + supertest tests in `tests/` against the local MongoDB database `corazon_test` (override with `TEST_DBCONECTION`), which is dropped afterwards. For a single test: `npx jest -t "texto del test"`.
- `npm run migrar` runs `scripts/migrar-datos.js`. It first writes a JSON backup of `Pacientes` to `backend/backups/` (git-ignored), then removes `medico_id` and converts string dates to `Date`. It is idempotent.

Frontend (`frontend/`):
- `npm start` (`ng serve`) serves on http://localhost:4200
- `npm run build`, `npm run lint` (angular-eslint)
- `npm test` runs Karma/Jasmine in Chrome (`npx ng test --watch=false --browsers=ChromeHeadless` for a single headless run). For a single spec: `npx ng test --include src/app/services/salud.service.spec.ts`.

## Architecture

### Backend
`app.js` builds the Express app (helmet, CORS, rate limit on login) and mounts one router per resource under `/api`: `login` (auth), `paciente`, `medico`, `pregunta` and `respuesta`. `index.js` connects to MongoDB and only then calls `listen`; the tests import `app.js` directly. Each resource follows `routes/<x>.js` → `controllers/<x>.js` → `models/<x>.js`. Routes chain middleware arrays: `validarJWT`, access middlewares, `express-validator` `check(...)` calls, then `validarCampos` to return the 400 errors as `{ ok: false, errores }`. All responses use the `{ ok, msg, ... }` shape.

Data model:
- `Paciente` (collection `Pacientes`) embeds its own `treatments`, `pastillero` (pill organizer by weekday, with morning/afternoon/night), `measurements` and `exercise_routines` (with numeric `_id`s and a `checkpoint` flag). The `date` fields in these arrays are `Date`.
- `Paciente` also stores `lastQuestionnaire` and `lastAlert`. `GET /api/pregunta/first-question/:pacienteId` returns `completadoHoy: true` when `lastQuestionnaire` is today.
- Most patient features are sub-routes such as `/api/paciente/:id/measurements` that read or modify these embedded arrays. `PUT /:id/measurements` validates ranges: weight 20–300, heart rate 30–250, blood pressure `NNN/NN`.
- `Medico` (collection `Medicos`) holds a `pacientes` array of ObjectId refs. This array is the only doctor–patient link; patients have no `medico_id`. Only doctors sign up publicly (`POST /api/medico`, rate-limited). Patients are created by their doctor (`POST /api/paciente`), who is assigned to them automatically. A new patient starts with empty arrays and a `pastillero` holding the 7 days with no medication. Emails are unique across `Paciente` and `Medico` (`helpers/email-en-uso.js`), because login looks in both collections.
- `Pregunta`/`Respuesta` hold the daily questionnaire questions and the patient answers (`pacienteId` ref).
- The collections `Tratamientos`, `Ejercicios`, `Medidas` and `usuarios` in the database are legacy and unused by the code.

Auth: `POST /api/login` (rate-limited) looks the email up first in `Paciente`, then in `Medico` (there is no unified users table). It compares the password with bcrypt and returns `{ _id, rol, tipo, token }`. The JWT payload is `{ uid, rol }`, it is valid for 7 days, and the client sends it in the `x-token` header. `validarJWT` sets `req.uid`/`req.rol` and answers 401 when the token is missing or invalid.

Authorization (all of these must run after `validarJWT`):
- `validarRolMedico`/`validarRolPaciente` check `req.rol`.
- `validarAccesoPaciente(obtenerId)` in `middleware/validar-acceso.js` allows the patient themself, or a doctor whose `pacientes` array contains that patient. `obtenerId` defaults to `req.params.id`. The pregunta/respuesta routes pass `req.params.pacienteId` or a body field instead.
- `validarMismoUsuario` requires `req.params.id === req.uid`. For example, only the patient can use `PUT /api/paciente/:id/password` (body `{ actual, nueva }`).
- Every `/api/paciente`, `/api/medico`, `/api/pregunta` and `/api/respuesta` route is protected, except the doctor sign-up. Responses for doctors are filtered to their own patients. Only doctors edit the pastillero, add treatments or exercises, and create patients. Passwords need at least 6 characters.
- `password` has `select: false` in `Paciente`/`Medico` (login asks for `+password`), and both models strip it in `toJSON`. Create and update controllers copy an explicit list of fields from `req.body`, so `rol` is never taken from the client.

### Frontend
- Routing lives in `app-routing.module.ts`, which imports `auth/auth.routing.ts` (`/landing`, `/login`, `/registro` under `AuthLayoutComponent`) and `pages/pages.routing.ts` (all app pages under `AdminLayoutComponent`). `/registro` is the doctor sign-up. Password recovery is an empty placeholder, pending design.
- Patient pages sit at the root (`/home`, `/medidas`, `/ejercicios`, `/tratamiento`, `/perfil`, `/preguntas-frecuentes`). The patient changes their password in `/perfil`. Doctor pages sit under `/medico/` (`dashboard`, with its name search and a "Registrar paciente" button, plus `nuevo-paciente`, `perfil` and `detalle-paciente/:id`).
- `AuthGuard` checks `route.data.roles` (`PACIENTE`/`MEDICO`) and redirects users to their own home page.
- Session state is kept in `localStorage`: `login.component.ts` writes `token`, `userId`, `rol` and `pacienteId`, and `AuthService.logout()` is the single place that clears them. Components read `pacienteId`/`userId` directly from `localStorage`. `ultimaMedicion` (timestamp) controls when the patient home shows the measurements form again (`HORAS_ENTRE_MEDICIONES = 12`).
- API calls go through the services in `services/`, which build URLs from `environment.apiUrl`. `interceptors/token.interceptor.ts` adds `x-token` to every API request and calls `AuthService.logout()` on a 401, so services must not set the header themselves.
- `services/salud.service.ts` holds the BMI and 0–100 health score calculations used by the doctor's patient detail page and its chart. Shared types are in `interfaces/`; `VALIDADORES_MEDIDAS` mirrors the backend measurement ranges. `helpers/` holds `mensajeError` (reads `msg` or the `errores` of a backend error) and the `camposIguales` validator, used for repeat-password fields.
- Charts use `chart.js` and alerts use `sweetalert2`.
- Styling targets elderly users and is light mode only:
  - Colors, the font (Atkinson Hyperlegible) and the `--app-*` tokens live in `theme/variables.scss`. The `--app-estado-*` tokens are the health-state colors, which the detail chart also reads.
  - `global.scss` sets an 18px base size and large tap targets, and holds the shared classes (`page-logo`, `page-title`, `section-title`, `dato`, `momento`, `estado-badge`, `empty-state`, `auth-container`, and `desplegable` for `<details>` dropdowns).
  - Component SCSS should only add layout. Don't hardcode colors or set font sizes below 16px.
  - Patients navigate with the bottom bar in `commons/menu`, where every item has an icon and a text label.
