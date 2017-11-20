import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './providers/auth.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Kripta';

  constructor(
    private router: Router,
    private as: AuthService
  ) {}

  ngOnInit(): void {
    this.as.authState.subscribe(user => {
      console.log('authState change', user)
      if(user){
        console.log('statechange navigate to secrets')
        this.secrets()
      } else {
        this.login()
      }
    })  
  }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.as.logout()
  }

  secrets() {
    this.router.navigate(['/secrets']);
  }
}
