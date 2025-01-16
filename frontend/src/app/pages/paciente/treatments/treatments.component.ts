import { Component, OnInit } from '@angular/core';
import { PacienteService } from 'src/app/services/paciente.service';

@Component({
  selector: 'app-treatments',
  templateUrl: './treatments.component.html',
  styleUrls: ['./treatments.component.scss'],
})
export class TreatmentsComponent  implements OnInit {
  treatments: any[] = [];
  constructor(private pacienteService: PacienteService) { }

  ngOnInit() {
    const pacienteId = localStorage.getItem('pacienteId'); 
    if (pacienteId) {
      this.getTreatments(pacienteId);
    }
  }

  
  private getTreatments(pacienteId: string): void {
    this.pacienteService.getTreatments(pacienteId).subscribe(
      (response: any) => {
        if (response.ok && Array.isArray(response.treatments)) {
          this.treatments = response.treatments
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
            .slice(0, 3);
        } else {
          console.error('No se pudieron obtener los tratamientos o el formato es incorrecto.');
          this.treatments = [];
        }
      },
      (error) => {
        console.error('Error al obtener tratamientos:', error);
        this.treatments = [];
      }
    );
  }

}
