import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { MedicoService } from 'src/app/services/medico.service';
import { mensajeError } from 'src/app/helpers/mensaje-error';
import { camposIguales } from 'src/app/helpers/campos-iguales';

// Registro público, solo para médicos: los pacientes los da de alta su médico
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent {
  enviando = false;

  registroForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    repetir: ['', Validators.required]
  }, { validators: camposIguales('password', 'repetir') });

  constructor(private fb: FormBuilder, private medicoService: MedicoService, private router: Router) {}

  registrar() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const { repetir, ...datos } = this.registroForm.getRawValue();
    this.enviando = true;

    this.medicoService.registrarMedico(datos).subscribe({
      next: () => {
        this.enviando = false;
        Swal.fire({
          title: 'Cuenta creada',
          text: 'Ya puedes iniciar sesión con tu correo y contraseña',
          icon: 'success',
          confirmButtonText: 'Vale',
          heightAuto: false
        }).then(() => this.router.navigateByUrl('/login', { replaceUrl: true }));
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire({
          title: 'Error',
          text: mensajeError(err, 'No se pudo crear la cuenta'),
          icon: 'error',
          confirmButtonText: 'Vale',
          heightAuto: false
        });
      }
    });
  }
}
