export interface Measurement {
  date: string;
  weight: number;
  heart_rate: number;
  blood_pressure: string;
}

export interface Patient {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  altura?: number; // Altura en cm
  measurements?: Measurement[];
  treatments?: any[];
  exercise_routines?: any[];
}
