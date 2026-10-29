import { HttpErrorResponse } from '@angular/common/http';

// Mensaje legible de una respuesta de error del backend: { ok: false, msg } o los errores de validación { errores }
export const mensajeError = (err: HttpErrorResponse, porDefecto: string): string => {
  const errores = Object.values(err.error?.errores ?? {}) as { msg?: string }[];
  return err.error?.msg || errores[0]?.msg || porDefecto;
};
