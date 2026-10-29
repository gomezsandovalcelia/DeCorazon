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

// Datos del formulario de alta de paciente (el rol lo fija el backend)
export interface NuevoPaciente {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  altura?: number | null;
}
