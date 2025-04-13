// En home.component.ts
import { Component, OnInit } from '@angular/core';
import { MedicoService } from 'src/app/services/medico.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pacientes: any[] = []; // Lista de pacientes
  medicoId: string = ''; // ID del médico
  
  constructor(private medicoService: MedicoService, private router: Router) { }
  
  ngOnInit() {
    this.medicoId = localStorage.getItem('userId') || ''; // Obtén el ID del médico desde localStorage
    console.log('ID del médico:', this.medicoId); // Verifica que el ID se haya obtenido correctamente
    if (this.medicoId) {
      this.getPacientes();
    }
  }
  
  getPacientes() {
    this.medicoService.getPacientesAsignados(this.medicoId).subscribe(
      (response) => {
        if (response.ok) {
          this.pacientes = response.pacientes; // Asigna los pacientes a la propiedad
          console.log('Pacientes asignados:', this.pacientes);
        } else {
          console.error('Error al obtener pacientes:', response.message);
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  
  verDetallePaciente(pacienteId: string) {
    console.log('ID del paciente:', pacienteId); // Verifica que el ID se haya pasado correctamente
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
}