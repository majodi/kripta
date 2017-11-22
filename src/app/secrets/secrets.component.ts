import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { AngularFirestore } from 'angularfire2/firestore';

import { Secrets } from '../models/secrets';
import { AuthService } from '../providers/auth.service';
import { DbService } from '../providers/db.service';

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.css']
})
export class SecretsComponent implements OnInit {
  secrets: Array<Secrets> = []
  secret: Secrets
  
  constructor(
    private db: DbService,
    private as: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.as.authState.subscribe(user => {
      console.log('0-', user.uid)
      // this.db.collection<Secrets>('secrets', ref => ref.limit(300).where('uid','==',user.uid))

      this.db.secretCollectionRef
      .stateChanges(['added']).map(secrets => {
        {
          secrets.forEach(secret => {
              const data = secret.payload.doc.data() as Secrets //decrypt before adding to the view
              const id = secret.payload.doc.id
              this.secrets.push({id, ...data})
          })
        }}).subscribe()
    })
  }

  addSecret() {
    this.secret = <Secrets>{}
    let dialogRef = this.openDialog(this.secret)
    dialogRef.afterClosed().subscribe(result => {
      console.log(result, this.secret)
      if(result=='save'){
        this.db.addSecret(this.secret) //encrypt before DB write in service
      }
    })
    dialogRef.keydownEvents().subscribe(k => {
      if(k.key=='Enter'){
        dialogRef.close('save')
      }
    })
  }

  updateSecret(i) {
    let secret = this.secrets[i]
    let savedSecret = Object.assign({}, secret);
    let dialogRef = this.openDialog(secret)
    dialogRef.afterClosed().subscribe(result => {
      if(result=='save'){
        this.db.updateSecret(secret) //encrypt before DB write in service
      } else {
        if(result=='delete'){
          this.db.deleteSecret(secret.id).then(v => {
            this.secrets.splice(i, 1) //remove from view when successful
          })
        } else {
          this.secrets[i] = savedSecret //dialog cancelled          
        }
      }
    });
    dialogRef.keydownEvents().subscribe(k => {
      if(k.key=='Enter'){
        dialogRef.close('save')
      }
    })
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
  deleteState = false
  passwordHide = true  

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if(Object.keys(data).length === 0 && data.constructor === Object){
      this.newrecord = true
    }
  }

}
