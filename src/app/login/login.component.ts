import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
// import {HttpClient} from '@angular/common/http';

import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  signed_in = false
  sign_inPending = false
  sign_inTimer: number
  passwordHide = true
  displayName = ''
  password = ''
  
  constructor(
    private as: AuthService,
    private router: Router,
    private dialog: MatDialog,
    // private http: HttpClient
  ) { }

  ngOnInit() {
    this.password = this.as.password
    this.sign_inTimer = window.setTimeout(() => this.signInTimeOut(), 8000);
    this.as.authState.subscribe(user => {
      if(user) {
        window.clearTimeout(this.sign_inTimer)
        this.signed_in = true
        this.setSignInPending(false)
        this.displayName = this.as.user.displayName
      } else {
        this.signed_in = false
        this.setSignInPending()
        this.displayName = 'unknown'
      }
    })
  }

  signInTimeOut() {
    this.setSignInPending()                               //sync pending with localstorage
    if(this.sign_inPending){                              //error after x seconds when we were waiting after sign-in
      this.as.signInTimeOut$.next('sign-in time out')      
    }
  }

  revealSecrets() {
    if((this.password !== null && this.password !== '')){
      this.as.password = this.password
      this.as.password$.next(this.password)  
    }
  }

  learnMore() {
    this.dialog.open(DialogLearnMoreDialog,
      {
        height: '400px',
        width: '600px',
      }
    )
  }

  loginGoogle() {
    this.as.loginGoogle().then(v => {this.setSignInPending(true)})
  }

  logout() {
    this.as.logout()
  }

  setSignInPending(forceState?) {
    if(forceState!=undefined){
      if(forceState==true){
        localStorage.setItem('sign_in_pending', "1");
        this.sign_inPending = true
      } else {
        localStorage.setItem('sign_in_pending', "0");
        this.sign_inPending = false
      }  
    } else {
      if(localStorage.getItem('sign_in_pending')=="1"){
        this.sign_inPending = true
      } else {
        this.sign_inPending = false
      }
    }
  }

}

@Component({
  selector: 'dialog-learn-more-dialog',
  templateUrl: 'dialog-learn-more-dialog.html',
  styles: [],
})
export class DialogLearnMoreDialog {

  constructor() {}

}
