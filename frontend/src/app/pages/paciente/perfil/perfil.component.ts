import { Component, OnInit } from '@angular/core';

import { PacienteService } from 'src/app/services/paciente.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent  implements OnInit {
  paciente: any = {};

  constructor(private pacienteService: PacienteService) { }

  ngOnInit() {
    const pacienteId = localStorage.getItem('pacienteId');
    if (pacienteId) {
      this.getPaciente(pacienteId);
    }
  }

  private getPaciente(pacienteId :string): void {
    if(pacienteId){
      this.pacienteService.getPacientePorId(pacienteId).subscribe(
        (response: any) => {
          if (response.ok && response.paciente) {
            this.paciente = response.paciente;
          } else {
            console.error('No se pudo obtener el paciente.');
            this.paciente = {};
          }
        },
        (error) => {
          console.error('Error al obtener paciente:', error);
          this.paciente = {};
        }
      );
    }
  }

  logout(){
    this.pacienteService.logout();
  }

}
