import { Component } from '@angular/core';
import { Login } from '../../components/login/login/login';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [Login],
  template: '<app-login></app-login>',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class LoginPageComponent {
}