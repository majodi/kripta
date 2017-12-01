import { Injectable } from '@angular/core';

import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore, DocumentChangeAction, Action } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Rx';

import { Secret, EncSecret, Payload } from '../models/secrets';
import { AuthService } from '../providers/auth.service';
import { CryptoService } from '../providers/crypto.service';
import { Observable } from 'rxjs/Observable';

type FsAction = "added" | "modified" | "removed";

@Injectable()
export class DbService {
  export$ = new Subject<string>()
  secrets$: Observable<Secret[]>

  constructor(
    private db: AngularFirestore,
    private as: AuthService,
    private cs: CryptoService) {}

  vaultEmpty() {
    return this.db.collection<Secret>('secrets', ref => ref.where('uid','==',this.as.user.uid).limit(1)).valueChanges().map(v => {return v.length < 1})
  }

  getSecrets(secretsArray: Array<Secret>) {
    return this.db.collection<Secret>('secrets', ref => ref.where('uid','==',this.as.user.uid).limit(300).orderBy('last_access','desc'))
    .stateChanges().map(secrets => {
        secrets.forEach(secret => {
          this.getDecodedData(secret).then(decData => {
            if(decData) this.updateLocalArray(secretsArray, decData, secret.type);
          })
        })
        return secretsArray
    })
  }

  updateLocalArray(secretsArray: Array<Secret>, decData: Secret, action: FsAction) {
    if(decData){
      if(action=='added') secretsArray.push(decData)
      else {
        let obj = secretsArray.find((o, i) => {
          if(o.id === decData.id) {
            if(action=='modified') secretsArray[i] = decData
            else secretsArray.splice(i,1)
            return true // stop searching
          }
        })
      }
      secretsArray.sort((a,b) => {
        let both = a.last_access.slice(0,19)+b.last_access.slice(0,19)
        let strip = both.replace(/-/gi,'').replace(/T/gi,'').replace(/:/gi,'')
        return (Number(strip.slice(0,14)) - Number(strip.slice(14))) * -1
      })  
    }
  }

  getDecodedData(secret: DocumentChangeAction) {
    let encSecret = secret.payload.doc.data() as EncSecret
    return this.cs.aesGcmDecrypt(encSecret.payload, this.as.password).then(payloadString => {
      let decPayload: Payload = JSON.parse(payloadString)
      let decData: Secret = {id: secret.payload.doc.id, uid: this.as.user.uid, last_access: encSecret.last_access, title: encSecret.title, payload: decPayload}
      return decData
    }).catch(e => {
      this.cs.cryptoError$.next(e)
    })
  }

  addSecret(data: Secret) {
    let payload: string = JSON.stringify(data.payload)
    return this.cs.aesGcmEncrypt(payload, this.as.password).then(encPayload => {
      let now = new Date()
      let encSecret: EncSecret = {uid: this.as.user.uid, last_access:now.toISOString(), title: data.title, payload: encPayload}
      return this.db.collection<EncSecret>('secrets').add(encSecret)
    })
  }

  updateSecret(data: Secret) {
    let payload = JSON.stringify(data.payload)
    return this.cs.aesGcmEncrypt(payload, this.as.password).then(encPayload => {
      let now = new Date()
      let encSecret: EncSecret = {uid: this.as.user.uid, last_access:now.toISOString(), title: data.title, payload: encPayload}
      return this.db.doc<EncSecret>('secrets/' + data.id).update(encSecret)
    })
  }

  updateLastAccess(data: Secret) {
    let now = new Date()
    return this.db.doc<Secret>('secrets/' + data.id).update({last_access:now.toISOString()})
  }

  deleteSecret(id) {
    return this.db.doc<Secret>('secrets/' + id).delete()
  }

}
