# Setup guide: Firebase, Vercel and the admin dashboard

This guide matches the code in this repository. Nothing here has been deployed for you: you create the Firebase project, the Vercel project and the DNS records yourself, in your own accounts.

**What was and was not tested** (details in section 12): the pure logic has real unit tests that passed; the Firestore rules have tests written but they could **not** be run in the environment where this was built, so run them yourself (section 8) before going live; the screens were exercised against an in-memory simulation of Firebase, not your real project.

## 0. How it fits together

```
Visitor's browser ──> Vercel (hosts the React website, static files only)
        │
        └──> Firebase (your project, free Spark plan)
               ├─ Cloud Firestore  volunteerApplications/{id}   public can only CREATE; admins read/review
               │                   admins/{uid}                 allowlist, edited only in the Firebase Console
               └─ Authentication   email + password, for admins only (no public sign-up page)
```

- Hosting is **Vercel**, not Firebase Hosting. No Cloud Functions, no Cloud Storage, no paid email or CAPTCHA service is used.
- The Firebase web settings in `.env.local` are **public** (anyone can see them in the browser). They are not what protects your data. **`firestore.rules` does.**
- The volunteer form uses the lightweight Firestore build (`firebase/firestore/lite`), and the admin area is loaded only when someone opens `/admin`, so ordinary visitors never download the sign-in code.

### Free-tier facts (checked 23 October 2026 on Google's pricing and quota pages; check again before launch)

| Firestore (default database, Spark plan) | Free allowance |
|---|---|
| Stored data | 1 GiB |
| Document reads | 50,000 per day |
| Document writes | 20,000 per day |
| Document deletes | 20,000 per day |
| Network egress | 10 GiB per month |

- Only the **(default)** database gets the free allowance. Do not create a differently named database.
- On Spark you cannot be billed. If a daily limit is reached, Firestore stops answering until it resets (about midnight Pacific time).
- Email/password sign-in is free (the free tier covers 50,000 monthly active users).
- Each admin request makes the rules read your `admins/{uid}` document, which counts as one extra read. Admin use is tiny compared with the allowance.

## 1. Requirements on your computer

- Node.js 20.19 or newer (or 22.12+), with npm
- Git
- Java 11 or newer, only for running the Firestore rules tests with the emulator

## 2. Run the website locally (no Firebase needed yet)

```bash
npm install
npm run dev
```

