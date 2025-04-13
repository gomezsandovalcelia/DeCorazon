import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service'; // Ajusta el path según tu estructura

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  role: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.role = this.authService.userRole;
  }
}
