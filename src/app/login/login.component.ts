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
    this.as.loginGoogle()
  }

  logout() {
    this.as.logout()
  }

  test() {
    // this.http.get('https://www.nickstick.nl/index.html', {responseType: 'text'}).subscribe(data => console.log(data))
    fetch('https://www.nickstick.nl/index.html', {
      mode: 'no-cors'
    })
    .then(r => r.text().then(d => console.log(d)))
    // .then(data => console.log(data))
    // .catch(e => console.log("Booo"))
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
