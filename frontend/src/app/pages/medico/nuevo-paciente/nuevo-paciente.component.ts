import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { PacienteService } from 'src/app/services/paciente.service';
import { mensajeError } from 'src/app/helpers/mensaje-error';

// Alta de un paciente por su médico. El backend fija rol PACIENTE y lo asigna al médico que lo crea
@Component({
  selector: 'app-nuevo-paciente',
  templateUrl: './nuevo-paciente.component.html',
  styleUrls: ['./nuevo-paciente.component.scss'],
})
export class NuevoPacienteComponent {
  enviando = false;

  pacienteForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    altura: [null as number | null, [Validators.min(50), Validators.max(250)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private pacienteService: PacienteService, private router: Router) {}

  guardar() {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    const { nombre, apellidos, email, altura, password } = this.pacienteForm.getRawValue();
    this.enviando = true;

    this.pacienteService.crearPaciente({
      nombre: nombre!, apellidos: apellidos!, email: email!, password: password!,
      altura: altura || null
    }).subscribe({
      next: () => {
        this.enviando = false;
        Swal.fire({
          title: 'Paciente registrado',
          text: `Comunica a ${nombre} su correo (${email}) y la contraseña para que pueda entrar.`,
          icon: 'success',
          confirmButtonText: 'Vale',
          heightAuto: false
        }).then(() => this.router.navigateByUrl('/medico/dashboard', { replaceUrl: true }));
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire({
          title: 'Error',
          text: mensajeError(err, 'No se pudo registrar al paciente'),
          icon: 'error',
          confirmButtonText: 'Vale',
          heightAuto: false
        });
      }
    });
  }
}
