import { Component, OnInit } from '@angular/core';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private as: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // console.log('login init')
    // this.as.authState.subscribe(user => {
    //   if(user){
    //     console.log('navigate to secrets')
    //     this.router.navigate(['/secrets']);        
    //   }
    // })
    
  }

  loginGoogle() {
    this.as.loginGoogle()
  }

  logout() {
    this.as.logout()
  }

}
