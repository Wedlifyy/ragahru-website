# RagaHru

Marketplace site for RagaHru wedding invitation websites. Each design is shown
as a preview video in a phone frame; enquiries go to WhatsApp.

Plain HTML, CSS and JavaScript: no build step, framework or backend. Deploy the
folder as-is to any static host.

The wedding websites themselves are never part of this project. Only their
preview videos and stills are published here.

## Structure

```
index.html              the page; the catalogue is rendered by js/app.js
404.html                shown by the host for unknown addresses
css/site.css            all styles
config/site-config.js   contact details, messages, prices, masthead artwork
js/templates.js         the template registry
js/hero.js              masthead: three phones and the drifting poster rows
js/app.js               catalogue, preview dialog, header, WhatsApp links
templates/<collection>/<code>/preview/   poster.jpg + preview.mp4 per design
assets/                 fonts, logo and icons, masthead artwork
tools/                  sync-templates (registers new template folders)
```

## Adding a design

1. Create `templates/hindu/HN03/preview/` and put `poster.jpg` and
   `preview.mp4` in it. The folder name is the design code shown on the card
   and in the WhatsApp message.
2. Run `tools/sync-templates.bat` (or `node tools/sync-templates.js`). It adds
   an entry to `js/templates.js` and reports any missing poster or video.
3. Edit the new entry's `description` and feature flags.

New collections (house warming, birthdays, ...) work the same way: create
`templates/<collection>/...`, and add a line to `collections` in
`config/site-config.js` for its heading and code prefix. A collection with no
templates is not shown.

Designs are listed newest first by `createdAt`, and carry a "New" badge for
`newForDays` days.

### Preview media

| | poster.jpg | preview.mp4 |
|---|---|---|
| Shape | 9:19.5 portrait (576 × 1248) | 9:19.5 portrait (576 × 1248) |
| Format | JPEG, under ~80 KB | MP4, H.264, 30 fps |
| Length | — | 10–20 s; it plays once, muted |
| Size | — | 2–5 MB |

Cards only ever load the poster. The video downloads when someone opens the
large preview, and is released when they close it.

## Settings

Everything editable lives in `config/site-config.js`: WhatsApp number, the
pre-filled messages, custom-design price, sale label, testimonials, collection
headings, and the masthead images (`heroRail` for the drifting rows,
`heroPhonePosters` for the three phones). If you change the centre phone image,
update the matching `<link rel="preload">` in `index.html`.

Testimonials stay hidden until at least one is added. Only use words a couple
actually sent, with their permission.

**Season sale.** The bar at the top is in `index.html`. To end the sale, delete
that block, set `saleLabel` to `""`, and remove `originalPrice` from the
templates (it is what shows the struck-through price).

**Design links.** Every design has its own address, e.g. `/#HN01`, which scrolls
to that design's card. "Share with family" in the preview sends that link. A
preview only opens when a visitor taps a design.

## Running locally

Serve the folder (opening `index.html` from disk works, but browsers will not
load the fonts that way):

```bash
npx serve .
```

Check at 375, 390, 768, 1024 and 1440 px wide.

## Deploying

Netlify, Cloudflare Pages or GitHub Pages with no build command and the root as
the publish directory. `_headers` (Netlify and Cloudflare) sets caching and
basic security headers. Make sure the files in `templates/` are uploaded.

Once the domain is live, change the `og:image` URL in `index.html` to an
absolute one and add a `Sitemap:` line to `robots.txt`.

## Protecting the designs

Preview stills and videos can't be dragged out or saved from the context menu,
carry a RagaHru watermark, and play without download or fullscreen controls.
No website can prevent screenshots or screen recording; the real protection is
that the wedding websites themselves are never published here.

## Browser support

Current Chrome, Edge, Firefox and Safari (15.4 or later, for the native
`<dialog>` used by the preview). Visitors who ask their system for reduced
motion see the page without animation.
