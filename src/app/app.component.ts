import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatDialog, MatSnackBar } from '@angular/material';

import * as firebase from 'firebase/app';

import { AuthService } from './providers/auth.service';
import { CryptoService } from './providers/crypto.service';
import { RouterEvent } from '@angular/router/src/events';
import { DbService } from './providers/db.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Kripta'
  photoURL = '../assets/noavatar.png'
  currentUrl = ''
  appStarted = false
  passwordReset = 0

  constructor(
    private router: Router,
    private as: AuthService,
    private db: DbService,
    private crypto: CryptoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    document.addEventListener('visibilitychange', () => {
      if (!this.appStarted && document.visibilityState === 'visible') {
        this.appStart(this.as.user)
      }
      if (document.visibilityState === 'hidden') {
        window.clearTimeout(this.passwordReset)
        this.passwordReset = window.setTimeout(() => {
          if(!this.appStarted){
            this.as.password = ''
            console.log('password empty')
          }
        }, 30000)
        this.appStarted = false
      }
    })

    this.as.authState.subscribe(user => {
      this.appStart(user)
    })

    this.as.password$.subscribe(password => {
      if(password && password != ''){
        this.secrets()        
      }
    })

    this.crypto.cryptoError$.subscribe(error => {
      let snackBarRef = this.snackBar.open('Crypto error ('+error+'), is your password correct?', 'Dismiss');
      this.login()
    })

    this.as.signInTimeOut$.subscribe(error => {
      let snackBarRef = this.snackBar.open('Time-out waiting for authentication, please try again?', 'Dismiss');
    })

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        this.currentUrl = event.url
      }
    })

  }

  appStart(user: firebase.User) {
    this.appStarted = true
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

  export() {
    this.db.export$.next('export')
  }

  about() {
    this.dialog.open(DialogAboutDialog,
      {
        height: '400px',
        width: '600px',
      }
    )
  }  

}

@Component({
  selector: 'dialog-about-dialog',
  templateUrl: 'dialog-about-dialog.html',
  styles: [],
})
export class DialogAboutDialog {

  constructor() {}

}
