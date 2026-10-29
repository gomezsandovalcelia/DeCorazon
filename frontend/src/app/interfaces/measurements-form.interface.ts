import { Validators } from '@angular/forms';

export interface measureForm {
    weight: number;
    heart_rate: number;
    blood_pressure: string;
}

// Mismos rangos que valida el backend en PUT /paciente/:id/measurements
export const RANGOS_MEDIDAS = {
    weight: { min: 20, max: 300 },
    heart_rate: { min: 30, max: 250 }
};

export const VALIDADORES_MEDIDAS = {
    weight: [Validators.required, Validators.min(RANGOS_MEDIDAS.weight.min), Validators.max(RANGOS_MEDIDAS.weight.max)],
    heart_rate: [Validators.required, Validators.min(RANGOS_MEDIDAS.heart_rate.min), Validators.max(RANGOS_MEDIDAS.heart_rate.max)],
    blood_pressure: [Validators.required, Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]
};
