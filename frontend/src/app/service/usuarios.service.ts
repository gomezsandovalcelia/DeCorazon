import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  apiURL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getUsuarios() {
    return this.http.get(`${this.apiURL}/usuarios`);
  }
}
