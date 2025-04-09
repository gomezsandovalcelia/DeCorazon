import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';


import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { LoginComponent } from '../auth/login/login.component';
import { RecoveryComponent } from '../auth/recovery/recovery.component';
import { RegistroComponent } from '../auth/registro/registro.component';
import { LandingComponent } from '../auth/landing/landing.component';

const routes: Routes = [
  /*{ path: '', redirectTo: '/landing', pathMatch: 'full' },*/
  { path: 'landing', component: AuthLayoutComponent,
    children: [
      { path: '', component: LandingComponent }
    ]
  },
  { path: 'login', component: AuthLayoutComponent,
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  { path: 'registro', component: AuthLayoutComponent,
    children: [
      { path: '', component: RegistroComponent }
    ]
  },
  { 
    path: '', 
    redirectTo: '/landing', 
    pathMatch: 'full' 
  }
  /*{ path: '**', redirectTo: '/landing'}*/
];


@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
