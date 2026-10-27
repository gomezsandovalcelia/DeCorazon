import { Validators } from '@angular/forms';

export interface measureForm {
    weight: number;
    heart_rate: number;
    blood_pressure: string;
}

// Mismos rangos que valida el backend en PUT /paciente/:id/measurements
export const VALIDADORES_MEDIDAS = {
    weight: [Validators.required, Validators.min(20), Validators.max(300)],
    heart_rate: [Validators.required, Validators.min(30), Validators.max(250)],
    blood_pressure: [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]
};
