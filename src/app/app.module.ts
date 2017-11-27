import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from "@angular/flex-layout";
// import { HttpClientModule } from '@angular/common/http';
import { MatGridListModule, MatSnackBarModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatListModule, MatCardModule, MatButtonModule, MatMenuModule, MatToolbarModule, MatIconModule } from '@angular/material';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AuthService } from './providers/auth.service';
import { AppRoutingModule } from './app-routing.module';
import { SecretsComponent } from './secrets/secrets.component';
import { FilterPipe } from './secrets/secrets.component';
import { LoginComponent } from './login/login.component';
import { DialogLearnMoreDialog } from './login/login.component';
import { DialogUpdateSecretDialog } from './secrets/secrets.component';
import { CryptoService } from './providers/crypto.service';
import { DbService } from './providers/db.service'

@NgModule({
  declarations: [
    AppComponent,
    SecretsComponent,
    LoginComponent,
    DialogLearnMoreDialog,
    DialogUpdateSecretDialog,
    FilterPipe
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FlexLayoutModule,
    // HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    MatGridListModule, MatSnackBarModule, MatInputModule, MatFormFieldModule, MatDialogModule, MatListModule, MatCardModule, MatButtonModule, MatMenuModule, MatToolbarModule, MatIconModule,
  ],
  entryComponents: [
    DialogUpdateSecretDialog, DialogLearnMoreDialog
  ],
  providers: [AuthService, CryptoService, DbService],
  bootstrap: [AppComponent]
})
export class AppModule { }
