import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth, User, signOut } from '@angular/fire/auth';
@Component({
  selector: 'app-home',
  imports: [MatToolbarModule, MatIconModule, MatToolbar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  user: User = this.activatedRoute.snapshot.data['user'];
  auth = inject(Auth);
  constructor() {
    console.log('logged in user', this.user);
    // The user data is already resolved and available in the component
  }
  onSignOut(){
    signOut(this.auth).then(() => {
      this.router.navigate(['/auth/sign-in']);
    }).catch((error) => {
      console.error('Sign-out error:', error);
    });

  }

}
