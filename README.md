# RamanainHYD — Vercel Portfolio

This version preserves the existing Framefolio public design and admin dashboard while moving the backend to Vercel serverless API routes, Supabase (database + admin authentication), and Cloudinary (video/image storage and delivery).

## 1. Create the services

1. Create a Supabase project at https://supabase.com.
2. In Supabase > SQL Editor, run the complete contents of `supabase-schema.sql`.
3. In Supabase > Authentication > Users, create one admin user with your chosen email and password. Disable public sign-ups if enabled. Use this same email in `ADMIN_EMAIL`.
4. In Supabase > Project Settings > API, copy the Project URL, anon/public key, and service_role key. Keep the service_role key private.
5. Create a Cloudinary account at https://cloudinary.com. From the Cloudinary dashboard, copy the cloud name, API key, and API secret.

## 2. Configure environment variables in Vercel

Import this folder/repository into Vercel. Set these variables in Project Settings > Environment Variables (Production, Preview and Development as needed):

- `SUPABASE_URL` — Supabase Project URL
- `SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service_role key (SECRET; server only)
- `ADMIN_EMAIL` — exact email of the Supabase admin user
- `SESSION_SECRET` — long random string, at least 32 random characters
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret (SECRET; server only)
- `SITE_URL` — your deployed site origin, e.g. `https://your-project.vercel.app`

Do not add secrets to frontend code, GitHub, or any `VITE_`/`NEXT_PUBLIC_` variable. Redeploy after adding variables.

## 3. Deploy

1. Push the contents of this folder to a GitHub repository (do not upload `node_modules`, `.env`, or credentials).
2. In Vercel, choose Add New > Project and import the repository.
3. Framework Preset: Other. Root Directory: `.` (or the folder containing this package.json). Build Command: leave blank. Output Directory: `public`.
4. Add all environment variables above and deploy.
5. Open `https://YOUR-DOMAIN/` for the public portfolio and `https://YOUR-DOMAIN/admin` for the private dashboard.

## Local development

Copy `.env.example` to `.env`, fill in the values, then run `npm install` and `npm run dev`. Requires Node.js 20+. Do not commit `.env`.

## Notes and limitations

- Existing locally stored `data/portfolio.json` and `uploads/` files are not automatically migrated. Re-add projects through the admin dashboard after deployment, or migrate them manually to Cloudinary and Supabase.
- Cloudinary upload is signed by the server. The browser never receives the API secret.
- The public site uses a visible RamanainHYD overlay watermark and disables common download affordances. This is deterrence, not DRM: browser media can still be captured or extracted. For stronger protection, upload permanently watermarked preview exports and use Cloudinary authenticated delivery / signed playback for private originals.
- Deleting a project removes its database record. Its Cloudinary asset may remain in your Cloudinary account and can be deleted from the Cloudinary Media Library.
- The service-role key is highly privileged. Keep it only in Vercel server environment variables. The database tables have RLS enabled and no direct anon/authenticated access.
- Vercel functions are stateless; media and portfolio data live in Cloudinary and Supabase, not local disk.
