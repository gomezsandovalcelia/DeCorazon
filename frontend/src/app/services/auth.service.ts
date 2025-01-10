import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { loginForm } from '../interfaces/login-form.interface';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private http: HttpClient) { }

  login(formData: loginForm){
    console.log('se ha hecho login:', formData);
    return this.http.post('http://localhost:3000/api/login', formData);
  }
}
