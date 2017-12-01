import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { Subject, Subscription } from 'rxjs/Rx';

import { AuthService } from '../providers/auth.service';
import { DbService } from '../providers/db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<string>()  
  signed_in = false
  sign_inPending = false
  sign_inTimer: number = 0
  vaultEmpty = false
  passwordHide = true
  displayName = ''
  password = ''
  
  constructor(
    private as: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private db: DbService
  ) { }

  ngOnInit() {
    this.signed_in = false
    this.setSignInPending()
    this.displayName = 'unknown'
    this.password = this.as.password
    this.as.authState.takeUntil(this.ngUnsubscribe).subscribe(user => {
      if(user) {
        this.db.vaultEmpty().takeUntil(this.ngUnsubscribe).subscribe(v => {
          this.vaultEmpty = v
        })
        if(this.sign_inTimer > 0){window.clearTimeout(this.sign_inTimer)}
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
    this.setSignInPending(false)                         //reset state to try again
    this.as.signInTimeOut$.next('sign-in time out')      //nog even uitzoeken of tijd te kort is
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
    this.setSignInPending(true)
    this.sign_inTimer = window.setTimeout(() => this.signInTimeOut(), 15000);
    this.as.loginGoogle()
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

  ngOnDestroy() {
    this.ngUnsubscribe.next()
    this.ngUnsubscribe.complete()
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
