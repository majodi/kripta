import { Injectable } from '@angular/core';

import { AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';

import { Secrets } from '../models/secrets';

@Injectable()
export class DbService {
  secretCollectionRef: AngularFirestoreCollection<Secrets>
  
  constructor(private db: AngularFirestore) {
    this.secretCollectionRef = db.collection<Secrets>('secrets', ref => ref.limit(300))
  }

  addSecret(data) {
    return this.db.collection<Secrets>('secrets').add(data)
  }

  updateSecret(data) {
    return this.db.doc<Secrets>('secrets/' + data.id).update(data)
  }

  deleteSecret(id) {
    return this.db.doc<Secrets>('secrets/' + id).delete()
  }

}
