import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthService {
  authState: Observable<firebase.User>
  user: firebase.User

  constructor(private auth: AngularFireAuth) {
    this.authState = auth.authState
    auth.authState.subscribe(user => {
      // if(user) {
        console.log('state: ', user); this.user = user        
      // }
    })
  }

  loginGoogle() {
    return this.auth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())
  }

  logout() {
    return this.auth.auth.signOut()
  }

}
