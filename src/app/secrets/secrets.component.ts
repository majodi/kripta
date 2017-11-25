import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { AngularFirestore } from 'angularfire2/firestore';

import { Secret } from '../models/secrets';
import { AuthService } from '../providers/auth.service';
import { DbService } from '../providers/db.service';
import { CryptoService } from '../providers/crypto.service';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  public transform(values: Secret[], filter: string): any[] {
    if (!values || !values.length) return [];
    if (!filter) return values;

    return values.filter(secret => secret.title.indexOf(filter) >= 0);
  }
}
//|| (secret.payload.subtitle.indexOf(filter) >= 0) || (secret.payload.url.indexOf(filter) >= 0) || (secret.payload.note.indexOf(filter) >= 0))

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.css']
})
export class SecretsComponent implements OnInit {
  secrets: Array<Secret> = []
  secret: Secret
  search: string = ''
  
  constructor(
    private db: DbService,
    private as: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {this.db.getSecrets(this.secrets)}

  addSecret() {
    this.secret = <Secret>{uid: this.as.user.uid, payload: {}}
    let dialogRef = this.openDialog(this.secret)
    dialogRef.afterClosed().subscribe(result => {
      if(result=='save'){
        this.db.addSecret(this.secret)
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
      if((k.key=='Enter') && (k.target.tagName!='TEXTAREA')){
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
  // styles: ['.form-container {display: flex; flex-direction: column;} .form-container > * {width: 100%;} .tooshort {color:red}']
  styles: [`
  .form-container {display: flex; flex-direction: column;}
  .form-container > * {width: 100%;}
  .verystrong{color: greenyellow}
  .strong{color: lightgreen}
  .average{color: gold}
  .weak{color: salmon}
  .tooshort{color: red}
`],
})
export class DialogUpdateSecretDialog {
  newrecord = false
  deleteState = false
  passwordHide = true
  passwordStrength = ''

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cs: CryptoService
  ) {
    if(Object.keys(data).length === 0 && data.constructor === Object){
      this.newrecord = true
    }
  }

  noteEnterKey(e) {
    console.log('enter key')
    e.preventDefault()
  }

  passwordScore(e) {
    this.passwordStrength = this.cs.checkPasswordStrength(e.target.value)
  }

  copyText (text) {
    let element = document.createElement('textarea');
    element.value = text;
    document.body.appendChild(element);
    element.focus();
    element.setSelectionRange(0, element.value.length);
    document.execCommand('copy');
    document.body.removeChild(element);
  }

  openURL(URL){
    window.open(URL)
  }

}
