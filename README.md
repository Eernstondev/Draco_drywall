# Draco Prestige Drywall — static site

HTML5, CSS3 and vanilla JavaScript. No build step: open `index.html` or serve the folder.

## Before going live
- Replace every `[PLACEHOLDER]` (phone, email, address, hours, locations, company story).
- Replace the placeholder photos in `/images` with real photography, same file names and ratios
  (hero 2400×1500, page heroes 2400×1200, services 1500×1000, projects 1600×1200, about 1200×1500).
- Run `supabase/quote_requests.sql` in the Supabase SQL Editor before accepting quote requests. It creates the `quote_requests` table and the private `quote-photos` bucket used by the form.
- Quote requests are inserted with the public key and insert-only row-level security. Read and follow up on requests from the Supabase dashboard, not from the public site.
- Contact messages still use the WhatsApp fallback. Set any additional form endpoints in `js/forms.js` (`FORM_ENDPOINTS`).

## Editing content
- Courses, prices, sessions and seats: `TRAININGS` in `js/training.js`.
- Projects and gallery photos: `PROJECTS` in `js/projects.js`.
- Currency and locale: `Draco.config` in `js/main.js`.

## Payment (Stripe)
Disabled. Enable `PAYMENT` in `js/forms.js` once a server endpoint creates Stripe Checkout
Sessions and returns `{ "url": "..." }`. Seats (`enrolled`) are not updated automatically:
that needs the same backend.
