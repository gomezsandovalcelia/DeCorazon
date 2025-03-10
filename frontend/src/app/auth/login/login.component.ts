import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { loginForm } from 'src/app/interfaces/login-form.interface';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {

  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(private http: HttpClient, private navCtrl: NavController, private fb: FormBuilder, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    console.log('LoginComponent initialized');
  }

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      if (email && password) {
        this.authService.login({ email, password } as loginForm).subscribe((res: any) => {
          console.log('respuesta al sub:', res);
          //AQUI ALMACENAMOS EL TOKEN EN EL LOCALSTORAGE
          localStorage.setItem('token', res.token);
          localStorage.setItem('pacienteId', res._id);
          localStorage.setItem('rol', res.rol);
          localStorage.setItem('showForm', 'true');
          localStorage.setItem('preguntadeldia', 'true');
          this.router.navigateByUrl('/home');
        }, (err) => {
          console.warn('error respuesta api');
          Swal.fire({ 
            title: 'Error',
            text: 'Usuario o contraseña incorrectos',
            icon: 'error',
            confirmButtonText: 'Ok',
            heightAuto: false
          });
        });
      }
    } else {
      console.log('ta mal');
    }
  }
}
