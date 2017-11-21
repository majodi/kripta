import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MatDialogModule, MatListModule, MatCardModule, MatButtonModule, MatMenuModule, MatToolbarModule, MatIconModule } from '@angular/material';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AuthService } from './providers/auth.service';
import { AppRoutingModule } from './app-routing.module';
import { SecretsComponent } from './secrets/secrets.component';
import { LoginComponent } from './login/login.component';
import { DialogUpdateSecretDialog } from './secrets/secrets.component'

@NgModule({
  declarations: [
    AppComponent,
    SecretsComponent,
    LoginComponent,
    DialogUpdateSecretDialog
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    MatDialogModule, MatListModule, MatCardModule, MatButtonModule, MatMenuModule, MatToolbarModule, MatIconModule,
  ],
  entryComponents: [
    DialogUpdateSecretDialog
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
