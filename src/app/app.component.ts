import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatSnackBar } from '@angular/material';

import { AuthService } from './providers/auth.service';
import { CryptoService } from './providers/crypto.service';

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
    private as: AuthService,
    private crypto: CryptoService,
    private snackBar: MatSnackBar
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

    this.crypto.cryptoError$.subscribe(error => {
      // console.log('crypto error:', error)
      let snackBarRef = this.snackBar.open('Crypto error ('+error+'), is your password correct?', 'Dismiss');
      this.login()
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
