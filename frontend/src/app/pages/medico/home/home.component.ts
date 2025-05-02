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
  pacientes: any[] = []; // Lista de pacientes
  medicoId: string = ''; // ID del médico
  alertas: any[] = [];
  loading: boolean = true;
  pacientesConAlertas: { [key: string]: boolean } = {}; 
  
  constructor( 
    private respuestaService: RespuestaService, 
    private medicoService: MedicoService, 
    private router: Router
  ) { }
  
  ngOnInit() {
    this.medicoId = localStorage.getItem('userId') || ''; 
    console.log('ID del médico:', this.medicoId); 
    
    if (this.medicoId) {
      this.getPacientes();
    } else {
      console.error('No se encontró el ID del médico en localStorage');
    }
    
    this.cargarAlertas();
    
    // Configurar actualización periódica cada 5 minutos
    setInterval(() => {
      this.verificarAlertasPacientes();
      this.cargarAlertas();
    }, 5 * 60 * 1000);
  }
  
  getPacientes() {
    this.loading = true;
    this.medicoService.getPacientesAsignados(this.medicoId).subscribe(
      (response) => {
        if (response.ok) {
          this.pacientes = response.pacientes;
          console.log('Pacientes asignados:', this.pacientes);
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

  verificarAlertasPacientes() {
    console.log('Verificando alertas para', this.pacientes.length, 'pacientes');
    
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
          console.log('Pacientes con alertas:', this.pacientesConAlertas);
        }
      );
    }
  }

  pacienteTieneAlertas(pacienteId: string): boolean {
    return this.pacientesConAlertas[pacienteId] || false;
  }
  
  verDetallePaciente(pacienteId: string) {
    console.log('Navegando a detalle de paciente:', pacienteId);
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
    
    // Evaluar peso (asumiendo valores normales entre 50-90kg)
    const peso = ultimaMedicion.weight;
    if (peso >= 50 && peso <= 90) {
      puntuacion += 33; // Peso normal
    } else if (peso >= 40 && peso < 50) {
      puntuacion += 20; // Bajo peso
    } else if (peso > 90 && peso <= 110) {
      puntuacion += 20; // Sobrepeso
    } else {
      puntuacion += 10; // Peso preocupante
    }
    
    // Evaluar frecuencia cardíaca (normal: 60-100 ppm)
    const frecuencia = ultimaMedicion.heart_rate;
    if (frecuencia >= 60 && frecuencia <= 100) {
      puntuacion += 33; // Frecuencia normal
    } else if ((frecuencia >= 50 && frecuencia < 60) || (frecuencia > 100 && frecuencia <= 110)) {
      puntuacion += 20; // Ligeramente anormal
    } else {
      puntuacion += 10; // Frecuencia preocupante
    }
    
    // Evaluar presión arterial
    // Formato esperado: "120/80"
    const presion = ultimaMedicion.blood_pressure;
    try {
      const [sistolica, diastolica] = presion.split('/').map(Number);
      
      // Evaluar presión sistólica (normal: 90-120)
      if (sistolica >= 90 && sistolica <= 120) {
        puntuacion += 17; // Normal
      } else if (sistolica > 120 && sistolica <= 139) {
        puntuacion += 10; // Prehipertensión
      } else if (sistolica > 139) {
        puntuacion += 5; // Hipertensión
      } else if (sistolica < 90) {
        puntuacion += 5; // Hipotensión
      }
      
      // Evaluar presión diastólica (normal: 60-80)
      if (diastolica >= 60 && diastolica <= 80) {
        puntuacion += 17; // Normal
      } else if (diastolica > 80 && diastolica <= 89) {
        puntuacion += 10; // Prehipertensión
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
  
  cargarAlertas(): void {
    this.loading = true;
    this.respuestaService.getAlertas().subscribe(
      (res) => {
        if (res.ok) {
          this.alertas = res.alertas;
          console.log('Alertas cargadas:', this.alertas.length);
        } else {
          console.error('Error obteniendo alertas:', res.msg);
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error en la petición de alertas:', error);
        this.loading = false;
      }
    );
  }
}