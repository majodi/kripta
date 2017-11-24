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
  photoURL = '../assets/noavatar.png'

  constructor(
    private router: Router,
    private as: AuthService
  ) {}

  ngOnInit(): void {
    this.as.authState.subscribe(user => {
      console.log(user)
      if(user){
        if(user.photoURL != ''){
          this.photoURL = user.photoURL
        }
        if(this.as.password && this.as.password != ''){
          this.secrets()
        } else {
          this.login()
        }
      } else {
        this.photoURL = '../assets/noavatar.png'
        this.login()
      }
    })
    this.as.password$.subscribe(password => {
      console.log('pw:', password)
      if(password && password != ''){
        this.secrets()        
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
