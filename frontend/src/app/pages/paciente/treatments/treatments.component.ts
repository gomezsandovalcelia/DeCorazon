  import { Component, OnInit } from '@angular/core';
  import { PacienteService } from 'src/app/services/paciente.service';

  @Component({
    selector: 'app-treatments',
    templateUrl: './treatments.component.html',
    styleUrls: ['./treatments.component.scss'],
  })
  export class TreatmentsComponent implements OnInit {
    pastillero: any[] = [];
    pastilleroOrdenado: any[] = [];
    loading: boolean = true;
    error: string | null = null;
    diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    diaActual: string = '';

    constructor(private pacienteService: PacienteService) { }

    ngOnInit() {
      // Obtener el día actual en español
      this.obtenerDiaActual();
      
      const pacienteId = localStorage.getItem('pacienteId');
      
      if (pacienteId) {
        this.getPastillero(pacienteId);
      }
    }
    
    obtenerDiaActual() {
      const hoy = new Date();
      const numeroDia = hoy.getDay(); // 0 es domingo, 1 es lunes, etc.
      
      // Convertir al formato español (donde el primer día es lunes)
      // En JavaScript: 0=Domingo, 1=Lunes, etc.
      // Queremos: 0=Lunes, 1=Martes, etc.
      let indice = numeroDia - 1;
      if (indice < 0) indice = 6; // Si es domingo (0), se convierte a 6
      
      this.diaActual = this.diasSemana[indice];
    }
    
    ordenarPastilleroDesdeDiaActual(pastillero: any[]) {
      // Encontrar el índice del día actual
      const indiceActual = pastillero.findIndex(p => p.day === this.diaActual);
      
      if (indiceActual === -1) return pastillero; // Si no se encuentra, retornar igual
      
      // Reordenar el array para que empiece con el día actual
      const primeraPartePastillero = pastillero.slice(indiceActual);
      const segundaPartePastillero = pastillero.slice(0, indiceActual);
      
      return [...primeraPartePastillero, ...segundaPartePastillero];
    }
      
    private getPastillero(pacienteId: string): void {
      this.loading = true;
      this.pacienteService.getPastillero(pacienteId).subscribe(
        (response: any) => {
          this.loading = false;
          if (response.ok && Array.isArray(response.pastillero)) {
            this.pastillero = response.pastillero;
            // Reordenar el pastillero para que empiece con el día actual
            this.pastilleroOrdenado = this.ordenarPastilleroDesdeDiaActual(response.pastillero);
          } else {
            this.error = 'No se pudo obtener el pastillero o el formato es incorrecto.';
            this.pastilleroOrdenado = [];
          }
        },
        (error) => {
          this.loading = false;
          this.error = 'Error al obtener el pastillero';
          console.error('Error al obtener pastillero:', error);
          this.pastilleroOrdenado = [];
        }
      );
    }
  }