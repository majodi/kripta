import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthService {
  authState: Observable<firebase.User>
  user: firebase.User
  password: string = ''
  password$ = new Subject<string>()
  signInTimeOut$ = new Subject<string>()
  

  constructor(private auth: AngularFireAuth) {
    this.authState = auth.authState
    auth.authState.subscribe(user => {
      this.user = user
    })
  }

  loginGoogle() {
    return this.auth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
  }

  logout() {
    return this.auth.auth.signOut()
  }

}
