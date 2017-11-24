import { Injectable } from '@angular/core';

import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';

import { Secret, EncSecret, Payload } from '../models/secrets';
import { AuthService } from '../providers/auth.service';
import { CryptoService } from '../providers/crypto.service';

@Injectable()
export class DbService {
  secretCollectionRef: AngularFirestoreCollection<Secret>
  
  constructor(
    private db: AngularFirestore,
    private as: AuthService,
    private cs: CryptoService) {
    this.secretCollectionRef = db.collection<Secret>('secrets', ref => ref.limit(300))
  }

  getSecrets(secretsArray) {

    this.as.authState.subscribe(user => {  //add if user??
      this.secretCollectionRef
      .stateChanges(['added']).map(secrets => {
        secrets.forEach(secret => {
          const encSecret = secret.payload.doc.data() as EncSecret
          console.log(encSecret)
          this.cs.aesGcmDecrypt(encSecret.payload, 'password').then(payloadString => {
            console.log(payloadString)
            let decPayload: Payload = JSON.parse(payloadString)
            let id = secret.payload.doc.id
            let decData: Secret = {id: secret.payload.doc.id, title: encSecret.title, payload: decPayload}
            secretsArray.push(decData)
          })
        })
      }).subscribe()
    })

  }

  addSecret(data) {
    // return this.db.collection<Secret>('secrets').add(data)
    let payload: string = JSON.stringify(data.payload)
    console.log('pl:',payload)
    this.cs.aesGcmEncrypt(payload, 'password').then(encPayload => {
      let encSecret: EncSecret = {title: data.title, payload: encPayload} //!!! uid: data.uid, 
      return this.db.collection<EncSecret>('secrets').add(encSecret)
    })
  }

  updateSecret(data: Secret) {
    let payload = JSON.stringify(data.payload)
    this.cs.aesGcmEncrypt(payload, 'password').then(encPayload => {
      let encSecret: EncSecret = {title: data.title, payload: encPayload} //!!! uid: data.uid, 
      return this.db.doc<EncSecret>('secrets/' + data.id).update(encSecret)
    })
    // return this.db.doc<Secret>('secrets/' + data.id).update(data)
  }

  deleteSecret(id) {
    return this.db.doc<Secret>('secrets/' + id).delete()
  }

}
