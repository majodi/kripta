import { Injectable } from '@angular/core';

import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';

import { Secret, EncSecret, Payload } from '../models/secrets';
import { AuthService } from '../providers/auth.service';
import { CryptoService } from '../providers/crypto.service';

@Injectable()
export class DbService {
  
  constructor(
    private db: AngularFirestore,
    private as: AuthService,
    private cs: CryptoService) {
  }

  getSecrets(secretsArray) {

    this.as.authState.subscribe(user => {
      if(this.as.password !== null && this.as.password !== '' && this.as.user != undefined && this.as.user != null){
        this.db.collection<Secret>('secrets', ref => ref.where('uid','==',this.as.user.uid).limit(300).orderBy('last_access','desc'))
        .stateChanges(['added']).map(secrets => {
          secrets.forEach(secret => {
            const encSecret = secret.payload.doc.data() as EncSecret
            this.cs.aesGcmDecrypt(encSecret.payload, this.as.password).then(payloadString => {
              let decPayload: Payload = JSON.parse(payloadString)
              let decData: Secret = {id: secret.payload.doc.id, uid: this.as.user.uid, last_access: encSecret.last_access, title: encSecret.title, payload: decPayload}
              secretsArray.push(decData)
            }).catch(e => {
              this.cs.cryptoError$.next(e)
            })
          })
        }).subscribe()
      }
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
