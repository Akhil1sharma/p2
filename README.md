# Task Reminder Dashboard

A simple and intuitive web-based task reminder dashboard built with Angular and Firebase. This application allows users to manage their daily, weekly, and monthly tasks, mark them as complete, and keep track of their productivity.

## Features

*   **User Authentication:** Secure sign-up and sign-in using Firebase Authentication.
*   **Task Management:**
    *   Add new tasks with titles, descriptions, and due dates.
    *   View all tasks.
    *   Mark tasks as completed.
    *   Delete individual tasks.
*   **Task Filtering:** Filter tasks by "Today", "This Week", "This Month", and "All Tasks".
*   **Responsive Design:** A clean and user-friendly interface that adapts to various screen sizes.

## Technologies Used

*   **Frontend:** Angular (TypeScript)
*   **Backend/Database:** Firebase (Authentication, Firestore)
*   **Styling:** (Assuming Material Design/Angular Material based on `mat-` prefixes)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js) or Yarn
*   Angular CLI (`npm install -g @angular/cli`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd task-reminder-dashboard
    ```

2.  **Install npm packages:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Firebase Project:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Create a new Firebase project.
    *   Enable **Firebase Authentication** (e.g., Email/Password provider).
    *   Enable **Cloud Firestore** and choose a location.
    *   **Configure Firestore Security Rules:** Ensure your rules allow authenticated users to read, create, update, and delete their own tasks. Based on our previous discussion, your rules should look something like this:
        ```firestore
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /users/{userId}/tasks/{taskId} {
              allow read: if request.auth != null && request.auth.uid == userId;
              allow create, update: if request.auth != null &&
                                      request.auth.uid == userId &&
                                      request.resource.data.userId == userId;
              allow delete: if request.auth != null && request.auth.uid == userId;
            }
            match /users/{userId} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            match /{document=**} {
              allow read, write: if false;
            }
          }
        }
        ```
        **Important:** Publish these rules in your Firebase Console.

4.  **Add Firebase Configuration to your Angular App:**
    *   In your Firebase project settings, find your web app's configuration. It will look like this:
        ```javascript
        const firebaseConfig = {
          apiKey: "YOUR_API_KEY",
          authDomain: "YOUR_AUTH_DOMAIN",
          projectId: "YOUR_PROJECT_ID",
          storageBucket: "YOUR_STORAGE_BUCKET",
          messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
          appId: "YOUR_APP_ID"
        };
        ```
    *   Create a file named `src/environments/environment.ts` (if it doesn't exist) and `src/environments/environment.prod.ts` and add your Firebase configuration there.
        ```typescript
        // src/environments/environment.ts
        export const environment = {
          production: false,
          firebaseConfig: {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_AUTH_DOMAIN",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_STORAGE_BUCKET",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
          }
        };
        ```
        Do the same for `environment.prod.ts` for production builds.

### Running the Application

To run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Usage

1.  **Sign Up/Sign In:** Create a new account or log in with existing credentials.
2.  **Add Tasks:** Use the input field to add new tasks.
3.  **Manage Tasks:** Mark tasks as complete or delete them individually.
4.  **Filter Tasks:** Use the navigation links to view tasks for "Today", "This Week", "This Month", or "All Tasks".

## Contributing

(Optional: Add guidelines for contributions if you plan to open source this project.)

## License

(Optional: Specify the license under which your project is distributed, e.g., MIT, Apache 2.0)

## Acknowledgements

(Optional: Give credit to any libraries, resources, or individuals that helped you.)