Open the address shown (normally http://localhost:5173). The public pages work without Firebase. The volunteer form will say "Online registration is not switched on yet" and `/admin/login` will say Firebase is not configured. That is correct: nothing is faked.

## 3. Create the Firebase project

1. Go to https://console.firebase.google.com and choose **Add project**. Use a Google account that belongs to the Foundation, and add a second owner later (Project settings, Users and permissions).
2. You can switch Google Analytics off. Keep the free **Spark** plan; do not add a card.
3. **Register the web app:** Project overview, the `</>` (Web) icon, give it a nickname. Skip "Firebase Hosting".
4. Copy the four values shown in the config snippet: `apiKey`, `authDomain`, `projectId`, `appId`.
5. **Enable email sign-in:** Build, Authentication, Get started, Sign-in method, **Email/Password**, Enable (leave "Email link" off).
6. **Create the database:** Build, Firestore Database, Create database.
   - Choose **Standard edition**, database ID **(default)**.
   - **Choose the region carefully: it cannot be changed later.** Pick one close to your users and admins (for India, Mumbai `asia-south1` or Delhi `asia-south2` are usual choices).
   - Start in **production mode** (the rules below replace the starter rules).
7. **Authorised domains:** Authentication, Settings, Authorized domains. Keep `localhost`, and add your final domain, the `www` version and your Vercel address (section 10). Email/password sign-in itself works from any address, but add them now so that any later redirect-based feature works.

## 4. Local environment variables

```bash
cp .env.example .env.local
```

**For this project the file is already filled in** (`.env.local` in the ZIP holds the four public settings of the `karwaan-foundation` project, and `.firebaserc` already names it). Only if you ever create a different Firebase project, edit `.env.local` and replace the four values with the ones from step 3.4. Never commit `.env.local` (it is already in `.gitignore`). Do not put a service-account key, Admin SDK key or any password into a `VITE_` variable.

Restart `npm run dev` after changing the file.

## 5. Deploy the security rules and indexes

```bash
npx firebase login              # opens your browser; sign in with the Google account that owns the project
# .firebaserc already points to the karwaan-foundation project (use .firebaserc.example for a different project)
npm run deploy:rules            # deploys firestore.rules and firestore.indexes.json
```

- `firestore.indexes.json` defines three composite indexes (status + newest, status + name search, status + email search). They take a few minutes to build. Until they finish, filtered lists in the dashboard fail with an "index" error; wait and retry.
- You can also deploy the rules by pasting `firestore.rules` into Firestore, Rules in the console, but the command keeps the file and the live rules identical.

## 6. Create administrators (the allowlist)

Admin access needs **all** of: a Firebase sign-in account, a **verified email**, and an allowlist document. Do this for each admin:

1. **Create the account:** Authentication, Users, **Add user**, the admin's real email and a strong password that the person chooses. (Never share this password with anyone else, and do not send it to me.)
2. **Copy the User UID** shown in the Users list.
3. **Create the allowlist record:** Firestore Database, **Start collection** `admins` (first time only), **Document ID = the UID you copied**, fields:

   | Field | Type | Value |
   |---|---|---|
   | `email` | string | the same email address (must match the sign-in email) |
   | `role` | string | `admin` |
   | `active` | boolean | `true` |
   | `createdAt` | timestamp | optional |

4. **Verify the email:** the admin opens `https://YOUR-SITE/admin/login`, signs in, and on the "Verify your email address" screen presses **Send verification email**, opens the link in the email, then returns and presses **I have verified my email**. (Accounts created in the console are unverified, and the console cannot mark them verified.)

**To disable an admin:** set `active` to `false` (effective on their next request; their open browser can no longer read or change anything), or delete their `admins/{uid}` document. Also disable the user under Authentication, Users, to stop them signing in at all.

**Limitations of this allowlist (by design, to stay free and function-less):**
- Admins are added and removed by hand in the console. There is no in-app user management.
- Only the **last** review is recorded on an application (`reviewedAt`, `reviewedBy`); there is no full history log.
- The "who can do what" check in React is only for a pleasant screen. The real enforcement is in `firestore.rules`.
- All active admins have the same powers (read, accept, decline, export). There are no finer roles.

## 7. Try it (against your real project)

1. `npm run dev`, open `/volunteer`, fill in the form, wait a few seconds, submit. You should see a thank-you and a reference number like `KF-AB12CD34`. Check Firestore Data: a new document appears in `volunteerApplications` with `status: "pending"`.
2. Open `/admin/login`, sign in as the admin from section 6, and confirm the overview counts match.
3. Open an application, press **Accept**, confirm. In Firestore the document now has `status`, `reviewedAt` and `reviewedBy` (the admin's UID), and nothing else changed.
4. Sign in with an account that is **not** in `admins` (create a test user): it must see "This account cannot use the admin area" and no data.
5. Try **Export CSV** and open the file; delete it afterwards (it contains personal data).

## 8. Run the tests

```bash
npm run test:unit    # 26 tests of the pure logic (validation, payload, anti-spam, admin check, CSV, search)
npm run test:rules   # starts the Firestore emulator and runs the security-rules tests
```

`test:rules` downloads the Firestore emulator the first time (needs internet and Java). It checks that the public can only create valid pending applications, cannot read or change anything, that admins can only change `status`, `reviewedAt` and `reviewedBy`, that unverified, inactive, non-allowlisted and mismatched accounts are refused, and that unknown collections are closed. **These tests were written but not run when this project was built. Run them and fix anything that fails before launch.**

To click through the whole site against local emulators instead of the real project:

```bash
# in .env.local use:  VITE_USE_FIREBASE_EMULATORS=true  and any non-empty values for the four settings
npm run emulators      # terminal 1 (UI at http://127.0.0.1:4000)
npm run dev            # terminal 2
```

In the emulator UI you can add an `admins/{uid}` document and create a user. The emulator prints email links (verification, password reset) in its terminal.

## 9. Search, filters, export: exactly what they do

- **Counts:** read with server-side aggregation (Overview opens, or press Refresh). They are not live-updating.
- **Lists:** 20 per page with "Load more". Views: All, Pending, Accepted, Declined.
- **Search** (waits 400 ms after you stop typing) covers **all** applications in the current view, server-side, but only by **prefix**: the start of the name, the start of the email (type the `@`), or an exact reference number such as `KF-AB12CD34`. It does not search the middle of a name or the written answers.
- **CSV export** downloads everything in the current view and search (500 records per read batch, up to 10,000). It includes names, phone numbers, emails and written answers, and leaves out internal search fields. Cells that start with `=`, `+`, `-` or `@` are neutralised so spreadsheets do not run them as formulas. Each exported record is one Firestore read.

## 10. Deploy on Vercel

Before you start: Vercel's free **Hobby** plan is restricted to non-commercial personal use, and (as reported by Vercel users) cannot connect to a repository owned by a GitHub *organisation*. Read Vercel's current terms and decide which plan fits the Foundation. This guide works on any plan.

1. **Put the code in a Git repository** (GitHub, GitLab or Bitbucket). `.env.local` and `.firebaserc` must not be committed (both are ignored).
2. In Vercel: **Add New, Project**, import the repository.
3. Settings (Vercel normally detects them): **Framework preset** Vite, **Install command** `npm install`, **Build command** `npm run build`, **Output directory** `dist`.
4. **Environment variables** (Settings, Environment Variables), for **Production and Preview**. Use the same four values as in `.env.local` (`.env.local` itself is never uploaded): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` (and `VITE_FIREBASE_APPCHECK_SITE_KEY` only if you enable App Check). Do **not** set `VITE_USE_FIREBASE_EMULATORS` in Vercel. Variables are baked in at build time: after changing one, redeploy.
5. Deploy. Vercel gives you an address like `your-project.vercel.app` (and a unique address for each preview). Add it under Firebase Authorized domains (section 3.7).
6. **Test the preview:** open `/`, refresh on `/about` and `/admin/login` (they must load, thanks to the rewrite in `vercel.json`), submit a test application, sign in as an admin.
7. **Production:** merge to the production branch (normally `main`) or promote the deployment.
8. **Domain:** Vercel, Project, Settings, Domains, add `karwafoundation.in` and `www.karwafoundation.in` (**confirm the spelling first**; the name and email use "karwaan"). Vercel then shows the exact DNS records to create (typically an A record for the apex and a CNAME for `www`). Create **exactly those** at your domain registrar. Do not assume your registrar's existing records; remove only records that conflict, after checking them.
9. **www and redirects:** in Vercel Domains, choose which hostname is the main one; the other redirects to it.
10. Add the final hostnames (apex and `www`) to Firebase Authorized domains, then repeat the section 7 tests on the live address.

`vercel.json` also sends `X-Robots-Tag: noindex` and `Cache-Control: no-store` for `/admin`, and basic security headers for every page.

## 11. Optional: Firebase App Check (anti-abuse)

The form already has light friction (a hidden trap field, a minimum fill time and a one-minute cooldown). **That is not real protection**: anyone who knows your public Firebase settings can call Firestore directly, and the rules (length limits, exact fields, pending status) are what limit the damage. If you see spam, add App Check:

1. Firebase Console, App Check, register your web app with **reCAPTCHA v3** (create a site key at google.com/recaptcha/admin).
2. Put the site key in `VITE_FIREBASE_APPCHECK_SITE_KEY` (local file and Vercel) and redeploy. The code starts App Check automatically when that variable is set.
3. In App Check, watch the metrics for a few days **before** pressing Enforce for Firestore. Enforcing too early blocks real visitors.
- Cost: reCAPTCHA v3 is free at normal volumes, but check Google's current terms. App Check also covers admin sign-in requests once enforced.
- Not tested against a real project when this was built.

## 12. Verification status (what was actually run)

| Area | Status |
|---|---|
| Unit tests (`npm run test:unit`): 26 tests of validation, payload, anti-spam, admin check, search plan, CSV | **Run, all passed** |
| Browser tests of the form, admin sign-in states, dashboard, review, search, paging, CSV (74 checks) | **Run, all passed, but against an in-memory simulation of Firebase**, not Firebase itself |
| Firestore rules tests (`npm run test:rules`) | **Written, NOT run** (no emulator or internet where this was built) |
| Real Firebase project (saving, sign-in, emailed links, rules, indexes) | **Not tested** |
| `npm install` and `npm run build` with the real packages | **Not run** (no internet where this was built); the code was bundled with stand-ins for the libraries |
| Vercel deployment and DNS | **Not done** |
| Package versions in `package.json` (firebase, rules-unit-testing, firebase-tools) | Chosen from memory, **not checked against the registry**; if `npm install` complains, adjust the version |

## 13. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Form says "Online registration is not switched on yet" | `.env.local` missing or still has `YOUR_...` values; restart `npm run dev`. On Vercel: variables missing, then redeploy. |
| Form says the system "did not accept" the submission | The deployed rules rejected it (permission denied). Check that `firestore.rules` is deployed and unchanged, and that the database is `(default)`. |
| Admin login: "The email or password is not correct" | Wrong credentials, or the user does not exist. The message is intentionally the same for both. |
| "Verify your email address" screen | Press Send verification email, open the link, then "I have verified my email". Check spam. |
| "This account cannot use the admin area" | No `admins/{uid}` document, `role` is not `admin`, `active` is not boolean `true`, or the document `email` differs from the sign-in email. The document ID must be the UID. |
| Dashboard errors after a filter or search | The composite indexes are still building (or not deployed). Run `npm run deploy:rules`, wait a few minutes. |
| Dashboard lists load but Accept fails | The rules only allow changing `status`, `reviewedAt`, `reviewedBy`, and the new status must differ from the current one. |
| Counts or reads stop working mid-day | The free daily quota is used up; it resets around midnight Pacific time. |
| `npm run test:rules` fails to start | Java is missing, or the emulator could not download. Install Java 11+ and retry with internet. |
| Pages 404 on refresh on Vercel | `vercel.json` missing from the deployment. Keep it at the project root. |
| Changing an environment variable has no effect on Vercel | Variables are baked in at build time: redeploy. |

## 14. Known limitations and to-do

- The privacy notice on the volunteer page is a **placeholder**; its version (`placeholder-0`, in `src/config/privacy.ts`) is saved with each application. Replace the text and change the version when the final notice exists.
- No email notifications (by design for this phase): admins must open the dashboard to see new applications.
- Duplicate protection is limited to the same browser (a one-minute cooldown and a lock while sending); the same person can submit twice from different devices.
- Reference numbers come from the random document ID, so they are not sequential and cannot reveal how many applications exist.
- The admin session stays signed in on that device until sign-out; there is no automatic timeout.
- Age is stored as a whole number between 0 and 150. That is a data-sanity range, not an eligibility rule: every age can apply.

## 15. Optional hardening: restrict the API key

The `apiKey` is public by design, but you can limit where it works. In Google Cloud Console, APIs and Services, Credentials, open the "Browser key" for this project, choose **Websites** under Application restrictions, and add `localhost`, your Vercel address and your final domains (apex and www). Add every hostname you use, or sign-in and saving will fail on the missing one. This reduces abuse of the key but does not replace `firestore.rules`.

The Firebase console also shows a Google Analytics `measurementId`. This website deliberately does **not** use Analytics (no cookies, nothing to disclose), so that value is not used anywhere.
