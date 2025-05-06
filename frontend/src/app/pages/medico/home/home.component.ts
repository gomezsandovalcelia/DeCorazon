// home.component.ts - para la vista del médico
import { Component, OnInit } from '@angular/core';
import { MedicoService } from 'src/app/services/medico.service';
import { Router } from '@angular/router';
import { RespuestaService } from 'src/app/services/respuesta.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pacientes: any[] = [];
  medicoId: string = '';
  loading: boolean = true;
  pacientesConAlertas: { [key: string]: boolean } = {};
  
  constructor(
    private respuestaService: RespuestaService,
    private medicoService: MedicoService,
    private router: Router
  ) { }
  
  ngOnInit() {
    this.medicoId = localStorage.getItem('userId') || '';
    
    if (this.medicoId) {
      this.getPacientes();
    } else {
      console.error('No se encontró el ID del médico en localStorage');
    }
    
    // Configurar actualización periódica cada 5 minutos
    setInterval(() => {
      this.verificarAlertasPacientes();
    }, 5 * 60 * 1000);
  }
  
  getPacientes() {
    this.loading = true;
    this.medicoService.getPacientesAsignados(this.medicoId).subscribe(
      (response) => {
        if (response.ok) {
          this.pacientes = response.pacientes;
          // Ordenar pacientes por puntuación (ascendente - los más preocupantes primero)
          this.ordenarPacientesPorEstado();
          this.verificarAlertasPacientes();
        } else {
          console.error('Error al obtener pacientes:', response.message);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error en la solicitud de pacientes:', error);
        this.loading = false;
      }
    );
  }
  
  // Nuevo método para ordenar pacientes
  ordenarPacientesPorEstado() {
    this.pacientes.sort((a, b) => {
      const estadoA = this.evaluarEstadoSalud(a);
      const estadoB = this.evaluarEstadoSalud(b);
      
      // Ordenar de menor a mayor puntuación (más preocupante a menos preocupante)
      return estadoA.puntuacion - estadoB.puntuacion;
    });
  }

  verificarAlertasPacientes() {
    // Si no hay pacientes, no hay nada que verificar
    if (!this.pacientes || this.pacientes.length === 0) {
      return;
    }
    
    // Crear un array de observables para cada paciente
    const verificaciones = this.pacientes.map(paciente => 
      this.respuestaService.verificarAlertasPaciente(paciente._id).pipe(
        map(res => ({ 
          pacienteId: paciente._id, 
          tieneAlertas: res.ok && res.tieneAlertas 
        })),
        catchError(error => {
          console.error(`Error verificando alertas para paciente ${paciente._id}:`, error);
          return of({ pacienteId: paciente._id, tieneAlertas: false });
        })
      )
    );
    
    // Ejecutar todas las verificaciones en paralelo
    if (verificaciones.length > 0) {
      forkJoin(verificaciones).subscribe(
        resultados => {
          // Crear un mapa con los resultados
          this.pacientesConAlertas = {};
          resultados.forEach(resultado => {
            this.pacientesConAlertas[resultado.pacienteId] = resultado.tieneAlertas;
          });
          
          // Reordenar pacientes después de actualizar las alertas
          this.ordenarPacientesPorEstado();
        }
      );
    }
  }

  pacienteTieneAlertas(pacienteId: string): boolean {
    return this.pacientesConAlertas[pacienteId] || false;
  }
  
  verDetallePaciente(pacienteId: string) {
    this.router.navigate(['/medico/detalle-paciente', pacienteId]);
  }

  // Método para evaluar el estado de salud basado en la última medición
  evaluarEstadoSalud(paciente: any): { estado: string, puntuacion: number } {
    if (!paciente.measurements || paciente.measurements.length === 0) {
      return { estado: 'sin-datos', puntuacion: 0 };
    }

    // Obtener la última medición
    const ultimaMedicion = paciente.measurements.slice(-1)[0];
    let puntuacion = 0;
    
    // Evaluar IMC si tenemos altura y peso
    if (paciente.altura && ultimaMedicion.weight) {
      // Calcular IMC: peso(kg) / (altura(m))²
      const alturaEnMetros = paciente.altura / 100;
      const imc = ultimaMedicion.weight / (alturaEnMetros * alturaEnMetros);
      
      // Evaluar el IMC (valores estándar de la OMS)
      if (imc >= 18.5 && imc < 25) {
        puntuacion += 25; // IMC normal
      } else if ((imc >= 17 && imc < 18.5) || (imc >= 25 && imc < 30)) {
        puntuacion += 15; // Bajo peso leve o sobrepeso
      } else if ((imc >= 16 && imc < 17) || (imc >= 30 && imc < 35)) {
        puntuacion += 10; // Bajo peso moderado u obesidad tipo I
      } else {
        puntuacion += 5; // Bajo peso severo u obesidad tipo II o mayor
      }
    } else {
      // Si no tenemos altura, mantenemos la evaluación de peso como antes
      const peso = ultimaMedicion.weight;
      if (peso >= 50 && peso <= 90) {
        puntuacion += 25; // Peso normal
      } else if (peso >= 40 && peso < 50) {
        puntuacion += 15; // Bajo peso
      } else if (peso > 90 && peso <= 110) {
        puntuacion += 15; // Sobrepeso
      } else {
        puntuacion += 5; // Peso preocupante
      }
    }
    // Evaluar frecuencia cardíaca (normal: 60-100 ppm)
    const frecuencia = ultimaMedicion.heart_rate;
    if (frecuencia >= 60 && frecuencia <= 100) {
      puntuacion += 25; // Frecuencia normal
    } else if ((frecuencia >= 50 && frecuencia < 60) || (frecuencia > 100 && frecuencia <= 110)) {
      puntuacion += 15; // Ligeramente anormal
    } else {
      puntuacion += 5; // Frecuencia preocupante
    }
    
    // Evaluar presión arterial
    const presion = ultimaMedicion.blood_pressure;
    try {
      const [sistolica, diastolica] = presion.split('/').map(Number);
      
      // Evaluar presión sistólica (normal: 90-120)
      if (sistolica >= 90 && sistolica <= 120) {
        puntuacion += 25; // Normal
      } else if (sistolica > 120 && sistolica <= 139) {
        puntuacion += 15; // Prehipertensión
      } else if (sistolica > 139) {
        puntuacion += 5; // Hipertensión
      } else if (sistolica < 90) {
        puntuacion += 5; // Hipotensión
      }
      
      // Evaluar presión diastólica (normal: 60-80)
      if (diastolica >= 60 && diastolica <= 80) {
        puntuacion += 25; // Normal
      } else if (diastolica > 80 && diastolica <= 89) {
        puntuacion += 15; // Prehipertensión
      } else if (diastolica > 89) {
        puntuacion += 5; // Hipertensión
      } else if (diastolica < 60) {
        puntuacion += 5; // Hipotensión
      }
    } catch (e) {
      puntuacion += 10; // Error en el formato, asignamos puntuación mínima
    }
    
    // Determinar el estado basado en la puntuación
    let estado = '';
    if (puntuacion < 40) estado = 'alarmante';
    else if (puntuacion < 60) estado = 'inestable';
    else if (puntuacion < 75) estado = 'normal';
    else estado = 'bien';
    
    return { estado, puntuacion };
  }

  // Método para obtener la etiqueta del estado
  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'bien': return 'Bien';
      case 'normal': return 'Normal';
      case 'inestable': return 'Inestable';
      case 'alarmante': return 'Alarmante';
      default: return 'Sin datos';
    }
  }
  
  // Calcular IMC para un paciente
  calcularIMC(paciente: any): number {
    if (!paciente.altura || !paciente.measurements || paciente.measurements.length === 0) {
      return 0;
    }
    
    const peso = paciente.measurements.slice(-1)[0].weight;
    const alturaEnMetros = paciente.altura / 100;
    return peso / (alturaEnMetros * alturaEnMetros);
  }

  // Obtener estado textual del IMC
  getEstadoIMC(imc: number): string {
    if (imc === 0) return 'No disponible';
    if (imc < 16) return 'Delgadez severa';
    if (imc < 17) return 'Delgadez moderada';
    if (imc < 18.5) return 'Delgadez leve';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidad tipo I';
    if (imc < 40) return 'Obesidad tipo II';
    return 'Obesidad tipo III';
  }
}