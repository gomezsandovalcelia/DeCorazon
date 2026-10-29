import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { PacienteService } from 'src/app/services/paciente.service';
import { AuthService } from 'src/app/services/auth.service';
import { mensajeError } from 'src/app/helpers/mensaje-error';
import { camposIguales } from 'src/app/helpers/campos-iguales';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent  implements OnInit {
  paciente: any = {};
  guardandoPassword = false;

  passwordForm = this.fb.nonNullable.group({
    actual: ['', Validators.required],
    nueva: ['', [Validators.required, Validators.minLength(6)]],
    repetir: ['', Validators.required]
  }, { validators: camposIguales('nueva', 'repetir') });

  constructor(private pacienteService: PacienteService, private authService: AuthService, private fb: FormBuilder) { }

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

  // Al guardar, se vacía el formulario y se cierra el desplegable
  cambiarPassword(desplegable: HTMLDetailsElement) {
    const pacienteId = localStorage.getItem('pacienteId');
    if (this.passwordForm.invalid || !pacienteId) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { actual, nueva } = this.passwordForm.getRawValue();
    this.guardandoPassword = true;

    this.pacienteService.cambiarPassword(pacienteId, actual, nueva).subscribe({
      next: () => {
        this.guardandoPassword = false;
        this.passwordForm.reset();
        desplegable.open = false;
        Swal.fire({
          title: 'Contraseña cambiada',
          text: 'La próxima vez entra con tu contraseña nueva',
          icon: 'success',
          confirmButtonText: 'Vale',
          heightAuto: false
        });
      },
      error: (err) => {
        this.guardandoPassword = false;
        Swal.fire({
          title: 'Error',
          text: mensajeError(err, 'No se pudo cambiar la contraseña'),
          icon: 'error',
          confirmButtonText: 'Vale',
          heightAuto: false
        });
      }
    });
  }

  logout(){
    this.authService.logout();
  }

}
