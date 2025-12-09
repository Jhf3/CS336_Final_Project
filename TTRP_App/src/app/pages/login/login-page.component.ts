import { Component } from '@angular/core';
import { Login } from '../../components/login/login';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [Login],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {

}