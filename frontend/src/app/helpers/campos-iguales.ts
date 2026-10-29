import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador de grupo: el campo b debe repetir el valor del campo a (p. ej., repetir contraseña).
// El error camposDistintos se marca también en el control b para que ion-input muestre su errorText
export const camposIguales = (a: string, b: string): ValidatorFn =>
  (grupo: AbstractControl): ValidationErrors | null => {
    const repetido = grupo.get(b);
    if (!repetido) {
      return null;
    }

    const distintos = grupo.get(a)?.value !== repetido.value;
    const { camposDistintos, ...otrosErrores } = repetido.errors ?? {};

    if (distintos) {
      repetido.setErrors({ ...otrosErrores, camposDistintos: true });
    } else if (camposDistintos) {
      repetido.setErrors(Object.keys(otrosErrores).length ? otrosErrores : null);
    }

    return distintos ? { camposDistintos: true } : null;
  };
