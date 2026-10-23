# Karwaan Foundation: website template (Phase 1)

Frontend only: React + Vite + TypeScript, Tailwind CSS v4 (design tokens), Motion for React, Lucide, React Router.
The volunteer form saves applications to Cloud Firestore, and a protected admin dashboard (`/admin`) lets approved admins review them. **Read `setup.md` first**: you must create your own Firebase project and add its public settings to `.env.local`.

## Architecture (Phase 2)

```
React + Vite + TypeScript (Vercel)  ──>  Firebase: Authentication (admins) + Cloud Firestore
src/lib/        firebase.ts (config), db.ts (Firestore Lite), auth.ts (Auth; admin chunk only)
src/services/   volunteerService.ts   writes a pending application with server timestamps
src/features/volunteer/   form UI, validation.ts, payload.ts, antiSpam.ts, errors.ts
src/features/admin/       AdminApp (lazy), auth/ (AuthContext, adminCheck), api.ts, pages/, components/
firestore.rules · firestore.indexes.json · firebase.json · vercel.json · .env.example
tests/unit (run: npm run test:unit) · tests/rules (run: npm run test:rules, needs the emulator)
handoff/karwaan-website-requirements.docx   everything still needed from the Foundation
```

Data: `volunteerApplications/{autoId}` (public can create only; admins read and review) and `admins/{uid}` (allowlist managed in the Firebase Console). Admin access needs a verified email plus an active allowlist record, enforced by the rules, not just the screens.

## Run it

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev        # opens http://localhost:5173
npm run build      # production build into /dist
npm run preview    # serve the production build locally
npm run typecheck  # TypeScript check
npm run test:unit  # unit tests
npm run test:rules # Firestore rules tests (needs Java and the emulator)
```

`vercel.json` already rewrites every path to `index.html`, so deep links work on Vercel. On other hosts, add the same single-page-app rewrite.

## Where things live

```
public/
  brand/            logo-mark.png, logo-lockup.jpg (supplied Foundation logo)
  photos/gallery/   drop gallery photos here
  photos/projects/  drop project photos here (one sub-folder per project)
src/
  data/             ALL content: site.ts (contact, nav), areas.ts, projects.ts, gallery.ts, volunteer.ts
  styles/           tokens.css (colours, fonts, spacing) then base / layout / components / sections / pages / volunteer
  components/       layout (header, menu, footer), ui (Photo, Button, Lightbox, ...)
  sections/         home-page sections and shared page blocks
  pages/            Home, About, Work, Gallery, Contact, Volunteer, NotFound
  features/volunteer/   form UI + validation (validation.ts is the single source of the rules)
  services/volunteerService.ts   the ONE place the form talks to a backend (prototype stub today)
```

## Replacing placeholders

- **Gallery:** put the file in `public/photos/gallery/`, then edit `src/data/gallery.ts` (`src`, `alt`, `ratio`, `category`, `caption`). Reorder by moving entries. No layout code changes. The home-page collage uses the first five entries.
- **Projects:** edit `src/data/projects.ts` (title, area, summary, where, when, photos; set `placeholder: false`). Photos go in `public/photos/projects/<slug>/`.
- **Ratios and cropping:** every image goes through `components/ui/Photo.tsx`. Choose the nearest `ratio` and set `focal` (x/y percent) to keep the subject visible when cropped.
- **Areas of impact, contact details, motto:** `src/data/`.

## Volunteer form and admin

- Without Firebase settings the form shows "Online registration is not switched on yet" and never a success message. With them, a successful save shows a thank-you and a reference number (for example `KF-AB12CD34`).
- Admin: `/admin/login` (no public sign-up exists). Setup, the admin allowlist, testing and deployment are all in `setup.md`.

## Design notes

- Direction: follows the reference site's actual language. Monochrome (ink black, white, greys; the logo is black on white, photography will bring the colour), a full-width light wordmark, huge editorial serif headings, small monospace labels in (brackets), numbered indexes, hairline rules.
- Type: Instrument Serif (headings), Hanken Grotesk (text and wordmark), IBM Plex Mono (labels). All bundled through Fontsource, so there are no external font requests.
- Motion (all respect `prefers-reduced-motion`): letter-by-letter wordmark entrance, masked heading reveals, scroll-filled statement text, parallax photographs, sticky stacking project panels, opposing scroll-driven photo rails, a cursor ring that shows words like "view" (mouse devices only), a photo that follows the cursor on the areas list, scrambling mono links, a black page-transition curtain, a full-screen menu, a blinking local-time clock.
- Placeholders: dot-grid "contact sheet" frames, each labelled "(Placeholder photo)" with its ratio.
- Only extra colour: the error red used in form validation.
- Tailwind v4 is installed and its tokens are mapped in `src/styles/index.css` (`bg-ink`, `font-serif`...) for the next stage. Page styling is plain CSS driven by the tokens in `src/styles/tokens.css`.
- WhatsApp: the contact number is also the WhatsApp number (`site.contact.whatsappHref` in `src/data/site.ts`). The contact page opens WhatsApp, offers a call link and a copy button.

## Content status

- Real (from the Foundation's current website copy): mission, vision, about text, six areas of impact, motto, contact details.
- Draft wording to be confirmed (the privacy notice is a marked placeholder): the "How we approach change" headings, button and helper text, and the **privacy notice** on the volunteer page (legal wording needs the Foundation's sign-off).
- Placeholders (clearly labelled on the pages): all photos, the four sample initiatives, the three values, the fuller story.

## Not built (by design)

Email notifications, payments, image uploads, Cloud Functions.
