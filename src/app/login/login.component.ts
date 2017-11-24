import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  signed_in = false
  passwordHide = true
  displayName = ''
  password = ''
  
  constructor(
    private as: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.password = this.as.password
    this.as.authState.subscribe(user => {
      if(user) {
        this.signed_in = true
        this.displayName = this.as.user.displayName
      } else {
        this.signed_in = false
        this.displayName = 'unknown'
      }
    })
  }

  revealSecrets() {
    if((this.password !== null && this.password !== ''))
    this.as.password = this.password
    this.as.password$.next(this.password)
  }

  loginGoogle() {
    this.as.loginGoogle()
  }

  logout() {
    this.as.logout()
  }

}
