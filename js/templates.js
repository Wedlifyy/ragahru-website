/* Template registry.
 *
 * One entry per design. Media is found by convention:
 *   templates/<collection>/<folder>/preview/poster.jpg   the still on the card
 *   templates/<collection>/<folder>/preview/preview.mp4  the film in the large preview
 *
 * Name the folder with the design code (HN03, CH02, ...) and that code is what
 * appears on the card and in the WhatsApp message. After adding a folder, run
 * tools/sync-templates.bat to append its entry here, then edit the description.
 *
 * Fields
 *   id, collection, folder   required
 *   description              one sentence about what the design looks like
 *   price, originalPrice     rupees; originalPrice is shown struck through
 *   music, rsvp, multilingual  feature flags shown under the description
 *   createdAt                "YYYY-MM-DD"; newest first, drives the New badge
 *   posterPath, previewPath  optional, only for media stored elsewhere
 */

const templates = [
  {
    id: "HN02",
    collection: "hindu",
    folder: "HN02",
    description: "A Hindu wedding invitation with music, RSVP and your choice of languages.",
    price: 999,
    originalPrice: 1499,
    music: true,
    rsvp: true,
    multilingual: true,
    createdAt: "2026-09-13"
  },

  {
    id: "HN01",
    collection: "hindu",
    folder: "HN01",
    description: "A cinematic South Indian wedding experience with elegant storytelling.",
    price: 999,
    originalPrice: 1499,
    music: true,
    rsvp: true,
    multilingual: true,
    createdAt: "2026-09-09"
  },

  {
    id: "CH01",
    collection: "christian",
    folder: "CH01",
    description: "A refined and romantic wedding experience.",
    price: 999,
    originalPrice: 1499,
    music: true,
    rsvp: false,
    multilingual: true,
    createdAt: "2026-09-08"
  },

  {
    id: "IS01",
    collection: "islamic",
    folder: "IS01",
    description: "An elegant contemporary wedding invitation experience.",
    price: 999,
    originalPrice: 1499,
    music: false,
    rsvp: true,
    multilingual: false,
    createdAt: "2026-09-07"
  }
];
