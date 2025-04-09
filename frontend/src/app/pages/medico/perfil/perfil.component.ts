import { Component, OnInit } from '@angular/core';
import { MedicoService } from 'src/app/services/medico.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  medico: any = {}; // Información del médico
  medicoId: string = ''; // ID del médico

  constructor(private medicoService: MedicoService) {}

  ngOnInit() {
    this.medicoId = localStorage.getItem('userId') || ''; // Obtén el ID del médico desde localStorage
    if (this.medicoId) {
      this.getMedico();
    }
  }

  getMedico() {
    this.medicoService.getMedicoPorId(this.medicoId).subscribe(
      (response) => {
        if (response.ok) {
          this.medico = response.medico; // Almacena la información del médico
          console.log('Información del médico:', this.medico);
        } else {
          console.error('Error al obtener la información del médico:', response.message);
        }
      },
      (error) => {
        console.error('Error en la solicitud:', error);
      }
    );
  }
  logout(){
    console.log('Cerrando sesión');
  }
}