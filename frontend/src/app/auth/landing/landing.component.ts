import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuariosService } from '../../service/usuarios.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent  implements OnInit {

  constructor(private http: HttpClient, private usuarioService: UsuariosService) { }

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe((data) => {
      console.log(data);
    });
  }

}
