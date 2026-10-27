import { SaludService } from './salud.service';

describe('SaludService', () => {
  let servicio: SaludService;

  beforeEach(() => {
    servicio = new SaludService();
  });

  it('calcula el IMC con dos decimales', () => {
    expect(servicio.calcularIMC(175, 70)).toBe(22.86);
  });

  it('devuelve null si falta la altura o el peso', () => {
    expect(servicio.calcularIMC(undefined, 70)).toBeNull();
    expect(servicio.calcularIMC(175, undefined)).toBeNull();
  });

  it('clasifica el IMC según la OMS', () => {
    expect(servicio.obtenerCategoriaIMC(17)).toBe('Bajo peso');
    expect(servicio.obtenerCategoriaIMC(22)).toBe('Peso normal');
    expect(servicio.obtenerCategoriaIMC(27)).toBe('Sobrepeso');
    expect(servicio.obtenerCategoriaIMC(32)).toBe('Obesidad grado 1');
    expect(servicio.obtenerCategoriaIMC(37)).toBe('Obesidad grado 2');
    expect(servicio.obtenerCategoriaIMC(42)).toBe('Obesidad grado 3');
  });

  it('asigna la clase de color del IMC', () => {
    expect(servicio.getClaseIMC(null)).toBe('');
    expect(servicio.getClaseIMC(22)).toBe('text-success');
    expect(servicio.getClaseIMC(27)).toBe('text-warning');
    expect(servicio.getClaseIMC(31)).toBe('text-danger');
    expect(servicio.getClaseIMC(17)).toBe('text-danger');
  });

  it('elige la medición más reciente', () => {
    const mediciones = [
      { date: '2024-01-01T00:00:00Z', weight: 70, heart_rate: 70, blood_pressure: '120/80' },
      { date: '2024-03-01T00:00:00Z', weight: 72, heart_rate: 70, blood_pressure: '120/80' },
      { date: '2024-02-01T00:00:00Z', weight: 71, heart_rate: 70, blood_pressure: '120/80' }
    ];
    expect(servicio.ultimaMedicion(mediciones)?.weight).toBe(72);
    expect(servicio.ultimaMedicion([])).toBeUndefined();
  });

  it('da la puntuación máxima a una medición en rango normal', () => {
    const medicion = { date: '', weight: 70, heart_rate: 70, blood_pressure: '115/75' };
    expect(servicio.evaluarEstadoSalud(medicion, 175)).toBe(100);
  });

  it('penaliza una medición fuera de rango', () => {
    const medicion = { date: '', weight: 130, heart_rate: 130, blood_pressure: '160/100' };
    expect(servicio.evaluarEstadoSalud(medicion, 175)).toBe(5 + 2 + 10 + 5 + 5);
  });

  it('compensa la falta de altura y de presión válida', () => {
    const medicion = { date: '', weight: 70, heart_rate: 70, blood_pressure: '' };
    expect(servicio.evaluarEstadoSalud(medicion)).toBe(25 + 8 + 30 + 10);
  });
});
