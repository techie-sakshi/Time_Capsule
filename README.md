# TimeCapsule

A modern web app to create and send messages to your future self.  
Users can create capsules containing text, images, voice messages,videos that unlock on a specified future date.

---

## Features

- User Authentication with Firebase Auth (Google, Email, etc.)
- Create Time Capsules with:
  - Text messages
  - Image uploads (via Cloudinary)
  - Voice recordings
  - Video recordings
- Capsules unlock on a scheduled future date/time
- Real-time updates with Firestore
- Filter and sort capsules by unlock date and status
- Download unlocked capsules
- Dark mode toggle and sleek neon/glow UI design with Tailwind CSS
- Email notifications when a capsule unlocks (via EmailJS)

---

## Demo

[Live Demo Link](https://time-capsule-iota-ivory.vercel.app/)

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS  
- **Backend:** Firebase (Firestore, Authentication)  
- **Storage:** Cloudinary (for image uploads)  
- **Email Service:** EmailJS  
- **Other:** React hooks, Context API, and custom components for smooth UX

---

## Getting Started

### Prerequisites

- Node.js >= 16.x  
- Firebase account  
- Cloudinary account  
- EmailJS account  

### Installation

1. Clone the repo:

git clone https://github.com/techie-sakshi/Time_Capsule
cd timecapsule

2. Install dependencies:
    npm install

3. Create a .env.local file in the project root and add your credentials:
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

4. Run the development server:
    npm run dev
Open http://localhost:3000 to view in the browser.

Usage

    Sign up or log in using Firebase Authentication

    Create new time capsules with messages and media

    Set unlock date/time

    View upcoming capsules and those unlocked

    Download unlocked messages or receive email notifications when capsules unlock

Folder Structure
    /components    - React UI components  
    /pages         - Next.js pages  
    /lib           - Firebase and other utility configs  
    /public        - Static assets  
    /styles        - Tailwind CSS and custom styles 
