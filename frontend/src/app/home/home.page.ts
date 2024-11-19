import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuariosService } from '../service/usuarios.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private http: HttpClient, private usuarioService: UsuariosService) {}

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe((data) => {
      console.log(data);
    });
  }
}
