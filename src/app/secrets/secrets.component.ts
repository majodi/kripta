import { Component, ElementRef, Inject, OnInit, OnDestroy, AfterViewInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ObservableMedia } from '@angular/flex-layout'
import { MatProgressSpinner, MatSnackBar, MatGridList, MatDialog, MAT_DIALOG_DATA } from '@angular/material';

import { AngularFirestore } from 'angularfire2/firestore';
import { Subject, Subscription } from 'rxjs/Rx';

import { Secret } from '../models/secrets';
import { AuthService } from '../providers/auth.service';
import { DbService } from '../providers/db.service';
import { CryptoService } from '../providers/crypto.service';

import * as _ from 'lodash';

@Component({
  selector: 'app-secrets',
  templateUrl: './secrets.component.html',
  styleUrls: ['./secrets.component.css']
})
export class SecretsComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject<string>()  
  @ViewChild('grid') grid: MatGridList
  secrets: Array<Secret> = []
  secret: Secret
  search: string = ''
  
  constructor(
    private db: DbService,
    private as: AuthService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private media: ObservableMedia
  ) { }

  ngOnInit() {
    if(this.as.user && this.as.password){
      this.db.getSecrets(this.secrets).takeUntil(this.ngUnsubscribe).subscribe(secrets => {this.secrets = secrets})      
      this.db.export$.takeUntil(this.ngUnsubscribe).subscribe(v => this.exportSecrets())  
    }
  }

  ngAfterViewInit() {
    this.media.subscribe(change => { this.updateGrid(); });
  }

  addSecret() {
    this.secret = <Secret>{uid: this.as.user.uid, payload: {}}
    let dialogRef = this.openDialog(this.secret)
    dialogRef.afterClosed().takeUntil(this.ngUnsubscribe).subscribe(result => {
      if(result=='save'){
        this.db.addSecret(this.secret)
      }
    })
    dialogRef.keydownEvents().takeUntil(this.ngUnsubscribe).subscribe(k => {
      if(k.key=='Enter'){
        dialogRef.close('save')
      }
    })
  }

  updateSecret(i) {
    let secret = this.secrets[i]
    let savedSecret = _.cloneDeep(secret)
    let now = new Date()          
    let dialogRef = this.openDialog(secret)
    dialogRef.afterClosed().takeUntil(this.ngUnsubscribe).subscribe(result => {
      if(result=='save'){
        secret.last_access = now.toISOString()
        this.db.updateSecret(secret)
      } else {
        if(result=='delete'){
          this.db.deleteSecret(secret.id)
        } else {
          savedSecret.last_access = now.toISOString()
          this.db.updateLastAccess(savedSecret)
        }
      }
    });
    dialogRef.keydownEvents().takeUntil(this.ngUnsubscribe).subscribe((k: any) => {
      if((k.key=='Enter') && (k.target.tagName!='TEXTAREA')){
        dialogRef.close('save')
      }
    })
  }

  exportSecrets() {
    let exportJSON = JSON.stringify(this.secrets, null, '....')
    let element = document.createElement('textarea')
    element.value = exportJSON
    document.body.appendChild(element)
    element.focus()
    element.setSelectionRange(0, element.value.length)
    document.execCommand('copy')
    document.body.removeChild(element)
    let snackBarRef = this.snackBar.open('Vault contents copied to clipboard in un-encrypted form!', 'Dismiss');    
  }

  updateGrid(): void {
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
      return 'https://'+url.split('/')[2]+'/favicon.ico'
    } else {
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

  ngOnDestroy() {
      this.ngUnsubscribe.next()
      this.ngUnsubscribe.complete()
  }

}

@Component({
  selector: 'dialog-update-secret-dialog',
  templateUrl: 'dialog-update-secret-dialog.html',
  styleUrls: ['./dialog-update-secret-dialog.css'],
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

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  public transform(values: Secret[], filter: string): any[] {
    if (!values || !values.length) return values//[]; <-- but then we need ngIf in div
    if (!filter) return values;
    filter = filter.toUpperCase()
    return values.filter(secret => {
      return ((secret.title && secret.title.toUpperCase().indexOf(filter) >= 0)||
      (secret.payload.subtitle && secret.payload.subtitle.toUpperCase().indexOf(filter) >= 0)||
      (secret.payload.url && secret.payload.url.toUpperCase().indexOf(filter) >= 0)||
      (secret.payload.note && secret.payload.note.toUpperCase().indexOf(filter) >= 0))});
  }
}

