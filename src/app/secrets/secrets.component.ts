import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

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
  secret: Secrets
  
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
    this.secret = <Secrets>{}
    this.openDialog(this.secret)
    .afterClosed().subscribe(result => {
      console.log(result, this.secret)
      if(result=='save'){
        //encrypt and save/add
      }
    })
  }

  updateSecret(i) {
    this.openDialog(this.secrets[i])
    .afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if(result=='save'){
        //encrypt and save
      } else {
        if(result=='delete'){
          //delete
        }
      }
    });
  }

  openDialog(data) {
    return this.dialog.open(DialogUpdateSecretDialog,
      {
        data: data,
        height: '400px',
        width: '600px',
      }
    )
  }

}

@Component({
  selector: 'dialog-update-secret-dialog',
  templateUrl: 'dialog-update-secret-dialog.html',
  styles: ['.form-container {display: flex; flex-direction: column;} .form-container > * {width: 100%;}']
})
export class DialogUpdateSecretDialog {
  newrecord = false

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if(Object.keys(data).length === 0 && data.constructor === Object){
      this.newrecord = true
    }
  }

}
