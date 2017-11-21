import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';

import { AngularFirestore } from 'angularfire2/firestore';

import { Secrets } from '../models/secrets';
import { AuthService } from '../providers/auth.service';

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.css']
})
export class SecretsComponent implements OnInit {
  secrets: Array<Secrets> = []
  
  constructor(
    private db: AngularFirestore,
    private as: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.as.authState.subscribe(user => {
      console.log('0-', user.uid)
      // this.db.collection<Secrets>('secrets', ref => ref.limit(300).where('uid','==',user.uid))

      this.db.collection<Secrets>('secrets', ref => ref.limit(300))
      .valueChanges().map(secrets => {
        console.log('1-',secrets)
        {
          secrets.forEach(secret => this.secrets.push(secret))
        }}).subscribe()
        console.log('2-',this.secrets)
    })
  }

  addSecret() {

  }

  updateSecret(i) {
    console.log(this.secrets[i])
    this.dialog.open(DialogUpdateSecretDialog, {data: this.secrets[i]})
  }

}

@Component({
  selector: 'dialog-update-secret-dialog',
  templateUrl: 'dialog-update-secret-dialog.html',
})
export class DialogUpdateSecretDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
