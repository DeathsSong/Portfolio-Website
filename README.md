# Michelle Loudenclos — Lava Portfolio

An immersive portfolio where the navigation is the lava: labeled wax blobs drift, merge, and expand into content when clicked or tapped.

Built from scratch with React, TypeScript, Vite, SVG filters, and a lightweight animation loop. No new runtime dependencies.

## Run locally

```sh
npm ci
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The existing GitHub Pages workflow supplies `BASE_PATH=/Portfolio-Website/` when deploying `main`. Other hosts default to `/`.

## The interaction

- Projects, About me, Contact, and GitHub are actual SVG wax shapes with accessible HTML buttons aligned to their current positions.
- Random destinations, smooth interpolation, shape deformation, and SVG metaball filtering make the lava drift and join organically.
- Clicking a blob expands the same shape into a content surface. Smaller lava choices open project details, personal background, skills, education, and contact links.
- Expansion grows from the clicked blob over one second. Wax starts releasing 300 ms into the swell, peels away while the parent is still growing, and settles into occasional rising bubbles. The particles share the metaball filter, so they stretch and separate from the parent wax. Motion off skips the transition and bubbles.
- Expanded lava and smaller action blobs have smooth traveling lobes around a stable inner area. Labels stay still over that protected wax core. After the opening burst, bubbles move at 30% of the burst speed and arrive in pairs every five to eight seconds, with a mix of smaller droplets and larger globs.
- Back follows the menu hierarchy; Escape does the same. Keyboard focus moves to opened content and returns to the originating blob.
- The header, lamp, and bottom controls share the live viewport height. Menus reflow on short screens; measured content fitting keeps every control inside the lamp without hiding page overflow or cutting off the bottom.
- Electric, Sunset, and Cosmic palettes and motion settings persist in browser storage. Reduced-motion preferences are respected by default.
- The motion switch freezes drifting and deformation. The animation loop stops while motion is off and updates when the stage resizes or the view changes.

## Edit content

Update `src/content.ts` for projects, skills, email, and social links. Contact links use `michelle.sherrie@yahoo.com` and open the visitor’s mail application.

The résumé is served from `public/resume.pdf` and linked from the About and Contact lava menus. Its URL uses Vite’s `BASE_URL`, so it also works under the GitHub Pages repository path. Replace this file when the résumé changes; the existing links will keep working. The supplied one-page PDF is preserved byte-for-byte.

The original General Assembly certificate is retained.

Fonts are self-hosted Shrikhand and DM Sans, licensed under the SIL Open Font License; licenses are in `src/assets/fonts/`. There are no analytics or remote font requests.
