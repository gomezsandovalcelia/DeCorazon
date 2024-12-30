import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';

import { FormBuilder, FormsModule, Validators } from '@angular/forms';

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

  constructor(private http: HttpClient, private navCtrl: NavController, private fb: FormBuilder) { }

  ngOnInit() {
    console.log('LoginComponent initialized');
  }

  /*customCounterFormatter(length: number, maxlength: number): string {
    return `${length} de ${maxlength} caracteres usados`;
  }*/
  login(){
    console.log(this.loginForm);
    if(this.loginForm.status === 'VALID'){
      console.log('enviar');
    } else {
      console.log('ta mal');
    }
  }
}
