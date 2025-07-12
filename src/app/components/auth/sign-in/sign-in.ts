import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http'; // ✅ ADD THIS
import {
  Auth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from '@angular/fire/auth';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css'],
})
export class SignIn {
  authForm!: FormGroup;

  auth = inject(Auth);
  router = inject(Router);
  http = inject(HttpClient); // ✅ ADD THIS
  googleAuthProvider = new GoogleAuthProvider();

  isSubmissionInProgress = false;
  errorMessage: string = '';

  // ✅ ADD WEBHOOK URL
  private webhookUrl = 'https://pleasant-macaw-deadly.ngrok-free.app/webhook-test/8f6008b3-6540-4045-986d-2014bdbbf594'; // Replace with actual URL

  constructor() {
    this.initForm();
  }

  initForm() {
    this.authForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    if (this.authForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmissionInProgress = true;
    this.errorMessage = '';

    signInWithEmailAndPassword(
      this.auth,
      this.authForm.value.email!,
      this.authForm.value.password!
    )
      .then((userCredential) => {
        // ✅ WEBHOOK CALL FOR EMAIL LOGIN
        const user = userCredential.user;
        this.sendWebhookData({
          email: user.email,
          uid: user.uid,
          displayName: user.displayName,
          loginMethod: 'email',
          timestamp: new Date().toISOString(),
          phoneNumber: user.phoneNumber,
        });

        this.redirectToDashboardPage();
      })
      .catch((error) => {
        this.isSubmissionInProgress = false;

        switch (error.code) {
          case 'auth/invalid-email':
            this.errorMessage = 'Invalid email format.';
            break;
          case 'auth/user-not-found':
            this.errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            this.errorMessage = 'Incorrect password.';
            break;
          case 'auth/too-many-requests':
            this.errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            this.errorMessage = 'Sign-in failed. Please try again.';
        }
      });
  }

  onSignInWithGoogle() {
    signInWithPopup(this.auth, this.googleAuthProvider)
      .then((response: any) => {
        // ✅ WEBHOOK CALL FOR GOOGLE LOGIN
        const user = response.user;
        this.sendWebhookData({
          email: user.email,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          loginMethod: 'google',
          timestamp: new Date().toISOString(),
          phoneNumber: user.phoneNumber,
        });

        this.redirectToDashboardPage();
      })
      .catch((error: any) => {
        console.error('Google sign-in error:', error);
        this.errorMessage = 'Google sign-in failed. Please try again.';
      });
  }

  // ✅ WEBHOOK METHOD
  private sendWebhookData(userData: any): void {
    console.log('Sending webhook data:', userData);
    
    this.http.post(this.webhookUrl, userData).subscribe({
      next: (response) => {
        console.log('✅ Webhook success:', response);
      },
      error: (error) => {
        console.error('❌ Webhook failed:', error);
        // Don't show error to user, just log it
      }
    });
  }

  redirectToDashboardPage() {
    this.router.navigate(['/dashboard']);
  }
}