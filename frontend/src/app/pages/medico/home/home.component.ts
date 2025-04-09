import { Component, OnInit } from '@angular/core';
import { MedicoService } from 'src/app/services/medico.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {
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
}
