# Corazon

Aplicación Ionic/Angular (`frontend/`) con API en Node/Express + MongoDB (`backend/`).

## Requisitos

- Node.js (Angular 18 soporta oficialmente Node 18/20/22)
- MongoDB escuchando en `localhost:27017`

## Arrancar

1. Arrancar MongoDB (en Windows, PowerShell como administrador): `Start-Service MongoDB`
2. Backend:
   ```
   cd backend
   npm install
   copy .env.example .env   # y rellenar los valores
   node index.js
   ```
   La API queda en http://localhost:3000
3. Frontend (en otra terminal):
   ```
   cd frontend
   npm install
   npm start
   ```
   La app queda en http://localhost:4200
