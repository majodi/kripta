import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { MatDialog, MatSnackBar } from '@angular/material';

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

  constructor(
    private router: Router,
    private as: AuthService,
    private db: DbService,
    private crypto: CryptoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {

    this.as.authState.subscribe(user => {
      // console.log(user)
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
      // console.log('pw:', password)
      if(password && password != ''){
        this.secrets()        
      }
    })

    this.crypto.cryptoError$.subscribe(error => {
      // console.log('crypto error:', error)
      let snackBarRef = this.snackBar.open('Crypto error ('+error+'), is your password correct?', 'Dismiss');
      this.login()
    })

    this.as.signInTimeOut$.subscribe(error => {
      // console.log('timeout error:', error)
      let snackBarRef = this.snackBar.open('Time-out waiting for authentication, please try again?', 'Dismiss');
      // this.login()
    })

    this.router.events.subscribe(event => {
      // console.log('routerevent', event);
      if (event instanceof NavigationEnd ) {
        this.currentUrl = event.url
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
