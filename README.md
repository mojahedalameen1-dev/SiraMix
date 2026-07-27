# SiraMix

SiraMix is a bilingual resume builder for Arabic and English resumes. It lets users manage two independent resume versions in the same account, preview clean ATS-friendly templates, and export PDF, JPG, DOC, or JSON backups.

## Run Locally

Prerequisites: Node.js 20+

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and add the Firebase web app values.
3. In Firebase Authentication, enable the Google provider and add the deployed
   site domain under **Authorized domains**.
4. Create a Cloud Firestore database, then deploy its security rules with
   `npx firebase-tools deploy --only firestore:rules`.
5. Run the app:
   `npm run dev`
6. Check production build:
   `npm run build`

## Quality Checks

- `npm run typecheck`
- `npm run lint`
- `npm run test`
