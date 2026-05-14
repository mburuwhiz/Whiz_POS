This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables Configuration

In order to run the marketing website and the back-office API endpoints (including Turso Database Sync and Brevo SMTP email processing), you must set up your environment variables.

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual credentials:
   - **TURSO_DATABASE_URL**: The URL to your Turso Database instance (e.g., `libsql://your-database-name.turso.io`).
   - **TURSO_AUTH_TOKEN**: Your Turso database API authentication token.
   - **API_AUTH_KEY**: The generic frontend API key for back-office and POS synchronization authentication. Ensure this key matches the one placed in the POS app's Developer Panel.
   - **ADMIN_EMAIL**: The global admin email to access the dashboard.
   - **ADMIN_PASSWORD**: The global admin password.
   - **BREVO_API_KEY**: Your Brevo API key for transactional emails.
   - **SMTP_HOST**: `smtp-relay.brevo.com` (Default)
   - **SMTP_PORT**: `587` (Default)
   - **SMTP_USER**: Brevo SMTP login email.
   - **SMTP_PASS**: Brevo SMTP master password.
