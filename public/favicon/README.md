# Favicon package — staged, not yet wired

Three favicon sets were dropped into the repo root as zips (`favicon.zip`,
`favicon (1).zip`, `favicon (2).zip`) — same leaf/"R" mark, three background
colors. All three are extracted here, unmodified, keyed by background:

| Folder | Background | Suggested use |
|---|---|---|
| `cream/` | Warm cream (close to the Design Spec's `#FBF8F2` page background) | Light mode |
| `black/` | Near-black | Dark mode |
| `brown/` | Dark brown | Kept as an alternate dark-mode option — not used in the snippet below, swap in if `black/` reads too harsh |

Each folder contains a full generator export: `favicon.svg`, `favicon.ico`,
`favicon-96x96.png`, `apple-touch-icon.png`, `web-app-manifest-192x192.png`,
`web-app-manifest-512x512.png`, `site.webmanifest`.

**Not wired into any HTML yet** — there's no site skeleton in the repo to
wire into (the build so far is calculation-engine only, per the build
sequence). When `SectionA_MaritalRegime`'s skeleton (or whatever the real
entry HTML ends up being) is built, add this to `<head>`, using
`prefers-color-scheme` to switch between the cream and black sets:

```html
<link rel="icon" type="image/svg+xml" href="/favicon/cream/favicon.svg" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/svg+xml" href="/favicon/black/favicon.svg" media="(prefers-color-scheme: dark)">

<link rel="icon" type="image/png" sizes="96x96" href="/favicon/cream/favicon-96x96.png" media="(prefers-color-scheme: light)">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon/black/favicon-96x96.png" media="(prefers-color-scheme: dark)">

<link rel="shortcut icon" href="/favicon/cream/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon/cream/apple-touch-icon.png">
<link rel="manifest" href="/favicon/cream/site.webmanifest">
```

Notes for whoever wires this up:

- `apple-touch-icon` and the web manifest have no light/dark switch in
  practice (iOS ignores `media` on `apple-touch-icon`, and only one manifest
  can be linked) — `cream/` is used as the single default above since it's
  the brand's primary background per the Design Spec.
- Every `site.webmanifest` in all three folders still has the generator's
  placeholder values (`"name": "MyWebSite"`, `theme_color`/`background_color:
  "#ffffff"`) — update these to HeirIQ branding (name "HeirIQ", theme color
  `#1B2A4A` navy or `#FBF8F2` cream) before shipping, whichever folder ends
  up in use.
- The three source zips are still at the repo root — safe to delete once
  this staged copy is confirmed to be what's wanted.
