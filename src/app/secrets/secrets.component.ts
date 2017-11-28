import { Component, ElementRef, Inject, OnInit, AfterViewInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ObservableMedia } from '@angular/flex-layout'
import { MatGridList, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { AngularFirestore } from 'angularfire2/firestore';

import { Secret } from '../models/secrets';
import { AuthService } from '../providers/auth.service';
import { DbService } from '../providers/db.service';
import { CryptoService } from '../providers/crypto.service';

import * as _ from 'lodash';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  public transform(values: Secret[], filter: string): any[] {
    if (!values || !values.length) return values//[]; <-- but then we need ngIf in div
    if (!filter) return values;
    return values.filter(secret => {
      return ((secret.title && secret.title.indexOf(filter) >= 0)||
      (secret.payload.subtitle && secret.payload.subtitle.indexOf(filter) >= 0)||
      (secret.payload.url && secret.payload.url.indexOf(filter) >= 0)||
      (secret.payload.note && secret.payload.note.indexOf(filter) >= 0))});
  }
}

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.css']
})
export class SecretsComponent implements OnInit, AfterViewInit {
  @ViewChild('grid') grid: MatGridList;
  secrets: Array<Secret> = []
  secret: Secret
  search: string = ''
  
  constructor(
    private db: DbService,
    private as: AuthService,
    public dialog: MatDialog,
    private media: ObservableMedia
  ) { }

  ngOnInit() {
    this.db.getSecrets(this.secrets)
  }

  ngAfterViewInit() {
    // ObservableMedia does not fire on init so you have to manually update the grid first.
    // this.updateGrid();
    // console.log(this.grid) <-- shows twice !!! is this a memory leak? (the subscribe twice)
    this.media.subscribe(change => { this.updateGrid(); });
  }

  addSecret() {
    this.secret = <Secret>{uid: this.as.user.uid, payload: {}}
    let dialogRef = this.openDialog(this.secret)
    dialogRef.afterClosed().subscribe(result => {
      if(result=='save'){
        this.db.addSecret(this.secret).then(v => this.sortSecrets())
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
    let savedSecret = _.cloneDeep(secret) //Object.assign({}, secret);
    let dialogRef = this.openDialog(secret)
    dialogRef.afterClosed().subscribe(result => {
      if(result=='save'){
        this.db.updateSecret(secret).then(v => this.sortSecrets())
      } else {
        if(result=='delete'){
          this.db.deleteSecret(secret.id).then(v => {
            this.secrets.splice(i, 1) //remove from view when successful
          })
        } else { //dialog cancelled, put original back with new timestamp, sort local, then write new timestamp to DB
          let now = new Date()          
          savedSecret.last_access = now.toISOString()
          this.secrets[i] = savedSecret
          this.sortSecrets()
          this.db.updateLastAccess(savedSecret)
        }
      }
    });
    dialogRef.keydownEvents().subscribe((k: any) => {
      if((k.key=='Enter') && (k.target.tagName!='TEXTAREA')){
        dialogRef.close('save')
      }
    })
  }

  sortSecrets() {
    this.secrets.sort((a,b) => {
      let both = a.last_access.slice(0,19)+b.last_access.slice(0,19)
      let strip = both.replace(/-/gi,'').replace(/T/gi,'').replace(/:/gi,'')
      return (Number(strip.slice(0,14)) - Number(strip.slice(14))) * -1
    })
  }

  updateGrid(): void {
    // console.log(this.grid, this.media.isActive('sm'))
    if(this.grid){
      if (this.media.isActive('xl')) { this.grid.cols = 5; }
      else if (this.media.isActive('lg')) { this.grid.cols = 4; }
      else if (this.media.isActive('md')) { this.grid.cols = 3; }
      else if (this.media.isActive('sm')) { this.grid.cols = 2; }
      else if (this.media.isActive('xs')) { this.grid.cols = 1; }  
    }
  }

  urlImage(url) {
    if(url == undefined || url.trim() == '') return './favicon.ico'
    if (url.indexOf("://") > -1) {
      // console.log('https://'+url.split('/')[2]+'./favicon.ico')
      return 'https://'+url.split('/')[2]+'/favicon.ico'
    } else {
      // console.log('https://'+url.split('/')[0]+'./favicon.ico')
      return 'https://'+url.split('/')[0]+'/favicon.ico'
    }
  }

  clearSearch() {
    this.search = ''
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
    this.copyText(this.data.payload.password)
    window.open(URL)
  }

}
