# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Corazon": a patient/doctor follow-up app (TFG). `frontend/` is Ionic 8 + Angular 18 (NgModule-based, not standalone) with Capacitor; `backend/` is a Node/Express API on MongoDB via Mongoose. Code, identifiers, comments and UI text are in Spanish.

## Git

Only commit when the user asks for it, and always ask before committing or pushing. Never push unless the user explicitly says so.

## Commands

Requires MongoDB on `localhost:27017` (Windows: `Start-Service MongoDB` from an admin PowerShell).

Backend (`backend/`):
- `npm install`, then copy `.env.example` to `.env` and fill in `PORT`, `DBCONECTION` (note the spelling), `JWTSECRET`
- `node index.js` starts the API on http://localhost:3000. There is no dev script, no watcher and no tests (`npm test` is a placeholder that fails).

Frontend (`frontend/`):
- `npm start` (`ng serve`) serves on http://localhost:4200
- `npm run build`, `npm run lint` (angular-eslint)
- `npm test` runs Karma/Jasmine in Chrome. For a single spec: `npx ng test --include src/app/auth/recovery/recovery.component.spec.ts`. Only a couple of spec files exist.

## Architecture

### Backend
`index.js` mounts one router per resource under `/api`: `login` (auth), `usuarios`, `paciente`, `medico`, `pregunta`, `respuesta`. Each one follows `routes/<x>.js` → `controllers/<x>.js` → `models/<x>.js`. Routes chain middleware arrays: `validarJWT`, `express-validator` `check(...)` calls, then `validarCampos` to return the 400 errors. All responses use the `{ ok, msg, ... }` shape.

Data model: `Paciente` (collection `Pacientes`) embeds its own `treatments`, `pastillero` (pill organizer by weekday, with morning/afternoon/night), `measurements` and `exercise_routines` (with numeric `_id`s and a `checkpoint` flag). Most patient features are sub-routes such as `/api/paciente/:id/measurements` that read or modify these embedded arrays. `Medico` (collection `Medicos`) holds a `pacientes` array of ObjectId refs. `Usuario` (`usuarios`) is a separate, older model. `Pregunta`/`Respuesta` hold the daily questionnaire questions and the patient answers (`pacienteId` ref).

Auth: `POST /api/login` (rate-limited in `index.js`) looks the email up first in `Paciente`, then in `Medico` (there is no unified users table). It compares the password with bcrypt and returns `{ _id, rol, tipo, token }`. The JWT payload is `{ uid, rol }`, it is valid for 7 days, and the client sends it in the `x-token` header. `validarJWT` sets `req.uid`/`req.rol` and answers 401 when the token is missing or invalid.

Authorization (all of these must run after `validarJWT`):
- `validarRolMedico`/`validarRolPaciente` check `req.rol`.
- `validarAccesoPaciente(obtenerId)` in `middleware/validar-acceso.js` allows the patient themself, or a doctor whose `pacientes` array contains that patient. `obtenerId` defaults to `req.params.id`. The pregunta/respuesta routes pass `req.params.pacienteId` or a body field instead.
- `validarMismoUsuario` requires `req.params.id === req.uid`.
- Every `/api/paciente`, `/api/medico`, `/api/pregunta` and `/api/respuesta` route is protected. Responses for doctors are filtered to their own patients.
- `password` has `select: false` in `Paciente`/`Medico` (login asks for `+password`), and both models strip it in `toJSON`. Create and update controllers copy an explicit list of fields from `req.body`, so `rol` is never taken from the client.

Known quirks to watch for when editing:
- `Paciente.medico_id` is a `Number` with `ref: 'Medico'`, but doctors have ObjectIds. Access control uses `Medico.pacientes`, not `medico_id`. Changing the type needs a data migration.
- Exercise `_id`s are numbers generated with `Date.now()`. Dates in the embedded arrays are stored as strings.

### Frontend
- Routing lives in `app-routing.module.ts`, which imports `auth/auth.routing.ts` (`/landing`, `/login`, `/registro` under `AuthLayoutComponent`) and `pages/pages.routing.ts` (all app pages under `AdminLayoutComponent`).
- Patient pages sit at the root (`/home`, `/medidas`, `/ejercicios`, `/tratamiento`, `/perfil`, `/preguntas-frecuentes`). Doctor pages sit under `/medico/` (`dashboard`, `perfil`, `detalle-paciente/:id`).
- `AuthGuard` checks `route.data.roles` (`PACIENTE`/`MEDICO`) and redirects users to their own home page.
- Session state is kept entirely in `localStorage`. `login.component.ts` writes `token`, `userId`, `rol` and `pacienteId`, plus the questionnaire flags `showForm` and `preguntadeldia`. `AuthService` reads these values and `logout()` clears them. Components read `pacienteId`/`userId` directly from `localStorage` instead of getting them from a service.
- API calls go through the services in `services/`, which build URLs from `environment.apiUrl`. `interceptors/token.interceptor.ts` adds `x-token` to every API request and calls `AuthService.logout()` on a 401, so services must not set the header themselves.
- `npm run lint` currently fails to parse, because `.eslintrc.json` points `parserOptions.project` at `frontend/tsconfig.json` relative to `frontend/`. The production build fails the `anyComponentStyle` budget on `detallepaciente.component.scss`. Use `npx ng build --configuration development` to check that the code compiles.
- Charts use `chart.js` and alerts use `sweetalert2`.

`usuarios.json` at the repo root is legacy sample data that the app does not use.
