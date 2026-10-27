import { Injectable } from '@angular/core';
import { Measurement } from '../interfaces/paciente.interface';

// Cálculos de salud a partir de las medidas del paciente (IMC y puntuación del estado general).
// Son funciones puras: no dependen del estado de ningún componente.
@Injectable({
  providedIn: 'root'
})
export class SaludService {

  // IMC = peso (kg) / (altura (m))², redondeado a 2 decimales. Null si falta algún dato
  calcularIMC(alturaCm: number | null | undefined, peso: number | null | undefined): number | null {
    if (!alturaCm || !peso) {
      return null;
    }
    const alturaEnMetros = alturaCm / 100;
    return parseFloat((peso / (alturaEnMetros * alturaEnMetros)).toFixed(2));
  }

  // Medición más reciente por fecha, o undefined si no hay ninguna
  ultimaMedicion(mediciones: Measurement[] | undefined): Measurement | undefined {
    if (!mediciones?.length) {
      return undefined;
    }
    return [...mediciones].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  }

  // Categorías de IMC de la OMS
  obtenerCategoriaIMC(imc: number): string {
    if (imc < 18.5) {
      return 'Bajo peso';
    } else if (imc < 25) {
      return 'Peso normal';
    } else if (imc < 30) {
      return 'Sobrepeso';
    } else if (imc < 35) {
      return 'Obesidad grado 1';
    } else if (imc < 40) {
      return 'Obesidad grado 2';
    } else {
      return 'Obesidad grado 3';
    }
  }

  // Clase CSS para colorear el IMC
  getClaseIMC(imc: number | null): string {
    if (imc === null) {
      return '';
    }
    if (imc < 18.5 || imc >= 30) {
      return 'text-danger';
    }
    if (imc >= 25) {
      return 'text-warning';
    }
    return 'text-success';
  }

  // Puntuación orientativa de 0 a 100 del estado general a partir de una medición:
  // peso (hasta 25), IMC (hasta 15), frecuencia cardiaca (hasta 30) y presión arterial (hasta 30)
  evaluarEstadoSalud(medicion: Measurement, alturaCm?: number | null): number {
    let puntuacion = 0;

    // Evaluación del peso
    const peso = medicion.weight;
    if (peso >= 50 && peso <= 90) {
      puntuacion += 25;
    } else if ((peso >= 40 && peso < 50) || (peso > 90 && peso <= 110)) {
      puntuacion += 15;
    } else {
      puntuacion += 5;
    }

    // Evaluación del IMC (si hay altura)
    const imc = this.calcularIMC(alturaCm, peso);
    if (imc === null) {
      puntuacion += 8; // Compensación por la falta de evaluación del IMC
    } else if (imc >= 18.5 && imc < 25) {
      puntuacion += 15;
    } else if ((imc >= 17 && imc < 18.5) || (imc >= 25 && imc < 30)) {
      puntuacion += 10;
    } else if ((imc >= 16 && imc < 17) || (imc >= 30 && imc < 35)) {
      puntuacion += 5;
    } else {
      puntuacion += 2;
    }

    // Evaluación de la frecuencia cardiaca
    const frecuencia = medicion.heart_rate;
    if (frecuencia >= 60 && frecuencia <= 100) {
      puntuacion += 30;
    } else if ((frecuencia >= 50 && frecuencia < 60) || (frecuencia > 100 && frecuencia <= 110)) {
      puntuacion += 20;
    } else {
      puntuacion += 10;
    }

    // Evaluación de la presión arterial (sistólica/diastólica)
    const [sistolica, diastolica] = (medicion.blood_pressure || '').split('/').map(Number);
    if (isNaN(sistolica) || isNaN(diastolica)) {
      puntuacion += 10;
    } else {
      if (sistolica >= 90 && sistolica <= 120) {
        puntuacion += 15;
      } else if (sistolica > 120 && sistolica <= 139) {
        puntuacion += 10;
      } else {
        puntuacion += 5;
      }

      if (diastolica >= 60 && diastolica <= 80) {
        puntuacion += 15;
      } else if (diastolica > 80 && diastolica <= 89) {
        puntuacion += 10;
      } else {
        puntuacion += 5;
      }
    }

    return puntuacion;
  }
}
