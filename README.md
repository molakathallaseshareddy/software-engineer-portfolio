# Sesha Reddy — React Portfolio

A responsive React portfolio built with Vite. Its profile, experience, projects, education, and certifications are based on the supplied resume. The contact form uses a Vercel serverless function and Gmail SMTP; Gmail credentials are only read by the server.

## Run locally

Install Node.js 20.19+ and npm. For the contact API, configure Gmail first:

1. Enable 2-Step Verification on the Gmail account.
2. Create a Google **App Password** for mail. Do not use your regular Gmail password.
3. Copy `.env.example` to `.env.local` and set `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and optionally `CONTACT_TO_EMAIL`.
4. Run the Vercel development server:

```powershell
cd D:\Python_Portfolie
npm install
Copy-Item .env.example .env.local
notepad .env.local
npx vercel dev
```

The Vercel CLI may ask you to sign in and link the project. Open the local URL it prints. Keep the terminal open while using the site, and press **Ctrl+C** to stop it.

`npm run dev` starts only the Vite frontend; it does not run `/api/contact`, so email submission requires `npx vercel dev`.

To create and preview a production build:

```powershell
npm run build
npm run preview
```

## Deploy on Vercel

1. Push the project to a GitHub repository and import it into Vercel.
2. In **Project → Settings → Environment Variables**, add:
   - `GMAIL_USER` — the sending Gmail address.
   - `GMAIL_APP_PASSWORD` — the Google App Password (keep this secret).
   - `CONTACT_TO_EMAIL` — optional; defaults to `mseshareddy48@gmail.com`.
3. Do not prefix these with `VITE_`, expose them in React, or commit them. Redeploy after adding or changing environment variables.
4. Deploy the project. Vercel builds the Vite site and serves `api/contact.js` at `/api/contact`.

The API validates submissions, checks same-origin requests, rejects the honeypot field, awaits Gmail SMTP delivery, and reports success only after Gmail accepts the message.

GitHub Pages can still host the static portfolio, but it cannot run the email API. Deploy on Vercel for the **Send message** button to deliver email. A custom domain can be added in Vercel's domain settings.

## Update content

- Replace `public/assets/resume.pdf` with the latest resume, retaining the filename.
- Edit portfolio content and React behavior in `src/App.jsx`.
- The React entry point is `src/main.jsx`; styles are in `css/`.
