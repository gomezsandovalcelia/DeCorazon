import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // Importar IonicModule

import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { RegistroComponent } from './registro/registro.component';
import { LandingComponent } from './landing/landing.component';
import { AppModule } from '../app.module';

@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginComponent,
    RecoveryComponent,
    RegistroComponent,
    LandingComponent
  ],
  exports: [
    AuthLayoutComponent,
    LoginComponent,
    RecoveryComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
