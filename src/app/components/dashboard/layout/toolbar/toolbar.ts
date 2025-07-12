import { Component, EventEmitter, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import {  inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth, User, signOut } from '@angular/fire/auth';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatMenuModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.css'
})
export class Toolbar {
  @Output() menu = new EventEmitter<void>();
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